import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useBranding } from '@/contexts/BrandingContext';
import { Loader2 } from 'lucide-react';

interface FeatureGuardProps {
  feature: 'microcourses' | 'career_guide' | 'achievements' | 'progress' | 'curriculum';
  children: ReactNode;
}

export function FeatureGuard({ feature, children }: FeatureGuardProps) {
  const { settings, isLoading } = useBranding();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const isEnabled = settings.features[feature];

  if (!isEnabled) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
