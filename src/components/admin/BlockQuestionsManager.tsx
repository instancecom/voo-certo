import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Plus, Edit2, Trash2, ChevronLeft, Loader2, FileQuestion, Check,
  Upload, Music, AlertTriangle, X, Volume2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

import { DriveImageUpload } from './DriveImageUpload';
interface Question {
  id: string;
  category_id: string;
  subcategory_id: string;
  text: string;
  options: string[];
  correct_answer: number;
  explanation: string | null;
  difficulty: string | null;
  audio_url: string | null;
  image_url: string | null;
  created_at: string;
}

interface DuplicateWarning {
  type: 'exact' | 'similar';
  questionId: string;
  questionText: string;
}

interface BlockQuestionsManagerProps {
  professionId: string;
  professionName: string;
  blockId: string;
  blockName: string;
  onBack: () => void;
}

const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: 'Fácil', color: 'bg-success/10 text-success' },
  { value: 'medium', label: 'Médio', color: 'bg-warning/10 text-warning' },
  { value: 'hard', label: 'Difícil', color: 'bg-destructive/10 text-destructive' },
];

function similarity(a: string, b: string): number {
  const la = a.toLowerCase().trim();
  const lb = b.toLowerCase().trim();
  if (la === lb) return 1;
  const wordsA = new Set(la.split(/\s+/));
  const wordsB = new Set(lb.split(/\s+/));
  const intersection = [...wordsA].filter(w => wordsB.has(w)).length;
  const union = new Set([...wordsA, ...wordsB]).size;
  return union === 0 ? 0 : intersection / union;
}

export function BlockQuestionsManager({
  professionId, professionName, blockId, blockName, onBack
}: BlockQuestionsManagerProps) {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showMassDeleteDialog, setShowMassDeleteDialog] = useState(false);
  const [massDeleteRange, setMassDeleteRange] = useState({ start: 1, end: 1 });
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<DuplicateWarning | null>(null);
  const [forceCreate, setForceCreate] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [formData, setFormData] = useState({
    text: '',
    options: ['', '', '', ''],
    correct_answer: 0,
    explanation: '',
    difficulty: 'medium' as string,
    audio_url: '',
    image_url: '',
  });

  const { data: questions, isLoading } = useQuery({
    queryKey: ['admin-block-questions', blockId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('subcategory_id', blockId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(q => ({ ...q, options: q.options as string[] })) as Question[];
    },
  });

  // Check for duplicates
  const checkDuplicate = (text: string): DuplicateWarning | null => {
    if (!questions || !text.trim()) return null;
    const editingId = selectedQuestion?.id;
    for (const q of questions) {
      if (q.id === editingId) continue;
      const sim = similarity(text, q.text);
      if (sim === 1) return { type: 'exact', questionId: q.id, questionText: q.text };
      if (sim >= 0.7) return { type: 'similar', questionId: q.id, questionText: q.text };
    }
    return null;
  };

  const handleTextChange = (text: string) => {
    setFormData(prev => ({ ...prev, text }));
    setForceCreate(false);
    if (text.trim().length > 20) {
      const warning = checkDuplicate(text);
      setDuplicateWarning(warning);
    } else {
      setDuplicateWarning(null);
    }
  };

  // Upload audio
  const uploadAudio = async (file: File): Promise<string> => {
    const ext = file.name.split('.').pop();
    const path = `${blockId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('question-audio').upload(path, file, { upsert: true });
    if (error) throw error;
    const { data: urlData } = supabase.storage.from('question-audio').getPublicUrl(path);
    return urlData.publicUrl;
  };

  const saveMutation = useMutation({
    mutationFn: async (payload: typeof formData & { id?: string }) => {
      let audio_url = payload.audio_url;

      if (audioFile) {
        setUploadingAudio(true);
        try {
          audio_url = await uploadAudio(audioFile);
        } finally {
          setUploadingAudio(false);
        }
      }

      const questionData = {
        category_id: professionId,
        subcategory_id: blockId,
        text: payload.text,
        options: payload.options,
        correct_answer: payload.correct_answer,
        explanation: payload.explanation || null,
        difficulty: payload.difficulty as 'easy' | 'medium' | 'hard',
        audio_url: audio_url || null,
        image_url: payload.image_url || null,
      };

      if (payload.id) {
        const { error } = await supabase.from('questions').update(questionData).eq('id', payload.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('questions').insert(questionData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-block-questions', blockId] });
      queryClient.invalidateQueries({ queryKey: ['admin-blocks'] });
      queryClient.invalidateQueries({ queryKey: ['admin-professions'] });
      toast.success(selectedQuestion ? 'Questão atualizada!' : 'Questão criada!');
      closeDialog();
    },
    onError: () => toast.error('Erro ao salvar questão'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('questions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-block-questions', blockId] });
      queryClient.invalidateQueries({ queryKey: ['admin-blocks'] });
      queryClient.invalidateQueries({ queryKey: ['admin-professions'] });
      toast.success('Questão excluída!');
      setShowDeleteDialog(false);
      setSelectedQuestion(null);
    },
    onError: () => toast.error('Erro ao excluir questão'),
  });

  const massDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from('questions').delete().in('id', ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-block-questions', blockId] });
      queryClient.invalidateQueries({ queryKey: ['admin-blocks'] });
      queryClient.invalidateQueries({ queryKey: ['admin-professions'] });
      toast.success('Questões excluídas com sucesso!');
      setShowMassDeleteDialog(false);
      setMassDeleteRange({ start: 1, end: 1 });
    },
    onError: () => toast.error('Erro ao excluir questões em massa'),
  });

  const openNewDialog = () => {
    setSelectedQuestion(null);
    setFormData({ text: '', options: ['', '', '', ''], correct_answer: 0, explanation: '', difficulty: 'medium', audio_url: '', image_url: '' });
    setDuplicateWarning(null);
    setForceCreate(false);
    setAudioFile(null);
    setShowDialog(true);
  };

  const openEditDialog = (question: Question) => {
    setSelectedQuestion(question);
    setFormData({
      text: question.text,
      options: question.options.length === 4 ? question.options : [...question.options, '', '', '', ''].slice(0, 4),
      correct_answer: question.correct_answer,
      explanation: question.explanation || '',
      difficulty: question.difficulty || 'medium',
      audio_url: question.audio_url || '',
      image_url: question.image_url || '',
    });
    setDuplicateWarning(null);
    setForceCreate(false);
    setAudioFile(null);
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
    setSelectedQuestion(null);
    setDuplicateWarning(null);
    setForceCreate(false);
    setAudioFile(null);
    setFormData({ text: '', options: ['', '', '', ''], correct_answer: 0, explanation: '', difficulty: 'medium', audio_url: '', image_url: '' });
  };

  const handleSubmit = () => {
    if (!formData.text.trim()) return toast.error('O texto da questão é obrigatório');
    if (formData.options.some(opt => !opt.trim())) return toast.error('Todas as 4 opções são obrigatórias');

    // Check duplicate (unless forced)
    if (!forceCreate && !selectedQuestion) {
      const warning = checkDuplicate(formData.text);
      if (warning) {
        setDuplicateWarning(warning);
        return;
      }
    }

    saveMutation.mutate({ ...formData, id: selectedQuestion?.id });
  };

  const handleMassDelete = () => {
    if (!questions) return;
    const { start, end } = massDeleteRange;
    if (start < 1 || end > questions.length || start > end) {
      toast.error('Intervalo inválido. Verifique os números preenchidos.');
      return;
    }
    const idsToDelete = questions.slice(start - 1, end).map(q => q.id);
    massDeleteMutation.mutate(idsToDelete);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ChevronLeft className="w-4 h-4 mr-1" />Voltar para Blocos
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{professionName}</p>
          <h2 className="text-2xl font-bold text-foreground">{blockName}</h2>
          <p className="text-muted-foreground">{questions?.length || 0} questões cadastradas</p>
        </div>
        <div className="flex items-center gap-2">
          {questions && questions.length > 0 && (
            <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setShowMassDeleteDialog(true)}>
              <Trash2 className="w-4 h-4 mr-2" />E. em Massa
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link to="/admin/importar-questoes">
              <Upload className="w-4 h-4 mr-2" />Importar CSV
            </Link>
          </Button>
          <Button onClick={openNewDialog}>
            <Plus className="w-4 h-4 mr-2" />Nova Questão
          </Button>
        </div>
      </div>

      {questions?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileQuestion className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">Nenhuma questão cadastrada neste bloco</p>
            <Button onClick={openNewDialog}><Plus className="w-4 h-4 mr-2" />Criar Primeira Questão</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {questions?.map((question, index) => {
            const difficultyInfo = DIFFICULTY_OPTIONS.find(d => d.value === question.difficulty);
            return (
              <motion.div key={question.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}>
                <Card className="hover:border-primary/50 transition-colors">
                  <CardContent className="py-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground line-clamp-2 mb-2">{question.text}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {difficultyInfo && <Badge className={difficultyInfo.color}>{difficultyInfo.label}</Badge>}
                          <span className="text-xs text-muted-foreground">Resposta: {String.fromCharCode(65 + question.correct_answer)}</span>
                          {question.audio_url && (
                            <Badge variant="outline" className="gap-1">
                              <Volume2 className="w-3 h-3" />Áudio
                            </Badge>
                          )}
                          {question.image_url && <Badge variant="outline">🖼️ Imagem</Badge>}
                        </div>
                        {question.audio_url && (
                          <audio controls className="mt-2 h-8 w-full max-w-xs" src={question.audio_url} />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(question)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => { setSelectedQuestion(question); setShowDeleteDialog(true); }}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedQuestion ? 'Editar Questão' : 'Nova Questão'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {/* Question Text */}
            <div className="space-y-2">
              <Label htmlFor="question-text">Texto da Questão *</Label>
              <Textarea
                id="question-text"
                placeholder="Digite o enunciado da questão..."
                value={formData.text}
                onChange={(e) => handleTextChange(e.target.value)}
                rows={4}
                className={duplicateWarning ? 'border-warning' : ''}
              />

              {/* Duplicate Warning */}
              {duplicateWarning && !forceCreate && (
                <Alert className="border-warning bg-warning/5">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  <AlertDescription>
                    <p className="font-medium text-warning mb-1">
                      {duplicateWarning.type === 'exact' ? '⚠️ Questão idêntica detectada!' : '⚠️ Questão muito parecida detectada!'}
                    </p>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      "{duplicateWarning.questionText}"
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-warning text-warning hover:bg-warning/10"
                      onClick={() => setForceCreate(true)}
                    >
                      Salvar mesmo assim
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
              {forceCreate && duplicateWarning && (
                <p className="text-xs text-success flex items-center gap-1">
                  <Check className="w-3 h-3" /> Você confirmou. A questão será salva mesmo assim.
                </p>
              )}
            </div>

            {/* Options */}
            <div className="space-y-3">
              <Label>Opções de Resposta *</Label>
              <RadioGroup
                value={formData.correct_answer.toString()}
                onValueChange={(value) => setFormData(prev => ({ ...prev, correct_answer: parseInt(value) }))}
              >
                {['A', 'B', 'C', 'D'].map((letter, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-shrink-0 w-6 font-semibold">{letter})</Label>
                    <Input
                      placeholder={`Opção ${letter}...`}
                      value={formData.options[index]}
                      onChange={(e) => {
                        const newOpts = [...formData.options];
                        newOpts[index] = e.target.value;
                        setFormData(prev => ({ ...prev, options: newOpts }));
                      }}
                      className="flex-1"
                    />
                    {formData.correct_answer === index && <Check className="w-5 h-5 text-success flex-shrink-0" />}
                  </div>
                ))}
              </RadioGroup>
              <p className="text-xs text-muted-foreground">Selecione o botão ao lado da opção correta</p>
            </div>

            {/* Explanation */}
            <div className="space-y-2">
              <Label htmlFor="explanation">Explicação</Label>
              <Textarea
                id="explanation"
                placeholder="Explique por que esta é a resposta correta..."
                value={formData.explanation}
                onChange={(e) => setFormData(prev => ({ ...prev, explanation: e.target.value }))}
                rows={3}
              />
            </div>

            {/* Difficulty */}
            <div className="space-y-2">
              <Label>Dificuldade</Label>
              <Select value={formData.difficulty} onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DIFFICULTY_OPTIONS.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Audio Upload */}
            <div className="space-y-2">
              <Label>Áudio (Listening)</Label>
              <div className="border-2 border-dashed border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Music className="w-4 h-4" />
                  <span>Upload de áudio MP3, WAV, OGG (máx. 20MB)</span>
                </div>

                <div className="flex items-center gap-3">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 20 * 1024 * 1024) {
                            toast.error('Arquivo muito grande. Máximo 20MB.');
                            return;
                          }
                          setAudioFile(file);
                          setFormData(prev => ({ ...prev, audio_url: '' }));
                        }
                      }}
                    />
                    <Button variant="outline" size="sm" type="button" asChild>
                      <span><Upload className="w-4 h-4 mr-2" />Selecionar arquivo</span>
                    </Button>
                  </label>
                  {audioFile && (
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-sm text-foreground truncate">{audioFile.name}</span>
                      <button onClick={() => setAudioFile(null)}><X className="w-4 h-4 text-muted-foreground" /></button>
                    </div>
                  )}
                </div>

                {audioFile && (
                  <audio controls className="w-full h-8" src={URL.createObjectURL(audioFile)} />
                )}

                {!audioFile && (
                  <div className="space-y-1">
                    <Label className="text-xs">Ou cole a URL do áudio</Label>
                    <Input
                      placeholder="https://..."
                      value={formData.audio_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, audio_url: e.target.value }))}
                    />
                    {formData.audio_url && (
                      <audio controls className="w-full h-8 mt-1" src={formData.audio_url} />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <DriveImageUpload
                label="Imagem da Questão (Google Drive)"
                value={formData.image_url}
                onChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancelar</Button>
            <Button
              onClick={handleSubmit}
              disabled={saveMutation.isPending || uploadingAudio || (!!duplicateWarning && !forceCreate && !selectedQuestion)}
            >
              {(saveMutation.isPending || uploadingAudio) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {uploadingAudio ? 'Enviando áudio...' : selectedQuestion ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Excluir Questão</DialogTitle>
            <DialogDescription>Tem certeza? Esta ação não pode ser desfeita.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => selectedQuestion && deleteMutation.mutate(selectedQuestion.id)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mass Delete Confirmation */}
      <Dialog open={showMassDeleteDialog} onOpenChange={setShowMassDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Excluir Questões em Massa</DialogTitle>
            <DialogDescription>
              Selecione o intervalo de questões que deseja excluir. Verifique a numeração exibida na lista de questões. Esta ação não poderá ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 space-y-2">
                <Label>Da questão Nº</Label>
                <Input 
                  type="number" 
                  min={1} 
                  max={questions?.length || 1} 
                  value={massDeleteRange.start} 
                  onChange={(e) => setMassDeleteRange(prev => ({ ...prev, start: parseInt(e.target.value) || 1 }))} 
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label>Até a questão Nº</Label>
                <Input 
                  type="number" 
                  min={1} 
                  max={questions?.length || 1} 
                  value={massDeleteRange.end} 
                  onChange={(e) => setMassDeleteRange(prev => ({ ...prev, end: parseInt(e.target.value) || 1 }))} 
                />
              </div>
            </div>
            {questions && massDeleteRange.start <= massDeleteRange.end && massDeleteRange.start >= 1 && massDeleteRange.end <= questions.length && (
              <p className="text-sm font-medium text-destructive">
                Isso irá apagar {massDeleteRange.end - massDeleteRange.start + 1} questão(ões) permanentemente.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMassDeleteDialog(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleMassDelete} disabled={massDeleteMutation.isPending}>
              {massDeleteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Excluir em Massa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
