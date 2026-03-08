import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Crown, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePlan, PlanLevel, PLAN_LABELS } from '@/hooks/usePlan';

interface PlanGateProps {
  requiredPlan: PlanLevel;
  children: ReactNode;
  /** Feature name to show in the lock message */
  feature?: string;
  /** Render inline (smaller) instead of full card */
  inline?: boolean;
  /** Custom message override */
  message?: string;
}

export function PlanGate({ requiredPlan, children, feature, inline, message }: PlanGateProps) {
  const { hasAccess, isLoggedIn, isLoading } = usePlan();

  if (isLoading) return <>{children}</>;

  if (hasAccess(requiredPlan)) {
    return <>{children}</>;
  }

  const planLabel = PLAN_LABELS[requiredPlan];
  const defaultMessage = !isLoggedIn
    ? `Faça login para acessar ${feature || 'este recurso'}.`
    : `${feature || 'Este recurso'} está disponível a partir do plano ${planLabel}.`;

  if (inline) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
        <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
        <span className="text-sm text-muted-foreground flex-1">{message || defaultMessage}</span>
        <Button variant="outline" size="sm" asChild>
          <Link to={!isLoggedIn ? '/auth' : '/premium'}>
            {!isLoggedIn ? 'Login' : 'Upgrade'}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <Card className="border-accent/20 bg-gradient-to-br from-card to-accent/5">
      <CardContent className="pt-8 pb-8 flex flex-col items-center text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
          <Lock className="w-8 h-8 text-accent" />
        </div>
        <h3 className="text-xl font-bold text-foreground">
          {!isLoggedIn ? 'Faça Login' : `Plano ${planLabel} necessário`}
        </h3>
        <p className="text-muted-foreground max-w-sm">
          {message || defaultMessage}
        </p>
        <Button variant="hero" size="lg" asChild>
          <Link to={!isLoggedIn ? '/auth' : '/premium'}>
            {!isLoggedIn ? (
              <>Fazer Login <ArrowRight className="w-4 h-4 ml-2" /></>
            ) : (
              <><Crown className="w-4 h-4 mr-2" /> Assinar {planLabel}</>
            )}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
