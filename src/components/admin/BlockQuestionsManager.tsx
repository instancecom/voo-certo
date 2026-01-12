import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, ChevronLeft, Loader2, FileQuestion, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';

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

export function BlockQuestionsManager({ professionId, professionName, blockId, blockName, onBack }: BlockQuestionsManagerProps) {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [formData, setFormData] = useState({
    text: '',
    options: ['', '', '', ''],
    correct_answer: 0,
    explanation: '',
    difficulty: 'medium' as string,
    audio_url: '',
    image_url: '',
  });

  // Fetch questions for this block
  const { data: questions, isLoading } = useQuery({
    queryKey: ['admin-block-questions', blockId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('subcategory_id', blockId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(q => ({
        ...q,
        options: q.options as string[],
      })) as Question[];
    },
  });

  // Create/Update question
  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData & { id?: string }) => {
      const questionData = {
        category_id: professionId,
        subcategory_id: blockId,
        text: data.text,
        options: data.options,
        correct_answer: data.correct_answer,
        explanation: data.explanation || null,
        difficulty: data.difficulty as 'easy' | 'medium' | 'hard',
        audio_url: data.audio_url || null,
        image_url: data.image_url || null,
      };

      if (data.id) {
        const { error } = await supabase
          .from('questions')
          .update(questionData)
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('questions')
          .insert(questionData);
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
    onError: (error) => {
      console.error(error);
      toast.error('Erro ao salvar questão');
    },
  });

  // Delete question
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
    onError: (error) => {
      console.error(error);
      toast.error('Erro ao excluir questão');
    },
  });

  const openNewDialog = () => {
    setSelectedQuestion(null);
    setFormData({
      text: '',
      options: ['', '', '', ''],
      correct_answer: 0,
      explanation: '',
      difficulty: 'medium',
      audio_url: '',
      image_url: '',
    });
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
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
    setSelectedQuestion(null);
    setFormData({
      text: '',
      options: ['', '', '', ''],
      correct_answer: 0,
      explanation: '',
      difficulty: 'medium',
      audio_url: '',
      image_url: '',
    });
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const handleSubmit = () => {
    if (!formData.text.trim()) {
      toast.error('O texto da questão é obrigatório');
      return;
    }
    if (formData.options.some(opt => !opt.trim())) {
      toast.error('Todas as 4 opções são obrigatórias');
      return;
    }
    saveMutation.mutate({ ...formData, id: selectedQuestion?.id });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ChevronLeft className="w-4 h-4 mr-1" />
          Voltar para Blocos
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{professionName}</p>
          <h2 className="text-2xl font-bold text-foreground">{blockName}</h2>
          <p className="text-muted-foreground">{questions?.length || 0} questões cadastradas</p>
        </div>
        <Button onClick={openNewDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Questão
        </Button>
      </div>

      {/* Questions List */}
      {questions?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileQuestion className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">Nenhuma questão cadastrada neste bloco</p>
            <Button onClick={openNewDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeira Questão
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {questions?.map((question, index) => {
            const difficultyInfo = DIFFICULTY_OPTIONS.find(d => d.value === question.difficulty);
            
            return (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card className="hover:border-primary/50 transition-colors">
                  <CardContent className="py-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold">
                        {index + 1}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground line-clamp-2 mb-2">{question.text}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {difficultyInfo && (
                            <Badge className={difficultyInfo.color}>{difficultyInfo.label}</Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            Resposta: {String.fromCharCode(65 + question.correct_answer)}
                          </span>
                          {question.audio_url && (
                            <Badge variant="outline">🔊 Áudio</Badge>
                          )}
                          {question.image_url && (
                            <Badge variant="outline">🖼️ Imagem</Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(question)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedQuestion(question);
                            setShowDeleteDialog(true);
                          }}
                        >
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
            <DialogTitle>
              {selectedQuestion ? 'Editar Questão' : 'Nova Questão'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Question Text */}
            <div className="space-y-2">
              <Label htmlFor="question-text">Texto da Questão *</Label>
              <Textarea
                id="question-text"
                placeholder="Digite o enunciado da questão..."
                value={formData.text}
                onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
                rows={4}
              />
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
                    <Label htmlFor={`option-${index}`} className="flex-shrink-0 w-6 font-semibold">
                      {letter})
                    </Label>
                    <Input
                      placeholder={`Opção ${letter}...`}
                      value={formData.options[index]}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      className="flex-1"
                    />
                    {formData.correct_answer === index && (
                      <Check className="w-5 h-5 text-success flex-shrink-0" />
                    )}
                  </div>
                ))}
              </RadioGroup>
              <p className="text-xs text-muted-foreground">
                Selecione o botão ao lado da opção correta
              </p>
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
              <Select
                value={formData.difficulty}
                onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTY_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Media URLs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="image_url">URL da Imagem (opcional)</Label>
                <Input
                  id="image_url"
                  placeholder="https://..."
                  value={formData.image_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="audio_url">URL do Áudio (opcional)</Label>
                <Input
                  id="audio_url"
                  placeholder="https://..."
                  value={formData.audio_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, audio_url: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={saveMutation.isPending}>
              {saveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {selectedQuestion ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Excluir Questão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta questão? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedQuestion && deleteMutation.mutate(selectedQuestion.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
