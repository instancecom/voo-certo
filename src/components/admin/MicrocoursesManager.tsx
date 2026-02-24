import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  Loader2, Plus, Pencil, Trash2, Save, X, Play, BookOpen,
  Clock, Youtube, Upload, Link2, Unplug, CheckCircle2, AlertCircle,
} from 'lucide-react';

interface Microcourse {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  youtube_video_id: string | null;
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

const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo'];
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

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

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
}

type VideoInputMode = 'link' | 'upload';

export function MicrocoursesManager() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [videoInputMode, setVideoInputMode] = useState<VideoInputMode>('link');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [youtubeConnected, setYoutubeConnected] = useState(false);
  const [youtubeChannel, setYoutubeChannel] = useState('');
  const [checkingYoutube, setCheckingYoutube] = useState(true);

  // Check YouTube connection status
  useEffect(() => {
    checkYoutubeStatus();
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'youtube_connected') {
        setYoutubeConnected(true);
        setYoutubeChannel(e.data.channel || '');
        toast.success('YouTube conectado com sucesso!');
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const checkYoutubeStatus = async () => {
    try {
      setCheckingYoutube(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await supabase.functions.invoke('youtube-upload', {
        body: null,
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      // Use query params approach
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const resp = await fetch(
        `https://${projectId}.supabase.co/functions/v1/youtube-upload?action=status`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        }
      );
      const data = await resp.json();
      setYoutubeConnected(data.connected);
      setYoutubeChannel(data.channel_title || '');
    } catch {
      // Ignore
    } finally {
      setCheckingYoutube(false);
    }
  };

  const handleConnectYoutube = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return toast.error('Faça login primeiro');
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const resp = await fetch(
        `https://${projectId}.supabase.co/functions/v1/youtube-upload?action=auth_url`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        }
      );
      const data = await resp.json();
      if (data.url) {
        window.open(data.url, 'youtube_oauth', 'width=600,height=700');
      } else {
        toast.error(data.error || 'Erro ao gerar URL OAuth');
      }
    } catch (err: any) {
      toast.error(`Erro: ${err.message}`);
    }
  };

  const handleDisconnectYoutube = async () => {
    if (!confirm('Desconectar sua conta YouTube?')) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/youtube-upload?action=disconnect`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        }
      );
      setYoutubeConnected(false);
      setYoutubeChannel('');
      toast.success('YouTube desconectado');
    } catch {
      toast.error('Erro ao desconectar');
    }
  };

  // Extract video ID when URL changes
  const videoId = extractYouTubeId(form.video_url);

  const { data: courses, isLoading } = useQuery({
    queryKey: ['admin-microcourses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('microcourses')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as unknown as Microcourse[];
    },
  });

  const handleUploadToYoutube = async (): Promise<{ video_id: string; thumbnail_url: string } | null> => {
    if (!videoFile) return null;
    setIsUploading(true);
    setUploadProgress(10);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Não autenticado');

      const formData = new FormData();
      formData.append('video', videoFile);
      formData.append('title', form.title || 'Microcurso Voo Certo');
      formData.append('description', form.description || '');
      formData.append('privacy', 'unlisted');

      setUploadProgress(30);

      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const resp = await fetch(
        `https://${projectId}.supabase.co/functions/v1/youtube-upload`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: formData,
        }
      );

      setUploadProgress(80);

      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Falha no upload');

      setUploadProgress(100);
      toast.success('Vídeo enviado ao YouTube!');
      return { video_id: data.video_id, thumbnail_url: data.thumbnail_url };
    } catch (err: any) {
      toast.error(`Erro no upload: ${err.message}`);
      return null;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const saveMutation = useMutation({
    mutationFn: async (data: typeof emptyForm) => {
      let finalVideoId = extractYouTubeId(data.video_url);
      let finalVideoUrl = data.video_url;
      let finalThumbnail = data.thumbnail_url;

      // If uploading a file, do the YouTube upload first
      if (videoInputMode === 'upload' && videoFile) {
        const result = await handleUploadToYoutube();
        if (!result) throw new Error('Upload falhou');
        finalVideoId = result.video_id;
        finalVideoUrl = getYouTubeEmbedUrl(result.video_id);
        finalThumbnail = result.thumbnail_url;
      } else if (finalVideoId) {
        finalVideoUrl = getYouTubeEmbedUrl(finalVideoId);
        if (!finalThumbnail) {
          finalThumbnail = getYouTubeThumbnail(finalVideoId);
        }
      }

      const payload: Record<string, unknown> = {
        title: data.title,
        description: data.description || null,
        content: data.content || null,
        video_url: finalVideoUrl || null,
        thumbnail_url: finalThumbnail || null,
        category: data.category,
        tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        duration_minutes: data.duration_minutes,
        display_order: data.display_order,
        is_active: data.is_active,
      };

      // youtube_video_id may not be in types yet, use raw query
      if (finalVideoId) {
        (payload as any).youtube_video_id = finalVideoId;
      }

      if (editingId) {
        const { error } = await supabase.from('microcourses').update(payload as any).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('microcourses').insert(payload as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-microcourses'] });
      queryClient.invalidateQueries({ queryKey: ['microcourses'] });
      toast.success(editingId ? 'Microcurso atualizado!' : 'Microcurso criado!');
      handleCancel();
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
    const ytId = course.youtube_video_id || extractYouTubeId(course.video_url || '');
    setForm({
      title: course.title,
      description: course.description || '',
      content: course.content || '',
      video_url: ytId ? `https://www.youtube.com/watch?v=${ytId}` : (course.video_url || ''),
      thumbnail_url: course.thumbnail_url || '',
      category: course.category,
      tags: (course.tags || []).join(', '),
      duration_minutes: course.duration_minutes,
      display_order: course.display_order,
      is_active: course.is_active,
    });
    setVideoInputMode('link');
    setVideoFile(null);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setVideoFile(null);
    setVideoInputMode('link');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      toast.error('Formato não suportado. Use MP4, MOV, WebM ou AVI.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error('Arquivo excede o limite de 500MB.');
      return;
    }
    setVideoFile(file);
  };

  return (
    <div className="space-y-6">
      {/* YouTube Connection Status */}
      <Card className="border-accent/30 bg-accent/5">
        <CardContent className="py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${youtubeConnected ? 'bg-destructive/10' : 'bg-muted'}`}>
                <Youtube className={`w-5 h-5 ${youtubeConnected ? 'text-destructive' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">
                  {checkingYoutube ? 'Verificando conexão...' :
                    youtubeConnected ? `YouTube conectado` : 'YouTube não conectado'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {youtubeConnected
                    ? `Canal: ${youtubeChannel || 'Conectado'} • Upload direto habilitado`
                    : 'Conecte para fazer upload direto de vídeos'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {youtubeConnected ? (
                <Button variant="outline" size="sm" onClick={handleDisconnectYoutube} className="gap-2 text-xs">
                  <Unplug className="w-3.5 h-3.5" /> Desconectar
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleConnectYoutube}
                  disabled={checkingYoutube}
                  className="gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs"
                >
                  {checkingYoutube ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Youtube className="w-3.5 h-3.5" />}
                  Conectar YouTube
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Microcursos</h2>
          <p className="text-muted-foreground text-sm">Gerencie os microcursos da plataforma.</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Novo Microcurso
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <Card className="border-primary/30">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">{editingId ? 'Editar Microcurso' : 'Novo Microcurso'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Title */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Título *</label>
              <Input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Ex: Briefing de Segurança para Comissários"
              />
            </div>

            {/* Category + Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Bloco / Categoria</label>
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
                <label className="text-sm font-medium text-foreground mb-1.5 block">Duração (minutos)</label>
                <Input
                  type="number"
                  value={form.duration_minutes}
                  onChange={e => setForm(f => ({ ...f, duration_minutes: parseInt(e.target.value) || 5 }))}
                />
              </div>
            </div>

            {/* Video Input Mode */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Vídeo</label>
              <div className="flex gap-2 mb-3">
                <Button
                  type="button"
                  variant={videoInputMode === 'link' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => { setVideoInputMode('link'); setVideoFile(null); }}
                  className="gap-2"
                >
                  <Link2 className="w-3.5 h-3.5" /> Link YouTube
                </Button>
                <Button
                  type="button"
                  variant={videoInputMode === 'upload' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setVideoInputMode('upload')}
                  disabled={!youtubeConnected}
                  className="gap-2"
                >
                  <Upload className="w-3.5 h-3.5" /> Upload Direto
                </Button>
                {!youtubeConnected && videoInputMode !== 'upload' && (
                  <span className="text-xs text-muted-foreground self-center ml-1">
                    Conecte o YouTube para upload direto
                  </span>
                )}
              </div>

              {videoInputMode === 'link' ? (
                <div className="space-y-2">
                  <Input
                    value={form.video_url}
                    onChange={e => setForm(f => ({ ...f, video_url: e.target.value }))}
                    placeholder="https://www.youtube.com/watch?v=... ou https://youtu.be/..."
                  />
                  {videoId && (
                    <div className="flex items-center gap-2 text-xs text-success">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Video ID: {videoId}</span>
                    </div>
                  )}
                  {form.video_url && !videoId && (
                    <div className="flex items-center gap-2 text-xs text-destructive">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>URL do YouTube inválida</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div
                    className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-foreground font-medium">
                      {videoFile ? videoFile.name : 'Clique para selecionar vídeo'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      MP4, MOV, WebM ou AVI • Máx. 500MB
                    </p>
                    {videoFile && (
                      <Badge variant="outline" className="mt-2 text-xs">
                        {(videoFile.size / (1024 * 1024)).toFixed(1)} MB
                      </Badge>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/mp4,video/quicktime,video/webm,video/x-msvideo"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  {isUploading && (
                    <div className="space-y-1">
                      <Progress value={uploadProgress} className="h-2" />
                      <p className="text-xs text-muted-foreground text-center">
                        Enviando para o YouTube... {uploadProgress}%
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Video Preview */}
            {videoId && (
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Preview do Vídeo</label>
                <div className="aspect-video rounded-xl overflow-hidden bg-black max-w-md">
                  <iframe
                    src={getYouTubeEmbedUrl(videoId)}
                    className="w-full h-full"
                    allowFullScreen
                    title="Preview"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Descrição</label>
              <Textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Breve descrição do conteúdo..."
                rows={2}
              />
            </div>

            {/* Content */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Conteúdo Texto <span className="text-xs text-muted-foreground">(complementar ao vídeo)</span>
              </label>
              <Textarea
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                placeholder="Conteúdo em texto, dicas, pontos importantes..."
                rows={4}
              />
            </div>

            {/* Tags + Order */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Tags <span className="text-xs text-muted-foreground">(separadas por vírgula)</span>
                </label>
                <Input
                  value={form.tags}
                  onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                  placeholder="briefing, segurança, ANAC"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Ordem de exibição</label>
                <Input
                  type="number"
                  value={form.display_order}
                  onChange={e => setForm(f => ({ ...f, display_order: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => saveMutation.mutate(form)}
                disabled={!form.title || saveMutation.isPending || isUploading}
                className="gap-2"
              >
                {(saveMutation.isPending || isUploading) ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isUploading ? 'Enviando...' : editingId ? 'Atualizar' : 'Criar'} Microcurso
              </Button>
              <Button variant="outline" onClick={handleCancel} className="gap-2">
                <X className="w-4 h-4" /> Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Courses List */}
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
            const ytId = course.youtube_video_id || extractYouTubeId(course.video_url || '');
            const thumb = course.thumbnail_url || (ytId ? getYouTubeThumbnail(ytId) : null);

            return (
              <Card key={course.id} className={`hover:border-primary/30 transition-colors ${!course.is_active ? 'opacity-60' : ''}`}>
                <CardContent className="py-4">
                  <div className="flex items-start gap-4">
                    {/* Thumbnail */}
                    {thumb && (
                      <div className="w-24 h-16 rounded-lg overflow-hidden shrink-0 bg-muted hidden sm:block">
                        <img src={thumb} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold text-foreground text-sm">{course.title}</h3>
                        <Badge variant="outline" className="text-xs">{cat?.label || course.category}</Badge>
                        {ytId && (
                          <Badge className="text-xs bg-destructive/10 text-destructive border-0">
                            <Play className="w-2.5 h-2.5 mr-1" />YouTube
                          </Badge>
                        )}
                        {!course.is_active && <Badge variant="secondary" className="text-xs">Inativo</Badge>}
                      </div>
                      {course.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mb-1">{course.description}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{course.duration_minutes} min</span>
                        {ytId && <span className="text-muted-foreground/60">ID: {ytId}</span>}
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
