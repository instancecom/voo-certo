import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Brain, Award, BarChart3 } from 'lucide-react';
import { TimeRange } from '@/hooks/useAdminStats';

interface FilterControlsProps {
  timeRange: TimeRange;
  setTimeRange: (range: TimeRange) => void;
  microcourses: { id: string; title: string }[];
  selectedMicrocourse: string;
  setSelectedMicrocourse: (id: string) => void;
  insignias: { id: string; name: string }[];
  selectedInsignia: string;
  setSelectedInsignia: (id: string) => void;
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
}: FilterControlsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
      {/* Time Range Filter */}
      <div className="space-y-1.5">
        <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1 flex items-center gap-1.5">
          <Calendar className="w-3 h-3" /> Período
        </label>
        <Select value={timeRange} onValueChange={val => setTimeRange(val as TimeRange)}>
          <SelectTrigger className="h-11 rounded-xl bg-card border-2 border-primary/10 hover:border-primary/30 transition-all font-semibold shadow-sm px-4">
            <SelectValue placeholder="Selecione o período" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-2 p-1.5">
            <SelectItem value="total" className="rounded-lg h-10">Total Acumulado</SelectItem>
            <SelectItem value="30days" className="rounded-lg h-10">Últimos 30 dias</SelectItem>
            <SelectItem value="7days" className="rounded-lg h-10">Últimos 7 dias</SelectItem>
            <SelectItem value="today" className="rounded-lg h-10">Hoje</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Microcourse Filter */}
      <div className="space-y-1.5">
        <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1 flex items-center gap-1.5">
          <Brain className="w-3 h-3" /> Microcursos
        </label>
        <Select value={selectedMicrocourse} onValueChange={setSelectedMicrocourse}>
          <SelectTrigger className="h-11 rounded-xl bg-card border-2 border-primary/10 hover:border-primary/30 transition-all font-semibold shadow-sm px-4">
            <SelectValue placeholder="Filtrar por Curso" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-2 p-1.5 max-h-[300px]">
            <SelectItem value="all" className="rounded-lg h-10 font-bold text-primary italic">Todos os cursos</SelectItem>
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
          <SelectTrigger className="h-11 rounded-xl bg-card border-2 border-primary/10 hover:border-primary/30 transition-all font-semibold shadow-sm px-4">
            <SelectValue placeholder="Filtrar por Insígnia" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-2 p-1.5">
            <SelectItem value="all" className="rounded-lg h-10 font-bold text-primary italic">Todas as insígnias</SelectItem>
            {insignias.map(ins => (
              <SelectItem key={ins.id} value={ins.id} className="rounded-lg h-10">{ins.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
