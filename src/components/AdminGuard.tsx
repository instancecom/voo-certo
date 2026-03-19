import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Shield } from 'lucide-react';

export function AdminGuard() {
  const { user, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center p-8 rounded-2xl bg-card border border-border max-w-md w-full shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-destructive" />
          </div>
          <h2 className="text-2xl font-black text-foreground mb-3 tracking-tight">Zona Militar</h2>
          <p className="text-muted-foreground mb-8 font-medium italic">
            Área restrita exclusivamente para comandantes da equipe técnica. Seu acesso não foi autorizado por falta de credenciais.
          </p>
          <Navigate to="/" replace />
        </div>
      </div>
    );
  }

  return <Outlet />;
}
