import { useState, useEffect, useRef } from 'react';
import { useMicrocoursesManager } from '@/hooks/useMicrocoursesManager';
import { googleDriveService } from '@/services/googleDrive';
import { youtubeService } from '@/services/youtube';
import { extractYouTubeId, getYouTubeEmbedUrl, getYouTubeThumbnail } from '@/lib/media-utils';
import { Microcourse, Module, Lesson, DriveFolder } from '@/types/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { DriveImageUpload } from './DriveImageUpload';
import { toast } from 'sonner';
import {
  Loader2, Plus, Pencil, Trash2, Save, X, Play, BookOpen,
  Youtube, Upload, CheckCircle2, ChevronRight, ChevronDown, 
  FolderPlus, FileText, Layers, GraduationCap, FileUp
} from 'lucide-react';

const CATEGORIES = [
  { value: 'seguranca', label: 'Segurança' },
  { value: 'regulamentacao', label: 'Regulamentação' },
  { value: 'procedimentos', label: 'Procedimentos' },
  { value: 'emergencias', label: 'Emergências' },
  { value: 'ingles', label: 'Inglês' },
  { value: 'geral', label: 'Geral' },
];

// ── Microcourse Form ──
function MicrocourseForm({ course, onSave, onCancel }: {
  course?: Microcourse;
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    title: course?.title || '',
    description: course?.description || '',
    content: course?.content || '',
    video_url: course?.youtube_video_id ? `https://www.youtube.com/watch?v=${course.youtube_video_id}` : (course?.video_url || ''),
    thumbnail_url: course?.thumbnail_url || '',
    category: course?.category || 'geral',
    tags: (course?.tags || []).join(', '),
    duration_minutes: course?.duration_minutes || 10,
    display_order: course?.display_order || 0,
    is_active: course?.is_active ?? true,
  });

  return (
    <Card className="border-primary/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{course ? 'Editar Microcurso' : 'Novo Microcurso'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Título *</label>
          <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Nome do microcurso" />
        </div>

           <div className="space-y-2">
            <DriveImageUpload
              label="Imagem de Capa (Google Drive)"
              value={form.thumbnail_url}
              onChange={(url) => setForm(f => ({ ...f, thumbnail_url: url }))}
            />
          </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Bloco / Categoria</label>
            <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Duração (min)</label>
            <Input type="number" value={form.duration_minutes} onChange={e => setForm(f => ({ ...f, duration_minutes: parseInt(e.target.value) || 5 }))} />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Descrição</label>
          <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Tags (vírgula)</label>
            <Input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Ordem</label>
            <Input type="number" value={form.display_order} onChange={e => setForm(f => ({ ...f, display_order: parseInt(e.target.value) || 0 }))} />
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <Button onClick={() => onSave(form)} disabled={!form.title} className="gap-2">
            <Save className="w-4 h-4" /> Salvar
          </Button>
          <Button variant="outline" onClick={onCancel} className="gap-2">
            <X className="w-4 h-4" /> Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Module Form ──
function ModuleForm({ mod, onSave, onCancel }: {
  mod?: Module;
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(mod?.title || '');
  const [description, setDescription] = useState(mod?.description || '');
  const [order, setOrder] = useState(mod?.display_order || 0);

  return (
    <div className="p-3 rounded-lg bg-muted/50 border border-border space-y-3">
      <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título do módulo" />
      <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Descrição (opcional)" rows={2} />
      <div className="flex items-center gap-3">
        <div className="w-20">
          <Input type="number" value={order} onChange={e => setOrder(parseInt(e.target.value) || 0)} placeholder="Ordem" />
        </div>
        <Button size="sm" onClick={() => onSave({ title, description, display_order: order })} disabled={!title} className="gap-1">
          <Save className="w-3.5 h-3.5" /> Salvar
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}><X className="w-3.5 h-3.5" /></Button>
      </div>
    </div>
  );
}

// ── Lesson Form ──
function LessonForm({ lesson, onSave, onCancel, youtubeConnected }: {
  lesson?: Lesson;
  onSave: (data: any, materialFile?: File) => void;
  onCancel: () => void;
  youtubeConnected: boolean;
}) {
  const [title, setTitle] = useState(lesson?.title || '');
  const [description, setDescription] = useState(lesson?.description || '');
  const [order, setOrder] = useState(lesson?.display_order || 0);
  const [videoUrl, setVideoUrl] = useState(lesson?.youtube_video_id ? `https://www.youtube.com/watch?v=${lesson.youtube_video_id}` : '');
  const [isPremium, setIsPremium] = useState(lesson?.is_premium || false);
  const [materialFile, setMaterialFile] = useState<File | null>(null);
  const [selectedFolder, setSelectedFolder] = useState(lesson?.material_drive_folder || '');
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [creatingFolder, setCreatingFolder] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const videoFileRef = useRef<HTMLInputElement>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = async () => {
    setLoadingFolders(true);
    try {
      const folderList = await googleDriveService.listFolders();
      setFolders(folderList);
    } catch { /* ignore */ } finally {
      setLoadingFolders(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    setCreatingFolder(true);
    try {
      const data = await googleDriveService.createFolder(newFolderName);
      if (data.folderId) {
        setFolders(prev => [...prev, { id: data.folderId, name: newFolderName.trim() }]);
        setSelectedFolder(data.folderId);
        setShowNewFolder(false);
        setNewFolderName('');
        toast.success(`Pasta criada!`);
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setCreatingFolder(false);
    }
  };

  const handleVideoUpload = async () => {
    if (!videoFile) return;
    setUploadingVideo(true);
    setUploadProgress(10);
    try {
      setUploadProgress(30);
      const data = await youtubeService.uploadVideo(videoFile, title || videoFile.name, description);
      setUploadProgress(80);

      if (data.success) {
        setUploadProgress(100);
        setVideoUrl(`https://www.youtube.com/watch?v=${data.video_id}`);
        setVideoFile(null);
        toast.success(`Vídeo enviado ao YouTube!`);
      } else {
        throw new Error(data.error);
      }
    } catch (e: any) {
      toast.error(e.message || 'Erro ao enviar vídeo');
    } finally {
      setUploadingVideo(false);
      setUploadProgress(0);
    }
  };

  const videoId = extractYouTubeId(videoUrl);

  return (
    <div className="p-3 rounded-lg bg-muted/30 border border-border space-y-3">
      <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título da aula" />
      <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Descrição (opcional)" rows={2} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium mb-1 block">Link YouTube</label>
          <Input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." />
          {videoId && <p className="text-xs text-success mt-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />ID: {videoId}</p>}
        </div>
        <div className="flex items-end gap-2">
          <div className="w-20">
            <label className="text-xs font-medium mb-1 block">Ordem</label>
            <Input type="number" value={order} onChange={e => setOrder(parseInt(e.target.value) || 0)} />
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer pb-2">
            <input type="checkbox" checked={isPremium} onChange={e => setIsPremium(e.target.checked)} className="rounded" />
            Premium
          </label>
        </div>
      </div>

      {/* YouTube Upload */}
      {youtubeConnected && (
        <div className="space-y-2 p-3 rounded-lg bg-background border border-primary/20">
          <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Youtube className="w-4 h-4 text-destructive" /> Enviar vídeo ao YouTube
          </p>
          {uploadingVideo ? (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Enviando... {uploadProgress}%
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <Button type="button" variant="outline" size="sm" onClick={() => videoFileRef.current?.click()} className="gap-1 text-xs">
                <Upload className="w-3 h-3" /> {videoFile ? videoFile.name : 'Selecionar vídeo'}
              </Button>
              <input ref={videoFileRef} type="file" className="hidden" accept="video/mp4,video/quicktime,video/webm,video/x-msvideo" onChange={e => setVideoFile(e.target.files?.[0] || null)} />
              {videoFile && (
                <Button type="button" size="sm" onClick={handleVideoUpload} className="gap-1 text-xs bg-destructive hover:bg-destructive/90">
                  <Youtube className="w-3 h-3" /> Enviar ao YouTube
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Material Upload */}
      <div className="space-y-2 p-3 rounded-lg bg-background border border-border/50">
        <p className="text-xs font-semibold text-foreground flex items-center gap-1"><FileUp className="w-3.5 h-3.5" /> Material Complementar</p>

        {lesson?.material_url && !materialFile && (
          <div className="flex items-center gap-2 text-xs text-primary">
            <FileText className="w-3.5 h-3.5" />
            <a href={lesson.material_url} target="_blank" rel="noopener noreferrer" className="underline truncate max-w-[200px]">
              {lesson.material_name || 'Material atual'}
            </a>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="gap-1 text-xs">
            <Upload className="w-3 h-3" /> {materialFile ? materialFile.name : 'Escolher arquivo'}
          </Button>
          <input ref={fileRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.ppt,.pptx,.xls,.xlsx" onChange={e => setMaterialFile(e.target.files?.[0] || null)} />
        </div>

        {/* Folder selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex-1 min-w-[140px]">
            <label className="text-xs text-muted-foreground mb-1 block">Pasta no Drive</label>
            {loadingFolders ? (
              <div className="flex items-center gap-1 text-xs text-muted-foreground"><Loader2 className="w-3 h-3 animate-spin" />Carregando...</div>
            ) : (
              <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Selecionar pasta" /></SelectTrigger>
                <SelectContent>
                  {folders.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={() => setShowNewFolder(!showNewFolder)} className="gap-1 text-xs mt-4">
            <FolderPlus className="w-3 h-3" /> Nova pasta
          </Button>
        </div>

        {showNewFolder && (
          <div className="flex items-center gap-2">
            <Input value={newFolderName} onChange={e => setNewFolderName(e.target.value)} placeholder="Nome da pasta" className="h-8 text-xs flex-1" />
            <Button size="sm" onClick={handleCreateFolder} disabled={!newFolderName.trim() || creatingFolder} className="h-8 text-xs gap-1">
              {creatingFolder ? <Loader2 className="w-3 h-3 animate-spin" /> : <FolderPlus className="w-3 h-3" />} Criar
            </Button>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button size="sm" onClick={() => onSave({
          title, description, display_order: order,
          video_url: videoId ? getYouTubeEmbedUrl(videoId) : '',
          youtube_video_id: videoId || null,
          thumbnail_url: videoId ? getYouTubeThumbnail(videoId) : null,
          is_premium: isPremium,
          material_drive_folder: selectedFolder || null,
        }, materialFile || undefined)} disabled={!title} className="gap-1">
          <Save className="w-3.5 h-3.5" /> Salvar Aula
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}><X className="w-3.5 h-3.5" /></Button>
      </div>
    </div>
  );
}

// ── Main Component ──
export function MicrocoursesManager() {
  const {
    courses,
    isLoadingCourses,
    showMicrocourseForm,
    setShowMicrocourseForm,
    editingMicrocourse,
    setEditingMicrocourse,
    expandedMicrocourses,
    setExpandedMicrocourses,
    expandedModules,
    setExpandedModules,
    addingModuleTo,
    setAddingModuleTo,
    editingModule,
    setEditingModule,
    addingLessonTo,
    setAddingLessonTo,
    editingLesson,
    setEditingLesson,
    youtubeConnected,
    driveConnected,
    uploadingMaterial,
    saveMicrocourseMutation,
    deleteMicrocourseMutation,
    saveModuleMutation,
    deleteModuleMutation,
    saveLessonMutation,
    deleteLessonMutation,
    toggleExpand,
    getModules,
    getLessons,
  } = useMicrocoursesManager();

  return (
    <div className="space-y-6">
      {/* Connection Status - Ultra Minimalist Pill */}
      <div className="flex items-center gap-3 px-2.5 py-1 rounded-full bg-muted/10 border border-border/30 w-fit backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${driveConnected ? 'bg-success shadow-[0_0_6px_rgba(34,197,94,0.4)]' : 'bg-muted-foreground/20'}`} />
          <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">DRIVE</span>
        </div>
        
        <div className="w-[1px] h-2.5 bg-border/50" />

        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${youtubeConnected ? 'bg-success shadow-[0_0_6px_rgba(34,197,94,0.4)]' : 'bg-muted-foreground/20'}`} />
          <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">YOUTUBE</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Microcursos</h2>
          <p className="text-muted-foreground text-sm">Hierarquia: Microcurso → Módulo → Aula → Material</p>
        </div>
        {!showMicrocourseForm && (
          <Button onClick={() => { setShowMicrocourseForm(true); setEditingMicrocourse(null); }} className="gap-2">
            <Plus className="w-4 h-4" /> Novo Microcurso
          </Button>
        )}
      </div>

      {/* New/Edit Microcourse Form */}
      {showMicrocourseForm && (
        <MicrocourseForm
          course={editingMicrocourse || undefined}
          onSave={data => saveMicrocourseMutation.mutate(data)}
          onCancel={() => { setShowMicrocourseForm(false); setEditingMicrocourse(null); }}
        />
      )}

      {/* Loading */}
      {isLoadingCourses ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : courses?.length === 0 ? (
        <div className="text-center py-12 bg-muted/50 rounded-xl">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Nenhum microcurso cadastrado.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {courses?.map(course => {
            const modules = getModules(course.id);
            const isExpanded = expandedMicrocourses.has(course.id);
            const cat = CATEGORIES.find(c => c.value === course.category);

            return (
              <Card key={course.id} className={`transition-colors ${!course.is_active ? 'opacity-60' : ''}`}>
                <CardContent className="py-3">
                  {/* Microcourse Header */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleExpand(expandedMicrocourses, course.id, setExpandedMicrocourses)}
                      className="p-1 hover:bg-muted rounded"
                    >
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    <GraduationCap className="w-4 h-4 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-foreground">{course.title}</span>
                        <Badge variant="outline" className="text-xs">{cat?.label || course.category}</Badge>
                        <Badge variant="secondary" className="text-xs">{modules.length} módulos</Badge>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="sm" onClick={() => { setEditingMicrocourse(course); setShowMicrocourseForm(true); }} className="h-7 w-7 p-0">
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => { if (confirm('Remover microcurso e todo conteúdo?')) deleteMicrocourseMutation.mutate(course.id); }} className="h-7 w-7 p-0 text-destructive">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Expanded: Modules */}
                  {isExpanded && (
                    <div className="ml-8 mt-3 space-y-2 border-l-2 border-border pl-4">
                      {modules.map(mod => {
                        const lessons = getLessons(mod.id);
                        const modExpanded = expandedModules.has(mod.id);

                        return (
                          <div key={mod.id}>
                            {editingModule?.id === mod.id ? (
                              <ModuleForm
                                mod={mod}
                                onSave={data => saveModuleMutation.mutate({ data, microcourseId: course.id, moduleId: mod.id })}
                                onCancel={() => setEditingModule(null)}
                              />
                            ) : (
                              <div className="flex items-center gap-2">
                                <button onClick={() => toggleExpand(expandedModules, mod.id, setExpandedModules)} className="p-0.5 hover:bg-muted rounded">
                                  {modExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                </button>
                                <Layers className="w-3.5 h-3.5 text-accent shrink-0" />
                                <span className="text-sm font-medium flex-1">{mod.title}</span>
                                <Badge variant="secondary" className="text-xs">{lessons.length} aulas</Badge>
                                <Button variant="ghost" size="sm" onClick={() => setEditingModule(mod)} className="h-6 w-6 p-0"><Pencil className="w-3 h-3" /></Button>
                                <Button variant="ghost" size="sm" onClick={() => { if (confirm('Remover módulo?')) deleteModuleMutation.mutate(mod.id); }} className="h-6 w-6 p-0 text-destructive"><Trash2 className="w-3 h-3" /></Button>
                              </div>
                            )}

                            {/* Lessons */}
                            {modExpanded && (
                              <div className="ml-6 mt-2 space-y-2 border-l border-border/50 pl-3">
                                {lessons.map(lesson => (
                                  <div key={lesson.id}>
                                    {editingLesson?.id === lesson.id ? (
                                      <LessonForm
                                        lesson={lesson}
                                        onSave={(data, file) => saveLessonMutation.mutate({ data: { ...data, material_url: lesson.material_url, material_name: lesson.material_name }, moduleId: mod.id, lessonId: lesson.id, materialFile: file })}
                                        onCancel={() => setEditingLesson(null)}
                                        youtubeConnected={youtubeConnected}
                                      />
                                    ) : (
                                      <div className="flex items-center gap-2 py-1">
                                        <Play className="w-3 h-3 text-primary shrink-0" />
                                        <span className="text-sm flex-1">{lesson.title}</span>
                                        {lesson.is_premium && <Badge className="text-xs bg-accent/20 text-accent border-0">Premium</Badge>}
                                        {lesson.material_url && <FileText className="w-3 h-3 text-success" />}
                                        {lesson.youtube_video_id && <Youtube className="w-3 h-3 text-destructive" />}
                                        <Button variant="ghost" size="sm" onClick={() => setEditingLesson(lesson)} className="h-6 w-6 p-0"><Pencil className="w-3 h-3" /></Button>
                                        <Button variant="ghost" size="sm" onClick={() => { if (confirm('Remover aula?')) deleteLessonMutation.mutate(lesson.id); }} className="h-6 w-6 p-0 text-destructive"><Trash2 className="w-3 h-3" /></Button>
                                      </div>
                                    )}
                                  </div>
                                ))}

                                {addingLessonTo === mod.id ? (
                                  <LessonForm
                                    onSave={(data, file) => saveLessonMutation.mutate({ data, moduleId: mod.id, materialFile: file })}
                                    onCancel={() => setAddingLessonTo(null)}
                                    youtubeConnected={youtubeConnected}
                                  />
                                ) : (
                                  <Button variant="ghost" size="sm" onClick={() => setAddingLessonTo(mod.id)} className="gap-1 text-xs text-primary h-7">
                                    <Plus className="w-3 h-3" /> Aula
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {addingModuleTo === course.id ? (
                        <ModuleForm
                          onSave={data => saveModuleMutation.mutate({ data, microcourseId: course.id })}
                          onCancel={() => setAddingModuleTo(null)}
                        />
                      ) : (
                        <Button variant="ghost" size="sm" onClick={() => setAddingModuleTo(course.id)} className="gap-1 text-xs text-accent h-7">
                          <Plus className="w-3 h-3" /> Módulo
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {uploadingMaterial && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="font-medium">Enviando material para o Drive...</span>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
