import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Calendar, Brain, Award, ShieldCheck, Search, Filter } from 'lucide-react';
import { TimeRange, PLAN_LABEL } from '@/hooks/useAdminStats';

interface FilterControlsProps {
  timeRange: TimeRange;
  setTimeRange: (range: TimeRange) => void;
  microcourses: { id: string; title: string }[];
  selectedMicrocourse: string;
  setSelectedMicrocourse: (id: string) => void;
  insignias: { id: string; name: string }[];
  selectedInsignia: string;
  setSelectedInsignia: (id: string) => void;
  selectedPlan: string;
  setSelectedPlan: (plan: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function FilterControls({
  timeRange,
  setTimeRange,
  microcourses,
  selectedMicrocourse,
  setSelectedMicrocourse,
  insignias,
  selectedInsignia,
  setSelectedInsignia,
  selectedPlan,
  setSelectedPlan,
  searchQuery,
  setSearchQuery,
}: FilterControlsProps) {
  return (
    <div className="space-y-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search Filter */}
        <div className="space-y-1.5 lg:col-span-2">
          <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1 flex items-center gap-1.5">
            <Search className="w-3 h-3" /> Pesquisar Aluno
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-50" />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nome ou e-mail do aluno..."
              className="h-11 pl-10 rounded-xl bg-card border-border hover:border-primary/30 transition-all font-semibold shadow-sm"
            />
          </div>
        </div>

        {/* Time Range Filter */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1 flex items-center gap-1.5">
            <Calendar className="w-3 h-3" /> Período
          </label>
          <Select value={timeRange} onValueChange={val => setTimeRange(val as TimeRange)}>
            <SelectTrigger className="h-11 rounded-xl bg-card border-border hover:border-primary/30 transition-all font-semibold shadow-sm px-4">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border">
              <SelectItem value="total" className="rounded-lg h-10">Total Acumulado</SelectItem>
              <SelectItem value="30days" className="rounded-lg h-10">Últimos 30 dias</SelectItem>
              <SelectItem value="7days" className="rounded-lg h-10">Últimos 7 dias</SelectItem>
              <SelectItem value="today" className="rounded-lg h-10">Hoje</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Plan Filter */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1 flex items-center gap-1.5">
            <Filter className="w-3 h-3" /> Plano
          </label>
          <Select value={selectedPlan} onValueChange={setSelectedPlan}>
            <SelectTrigger className="h-11 rounded-xl bg-card border-border hover:border-primary/30 transition-all font-semibold shadow-sm px-4">
              <SelectValue placeholder="Filtrar por Plano" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border">
              <SelectItem value="all" className="rounded-lg h-10 italic">Todos os planos</SelectItem>
              {Object.entries(PLAN_LABEL).map(([id, label]) => (
                <SelectItem key={id} value={id} className="rounded-lg h-10">{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Microcourse Filter */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1 flex items-center gap-1.5">
            <Brain className="w-3 h-3" /> Microcursos
          </label>
          <Select value={selectedMicrocourse} onValueChange={setSelectedMicrocourse}>
            <SelectTrigger className="h-11 rounded-xl bg-card border-border hover:border-primary/30 transition-all font-semibold shadow-sm px-4">
              <SelectValue placeholder="Filtrar por Curso" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border max-h-[300px]">
              <SelectItem value="all" className="rounded-lg h-10 italic">Todos os cursos</SelectItem>
              {microcourses.map(mc => (
                <SelectItem key={mc.id} value={mc.id} className="rounded-lg h-10 truncate max-w-[200px]">{mc.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Insignia Filter */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1 flex items-center gap-1.5">
            <Award className="w-3 h-3" /> Insígnias
          </label>
          <Select value={selectedInsignia} onValueChange={setSelectedInsignia}>
            <SelectTrigger className="h-11 rounded-xl bg-card border-border hover:border-primary/30 transition-all font-semibold shadow-sm px-4">
              <SelectValue placeholder="Filtrar por Insígnia" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border">
              <SelectItem value="all" className="rounded-lg h-10 italic">Todas as insígnias</SelectItem>
              {insignias.map(ins => (
                <SelectItem key={ins.id} value={ins.id} className="rounded-lg h-10">{ins.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
