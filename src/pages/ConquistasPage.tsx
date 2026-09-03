import { useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Trophy, Lock, Award, Star, Crown, Gem, Loader2, Sparkles } from "lucide-react";
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

function BadgeTierSection({ rarity, badges, earnedIds, earnedMap }: {
  rarity: BadgeRarity;
  badges: any[];
  earnedIds: Set<string>;
  earnedMap: Map<string, string>;
}) {
  const cfg = rarityConfig[rarity];
  const Icon = cfg.icon;
  const earned = badges.filter((b: any) => earnedIds.has(b.id)).length;

  if (badges.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      {/* Row header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-[5px] flex items-center justify-center", cfg.bgColor)}>
            <Icon className={cn("w-5 h-5", cfg.color)} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">{cfg.label}</h2>
            <p className="text-xs text-muted-foreground">
              {earned} de {badges.length} conquistadas
            </p>
          </div>
        </div>
      </div>

      {/* Grid container em vez de scroll horizontal */}
      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 gap-x-2 gap-y-6 sm:gap-4 py-4">
        {badges.map((insignia: any, i: number) => (
          <motion.div
            key={insignia.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
          >
            <BadgeCard
              insignia={insignia}
              earned={earnedIds.has(insignia.id)}
              earnedAt={earnedMap.get(insignia.id)}
            />
          </motion.div>
        ))}
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
    <div className="min-h-screen bg-[#F5F7F9] flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">

          {/* Hero banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-[5px] bg-white border border-yellow-500/30 shadow-sm p-6 sm:p-8 mb-10"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-500/5 rounded-full -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-yellow-500/5 rounded-full translate-y-1/2" />

            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
              {/* Trophy visual */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[5px] bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shrink-0">
                <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-accent" />
              </div>

              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A233A] mb-1">
                  Suas Conquistas
                </h1>
                <p className="text-[#1A233A]/70 text-sm sm:text-base mb-4">
                  Colecione insígnias e mostre seu progresso como aviador
                </p>

                {/* Progress bar */}
                <div className="max-w-md">
                  <div className="flex items-center justify-between text-xs text-[#1A233A]/80 mb-1.5">
                    <span className="font-medium">{stats.earned} de {stats.total} insígnias conquistadas</span>
                    <span className="font-bold text-yellow-600">{progressPct}%</span>
                  </div>
                  <div className="h-2.5 bg-gray-200 rounded-[5px] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPct}%` }}
                      transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-[5px]"
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
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] bg-yellow-500/10 border border-yellow-500/20"
                    >
                      <cfg.icon className="w-3.5 h-3.5 text-yellow-600" />
                      <span className="text-xs font-semibold text-[#1A233A]">
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
              <div className="grid grid-cols-3 gap-2 sm:gap-4 pb-3">
                {[...userInsignias]
                  .sort((a, b) => new Date(b.earned_at).getTime() - new Date(a.earned_at).getTime())
                  .slice(0, 3)
                  .map((ui) => {
                    const badge = insignias?.find((i) => i.id === ui.insignia_id);
                    if (!badge) return null;
                    return (
                      <div key={ui.id} className="w-full">
                        <BadgeCard insignia={badge} earned earnedAt={ui.earned_at} large />
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
                  <BadgeTierSection
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
