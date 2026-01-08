import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Plus,
  Upload,
  Trash2,
  Edit,
  Save,
  X,
  Volume2,
  ImageIcon,
  BookOpen,
  Brain,
  Settings,
  BarChart3,
  Plane,
  ArrowLeft,
  Shield,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useCategories, useSubcategories, useExams } from '@/hooks/useExams';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export default function AdminPage() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const { data: categories, isLoading: loadingCategories } = useCategories();
  const { data: subcategories, isLoading: loadingSubcategories } = useSubcategories();
  const { data: exams, isLoading: loadingExams } = useExams();
  const queryClient = useQueryClient();

  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    category_id: '',
    subcategory_id: '',
    text: '',
    options: ['', '', '', ''],
    correct_answer: 0,
    explanation: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    block_number: '' as '' | '1' | '2' | '3' | '4',
    audio_url: '',
    image_url: '',
  });

  const isLoading = authLoading || loadingCategories || loadingSubcategories || loadingExams;

  // Show loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated and is admin
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8 rounded-2xl bg-card border border-border max-w-md">
          <Shield className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Acesso Restrito</h2>
          <p className="text-muted-foreground mb-6">
            Você precisa fazer login para acessar esta página.
          </p>
          <Button asChild>
            <Link to="/auth">Fazer Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8 rounded-2xl bg-card border border-border max-w-md">
          <Shield className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Acesso Negado</h2>
          <p className="text-muted-foreground mb-6">
            Você não tem permissão para acessar o painel administrativo.
            Esta área é restrita a administradores.
          </p>
          <Button asChild>
            <Link to="/">Voltar ao Início</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleAddQuestion = async () => {
    if (!newQuestion.text || newQuestion.options.some((o) => !o) || !newQuestion.subcategory_id) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.from('questions').insert({
        category_id: newQuestion.category_id,
        subcategory_id: newQuestion.subcategory_id,
        text: newQuestion.text,
        options: newQuestion.options,
        correct_answer: newQuestion.correct_answer,
        explanation: newQuestion.explanation || null,
        difficulty: newQuestion.difficulty,
        block_number: newQuestion.block_number ? parseInt(newQuestion.block_number) : null,
        audio_url: newQuestion.audio_url || null,
        image_url: newQuestion.image_url || null,
      });

      if (error) throw error;

      toast.success('Questão adicionada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      
      setNewQuestion({
        category_id: '',
        subcategory_id: '',
        text: '',
        options: ['', '', '', ''],
        correct_answer: 0,
        explanation: '',
        difficulty: 'medium',
        block_number: '',
        audio_url: '',
        image_url: '',
      });
      setIsAddingQuestion(false);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao adicionar questão');
    } finally {
      setIsSaving(false);
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...newQuestion.options];
    newOptions[index] = value;
    setNewQuestion({ ...newQuestion, options: newOptions });
  };

  const anacCategory = categories?.find((c) => c.slug === 'anac');
  const anacSubcategories = subcategories?.filter(s => s.category_id === anacCategory?.id) || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/">
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </Button>
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                <h1 className="text-lg font-semibold">Painel Administrativo</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Olá, {user.email}
              </span>
              <Button variant="outline" size="sm" asChild>
                <Link to="/simulados">Ver Simulados</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total de Simulados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{exams?.length || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Categorias Ativas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{categories?.length || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Subcategorias
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{subcategories?.length || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Premium
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">
                    {exams?.filter((e) => e.is_premium).length || 0}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="questions" className="space-y-6">
              <TabsList className="bg-muted">
                <TabsTrigger value="questions" className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Questões
                </TabsTrigger>
                <TabsTrigger value="exams" className="flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  Simulados
                </TabsTrigger>
                <TabsTrigger value="categories" className="flex items-center gap-2">
                  <Plane className="w-4 h-4" />
                  Categorias
                </TabsTrigger>
                <TabsTrigger value="stats" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Estatísticas
                </TabsTrigger>
              </TabsList>

              {/* Questions Tab */}
              <TabsContent value="questions" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-foreground">Gerenciar Questões</h2>
                  <Button onClick={() => setIsAddingQuestion(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Questão
                  </Button>
                </div>

                {/* Add Question Form */}
                {isAddingQuestion && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-xl bg-card border-2 border-accent"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-foreground">Nova Questão</h3>
                      <Button variant="ghost" size="icon" onClick={() => setIsAddingQuestion(false)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Category Selection */}
                      <div className="space-y-2">
                        <Label>Categoria</Label>
                        <Select
                          value={newQuestion.category_id}
                          onValueChange={(value) => setNewQuestion({ ...newQuestion, category_id: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent>
                            {categories?.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Subcategoria</Label>
                        <Select
                          value={newQuestion.subcategory_id}
                          onValueChange={(value) => setNewQuestion({ ...newQuestion, subcategory_id: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent>
                            {anacSubcategories.map((sub) => (
                              <SelectItem key={sub.id} value={sub.id}>
                                {sub.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Bloco ANAC</Label>
                        <Select
                          value={newQuestion.block_number}
                          onValueChange={(value) =>
                            setNewQuestion({ ...newQuestion, block_number: value as '' | '1' | '2' | '3' | '4' })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Opcional" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Nenhum</SelectItem>
                            <SelectItem value="1">Bloco 1 - Regulamentação</SelectItem>
                            <SelectItem value="2">Bloco 2 - Segurança</SelectItem>
                            <SelectItem value="3">Bloco 3 - Conhecimentos Técnicos</SelectItem>
                            <SelectItem value="4">Bloco 4 - CRM/Fatores Humanos</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Dificuldade</Label>
                        <Select
                          value={newQuestion.difficulty}
                          onValueChange={(value) =>
                            setNewQuestion({ ...newQuestion, difficulty: value as 'easy' | 'medium' | 'hard' })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="easy">Fácil</SelectItem>
                            <SelectItem value="medium">Média</SelectItem>
                            <SelectItem value="hard">Difícil</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Resposta Correta</Label>
                        <Select
                          value={newQuestion.correct_answer.toString()}
                          onValueChange={(value) =>
                            setNewQuestion({ ...newQuestion, correct_answer: parseInt(value) })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">Opção A</SelectItem>
                            <SelectItem value="1">Opção B</SelectItem>
                            <SelectItem value="2">Opção C</SelectItem>
                            <SelectItem value="3">Opção D</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Question Text */}
                    <div className="mt-6 space-y-2">
                      <Label>Enunciado da Questão</Label>
                      <Textarea
                        value={newQuestion.text}
                        onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                        placeholder="Digite o enunciado da questão..."
                        rows={3}
                      />
                    </div>

                    {/* Options */}
                    <div className="mt-6 space-y-4">
                      <Label>Alternativas</Label>
                      {newQuestion.options.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span
                            className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-semibold ${
                              index === newQuestion.correct_answer
                                ? 'bg-success text-success-foreground'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {String.fromCharCode(65 + index)}
                          </span>
                          <Input
                            value={option}
                            onChange={(e) => updateOption(index, e.target.value)}
                            placeholder={`Alternativa ${String.fromCharCode(65 + index)}`}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Explanation */}
                    <div className="mt-6 space-y-2">
                      <Label>Explicação (Gabarito Comentado)</Label>
                      <Textarea
                        value={newQuestion.explanation}
                        onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                        placeholder="Explique por que a resposta correta é a certa..."
                        rows={3}
                      />
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsAddingQuestion(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleAddQuestion} disabled={isSaving}>
                        {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Salvar Questão
                      </Button>
                    </div>
                  </motion.div>
                )}

                <div className="p-12 rounded-2xl bg-muted text-center">
                  <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Use o formulário acima para adicionar novas questões ao banco de dados.
                  </p>
                </div>
              </TabsContent>

              {/* Exams Tab */}
              <TabsContent value="exams" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-foreground">Gerenciar Simulados</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {exams?.map((exam) => (
                    <Card key={exam.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{exam.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">{exam.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{exam.duration} min</span>
                          <span>{exam.question_count} questões</span>
                          {exam.is_premium && (
                            <span className="text-accent">Premium</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Categories Tab */}
              <TabsContent value="categories" className="space-y-6">
                <h2 className="text-xl font-bold text-foreground">Categorias e Subcategorias</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categories?.map((cat) => (
                    <Card key={cat.id}>
                      <CardHeader>
                        <CardTitle>{cat.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">{cat.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {subcategories?.filter(s => s.category_id === cat.id).map((sub) => (
                            <span
                              key={sub.id}
                              className="px-3 py-1 text-xs bg-secondary rounded-full text-secondary-foreground"
                            >
                              {sub.name}
                            </span>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Stats Tab */}
              <TabsContent value="stats" className="space-y-6">
                <h2 className="text-xl font-bold text-foreground">Estatísticas</h2>
                <div className="p-12 rounded-2xl bg-muted text-center">
                  <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Estatísticas detalhadas em breve.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
}
