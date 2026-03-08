import { useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Trophy, Lock, Award, Star, Crown, Gem, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BadgeCard } from "@/components/badges/BadgeCard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useInsignias, useUserInsignias, BadgeRarity } from "@/hooks/useInsignias";
import { cn } from "@/lib/utils";

const rarityConfig: Record<BadgeRarity, { icon: React.ElementType; label: string; gradient: string }> = {
  bronze: { icon: Award, label: "Bronze", gradient: "from-amber-700 to-amber-900" },
  silver: { icon: Star, label: "Prata", gradient: "from-slate-400 to-slate-600" },
  gold: { icon: Crown, label: "Ouro", gradient: "from-yellow-400 to-yellow-600" },
  platinum: { icon: Gem, label: "Platina", gradient: "from-cyan-300 via-purple-400 to-pink-400" },
};

const RARITY_ORDER: BadgeRarity[] = ["bronze", "silver", "gold", "platinum"];

function ScrollRow({ title, icon: Icon, gradient, badges, earnedIds, earnedMap, earned, total }: {
  title: string;
  icon: React.ElementType;
  gradient: string;
  badges: any[];
  earnedIds: Set<string>;
  earnedMap: Map<string, string>;
  earned: number;
  total: number;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 280, behavior: "smooth" });
  };

  if (badges.length === 0) return null;

  return (
    <div className="mb-8">
      {/* Row header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2.5">
          <div className={cn("w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center", gradient)}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-foreground leading-tight">{title}</h2>
            <p className="text-xs text-muted-foreground">{earned}/{total} conquistadas</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1">
          <button onClick={() => scroll(-1)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <button onClick={() => scroll(1)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Scrollable row */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {badges.map((insignia, i) => (
          <motion.div
            key={insignia.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
            className="shrink-0 w-[140px] sm:w-[160px] snap-start"
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
          {/* Hero */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary mb-4">
              <Trophy className="w-4 h-4" />
              <span className="text-sm font-semibold">Suas Conquistas</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Insígnias</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Colecione insígnias completando desafios e avançando nos seus estudos.
            </p>
          </motion.div>

          {/* Overall Progress */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-xl mx-auto mb-10 p-4 rounded-xl bg-card border border-border"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Progresso Geral</span>
              <span className="text-sm text-muted-foreground font-medium">{stats.earned}/{stats.total} • {progressPct}%</span>
            </div>
            <Progress value={progressPct} className="h-2.5" />
            <div className="flex items-center justify-between mt-3 gap-2">
              {RARITY_ORDER.map((rarity) => {
                const cfg = rarityConfig[rarity];
                const group = byRarity[rarity] || [];
                const earned = group.filter((b: any) => earnedBadgeIds.has(b.id)).length;
                return (
                  <div key={rarity} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className={cn("w-5 h-5 rounded bg-gradient-to-br flex items-center justify-center", cfg.gradient)}>
                      <cfg.icon className="w-3 h-3 text-white" />
                    </div>
                    <span>{earned}/{group.length}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Netflix-style rows by rarity */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div>
              {RARITY_ORDER.map((rarity) => {
                const cfg = rarityConfig[rarity];
                const badges = byRarity[rarity] || [];
                const earned = badges.filter((b: any) => earnedBadgeIds.has(b.id)).length;
                return (
                  <ScrollRow
                    key={rarity}
                    title={cfg.label}
                    icon={cfg.icon}
                    gradient={cfg.gradient}
                    badges={badges}
                    earnedIds={earnedBadgeIds}
                    earnedMap={earnedBadgesMap}
                    earned={earned}
                    total={badges.length}
                  />
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ConquistasPage;
