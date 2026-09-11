import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[300px] flex items-center justify-center p-6">
          <div className="max-w-md w-full p-6 rounded-[5px] border border-border bg-card text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-[5px] bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">
                {this.props.fallbackTitle || 'Ocorreu um erro ao carregar esta seção'}
              </h3>
              <p className="text-xs text-muted-foreground">
                As métricas podem estar sendo recalculadas. Tente recarregar a página.
              </p>
            </div>
            <Button
              onClick={this.handleReset}
              className="gap-2 h-9 text-xs font-bold bg-accent text-accent-foreground hover:bg-accent/90 rounded-[5px]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Recarregar Página
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
