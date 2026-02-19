import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Plus, Pencil, Trash2, Save, X, Play, BookOpen, Clock } from 'lucide-react';

interface Microcourse {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  category: string;
  tags: string[];
  duration_minutes: number;
  display_order: number;
  is_active: boolean;
}

const CATEGORIES = [
  { value: 'seguranca', label: 'Segurança' },
  { value: 'regulamentacao', label: 'Regulamentação' },
  { value: 'procedimentos', label: 'Procedimentos' },
  { value: 'emergencias', label: 'Emergências' },
  { value: 'ingles', label: 'Inglês' },
  { value: 'geral', label: 'Geral' },
];

const emptyForm = {
  title: '',
  description: '',
  content: '',
  video_url: '',
  thumbnail_url: '',
  category: 'geral',
  tags: '',
  duration_minutes: 10,
  display_order: 0,
  is_active: true,
};

function getYouTubeEmbedUrl(url: string): string {
  if (!url) return '';
  if (url.includes('youtube.com/embed/')) return url;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (match) return `https://www.youtube.com/embed/${match[1]}`;
  return url;
}

export function MicrocoursesManager() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: courses, isLoading } = useQuery({
    queryKey: ['admin-microcourses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('microcourses')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as Microcourse[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof emptyForm) => {
      const payload = {
        title: data.title,
        description: data.description || null,
        content: data.content || null,
        video_url: data.video_url ? getYouTubeEmbedUrl(data.video_url) : null,
        thumbnail_url: data.thumbnail_url || null,
        category: data.category,
        tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        duration_minutes: data.duration_minutes,
        display_order: data.display_order,
        is_active: data.is_active,
      };

      if (editingId) {
        const { error } = await supabase.from('microcourses').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('microcourses').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-microcourses'] });
      queryClient.invalidateQueries({ queryKey: ['microcourses'] });
      toast.success(editingId ? 'Microcurso atualizado!' : 'Microcurso criado!');
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
    },
    onError: (err: any) => toast.error(`Erro: ${err.message}`),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('microcourses').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-microcourses'] });
      queryClient.invalidateQueries({ queryKey: ['microcourses'] });
      toast.success('Microcurso removido!');
    },
    onError: (err: any) => toast.error(`Erro: ${err.message}`),
  });

  const handleEdit = (course: Microcourse) => {
    setEditingId(course.id);
    setForm({
      title: course.title,
      description: course.description || '',
      content: course.content || '',
      video_url: course.video_url || '',
      thumbnail_url: course.thumbnail_url || '',
      category: course.category,
      tags: (course.tags || []).join(', '),
      duration_minutes: course.duration_minutes,
      display_order: course.display_order,
      is_active: course.is_active,
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Microcursos</h2>
          <p className="text-muted-foreground">Gerencie os microcursos disponíveis na plataforma.</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Novo Microcurso
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-lg">{editingId ? 'Editar Microcurso' : 'Novo Microcurso'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-foreground mb-1 block">Título *</label>
                <Input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Ex: Briefing de Segurança para Comissários"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Categoria</label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Duração (minutos)</label>
                <Input
                  type="number"
                  value={form.duration_minutes}
                  onChange={e => setForm(f => ({ ...f, duration_minutes: parseInt(e.target.value) || 5 }))}
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-foreground mb-1 block">
                  URL do YouTube
                  <span className="text-xs text-muted-foreground ml-2">(cole o link normal ou embed)</span>
                </label>
                <Input
                  value={form.video_url}
                  onChange={e => setForm(f => ({ ...f, video_url: e.target.value }))}
                  placeholder="https://www.youtube.com/watch?v=... ou https://youtu.be/..."
                />
                {form.video_url && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Embed: {getYouTubeEmbedUrl(form.video_url)}
                  </p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-foreground mb-1 block">Descrição</label>
                <Textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Breve descrição do conteúdo..."
                  rows={2}
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Conteúdo Texto <span className="text-xs text-muted-foreground">(complementar ao vídeo)</span>
                </label>
                <Textarea
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  placeholder="Conteúdo em texto, dicas, pontos importantes..."
                  rows={4}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Tags <span className="text-xs text-muted-foreground">(separadas por vírgula)</span>
                </label>
                <Input
                  value={form.tags}
                  onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                  placeholder="briefing, segurança, ANAC"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Ordem de exibição</label>
                <Input
                  type="number"
                  value={form.display_order}
                  onChange={e => setForm(f => ({ ...f, display_order: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => saveMutation.mutate(form)}
                disabled={!form.title || saveMutation.isPending}
                className="gap-2"
              >
                {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingId ? 'Atualizar' : 'Criar'} Microcurso
              </Button>
              <Button variant="outline" onClick={handleCancel} className="gap-2">
                <X className="w-4 h-4" /> Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : courses?.length === 0 ? (
        <div className="text-center py-12 bg-muted/50 rounded-xl">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Nenhum microcurso cadastrado.</p>
          <Button variant="outline" className="mt-4" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" /> Criar primeiro microcurso
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {courses?.map(course => {
            const cat = CATEGORIES.find(c => c.value === course.category);
            return (
              <Card key={course.id} className={`hover:border-primary/30 transition-colors ${!course.is_active ? 'opacity-60' : ''}`}>
                <CardContent className="py-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold text-foreground text-sm">{course.title}</h3>
                        <Badge variant="outline" className="text-xs">{cat?.label || course.category}</Badge>
                        {course.video_url && <Badge className="text-xs bg-primary/10 text-primary border-0"><Play className="w-2.5 h-2.5 mr-1" />Vídeo</Badge>}
                        {!course.is_active && <Badge variant="secondary" className="text-xs">Inativo</Badge>}
                      </div>
                      {course.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mb-1">{course.description}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{course.duration_minutes} min</span>
                        {course.tags?.length > 0 && <span>{course.tags.join(', ')}</span>}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(course)} className="h-8 w-8 p-0">
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (confirm('Remover este microcurso?')) deleteMutation.mutate(course.id);
                        }}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
