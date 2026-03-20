import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShuffledQuestion } from '@/lib/examShuffle';
import { Info, Image as ImageIcon, Volume2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuestionViewProps {
  question: ShuffledQuestion;
  selectedAnswer?: number;
  onSelectAnswer: (index: number) => void;
  showFeedback?: boolean;
}

export function QuestionView({ 
  question, 
  selectedAnswer, 
  onSelectAnswer, 
  showFeedback = false 
}: QuestionViewProps) {
  const options = ['A', 'B', 'C', 'D'];

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      {/* Header section with question ID or tags if any */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-bold px-2.5 py-1 text-[10px] tracking-wider uppercase">
            Questão #{question.id.slice(0, 8)}
          </Badge>
          {question.difficulty && (
            <Badge className={`font-bold px-2.5 py-1 text-[10px] tracking-wider uppercase ${
              question.difficulty === 'easy' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 text-green-400' :
              question.difficulty === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 text-amber-400' :
              'bg-red-100 text-red-700 dark:bg-red-900/40 text-red-400'
            }`}>
              {question.difficulty}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-1.5">
          {question.audio_url && (
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-muted/50 hover:bg-primary/20 text-primary transition-all">
              <Volume2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-6 md:space-y-10">
        {/* Question text with improved typography */}
        <h3 className="text-xl md:text-2xl font-bold text-foreground leading-relaxed md:leading-snug tracking-tight">
          {question.text}
        </h3>

        {/* Question image if any */}
        {question.image_url && (
          <div className="relative group overflow-hidden rounded-2xl border-4 border-muted/50 shadow-xl max-w-2xl mx-auto transition-transform hover:scale-[1.01] duration-500">
            <img 
              src={question.image_url} 
              alt="Contexto da questão" 
              className="w-full h-auto object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
            <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md p-2 rounded-xl text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <ImageIcon className="w-5 h-5" />
            </div>
          </div>
        )}

        {/* Options grid with premium interaction states */}
        <div className="grid grid-cols-1 gap-4 md:gap-5 pt-4">
          {question.shuffledOptions.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = index === question.shuffledCorrectAnswer;
            const isWrong = isSelected && !isCorrect;
            
            // Interaction classes
            let stateClasses = "hover:border-primary/40 hover:bg-primary/5";
            if (isSelected) stateClasses = "border-primary bg-primary/10 ring-2 ring-primary/20";
            
            // Feedback classes
            if (showFeedback) {
              if (isCorrect) stateClasses = "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400 ring-2 ring-green-500/20";
              else if (isWrong) stateClasses = "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400 ring-2 ring-red-500/20";
              else stateClasses = "opacity-50 pointer-events-none grayscale-[0.3]";
            }

            return (
              <Button
                key={index}
                variant="outline"
                onClick={() => !showFeedback && onSelectAnswer(index)}
                disabled={showFeedback}
                className={`h-auto min-h-[4.5rem] py-4 px-6 justify-start text-left border-2 rounded-2xl transition-all duration-300 relative group overflow-hidden whitespace-normal break-words ${stateClasses}`}
              >
                <div className={`flex-shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center font-black text-sm md:text-base border-2 transition-all mr-4 ${
                  isSelected ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 
                  'bg-muted/50 border-muted group-hover:border-primary/30 group-hover:text-primary'
                }`}>
                  {options[index]}
                </div>
                <span className="text-sm md:text-base font-bold leading-normal pr-2">
                  {option}
                </span>
                
                {/* Visual indicator for feedback */}
                {showFeedback && isCorrect && (
                  <div className="ml-auto w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white scale-110 shadow-lg shadow-green-500/20">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}
              </Button>
            );
          })}
        </div>
        
        {/* Explanation text - only when showing feedback */}
        {showFeedback && question.explanation && (
          <Card className="border-2 border-primary/20 bg-primary/5 animate-slide-up mt-8">
            <CardContent className="p-6 md:p-8 space-y-3">
              <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider">
                <Info className="w-4 h-4" /> Explicação do Professor
              </div>
              <p className="text-muted-foreground leading-relaxed italic border-l-4 border-primary/20 pl-4 py-1">
                {question.explanation}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
