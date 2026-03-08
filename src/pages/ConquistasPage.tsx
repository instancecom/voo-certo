import { useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Trophy, Lock, Award, Star, Crown, Gem, ChevronLeft, ChevronRight, Loader2, Sparkles } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BadgeCard } from "@/components/badges/BadgeCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useInsignias, useUserInsignias, BadgeRarity } from "@/hooks/useInsignias";
import { cn } from "@/lib/utils";

const rarityConfig: Record<BadgeRarity, { icon: React.ElementType; label: string; color: string; bgColor: string; borderColor: string }> = {
  bronze: { icon: Award, label: "Bronze", color: "text-amber-600", bgColor: "bg-amber-500/10", borderColor: "border-amber-500/20" },
  silver: { icon: Star, label: "Prata", color: "text-slate-500", bgColor: "bg-slate-400/10", borderColor: "border-slate-400/20" },
  gold: { icon: Crown, label: "Ouro", color: "text-yellow-500", bgColor: "bg-yellow-400/10", borderColor: "border-yellow-400/20" },
  platinum: { icon: Gem, label: "Platina", color: "text-purple-500", bgColor: "bg-purple-400/10", borderColor: "border-purple-400/20" },
};

const RARITY_ORDER: BadgeRarity[] = ["bronze", "silver", "gold", "platinum"];

function ScrollRow({ rarity, badges, earnedIds, earnedMap }: {
  rarity: BadgeRarity;
  badges: any[];
  earnedIds: Set<string>;
  earnedMap: Map<string, string>;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const cfg = rarityConfig[rarity];
  const Icon = cfg.icon;
  const earned = badges.filter((b: any) => earnedIds.has(b.id)).length;

  const scroll = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 300, behavior: "smooth" });
  };

  if (badges.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative group/row"
    >
      {/* Row header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", cfg.bgColor)}>
            <Icon className={cn("w-5 h-5", cfg.color)} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">{cfg.label}</h2>
            <p className="text-xs text-muted-foreground">
              {earned} de {badges.length} conquistadas
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
          <button onClick={() => scroll(-1)} className="p-2 rounded-full bg-card border border-border hover:bg-muted transition-colors shadow-sm">
            <ChevronLeft className="w-4 h-4 text-foreground" />
          </button>
          <button onClick={() => scroll(1)} className="p-2 rounded-full bg-card border border-border hover:bg-muted transition-colors shadow-sm">
            <ChevronRight className="w-4 h-4 text-foreground" />
          </button>
        </div>
      </div>

      {/* Scroll container with fade edges */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto overflow-y-visible py-3 px-1 -my-3 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
        >
          {badges.map((insignia: any, i: number) => (
            <motion.div
              key={insignia.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              className="shrink-0 w-[150px] sm:w-[165px] snap-start"
            >
              <BadgeCard
                insignia={insignia}
                earned={earnedIds.has(insignia.id)}
                earnedAt={earnedMap.get(insignia.id)}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

const ConquistasPage = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { data: insignias, isLoading: insigniasLoading } = useInsignias();
  const { data: userInsignias, isLoading: userInsigniasLoading } = useUserInsignias();

  const isLoading = authLoading || insigniasLoading || userInsigniasLoading;

  const earnedBadgeIds = useMemo(() => new Set(userInsignias?.map((ui) => ui.insignia_id) || []), [userInsignias]);
  const earnedBadgesMap = useMemo(() => {
    const map = new Map<string, string>();
    userInsignias?.forEach((ui) => map.set(ui.insignia_id, ui.earned_at));
    return map;
  }, [userInsignias]);

  const byRarity = useMemo(() => {
    const groups: Record<BadgeRarity, any[]> = { bronze: [], silver: [], gold: [], platinum: [] };
    insignias?.forEach((i) => groups[i.rarity].push(i));
    return groups;
  }, [insignias]);

  const stats = useMemo(() => {
    if (!insignias) return { total: 0, earned: 0 };
    return { total: insignias.length, earned: userInsignias?.length || 0 };
  }, [insignias, userInsignias]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16 text-center">
          <Lock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">Acesso Restrito</h1>
          <p className="text-muted-foreground mb-6">Faça login para ver suas conquistas</p>
          <Button onClick={() => navigate("/auth")}>Fazer Login</Button>
        </main>
        <Footer />
      </div>
    );
  }

  const progressPct = stats.total ? Math.round((stats.earned / stats.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">

          {/* Hero banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-6 sm:p-8 mb-10"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-accent/10 rounded-full -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-white/5 rounded-full translate-y-1/2" />

            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
              {/* Trophy visual */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shrink-0">
                <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-accent" />
              </div>

              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-primary-foreground mb-1">
                  Suas Conquistas
                </h1>
                <p className="text-primary-foreground/70 text-sm sm:text-base mb-4">
                  Colecione insígnias e mostre seu progresso como aviador
                </p>

                {/* Progress bar */}
                <div className="max-w-md">
                  <div className="flex items-center justify-between text-xs text-primary-foreground/80 mb-1.5">
                    <span className="font-medium">{stats.earned} de {stats.total} insígnias</span>
                    <span className="font-bold">{progressPct}%</span>
                  </div>
                  <div className="h-2.5 bg-white/15 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPct}%` }}
                      transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                      className="h-full bg-accent rounded-full"
                    />
                  </div>
                </div>
              </div>

              {/* Rarity summary pills */}
              <div className="grid grid-cols-4 sm:grid-cols-2 gap-2 shrink-0">
                {RARITY_ORDER.map((rarity) => {
                  const cfg = rarityConfig[rarity];
                  const group = byRarity[rarity] || [];
                  const earned = group.filter((b: any) => earnedBadgeIds.has(b.id)).length;
                  return (
                    <div
                      key={rarity}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10"
                    >
                      <cfg.icon className="w-3.5 h-3.5 text-primary-foreground/80" />
                      <span className="text-xs font-semibold text-primary-foreground">
                        {earned}/{group.length}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Recently earned highlight */}
          {userInsignias && userInsignias.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mb-10"
            >
              <div className="flex items-center gap-2 mb-4 px-1">
                <Sparkles className="w-5 h-5 text-accent" />
                <h2 className="text-lg font-bold text-foreground">Últimas Conquistas</h2>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-3" style={{ scrollbarWidth: "none" }}>
                {[...userInsignias]
                  .sort((a, b) => new Date(b.earned_at).getTime() - new Date(a.earned_at).getTime())
                  .slice(0, 6)
                  .map((ui) => {
                    const badge = insignias?.find((i) => i.id === ui.insignia_id);
                    if (!badge) return null;
                    return (
                      <div key={ui.id} className="shrink-0 w-[150px] sm:w-[165px]">
                        <BadgeCard insignia={badge} earned earnedAt={ui.earned_at} />
                      </div>
                    );
                  })}
              </div>
            </motion.div>
          )}

          {/* Badge rows by rarity */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-8">
              {RARITY_ORDER.map((rarity, i) => (
                <motion.div key={rarity} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 + i * 0.1 }}>
                  <ScrollRow
                    rarity={rarity}
                    badges={byRarity[rarity] || []}
                    earnedIds={earnedBadgeIds}
                    earnedMap={earnedBadgesMap}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ConquistasPage;
