import { motion } from 'framer-motion';
import { Shuffle, Loader2 } from 'lucide-react';

export function ExamLoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-sm"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 mb-6"
        >
          <Shuffle className="w-8 h-8 text-accent" />
        </motion.div>
        <h2 className="text-xl font-bold text-foreground mb-2">
          Preparando simulado...
        </h2>
        <p className="text-muted-foreground text-sm">
          Embaralhando questões e alternativas
        </p>
        <Loader2 className="w-5 h-5 animate-spin text-accent mx-auto mt-4" />
      </motion.div>
    </div>
  );
}
