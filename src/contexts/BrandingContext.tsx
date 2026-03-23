import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BrandingSettings {
  logo_url: string | null;
  site_name: string;
}

interface BrandingContextType {
  settings: BrandingSettings;
  updateSettings: (newSettings: Partial<BrandingSettings>) => Promise<void>;
  isLoading: boolean;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

const DEFAULT_SETTINGS: BrandingSettings = {
  logo_url: null,
  site_name: 'Voo Certo',
};

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<BrandingSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBranding = async () => {
    try {
      // Trying to fetch from a table 'site_settings'. 
      // If it doesn't exist, we fallback to defaults.
      const { data, error } = await supabase
        .from('site_settings' as any)
        .select('key, value');

      if (!error && data) {
        const newSettings = { ...DEFAULT_SETTINGS };
        data.forEach((item: any) => {
          if (item.key === 'logo_url') newSettings.logo_url = item.value;
          if (item.key === 'site_name') newSettings.site_name = item.value;
        });
        setSettings(newSettings);
      }
    } catch (err) {
      console.warn('Branding fetch failed (table likely missing):', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<BrandingSettings>) => {
    try {
      const updates = Object.entries(newSettings).map(([key, value]) => ({
        key,
        value: value as string,
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('site_settings' as any)
        .upsert(updates, { onConflict: 'key' });

      if (error) throw error;
      setSettings(prev => ({ ...prev, ...newSettings }));
    } catch (err) {
      console.error('Failed to update branding:', err);
      // Even if it fails (no table), update state localy for session trial
      setSettings(prev => ({ ...prev, ...newSettings }));
      throw err;
    }
  };

  useEffect(() => {
    fetchBranding();
  }, []);

  return (
    <BrandingContext.Provider value={{ settings, updateSettings, isLoading }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const context = useContext(BrandingContext);
  if (context === undefined) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
}
