import { useState, useEffect } from 'react';
import { Bell, Trophy, Clock, X } from 'lucide-react';
import { useUserInsignias } from '@/hooks/useInsignias';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { DynamicIcon } from '@/components/ui/dynamic-icon';

const getDriveImageUrl = (url: string | null): string | null => {
  if (!url) return null;
  if (url.includes('lh3.googleusercontent.com')) return url;
  const ucMatch = url.match(/drive\.google\.com\/uc\?export=view&id=([^&]+)/);
  if (ucMatch) return `https://lh3.googleusercontent.com/d/${ucMatch[1]}`;
  const fileMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (fileMatch) return `https://lh3.googleusercontent.com/d/${fileMatch[1]}`;
  return url;
};

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className }: NotificationBellProps) {
  const { user } = useAuth();
  const { data: userInsignias } = useUserInsignias();
  const [lastViewed, setLastViewed] = useState<string | null>(
    localStorage.getItem(`voocerto_notifications_last_viewed_${user?.id}`)
  );
  const [isOpen, setIsOpen] = useState(false);

  // New notifications are those earned after lastViewed
  const newNotificationsCount = userInsignias?.filter(
    (ui) => !lastViewed || new Date(ui.earned_at) > new Date(lastViewed)
  ).length || 0;

  useEffect(() => {
    if (user?.id) {
      setLastViewed(localStorage.getItem(`voocerto_notifications_last_viewed_${user.id}`));
    }
  }, [user?.id]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && user?.id) {
      const now = new Date().toISOString();
      localStorage.setItem(`voocerto_notifications_last_viewed_${user.id}`, now);
      // We don't update setLastViewed immediately to keep the "new" indicator during the current open session
      // or we can update it after a small delay or when it closes.
      // Let's update it when it CLOSES so the user can see what's new while it's open.
    } else if (!open && user?.id) {
      setLastViewed(localStorage.getItem(`voocerto_notifications_last_viewed_${user.id}`));
    }
  };

  if (!user) return null;

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn(
            "relative rounded-full hover:bg-muted/50 transition-colors focus-visible:ring-0 focus-visible:ring-offset-0 ring-0 outline-none border-none",
            className
          )}
        >
          <Bell className={cn("w-5 h-5", !className && "text-muted-foreground")} />
          {newNotificationsCount > 0 && (
            <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-white"></span>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[320px] p-0 rounded-[5px] overflow-hidden shadow-xl border-border/40">
        <div className="flex items-center justify-between p-4 bg-muted/30 border-b border-border/40">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-foreground">Notificações</h3>
            {newNotificationsCount > 0 && (
              <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                {newNotificationsCount} novas
              </span>
            )}
          </div>
        </div>
        
        <ScrollArea className="h-[350px]">
          {!userInsignias || userInsignias.length === 0 ? (
            <div className="p-10 text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center">
                <Bell className="w-6 h-6 text-muted-foreground opacity-30" />
              </div>
              <p className="text-xs text-muted-foreground font-medium italic">Nenhuma conquista por enquanto.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {userInsignias.map((ui) => {
                const isNew = !lastViewed || new Date(ui.earned_at) > new Date(lastViewed);
                return (
                  <DropdownMenuItem 
                    key={ui.id} 
                    className="flex flex-col items-start p-4 cursor-pointer hover:bg-muted/50 focus:bg-muted/50 transition-colors gap-0"
                    asChild
                  >
                    <Link to="/conquistas" onClick={() => setIsOpen(false)}>
                      <div className="flex gap-4 w-full relative">
                        {isNew && (
                           <div className="absolute -left-1 top-0 bottom-0 w-1 bg-red-500 rounded-full" />
                        )}
                        <div className={`w-12 h-12 rounded-[5px] flex items-center justify-center shrink-0 border transition-colors overflow-hidden ${
                          isNew ? 'bg-accent/10 border-accent/20' : 'bg-muted/30 border-transparent'
                        }`}>
                          {ui.insignia?.model_url ? (
                            <img 
                              src={getDriveImageUrl(ui.insignia.model_url) || ''} 
                              alt={ui.insignia.name} 
                              className="w-full h-full object-contain p-2"
                            />
                          ) : (
                            ui.insignia?.icon ? (
                              <DynamicIcon name={ui.insignia.icon} size={24} className={isNew ? 'text-accent' : 'text-muted-foreground/60'} />
                            ) : (
                              <Trophy className={`w-6 h-6 ${isNew ? 'text-accent' : 'text-muted-foreground/60'}`} />
                            )
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm leading-tight mb-1 ${isNew ? 'font-bold text-foreground' : 'font-medium text-muted-foreground'}`}>
                            Conquista: {ui.insignia?.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground line-clamp-2 mb-2 font-medium">
                            {ui.insignia?.description}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tight">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(new Date(ui.earned_at), { addSuffix: true, locale: ptBR })}
                          </div>
                        </div>
                        {isNew && (
                          <div className="w-2 h-2 rounded-full bg-red-500 mt-1 shrink-0" />
                        )}
                      </div>
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </div>
          )}
        </ScrollArea>
        
        <DropdownMenuSeparator className="m-0" />
        <Link 
          to="/conquistas" 
          onClick={() => setIsOpen(false)}
          className="block py-3.5 text-center text-[11px] font-black text-primary hover:bg-primary/5 transition-colors uppercase tracking-[0.1em]"
        >
          Ver todas as conquistas
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
