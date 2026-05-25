import React, { useState } from 'react';
import {
  useCareerGuides,
  useCreateCareerGuide,
  useUpdateCareerGuide,
  useDeleteCareerGuide,
  useCareerGuideWithSteps,
  useUpsertGuideStep,
  useDeleteGuideStep,
} from '@/hooks/useCareerGuides';
import { useSimuladoOptions } from '@/hooks/useGuiaEtapas';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Loader2, Plus, Trash2, Save, ArrowLeft, Edit, ChevronDown, ChevronUp, X, BookOpen, Layers, GraduationCap,
} from 'lucide-react';

function useMicrocourseOptions() {
  return useQuery({
    queryKey: ['microcourse-options'],
    queryFn: async () => {
      const { data, error } = await supabase.from('microcourses').select('id, title').eq('is_active', true).order('display_order');
      if (error) throw error;
      return data || [];
    },
  });
}

interface StepForm {
  id?: string;
  title: string;
  description: string;
  simulado_ids: string[];
  microcourse_ids: string[];
}

export function CareerGuidesManager() {
  const { data: guides, isLoading } = useCareerGuides();
  const createGuide = useCreateCareerGuide();
  const updateGuide = useUpdateCareerGuide();
  const deleteGuide = useDeleteCareerGuide();

  const [showForm, setShowForm] = useState(false);
  const [editingGuideId, setEditingGuideId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');

  const handleCreate = async () => {
    if (!formTitle.trim()) return toast.error('Título obrigatório');
    try {
      await createGuide.mutateAsync({ title: formTitle.trim(), description: formDesc.trim() });
      toast.success('Guia criado!');
      setShowForm(false);
      setFormTitle('');
      setFormDesc('');
    } catch { toast.error('Erro ao criar guia'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este guia e todas suas etapas?')) return;
    try {
      await deleteGuide.mutateAsync(id);
      toast.success('Guia excluído');
    } catch { toast.error('Erro ao excluir'); }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      await updateGuide.mutateAsync({ id, is_active: !current });
      toast.success(!current ? 'Guia ativado' : 'Guia desativado');
    } catch { toast.error('Erro ao atualizar'); }
  };

  if (editingGuideId) {
    return <GuideStepsEditor guideId={editingGuideId} onBack={() => setEditingGuideId(null)} />;
  }

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Guias de Carreira</h2>
          <p className="text-sm text-muted-foreground">Crie e gerencie guias com etapas sequenciais.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="w-full sm:w-auto shrink-0">
          <Plus className="w-4 h-4 mr-2" />Novo Guia
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div>
              <Label>Título do Guia</Label>
              <Input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="Ex: Como ser Comissário de Bordo" />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="Descrição geral do guia..." />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button onClick={handleCreate} disabled={createGuide.isPending}>
                {createGuide.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <Save className="w-4 h-4 mr-2" />Criar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {guides?.length === 0 && (
          <p className="text-center text-muted-foreground py-12">Nenhum guia criado ainda.</p>
        )}
        {guides?.map(guide => (
          <Card key={guide.id}>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <CardTitle className="text-base sm:text-lg font-bold text-foreground">
                      {guide.title}
                    </CardTitle>
                    <Badge variant={guide.is_active ? 'default' : 'secondary'} className="text-xs shrink-0 rounded-[5px]">
                      {guide.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  {guide.description && <CardDescription className="mt-1.5 leading-relaxed line-clamp-2">{guide.description}</CardDescription>}
                </div>
                <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t border-border/50 sm:border-0 w-full sm:w-auto shrink-0 mt-2 sm:mt-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-muted-foreground">
                      Status:
                    </span>
                    <Switch checked={guide.is_active} onCheckedChange={() => handleToggleActive(guide.id, guide.is_active)} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditingGuideId(guide.id)} className="h-9 px-3 rounded-[5px]">
                      <Edit className="w-4 h-4 mr-1.5" />Etapas
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(guide.id)} className="text-destructive hover:bg-destructive/10 h-9 w-9 p-0 rounded-[5px]">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}

function GuideStepsEditor({ guideId, onBack }: { guideId: string; onBack: () => void }) {
  const { data: guide, isLoading } = useCareerGuideWithSteps(guideId);
  const { data: simuladoOptions } = useSimuladoOptions();
  const { data: microcourseOptions } = useMicrocourseOptions();
  const upsertStep = useUpsertGuideStep();
  const deleteStep = useDeleteGuideStep();

  const [editingStep, setEditingStep] = useState<StepForm | null>(null);
  const [isNew, setIsNew] = useState(false);

  const handleAddStep = () => {
    setIsNew(true);
    setEditingStep({
      title: '',
      description: '',
      simulado_ids: [],
      microcourse_ids: [],
    });
  };

  const handleEditStep = (step: any) => {
    setIsNew(false);
    setEditingStep({
      id: step.id,
      title: step.title,
      description: step.description || '',
      simulado_ids: step.simulado_ids || [],
      microcourse_ids: step.microcourse_ids || [],
    });
  };

  const handleSaveStep = async () => {
    if (!editingStep?.title.trim()) return toast.error('Título da etapa obrigatório');
    try {
      await upsertStep.mutateAsync({
        id: editingStep.id,
        guide_id: guideId,
        title: editingStep.title.trim(),
        description: editingStep.description.trim(),
        step_order: isNew ? (guide?.steps?.length || 0) : (guide?.steps?.findIndex(s => s.id === editingStep.id) ?? 0),
        simulado_ids: editingStep.simulado_ids,
        microcourse_ids: editingStep.microcourse_ids,
      });
      toast.success(isNew ? 'Etapa adicionada!' : 'Etapa atualizada!');
      setEditingStep(null);
    } catch { toast.error('Erro ao salvar etapa'); }
  };

  const handleDeleteStep = async (id: string) => {
    if (!confirm('Excluir esta etapa?')) return;
    try {
      await deleteStep.mutateAsync({ id, guide_id: guideId });
      toast.success('Etapa excluída');
    } catch { toast.error('Erro ao excluir'); }
  };

  const addSimulado = (value: string) => {
    if (!editingStep || !value || value === 'none') return;
    const parts = value.split(':');
    const idWithMode = parts.slice(1).join(':');
    if (!editingStep.simulado_ids.includes(idWithMode)) {
      setEditingStep({ ...editingStep, simulado_ids: [...editingStep.simulado_ids, idWithMode] });
    }
  };

  const removeSimulado = (id: string) => {
    if (!editingStep) return;
    setEditingStep({ ...editingStep, simulado_ids: editingStep.simulado_ids.filter(s => s !== id) });
  };

  const addMicrocourse = (value: string) => {
    if (!editingStep || !value || value === 'none') return;
    if (!editingStep.microcourse_ids.includes(value)) {
      setEditingStep({ ...editingStep, microcourse_ids: [...editingStep.microcourse_ids, value] });
    }
  };

  const removeMicrocourse = (id: string) => {
    if (!editingStep) return;
    setEditingStep({ ...editingStep, microcourse_ids: editingStep.microcourse_ids.filter(m => m !== id) });
  };

  const getSimuladoLabel = (item: string) => {
    const [id, mode] = item.split(':');
    const opt = simuladoOptions?.find(o => o.id === id);
    if (!opt) return id.substring(0, 8);
    const baseName = opt.type === 'subcategory' && opt.parentName ? `${opt.parentName} - ${opt.name}` : opt.name;
    if (mode === 'banca_anac') return `${baseName} (Modo Banca)`;
    if (mode === 'livre') return `${baseName} (Modo Livre)`;
    if (mode === 'bloco') return `${baseName} (Modo Bloco)`;
    return baseName;
  };

  const getMicrocourseLabel = (id: string) => {
    return microcourseOptions?.find(m => m.id === id)?.title || id.substring(0, 8);
  };

  const renderStepForm = () => {
    if (!editingStep) return null;

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const textarea = e.currentTarget;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = editingStep.description.substring(start, end);
        
        const url = window.prompt('Digite a URL de destino:');
        if (url) {
          const textToInsert = `[${selectedText || 'clique aqui'}](${url})`;
          const newDescription = 
            editingStep.description.substring(0, start) + 
            textToInsert + 
            editingStep.description.substring(end);
          
          setEditingStep({ ...editingStep, description: newDescription });
          
          setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + textToInsert.length, start + textToInsert.length);
          }, 10);
        }
      }
    };

    return (
      <Card className="bg-muted/50 border-primary">
        <CardContent className="pt-6 space-y-4">
          <h3 className="font-semibold text-primary">{isNew ? 'Nova Etapa' : 'Editar Etapa'}</h3>
          <div>
            <Label>Título da Etapa</Label>
            <Input value={editingStep.title} onChange={e => setEditingStep({ ...editingStep, title: e.target.value })} placeholder="Ex: Inscrição no processo seletivo" />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <Label>Descrição / Instruções</Label>
              <span className="text-[10px] text-muted-foreground">Selecione texto e pressione <kbd className="px-1 border rounded bg-background">Ctrl</kbd> + <kbd className="px-1 border rounded bg-background">K</kbd> para link</span>
            </div>
            <Textarea 
              value={editingStep.description} 
              onChange={e => setEditingStep({ ...editingStep, description: e.target.value })} 
              onKeyDown={handleKeyDown}
              placeholder="O que o aluno deve fazer nesta etapa..." 
              rows={4} 
            />
          </div>

          {/* Simulados */}
          <div>
            <Label className="text-sm">Simulados Associados</Label>
            <div className="flex flex-wrap gap-1 mb-2">
              {editingStep.simulado_ids.map(id => (
                <Badge key={id} variant="secondary" className="flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />{getSimuladoLabel(id)}
                  <button onClick={() => removeSimulado(id)} className="ml-1 hover:text-destructive"><X className="w-3 h-3" /></button>
                </Badge>
              ))}
            </div>
            <Select onValueChange={addSimulado}>
              <SelectTrigger className="max-w-md"><SelectValue placeholder="Adicionar simulado..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Selecione...</SelectItem>
                {simuladoOptions?.map(o => {
                  const isCategory = o.type === 'category';
                  const prefix = isCategory ? 'category' : 'subcategory';
                  const icon = isCategory ? '📚' : '📋';
                  const name = isCategory ? o.name : `${o.parentName} - ${o.name}`;
                  
                  return (
                    <React.Fragment key={o.id}>
                      <SelectItem value={`${prefix}:${o.id}`} disabled={editingStep.simulado_ids.includes(o.id)}>
                        {icon} {name}
                      </SelectItem>
                      {o.activeModes?.includes('banca_anac') && (
                        <SelectItem value={`${prefix}:${o.id}:banca_anac`} disabled={editingStep.simulado_ids.includes(`${o.id}:banca_anac`)}>
                          {icon} {name} (Modo Banca)
                        </SelectItem>
                      )}
                      {o.activeModes?.includes('livre') && (
                        <SelectItem value={`${prefix}:${o.id}:livre`} disabled={editingStep.simulado_ids.includes(`${o.id}:livre`)}>
                          {icon} {name} (Modo Livre)
                        </SelectItem>
                      )}
                      {isCategory && o.activeModes?.includes('bloco') && (
                        <SelectItem value={`${prefix}:${o.id}:bloco`} disabled={editingStep.simulado_ids.includes(`${o.id}:bloco`)}>
                          {icon} {name} (Modo Bloco)
                        </SelectItem>
                      )}
                    </React.Fragment>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Microcursos */}
          <div>
            <Label className="text-sm">Microcursos Associados</Label>
            <div className="flex flex-wrap gap-1 mb-2">
              {editingStep.microcourse_ids.map(id => (
                <Badge key={id} variant="secondary" className="flex items-center gap-1">
                  <GraduationCap className="w-3 h-3" />{getMicrocourseLabel(id)}
                  <button onClick={() => removeMicrocourse(id)} className="ml-1 hover:text-destructive"><X className="w-3 h-3" /></button>
                </Badge>
              ))}
            </div>
            <Select onValueChange={addMicrocourse}>
              <SelectTrigger className="max-w-md"><SelectValue placeholder="Adicionar microcurso..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Selecione...</SelectItem>
                {microcourseOptions?.map(m => (
                  <SelectItem key={m.id} value={m.id} disabled={editingStep.microcourse_ids.includes(m.id)}>
                    🎓 {m.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button variant="ghost" onClick={() => setEditingStep(null)}>Cancelar</Button>
            <Button onClick={handleSaveStep} disabled={upsertStep.isPending}>
              {upsertStep.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Save className="w-4 h-4 mr-2" />Salvar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="w-4 h-4" /></Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">{guide?.title}</h2>
          <p className="text-muted-foreground">Gerencie as etapas deste guia</p>
        </div>
      </div>

      {/* Steps list */}
      <div className="space-y-3">
        {guide?.steps?.map((step, index) => (
          editingStep && !isNew && editingStep.id === step.id ? (
            <div key={step.id} className="animate-in fade-in slide-in-from-top-2">
              {renderStepForm()}
            </div>
          ) : (
            <Card key={step.id} className="border-l-4 border-l-accent">
              <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-sm font-bold text-accent shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base font-bold text-foreground">{step.title}</CardTitle>
                      {step.description && <CardDescription className="mt-1.5 leading-relaxed line-clamp-2">{step.description}</CardDescription>}
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2.5 sm:pt-0 border-t border-border/50 sm:border-0 w-full sm:w-auto shrink-0 mt-1 sm:mt-0">
                    <Button variant="outline" size="sm" onClick={() => handleEditStep(step)} className="h-8 px-2.5 rounded-[5px]">
                      <Edit className="w-3.5 h-3.5 mr-1.5" />Editar
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteStep(step.id)} className="text-destructive hover:bg-destructive/10 h-8 w-8 p-0 rounded-[5px]">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-1">
                  {step.simulado_ids?.map(id => (
                    <Badge key={id} variant="outline" className="text-xs"><BookOpen className="w-3 h-3 mr-1" />{getSimuladoLabel(id)}</Badge>
                  ))}
                  {step.microcourse_ids?.map(id => (
                    <Badge key={id} variant="secondary" className="text-xs"><GraduationCap className="w-3 h-3 mr-1" />{getMicrocourseLabel(id)}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        ))}
      </div>

      {/* Add new step or Add button */}
      {editingStep && isNew ? (
        <div className="animate-in fade-in slide-in-from-top-2">
          {renderStepForm()}
        </div>
      ) : (
        <Button variant="outline" className="w-full border-dashed" onClick={handleAddStep}>
          <Plus className="w-4 h-4 mr-2" />Adicionar Etapa
        </Button>
      )}
    </div>
  );
}
