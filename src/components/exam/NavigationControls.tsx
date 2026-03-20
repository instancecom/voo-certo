import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CheckCircle, Clock } from 'lucide-react';

interface NavigationControlsProps {
  currentIndex: number;
  totalQuestions: number;
  onPrev: () => void;
  onNext: () => void;
  onFinish: () => void;
  disableNext?: boolean;
  disablePrev?: boolean;
  isFinished?: boolean;
  timeLeft?: number; // optionally display time here
}

export function NavigationControls({
  currentIndex,
  totalQuestions,
  onPrev,
  onNext,
  onFinish,
  disableNext,
  disablePrev,
  isFinished,
  timeLeft
}: NavigationControlsProps) {
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalQuestions - 1;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 md:gap-8 bg-card/60 backdrop-blur-md p-6 md:p-8 rounded-3xl border-2 border-primary/5 shadow-xl relative overflow-hidden group">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/10 transition-colors" />
      
      <div className="flex items-center gap-6 relative z-10">
        <div className="flex flex-col">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-muted-foreground opacity-60">Questão Selecionada</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-3xl font-black text-primary select-none">{currentIndex + 1}</span>
            <span className="text-sm font-bold text-muted-foreground select-none">/ {totalQuestions}</span>
          </div>
        </div>
        
        {timeLeft !== undefined && (
          <div className="h-12 w-px bg-border mx-2 hidden sm:block opacity-40" />
        )}
        
        {timeLeft !== undefined && (
          <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border-2 transition-all duration-300 ${
            timeLeft < 60 ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-primary/5 border-primary/10 text-primary'
          }`}>
            <Clock className={`w-4 h-4 ${timeLeft < 60 ? 'animate-pulse' : ''}`} />
            <span className="font-mono font-black text-lg select-none">{formatTime(timeLeft)}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto relative z-10">
        <Button
          variant="outline"
          size="lg"
          onClick={onPrev}
          disabled={isFirst || isFinished || disablePrev}
          className="flex-1 sm:flex-none h-14 px-6 rounded-2xl border-2 border-primary/10 hover:border-primary/40 text-primary font-bold transition-all disabled:opacity-30 disabled:grayscale"
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          <span className="hidden md:inline">Anterior</span>
        </Button>

        {!isLast ? (
          <Button
            size="lg"
            onClick={onNext}
            disabled={isFinished || disableNext}
            className="flex-1 sm:flex-none h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black shadow-lg shadow-primary/20 transition-all hover:translate-x-1"
          >
            <span>Próxima</span>
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        ) : (
          <Button
            size="lg"
            onClick={onFinish}
            disabled={isFinished}
            className="flex-1 sm:flex-none h-14 px-10 rounded-2xl bg-accent hover:bg-accent/90 text-slate-900 font-black shadow-xl shadow-accent/20 transition-all hover:scale-105 active:scale-95"
          >
            <span>Finalizar</span>
            <CheckCircle className="w-5 h-5 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
