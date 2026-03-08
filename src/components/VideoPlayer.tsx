import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Loader2, Lock, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface VideoPlayerProps {
  videoUrl: string;
  thumbnailUrl?: string | null;
  title: string;
  hasAccess: boolean;
  autoplay?: boolean;
}

export function VideoPlayer({ videoUrl, thumbnailUrl, title, hasAccess, autoplay = false }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoplay && hasAccess);
  const [isLoading, setIsLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handlePlay = () => {
    if (!hasAccess) return;
    setIsLoading(true);
    setIsPlaying(true);
  };

  if (!hasAccess) {
    return (
      <AspectRatio ratio={16 / 9}>
        <div className="w-full h-full bg-muted/80 rounded-xl overflow-hidden relative flex items-center justify-center">
          {thumbnailUrl && (
            <img src={thumbnailUrl} alt={title} className="absolute inset-0 w-full h-full object-cover opacity-30 blur-sm" />
          )}
          <div className="relative z-10 text-center px-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center mx-auto border border-accent/30">
              <Lock className="w-7 h-7 text-accent" />
            </div>
            <div>
              <p className="text-foreground font-semibold text-lg">Conteúdo exclusivo</p>
              <p className="text-muted-foreground text-sm mt-1">Assine para acessar este conteúdo</p>
            </div>
            <Button variant="hero" size="lg" asChild>
              <Link to="/premium">
                <Crown className="w-4 h-4 mr-2" />
                Assinar agora
              </Link>
            </Button>
          </div>
        </div>
      </AspectRatio>
    );
  }

  if (!isPlaying) {
    return (
      <AspectRatio ratio={16 / 9}>
        <div
          className="w-full h-full bg-card rounded-xl overflow-hidden relative cursor-pointer group"
          onClick={handlePlay}
        >
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt={title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <Play className="w-12 h-12 text-muted-foreground" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-16 h-16 rounded-full bg-accent flex items-center justify-center shadow-lg"
            >
              <Play className="w-7 h-7 text-accent-foreground ml-1" />
            </motion.div>
          </div>
        </div>
      </AspectRatio>
    );
  }

  return (
    <AspectRatio ratio={16 / 9}>
      <div className="w-full h-full rounded-xl overflow-hidden relative bg-black shadow-lg">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
            <Loader2 className="w-8 h-8 text-accent animate-spin" />
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={videoUrl}
          className="w-full h-full"
          allowFullScreen
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          title={title}
          onLoad={() => setIsLoading(false)}
        />
      </div>
    </AspectRatio>
  );
}
