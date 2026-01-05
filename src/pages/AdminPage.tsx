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
  Languages,
  Users,
  Settings,
  BarChart3,
  Plane,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useExam } from '@/contexts/ExamContext';
import { categories } from '@/data/mockData';

export default function AdminPage() {
  const { questions, exams, addQuestion } = useExam();
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [newQuestion, setNewQuestion] = useState<{
    category: string;
    subcategory: string;
    text: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    difficulty: 'easy' | 'medium' | 'hard';
    audioUrl: string;
    imageUrl: string;
  }>({
    category: 'anac',
    subcategory: 'anac-ingles',
    text: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    difficulty: 'medium',
    audioUrl: '',
    imageUrl: '',
  });

  const handleAddQuestion = () => {
    if (!newQuestion.text || newQuestion.options.some((o) => !o)) {
      return;
    }

    addQuestion(newQuestion);
    setNewQuestion({
      category: 'anac',
      subcategory: 'anac-ingles',
      text: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      difficulty: 'medium',
      audioUrl: '',
      imageUrl: '',
    });
    setIsAddingQuestion(false);
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...newQuestion.options];
    newOptions[index] = value;
    setNewQuestion({ ...newQuestion, options: newOptions });
  };

  const anacCategory = categories.find((c) => c.id === 'anac');

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
              <Button variant="outline" size="sm" asChild>
                <Link to="/simulados">Ver Simulados</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Questões
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{questions.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Simulados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{exams.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Categorias Ativas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {categories.filter((c) => c.subcategories.length > 0).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Com Áudio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {questions.filter((q) => q.audioUrl).length}
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
                      value={newQuestion.category}
                      onValueChange={(value) => setNewQuestion({ ...newQuestion, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
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
                      value={newQuestion.subcategory}
                      onValueChange={(value) => setNewQuestion({ ...newQuestion, subcategory: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {anacCategory?.subcategories.map((sub) => (
                          <SelectItem key={sub.id} value={sub.id}>
                            {sub.name}
                          </SelectItem>
                        ))}
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
                      value={newQuestion.correctAnswer.toString()}
                      onValueChange={(value) =>
                        setNewQuestion({ ...newQuestion, correctAnswer: parseInt(value) })
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
                          index === newQuestion.correctAnswer
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

                {/* Media Upload */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4" />
                      Áudio (Opcional)
                    </Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-accent transition-colors cursor-pointer">
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Arraste um arquivo MP3 ou clique para fazer upload
                      </p>
                      <Input
                        type="file"
                        accept="audio/*"
                        className="hidden"
                        onChange={(e) => {
                          // Handle audio upload
                          const file = e.target.files?.[0];
                          if (file) {
                            // In production, upload to storage
                            setNewQuestion({ ...newQuestion, audioUrl: URL.createObjectURL(file) });
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      Imagem (Opcional)
                    </Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-accent transition-colors cursor-pointer">
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Arraste uma imagem ou clique para fazer upload
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddingQuestion(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddQuestion}>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Questão
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Questions List */}
            <div className="space-y-4">
              {questions.map((question) => (
                <div
                  key={question.id}
                  className="p-4 rounded-xl bg-card border border-border hover:border-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                          {anacCategory?.subcategories.find((s) => s.id === question.subcategory)?.name ||
                            question.subcategory}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            question.difficulty === 'easy'
                              ? 'bg-success/10 text-success'
                              : question.difficulty === 'medium'
                              ? 'bg-warning/10 text-warning'
                              : 'bg-destructive/10 text-destructive'
                          }`}
                        >
                          {question.difficulty === 'easy'
                            ? 'Fácil'
                            : question.difficulty === 'medium'
                            ? 'Média'
                            : 'Difícil'}
                        </span>
                        {question.audioUrl && (
                          <span className="flex items-center gap-1 px-2 py-1 text-xs bg-accent/10 text-accent rounded-full">
                            <Volume2 className="w-3 h-3" />
                            Áudio
                          </span>
                        )}
                      </div>
                      <p className="text-foreground">{question.text}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Exams Tab */}
          <TabsContent value="exams" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Gerenciar Simulados</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Simulado
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exams.map((exam) => (
                <Card key={exam.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{exam.title}</CardTitle>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>{exam.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{exam.duration} min</span>
                      <span>{exam.questionCount} questões</span>
                      {exam.isPremium && (
                        <span className="text-accent font-medium">Premium</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Gerenciar Categorias</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nova Categoria
              </Button>
            </div>

            <div className="space-y-4">
              {categories.map((category) => (
                <Card key={category.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Plane className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle>{category.name}</CardTitle>
                          <CardDescription>{category.description}</CardDescription>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {category.subcategories.map((sub) => (
                        <span
                          key={sub.id}
                          className="px-3 py-1 bg-secondary rounded-full text-sm text-secondary-foreground"
                        >
                          {sub.name}
                        </span>
                      ))}
                      {category.subcategories.length === 0 && (
                        <span className="text-muted-foreground text-sm">
                          Nenhuma subcategoria configurada
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-6">
            <h2 className="text-xl font-bold text-foreground">Estatísticas</h2>
            <div className="p-12 rounded-xl bg-muted text-center">
              <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Estatísticas detalhadas estarão disponíveis em breve.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
