import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, Loader2, Lock, Crown, Maximize, Volume2, VolumeX,
  RotateCcw, Rewind, FastForward, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Slider } from '@/components/ui/slider';

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

interface VideoPlayerProps {
  videoUrl: string;
  thumbnailUrl?: string | null;
  title: string;
  hasAccess: boolean;
  autoplay?: boolean;
}

export function VideoPlayer({ videoUrl, thumbnailUrl, title, hasAccess, autoplay = false }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  const [showControls, setShowControls] = useState(true);
  
  const [isEnded, setIsEnded] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number>();

  useEffect(() => {
    setHasStarted(false);
    if (!hasAccess) return;

    // Load YouTube API if not already loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const videoId = extractYouTubeId(videoUrl);
    if (!videoId) return;

    const initPlayer = () => {
      playerRef.current = new window.YT.Player(`yt-player-${videoId}`, {
        videoId: videoId,
        playerVars: {
          autoplay: autoplay ? 1 : 0,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          disablekb: 1,
          fs: 0,
        },
        events: {
          onReady: (event: any) => {
            setIsLoading(false);
            setDuration(event.target.getDuration());
          },
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              setHasStarted(true);
              setIsEnded(false);
              startTracking();
            } else if (event.data === window.YT.PlayerState.ENDED) {
              setIsPlaying(false);
              setIsEnded(true);
              stopTracking();
            } else {
              setIsPlaying(false);
              stopTracking();
            }
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      stopTracking();
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [videoUrl, hasAccess]);

  const extractYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : url.split('/').pop();
  };

  const startTracking = () => {
    stopTracking();
    timerRef.current = window.setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        setCurrentTime(playerRef.current.getCurrentTime());
      }
    }, 500);
  };

  const stopTracking = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const togglePlay = () => {
    if (isEnded) {
      handleRewatch();
      return;
    }
    if (isPlaying) playerRef.current.pauseVideo();
    else playerRef.current.playVideo();
  };

  const handleRewatch = () => {
    setIsEnded(false);
    playerRef.current.seekTo(0);
    playerRef.current.playVideo();
  };

  const handleSeek = (value: number[]) => {
    const time = value[0];
    setCurrentTime(time);
    playerRef.current.seekTo(time);
    if (isEnded && time < duration) setIsEnded(false);
  };

  const toggleMute = () => {
    if (isMuted) {
      playerRef.current.unMute();
      playerRef.current.setVolume(volume);
    } else {
      playerRef.current.mute();
    }
    setIsMuted(!isMuted);
  };

  const handleVolume = (value: number[]) => {
    const vol = value[0];
    setVolume(vol);
    playerRef.current.setVolume(vol);
    if (vol > 0) {
      playerRef.current.unMute();
      setIsMuted(false);
    }
  };

  const toggleFullscreen = () => {
    if (containerRef.current?.requestFullscreen) {
      if (document.fullscreenElement) document.exitFullscreen();
      else containerRef.current.requestFullscreen();
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return [h, m, s].map(v => v.toString().padStart(2, '0')).slice(h > 0 ? 0 : 1).join(':');
  };

  if (!hasAccess) {
    return (
      <AspectRatio ratio={16 / 9}>
        <div className="w-full h-full bg-[#0A192F]/80 rounded-[5px] overflow-hidden relative flex items-center justify-center border border-white/5">
          {thumbnailUrl && (
            <img src={thumbnailUrl} alt={title} className="absolute inset-0 w-full h-full object-cover opacity-20 blur-sm" />
          )}
          <div className="relative z-10 text-center px-6 space-y-6">
            <div className="w-20 h-20 rounded-[5px] bg-white/5 backdrop-blur-xl flex items-center justify-center mx-auto border border-accent/20 shadow-2xl">
              <Lock className="w-8 h-8 text-accent" />
            </div>
            <div>
              <h3 className="text-white font-black text-2xl tracking-tight">Conteúdo de Elite</h3>
              <p className="text-white/40 text-sm mt-2 font-medium">Assine o plano Comandante para desbloquear</p>
            </div>
            <Button variant="hero" size="xl" className="rounded-[5px] px-10 shadow-xl shadow-accent/20" asChild>
              <Link to="/premium"><Crown className="w-5 h-5 mr-3" /> Assinar agora</Link>
            </Button>
          </div>
        </div>
      </AspectRatio>
    );
  }

  return (
    <AspectRatio ratio={16 / 9}>
      <div 
        ref={containerRef}
        className="w-full h-full rounded-[5px] overflow-hidden relative bg-black shadow-3xl group/player flex flex-col items-center justify-center"
        onMouseMove={() => { setShowControls(true); window.clearTimeout((window as any)._player_to); (window as any)._player_to = window.setTimeout(() => (isPlaying || isEnded) && setShowControls(false), 3000); }}
        onMouseLeave={() => isPlaying && setShowControls(false)}
      >
        {/* The YouTube Player Container */}
        <div id={`yt-player-${extractYouTubeId(videoUrl)}`} className="w-full h-full pointer-events-none" />

        {/* Initial Custom Play Button Overlay */}
        {!hasStarted && !isLoading && (
          <div 
            className="absolute inset-0 z-30 flex items-center justify-center cursor-pointer group/start"
            onClick={togglePlay}
          >
            {thumbnailUrl && (
              <img 
                src={thumbnailUrl} 
                alt={title} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/start:scale-105" 
              />
            )}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-colors group-hover/start:bg-black/20" />
            
            <div className="relative z-10 flex flex-col items-center gap-6">
              <div className="w-20 h-20 rounded-[5px] bg-accent/20 backdrop-blur-xl flex items-center justify-center border border-accent/40 shadow-2xl group-hover/start:scale-110 group-hover/start:bg-accent/30 transition-all duration-500">
                <Play className="w-10 h-10 text-accent fill-accent ml-2" />
              </div>
              <div className="flex flex-col items-center gap-2">
                <p className="text-white font-black text-xl tracking-tight drop-shadow-lg uppercase italic">{title}</p>
                <div className="h-[2px] w-12 bg-accent rounded-full transition-all duration-500 group-hover/start:w-24" />
                <p className="text-accent text-[10px] font-black uppercase tracking-[0.4em] mt-2 animate-pulse">Clique para Iniciar a Aula</p>
              </div>
            </div>

            {/* Premium badge indicator if applicable */}
            <div className="absolute top-6 left-6 flex items-center gap-3">
               <div className="w-10 h-10 rounded-[5px] bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center">
                  <Play className="w-4 h-4 text-white/40" />
               </div>
               <div>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none">AULA COMPLETA</p>
                  <p className="text-[9px] font-medium text-accent uppercase tracking-widest mt-1">VOO CERTO EDUCATION</p>
               </div>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0A192F] z-50">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-10 h-10 text-accent animate-spin" />
              <p className="text-accent text-[10px] font-black uppercase tracking-[0.3em]">Preparando sua aula...</p>
            </div>
          </div>
        )}

        {/* End of Video Overlay (Covers Recommended Videos) */}
        <AnimatePresence>
          {isEnded && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-[#0A192F] flex flex-col items-center justify-center p-8 text-center"
            >
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none" />
              <div className="w-20 h-20 rounded-[5px] bg-accent/10 flex items-center justify-center mb-6 border border-accent/20 shadow-2xl">
                <CheckCircle2 className="w-10 h-10 text-accent" />
              </div>
              <h3 className="text-white text-3xl font-black mb-2 tracking-tight">Aula Concluída!</h3>
              <p className="text-white/40 text-sm mb-10 max-w-xs font-medium italic">Parabéns por chegar ao fim. Você está mais próximo da sua aprovação.</p>
              
              <div className="flex gap-4">
                <Button variant="hero" size="lg" className="rounded-[5px] px-8" onClick={handleRewatch}>
                  <RotateCcw className="w-4 h-4 mr-2" /> Reassistir Aula
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Click Layer (For play/pause) */}
        <div className="absolute inset-0 z-10 cursor-pointer" onClick={togglePlay} />

        {/* Custom Branding Overlays (Hiding any residual YT icons) */}
        <div className="absolute top-0 right-0 p-6 z-20 pointer-events-none opacity-40">
           <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">Voo Certo Education</span>
        </div>

        {/* Custom Control Bar */}
        <AnimatePresence>
          {showControls && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="absolute bottom-0 left-0 right-0 p-6 pt-12 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-40"
            >
              {/* Progress Slider */}
              <div className="mb-4 group/slider">
                <Slider
                  value={[currentTime]}
                  max={duration}
                  step={1}
                  onValueChange={handleSeek}
                  className="cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  {/* Play/Pause Button */}
                  <button onClick={togglePlay} className="text-white hover:text-accent transition-colors">
                    {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                  </button>

                  {/* Volume Control */}
                  <div className="flex items-center gap-3">
                    <button onClick={toggleMute} className="text-white hover:text-accent transition-colors">
                      {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                    <div className="w-20 hidden md:block">
                      <Slider value={[isMuted ? 0 : volume]} max={100} onValueChange={handleVolume} />
                    </div>
                  </div>

                  {/* Time Display */}
                  <div className="text-white/60 text-[11px] font-black tracking-widest tabular-nums">
                    <span>{formatTime(currentTime)}</span>
                    <span className="mx-1.5 opacity-30">/</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Branding inside controls */}
                  <div className="px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-[5px] hidden sm:block">
                    <span className="text-[9px] font-black text-accent uppercase tracking-[0.2em]">Voo Certo</span>
                  </div>

                  <button onClick={toggleFullscreen} className="text-white hover:text-accent transition-colors">
                    <Maximize className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Play Icon Hint on hover/pause */}
        {!isPlaying && !isLoading && !showControls && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="w-16 h-16 rounded-[5px] bg-accent/10 backdrop-blur-md border border-accent/20 flex items-center justify-center">
              <Play className="w-8 h-8 text-accent fill-accent ml-1" />
            </div>
          </div>
        )}
      </div>
    </AspectRatio>
  );
}
