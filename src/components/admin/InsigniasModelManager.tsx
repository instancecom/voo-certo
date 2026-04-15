import { useState, useRef, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Loader2, Upload, ImageIcon, CheckCircle2, CloudIcon, Plus, Pencil, Trash2, Search, Award, FolderPlus,
} from 'lucide-react';

interface Insignia {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'bronze' | 'silver' | 'gold' | 'platinum';
  condition_type: string;
  condition_value: number;
  model_url: string | null;
  is_active: boolean | null;
  display_order: number | null;
  verso_texto: string | null;
}

interface DriveFolder {
  id: string;
  name: string;
}

const RARITY_COLORS: Record<string, string> = {
  bronze: 'text-amber-600 bg-amber-900/20 border-amber-700/40',
  silver: 'text-slate-300 bg-slate-700/30 border-slate-500/40',
  gold: 'text-yellow-400 bg-yellow-900/20 border-yellow-600/40',
  platinum: 'text-cyan-300 bg-cyan-900/20 border-cyan-600/40',
};

const getDriveImageUrl = (url: string | null): string | null => {
  if (!url) return null;
  if (url.includes('lh3.googleusercontent.com')) return url;
  const ucMatch = url.match(/drive\.google\.com\/uc\?export=view&id=([^&]+)/);
  if (ucMatch) return `https://lh3.googleusercontent.com/d/${ucMatch[1]}`;
  const fileMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (fileMatch) return `https://lh3.googleusercontent.com/d/${fileMatch[1]}`;
  return url;
};

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export function InsigniasModelManager() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dropRef = useRef<HTMLDivElement | null>(null);

  const [driveConnected, setDriveConnected] = useState<boolean | null>(null);
  const [connectingDrive, setConnectingDrive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state
  const [editingInsignia, setEditingInsignia] = useState<Insignia | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editVerso, setEditVerso] = useState('');
  const [editActive, setEditActive] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Drive folder state
  const [driveFolders, setDriveFolders] = useState<DriveFolder[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Check Drive connection using the central function logic
  useEffect(() => {
    const checkDrive = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('google-drive?action=status');
        if (error) throw error;
        setDriveConnected(!!data.connected);
      } catch (err) {
        console.error('Erro ao validar conexão do Drive:', err);
        setDriveConnected(false);
      }
    };
    checkDrive();
  }, []);

  const { data: insignias, isLoading } = useQuery({
    queryKey: ['admin-insignias-models'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('insignias')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as Insignia[];
    },
  });

  const updateInsignia = useMutation({
    mutationFn: async (params: { id: string; updates: Record<string, any> }) => {
      const { error } = await supabase.from('insignias').update(params.updates).eq('id', params.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-insignias-models'] });
      queryClient.invalidateQueries({ queryKey: ['insignias'] });
    },
  });

  const deleteInsignia = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('insignias').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-insignias-models'] });
      queryClient.invalidateQueries({ queryKey: ['insignias'] });
      toast.success('Insígnia excluída!');
      setDeletingId(null);
    },
    onError: (err: any) => {
      toast.error(`Erro ao excluir: ${err.message}`);
      setDeletingId(null);
    },
  });

  const handleConnectDrive = async () => {
    setConnectingDrive(true);
    try {
      const { data, error } = await supabase.functions.invoke('google-drive?action=auth_url');
      if (error) throw error;
      
      const popup = window.open(data.url, 'google-drive-auth', 'width=600,height=700');
      
      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === 'drive_connected') {
          setDriveConnected(true);
          setConnectingDrive(false);
          toast.success('Google Drive conectado!');
          window.removeEventListener('message', handleMessage);
        }
      };
      window.addEventListener('message', handleMessage);

    } catch (err: any) {
      toast.error(`Erro: ${err.message}`);
      setConnectingDrive(false);
    }
  };

  const loadDriveFolders = useCallback(async () => {
    setLoadingFolders(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data, error } = await supabase.functions.invoke('google-drive?action=list_folders');
      if (error) throw error;
      setDriveFolders(data.folders || []);
    } catch {
      toast.error('Erro ao listar pastas do Drive');
    } finally {
      setLoadingFolders(false);
    }
  }, []);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    setCreatingFolder(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data, error } = await supabase.functions.invoke('google-drive?action=create_folder', {
        method: 'POST',
        body: { name: newFolderName.trim() },
      });
      if (data.error) throw new Error(data.error);
      setDriveFolders(prev => [...prev, { id: data.folderId, name: newFolderName.trim() }]);
      setSelectedFolderId(data.folderId);
      setNewFolderName('');
      setShowNewFolder(false);
      toast.success('Pasta criada!');
    } catch (err: any) {
      toast.error(`Erro: ${err.message}`);
    } finally {
      setCreatingFolder(false);
    }
  };

  const openEditModal = (insignia: Insignia) => {
    setEditingInsignia(insignia);
    setEditName(insignia.name);
    setEditDescription(insignia.description);
    setEditVerso(insignia.verso_texto || '');
    setEditActive(insignia.is_active !== false);
    setSelectedFile(null);
    setFilePreview(null);
    setSelectedFolderId('');
    setShowNewFolder(false);
    setNewFolderName('');
    setModalOpen(true);
    if (driveConnected) loadDriveFolders();
  };

  const openNewModal = () => {
    setEditingInsignia(null);
    setEditName('');
    setEditDescription('');
    setEditVerso('');
    setEditActive(true);
    setSelectedFile(null);
    setFilePreview(null);
    setSelectedFolderId('');
    setShowNewFolder(false);
    setNewFolderName('');
    setModalOpen(true);
    if (driveConnected) loadDriveFolders();
  };

  const handleFileChange = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Apenas imagens PNG, JPG ou WebP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Máximo 5MB.');
      return;
    }
    setSelectedFile(file);
    setFilePreview(URL.createObjectURL(file));
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileChange(file);
  }, []);

  const handleSave = async () => {
    if (!editName.trim()) {
      toast.error('Nome é obrigatório.');
      return;
    }

    // If new file selected, folder must be selected
    if (selectedFile && !selectedFolderId) {
      toast.error('Selecione ou crie uma pasta no Drive.');
      return;
    }

    setSaving(true);
    try {
      let modelUrl = editingInsignia?.model_url || null;

      // Upload file if selected
      if (selectedFile && selectedFolderId) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Não autenticado');

        const ext = selectedFile.name.split('.').pop()?.toLowerCase() || 'png';
        const safeName = editName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        const fileName = `${safeName}_${Date.now()}.${ext}`;

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('fileName', fileName);
        formData.append('folderId', selectedFolderId);

        const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
        const res = await fetch(`https://${projectId}.supabase.co/functions/v1/google-drive?action=upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.access_token}` },
          body: formData,
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        modelUrl = data.directUrl;
      }

      if (editingInsignia) {
        // Update existing
        await updateInsignia.mutateAsync({
          id: editingInsignia.id,
          updates: {
            name: editName.trim(),
            description: editDescription.trim(),
            verso_texto: editVerso.trim(),
            is_active: editActive,
            ...(modelUrl !== editingInsignia.model_url ? { model_url: modelUrl } : {}),
          },
        });
      } else {
        // Create new
        const { error } = await supabase.from('insignias').insert({
          name: editName.trim(),
          description: editDescription.trim(),
          verso_texto: editVerso.trim(),
          is_active: editActive,
          model_url: modelUrl,
          icon: 'Award',
          condition_type: 'manual',
          condition_value: 1,
          rarity: 'bronze' as any,
        });
        if (error) throw error;
        queryClient.invalidateQueries({ queryKey: ['admin-insignias-models'] });
        queryClient.invalidateQueries({ queryKey: ['insignias'] });
      }

      toast.success('Insígnia salva com sucesso!');
      setModalOpen(false);
    } catch (err: any) {
      toast.error(`Erro: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const filteredInsignias = insignias?.filter(i =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-foreground">Modelos de Insígnias</h2>
          <p className="text-sm text-muted-foreground">Upload de PNGs via Google Drive</p>
        </div>
        <div className="flex items-center gap-2">
          {driveConnected ? (
            <Badge variant="outline" className="gap-1.5 text-green-400 border-green-700/50 bg-green-900/20 text-xs">
              <CheckCircle2 className="w-3 h-3" /> Drive
            </Badge>
          ) : (
            <Button variant="outline" size="sm" className="gap-2 text-xs" disabled={connectingDrive} onClick={handleConnectDrive}>
              {connectingDrive ? <Loader2 className="w-3 h-3 animate-spin" /> : <CloudIcon className="w-3 h-3" />}
              Conectar Drive
            </Button>
          )}
          <Button size="sm" className="gap-1.5" onClick={openNewModal}>
            <Plus className="w-3.5 h-3.5" /> Nova Insígnia
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar insígnia..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-9 h-9 text-sm"
        />
      </div>

      {/* Compact List */}
      <div className="rounded-lg border border-border overflow-hidden">
        {filteredInsignias.length === 0 ? (
          <div className="text-center py-12 bg-muted/20">
            <Award className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {searchQuery ? 'Nenhuma insígnia encontrada.' : 'Nenhuma insígnia cadastrada.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredInsignias.map(insignia => (
              <div
                key={insignia.id}
                className="group flex items-center gap-3 px-3 py-2.5 hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => openEditModal(insignia)}
              >
                {/* Preview 40x40 */}
                <div className="w-10 h-10 rounded-md border border-border bg-muted/30 flex items-center justify-center overflow-hidden shrink-0">
                   {insignia.model_url ? (
                    <img
                      src={getDriveImageUrl(insignia.model_url) || ''}
                      alt={insignia.name}
                      className="w-full h-full object-contain"
                      onError={e => { 
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <ImageIcon className={cn("w-4 h-4 text-muted-foreground", insignia.model_url ? "hidden" : "")} />
                </div>

                {/* Name + rarity */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{insignia.name}</p>
                  <Badge className={`text-[10px] capitalize border ${RARITY_COLORS[insignia.rarity] || RARITY_COLORS.bronze} px-1.5 py-0`}>
                    {insignia.rarity}
                  </Badge>
                </div>

                {/* Status */}
                <Badge
                  variant="outline"
                  className={`text-[10px] shrink-0 ${
                    insignia.is_active !== false
                      ? 'text-green-400 border-green-700/50 bg-green-900/20'
                      : 'text-red-400 border-red-700/50 bg-red-900/20'
                  }`}
                >
                  {insignia.is_active !== false ? 'Ativa' : 'Inativa'}
                </Badge>

                {/* Actions */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={e => { e.stopPropagation(); openEditModal(insignia); }}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive transition-opacity"
                  onClick={e => {
                    e.stopPropagation();
                    setDeletingId(insignia.id);
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deletingId} onOpenChange={open => !open && setDeletingId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Excluir insígnia?</DialogTitle>
            <DialogDescription>Essa ação não pode ser desfeita.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setDeletingId(null)}>Cancelar</Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={deleteInsignia.isPending}
              onClick={() => deletingId && deleteInsignia.mutate(deletingId)}
            >
              {deleteInsignia.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit/Create Modal */}
      <Dialog open={modalOpen} onOpenChange={open => !open && setModalOpen(false)}>
        <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>{editingInsignia ? 'Editar Insígnia' : 'Nova Insígnia'}</DialogTitle>
            <DialogDescription>
              {editingInsignia ? 'Atualize os dados e o modelo PNG.' : 'Preencha os campos para criar.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-4 p-4">
            {/* Left: preview */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-full aspect-square max-w-[200px] rounded-lg border-2 border-dashed border-border bg-muted/20 flex items-center justify-center overflow-hidden">
                {filePreview ? (
                  <img src={filePreview} alt="Preview" className="w-full h-full object-contain" />
                ) : editingInsignia?.model_url ? (
                  <img src={getDriveImageUrl(editingInsignia.model_url) || ''} alt={editingInsignia.name} className="w-full h-full object-contain" />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-muted-foreground">
                    <ImageIcon className="w-8 h-8" />
                    <span className="text-[10px]">Sem imagem</span>
                  </div>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground text-center">PNG/JPG até 5MB · 800×800px</p>
            </div>

            {/* Right: fields */}
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Nome</Label>
                <Input value={editName} onChange={e => setEditName(e.target.value)} placeholder="Nome da insígnia" className="h-9 text-sm" />
              </div>

              {/* Drag & drop upload */}
              <div>
                <Label className="text-xs">Imagem</Label>
                <div
                  ref={dropRef}
                  onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-1 border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <Upload className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
                  <p className="text-xs text-muted-foreground">
                    {selectedFile ? selectedFile.name : 'Arraste ou clique para selecionar'}
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) handleFileChange(file);
                  }}
                />
              </div>

              {/* Drive folder selector - always visible when Drive connected */}
              {driveConnected && (
                <div className="space-y-2 p-3 rounded-lg bg-muted/20 border border-border">
                  <Label className="text-xs flex items-center gap-1.5">
                    <CloudIcon className="w-3 h-3" /> Pasta de destino no Google Drive
                  </Label>
                  {loadingFolders ? (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                      <Loader2 className="w-3 h-3 animate-spin" /> Carregando pastas...
                    </div>
                  ) : (
                    <>
                      <Select value={selectedFolderId} onValueChange={val => {
                        if (val === '__new__') {
                          setShowNewFolder(true);
                          setSelectedFolderId('');
                        } else {
                          setShowNewFolder(false);
                          setSelectedFolderId(val);
                        }
                      }}>
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue placeholder="Selecione uma pasta" />
                        </SelectTrigger>
                        <SelectContent>
                          {driveFolders.map(f => (
                            <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                          ))}
                          <SelectItem value="__new__">
                            <span className="flex items-center gap-1.5"><FolderPlus className="w-3 h-3" /> Criar nova pasta</span>
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      {showNewFolder && (
                        <div className="flex gap-2">
                          <Input
                            value={newFolderName}
                            onChange={e => setNewFolderName(e.target.value)}
                            placeholder="Nome da pasta"
                            className="h-8 text-sm flex-1"
                          />
                          <Button size="sm" className="h-8 text-xs" disabled={creatingFolder || !newFolderName.trim()} onClick={handleCreateFolder}>
                            {creatingFolder ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Criar'}
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                  {!selectedFile && (
                    <p className="text-[10px] text-muted-foreground">Selecione uma imagem acima para fazer upload nesta pasta.</p>
                  )}
                </div>
              )}

              <div>
                <Label className="text-xs">Descrição (Requisito)</Label>
                <Textarea
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  placeholder="Ex: Complete seu primeiro simulado"
                  className="text-sm min-h-[60px]"
                />
              </div>

              <div>
                <Label className="text-xs">Mensagem do Verso (Motivacional)</Label>
                <Textarea
                  value={editVerso}
                  onChange={e => setEditVerso(e.target.value)}
                  placeholder="Mensagem motivacional que aparece ao virar a insígnia..."
                  className="text-sm min-h-[60px]"
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch checked={editActive} onCheckedChange={setEditActive} id="active-toggle" />
                <Label htmlFor="active-toggle" className="text-xs">Ativa</Label>
              </div>
            </div>
          </div>

          <DialogFooter className="p-4 pt-0 gap-2">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1.5">
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
