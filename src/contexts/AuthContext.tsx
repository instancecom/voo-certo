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
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isAdmin: boolean;
  isPremium: boolean;
  hasActivePlan: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return;
      }

      if (profileData) {
        setProfile(profileData);
        setIsPremium(profileData.is_premium || false);
      }

      // Check if user is admin
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();

      if (!roleError && roleData) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsAdmin(false);
    setIsPremium(false);
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Defer profile fetch to avoid Supabase deadlock
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);

          // Conceder insígnia "Check-in Feito" somente no primeiro login
          if (event === 'SIGNED_IN') {
            setTimeout(async () => {
              try {
                // Busca a insígnia de first_login
                const { data: badge } = await supabase
                  .from('insignias')
                  .select('id')
                  .eq('condition_type', 'first_login')
                  .eq('is_active', true)
                  .maybeSingle();

                if (badge?.id) {
                  // Insere ignorando duplicata (UNIQUE constraint na tabela user_insignias)
                  await supabase
                    .from('user_insignias')
                    .insert({ user_id: session.user.id, insignia_id: badge.id })
                    .throwOnError();
                }
              } catch (err: any) {
                // Código 23505 = duplicate key — usuário já tem a insígnia, ignorar
                if (err?.code !== '23505') {
                  console.error('Erro ao conceder insígnia de primeiro login:', err);
                }
              }
            }, 500);
          }
        } else {
          setProfile(null);
          setIsAdmin(false);
          setIsPremium(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => {
          setIsLoading(false);
        });
      } else {
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
