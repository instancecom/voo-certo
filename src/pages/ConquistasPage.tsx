import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Trophy, Lock, Award, Star, Crown, Gem, Filter } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BadgeCard } from "@/components/badges/BadgeCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { usePlan } from "@/hooks/usePlan";
import { PlanGate } from "@/components/PlanGate";
import { useInsignias, useUserInsignias, BadgeRarity } from "@/hooks/useInsignias";
import { Loader2 } from "lucide-react";

const rarityIcons: Record<BadgeRarity, React.ElementType> = {
  bronze: Award,
  silver: Star,
  gold: Crown,
  platinum: Gem,
};

const rarityLabels: Record<BadgeRarity, string> = {
  bronze: "Bronze",
  silver: "Prata",
  gold: "Ouro",
  platinum: "Platina",
};

const ConquistasPage = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { canAccessConquistas } = usePlan();
  const { data: insignias, isLoading: insigniasLoading } = useInsignias();
  const { data: userInsignias, isLoading: userInsigniasLoading } = useUserInsignias();
  const [selectedRarity, setSelectedRarity] = useState<BadgeRarity | "all">("all");

  const isLoading = authLoading || insigniasLoading || userInsigniasLoading;

  const earnedBadgeIds = useMemo(() => {
    return new Set(userInsignias?.map((ui) => ui.insignia_id) || []);
  }, [userInsignias]);

  const earnedBadgesMap = useMemo(() => {
    const map = new Map<string, string>();
    userInsignias?.forEach((ui) => {
      map.set(ui.insignia_id, ui.earned_at);
    });
    return map;
  }, [userInsignias]);

  const filteredInsignias = useMemo(() => {
    if (!insignias) return [];
    if (selectedRarity === "all") return insignias;
    return insignias.filter((i) => i.rarity === selectedRarity);
  }, [insignias, selectedRarity]);

  const stats = useMemo(() => {
    if (!insignias || !userInsignias) return { total: 0, earned: 0, byRarity: {} as Record<BadgeRarity, { total: number; earned: number }> };
    
    const byRarity: Record<BadgeRarity, { total: number; earned: number }> = {
      bronze: { total: 0, earned: 0 },
      silver: { total: 0, earned: 0 },
      gold: { total: 0, earned: 0 },
      platinum: { total: 0, earned: 0 },
    };

    insignias.forEach((i) => {
      byRarity[i.rarity].total++;
      if (earnedBadgeIds.has(i.id)) {
        byRarity[i.rarity].earned++;
      }
    });

    return {
      total: insignias.length,
      earned: userInsignias.length,
      byRarity,
    };
  }, [insignias, userInsignias, earnedBadgeIds]);

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
          <p className="text-muted-foreground mb-6">
            Faça login para ver suas conquistas
          </p>
          <Button onClick={() => navigate("/auth")}>Fazer Login</Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Trophy className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Minhas Conquistas</h1>
          <p className="text-muted-foreground">
            Colecione insígnias e mostre seu progresso
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
        >
          {/* Total Progress */}
          <div className="col-span-2 md:col-span-1 bg-card border rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-primary">
              {stats.earned}/{stats.total}
            </div>
            <p className="text-sm text-muted-foreground">Total</p>
            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${(stats.earned / stats.total) * 100}%` }}
              />
            </div>
          </div>

          {/* By Rarity */}
          {(Object.keys(stats.byRarity) as BadgeRarity[]).map((rarity) => {
            const Icon = rarityIcons[rarity];
            const data = stats.byRarity[rarity];
            return (
              <div key={rarity} className="bg-card border rounded-xl p-4 text-center">
                <Icon className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                <div className="text-xl font-bold">
                  {data.earned}/{data.total}
                </div>
                <p className="text-xs text-muted-foreground">{rarityLabels[rarity]}</p>
              </div>
            );
          })}
        </motion.div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-4 mb-6">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <Tabs value={selectedRarity} onValueChange={(v) => setSelectedRarity(v as BadgeRarity | "all")}>
            <TabsList>
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="bronze">Bronze</TabsTrigger>
              <TabsTrigger value="silver">Prata</TabsTrigger>
              <TabsTrigger value="gold">Ouro</TabsTrigger>
              <TabsTrigger value="platinum">Platina</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Badges Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
          >
            {filteredInsignias.map((insignia, index) => (
              <motion.div
                key={insignia.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
              >
                <BadgeCard
                  insignia={insignia}
                  earned={earnedBadgeIds.has(insignia.id)}
                  earnedAt={earnedBadgesMap.get(insignia.id)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {filteredInsignias.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              Nenhuma insígnia encontrada nesta categoria
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ConquistasPage;
