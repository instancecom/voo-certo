import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  is_premium: boolean;
  premium_expires_at: string | null;
  plan_type: string;
  plan_expires_at: string | null;
  ai_questions_count?: number;
  is_tester: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isAdmin: boolean;
  isPremium: boolean;
  isTester: boolean;
  hasActivePlan: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AUTH_CACHE_KEY = 'voecerto_auth_cache_v2';

interface CachedAuthData {
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  isPremium: boolean;
  isTester: boolean;
}

const getInitialAuthCache = (): CachedAuthData => {
  try {
    const raw = localStorage.getItem(AUTH_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.user) {
        return parsed;
      }
    }
  } catch (e) {}
  return { user: null, profile: null, isAdmin: false, isPremium: false, isTester: false };
};

const saveAuthCache = (data: CachedAuthData) => {
  try {
    if (data.user) {
      localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(data));
    } else {
      localStorage.removeItem(AUTH_CACHE_KEY);
    }
  } catch (e) {}
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const initialCache = getInitialAuthCache();
  const [user, setUser] = useState<User | null>(initialCache.user);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(initialCache.profile);
  const [isAdmin, setIsAdmin] = useState<boolean>(initialCache.isAdmin);
  const [isPremium, setIsPremium] = useState<boolean>(initialCache.isPremium);
  const [isTester, setIsTester] = useState<boolean>(initialCache.isTester);
  const [isLoading, setIsLoading] = useState<boolean>(!initialCache.user);

  const fetchProfile = async (userId: string, currentUser?: User) => {
    try {
      const targetUser = currentUser || user;
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      let currentProfile = profile;
      let currentIsPremium = isPremium;
      let currentIsTester = isTester;
      let currentIsAdmin = isAdmin;

      if (!profileError && profileData) {
        currentProfile = profileData;
        setProfile(profileData);
        const hasExpired = profileData.premium_expires_at && new Date(profileData.premium_expires_at) < new Date();
        currentIsPremium = (profileData.is_premium && !hasExpired) || false;
        currentIsTester = profileData.is_tester || false;
        setIsPremium(currentIsPremium);
        setIsTester(currentIsTester);
      }

      // Check if user is admin
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();

      if (!roleError && roleData) {
        currentIsAdmin = true;
        setIsAdmin(true);
      } else {
        currentIsAdmin = false;
        setIsAdmin(false);
      }

      // Atualiza o cache síncrono no localStorage para carregamentos instantâneos futuros
      if (targetUser) {
        saveAuthCache({
          user: targetUser,
          profile: currentProfile,
          isAdmin: currentIsAdmin,
          isPremium: currentIsPremium,
          isTester: currentIsTester,
        });
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id, user);
    }
  };

  const signOut = async () => {
    saveAuthCache({ user: null, profile: null, isAdmin: false, isPremium: false, isTester: false });
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsAdmin(false);
    setIsPremium(false);
    setIsTester(false);
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        const currentUser = currentSession?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          saveAuthCache({
            user: currentUser,
            profile,
            isAdmin,
            isPremium,
            isTester,
          });

          setTimeout(() => {
            fetchProfile(currentUser.id, currentUser);
          }, 0);

          // Conceder insígnia "Check-in Feito" somente no primeiro login
          if (event === 'SIGNED_IN') {
            setTimeout(async () => {
              try {
                const { data: badge } = await supabase
                  .from('insignias')
                  .select('id')
                  .eq('condition_type', 'first_login')
                  .eq('is_active', true)
                  .maybeSingle();

                if (badge?.id) {
                  const { data: existing } = await supabase
                    .from('user_insignias')
                    .select('id')
                    .eq('user_id', currentUser.id)
                    .eq('insignia_id', badge.id)
                    .maybeSingle();

                  if (!existing) {
                    await supabase
                      .from('user_insignias')
                      .insert({ user_id: currentUser.id, insignia_id: badge.id })
                      .throwOnError();
                  }
                }
              } catch (err: any) {
                if (err?.code !== '23505') {
                  console.error('Erro ao conceder insígnia de primeiro login:', err);
                }
              }
            }, 500);
          }
        } else {
          saveAuthCache({ user: null, profile: null, isAdmin: false, isPremium: false, isTester: false });
          setProfile(null);
          setIsAdmin(false);
          setIsPremium(false);
          setIsTester(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      const currentUser = currentSession?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        saveAuthCache({
          user: currentUser,
          profile,
          isAdmin,
          isPremium,
          isTester,
        });
        fetchProfile(currentUser.id, currentUser).finally(() => {
          setIsLoading(false);
        });
      } else {
        saveAuthCache({ user: null, profile: null, isAdmin: false, isPremium: false, isTester: false });
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const hasActivePlan = (() => {
    if (!profile) return false;
    const validPlans = ['solo', 'tripulante', 'comandante'];
    if (!validPlans.includes(profile.plan_type)) return false;
    if (profile.plan_expires_at && new Date(profile.plan_expires_at) < new Date()) return false;
    return true;
  })();

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isAdmin,
        isPremium,
        isTester,
        hasActivePlan,
        isLoading,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
