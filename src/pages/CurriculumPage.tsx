import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  User, Briefcase, GraduationCap, Award, Plus, Trash2, X,
  Download, Save, Loader2, Lock, FileText, Sparkles, Layout, Globe, Star, ArrowRight, Shield, MessageSquare, Edit3, CheckCircle2, Lightbulb, Eye, Calendar, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePlan } from '@/hooks/usePlan';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CurriculumPreview, CurriculumData, Experience, Education, Certificate, Language } from '@/components/curriculum/CurriculumPreview';
import { CurriculumChatAssistant } from '@/components/curriculum/CurriculumChatAssistant';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const EMPTY_DATA: CurriculumData = {
  full_name: '',
  email: '',
  phone: '',
  city: '',
  profession: '',
  summary: '',
  experience: [],
  education: [],
  certificates: [],
  languages: [],
  skills: [],
  template: 'ats',
  recommended_template: 'ats',
  recommendation_reason: '',
};

const TEMPLATES = [
  { 
    id: 'ats', 
    name: 'Digital / ATS', 
    icon: FileText, 
    badge: 'Compatível com Gupy/LinkedIn',
    desc: 'Coluna única ultra-limpa, sem gráficos ou tabelas. Leitura 100% perfeita para robôs de triagem automática de RH.' 
  },
  { 
    id: 'geral', 
    name: 'Profissional Geral', 
    icon: Briefcase, 
    badge: 'Ideal para E-mail',
    desc: 'Visual corporativo refinado com cabeçalho azul marinho. Excelente para enviar em PDF como anexo de e-mail.' 
  },
  { 
    id: 'presencial', 
    name: 'Presencial (Papel)', 
    icon: Shield, 
    badge: 'Alto Impacto Visual',
    desc: 'Design de alto contraste com foco visual marcante, pensado especificamente para leitura presencial em folha impressa.' 
  },
];

export default function CurriculumPage() {
  const { user } = useAuth();
  const { canSaveCurriculum } = usePlan();
  const queryClient = useQueryClient();
  
  // Modes: 'dashboard' (Galeria em Lista) | 'chat' (Criador IA) | 'editor' (Edição Manual)
  const [mode, setMode] = useState<'dashboard' | 'chat' | 'editor'>('dashboard');
  const [data, setData] = useState<CurriculumData>(EMPTY_DATA);
  const [newSkill, setNewSkill] = useState('');
  const [activeTab, setActiveTab] = useState('dados');
  const [isEnhancingSection, setIsEnhancingSection] = useState<string | null>(null);
  
  // Modal de Pré-visualização na Galeria
  const [previewModalCurriculum, setPreviewModalCurriculum] = useState<CurriculumData | null>(null);

  // Carrega TODOS os currículos do usuário (Banco Supabase + Armazenamento Local)
  const { data: savedCurriculums = [], isLoading: loadingSaved } = useQuery({
    queryKey: ['curriculums', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // 1. Buscar do Supabase
      const { data: list } = await supabase
        .from('curriculum_data')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      // 2. Carrega do armazenamento local do usuário
      const localKey = `voo_certo_curriculums_${user.id}`;
      let localList: CurriculumData[] = [];
      try {
        const stored = localStorage.getItem(localKey);
        if (stored) localList = JSON.parse(stored);
      } catch (e) {
        console.warn('Erro ao ler localStorage de currículos:', e);
      }

      // Combina os currículos do banco e do localStorage sem duplicar
      const mergedMap = new Map<string, CurriculumData>();

      (list || []).forEach(curr => {
        const item: CurriculumData = {
          id: curr.id,
          full_name: curr.full_name || '',
          email: curr.email || '',
          phone: curr.phone || '',
          city: curr.city || '',
          profession: curr.profession || '',
          summary: curr.summary || '',
          experience: (curr.experience as any) || [],
          education: (curr.education as any) || [],
          certificates: (curr.certificates as any) || [],
          languages: (curr.languages as any) || [],
          skills: curr.skills || [],
          template: curr.template || 'ats',
          updated_at: curr.updated_at,
        };
        mergedMap.set(curr.id, item);
      });

      localList.forEach(item => {
        if (item.id && !mergedMap.has(item.id)) {
          mergedMap.set(item.id, item);
        }
      });

      return Array.from(mergedMap.values()).sort((a, b) => {
        const dateA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
        const dateB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
        return dateB - dateA;
      });
    },
    enabled: !!user,
  });

  // Ajusta o modo inicial de forma fluida sem pulos de tela
  useEffect(() => {
    if (!loadingSaved) {
      if (savedCurriculums.length > 0) {
        setMode('dashboard');
      } else {
        setMode('chat');
      }
    }
  }, [loadingSaved, savedCurriculums.length]);

  // Salvar / Atualizar currículo no Supabase e LocalStorage
  const saveMutation = useMutation({
    mutationFn: async (customData?: CurriculumData) => {
      if (!user) throw new Error('Faça login para salvar');
      
      const dataToSave = customData || data;
      const targetId = dataToSave.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `curr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`);
      const updatedAt = new Date().toISOString();

      const curriculumToSave: CurriculumData = {
        ...dataToSave,
        id: targetId,
        updated_at: updatedAt,
      };

      // 1. Salva no localStorage para garantir múltiplos currículos sem sobrescrever
      const localKey = `voo_certo_curriculums_${user.id}`;
      let currentLocalList: CurriculumData[] = [];
      try {
        const stored = localStorage.getItem(localKey);
        if (stored) currentLocalList = JSON.parse(stored);
      } catch (e) {}

      const idx = currentLocalList.findIndex(c => c.id === targetId);
      if (idx >= 0) {
        currentLocalList[idx] = curriculumToSave;
      } else {
        currentLocalList.unshift(curriculumToSave);
      }
      localStorage.setItem(localKey, JSON.stringify(currentLocalList));

      // 2. Salva no Supabase
      const payload: any = {
        id: targetId,
        user_id: user.id,
        full_name: curriculumToSave.full_name,
        email: curriculumToSave.email,
        phone: curriculumToSave.phone,
        city: curriculumToSave.city,
        profession: curriculumToSave.profession,
        summary: curriculumToSave.summary,
        experience: curriculumToSave.experience,
        education: curriculumToSave.education,
        certificates: curriculumToSave.certificates,
        languages: curriculumToSave.languages,
        skills: curriculumToSave.skills,
        template: curriculumToSave.template,
        updated_at: updatedAt,
      };

      const { error } = await supabase
        .from('curriculum_data')
        .upsert(payload);

      if (error) {
        console.warn('Aviso de salvamento no Supabase (salvo localmente):', error.message);
      }

      setData(curriculumToSave);
      return curriculumToSave;
    },
    onSuccess: () => {
      toast.success('Currículo salvo na sua galeria!');
      queryClient.invalidateQueries({ queryKey: ['curriculums', user?.id] });
    },
    onError: (err: any) => toast.error(`Erro ao salvar: ${err.message}`),
  });

  // Excluir currículo específico no Supabase e LocalStorage
  const deleteMutation = useMutation({
    mutationFn: async (curriculumId: string) => {
      if (!user) throw new Error('Usuário não autenticado');
      
      // 1. Remove do localStorage
      const localKey = `voo_certo_curriculums_${user.id}`;
      try {
        const stored = localStorage.getItem(localKey);
        if (stored) {
          const list: CurriculumData[] = JSON.parse(stored);
          const filtered = list.filter(c => c.id !== curriculumId);
          localStorage.setItem(localKey, JSON.stringify(filtered));
        }
      } catch (e) {}

      // 2. Remove do Supabase
      await supabase
        .from('curriculum_data')
        .delete()
        .eq('id', curriculumId);
    },
    onSuccess: () => {
      toast.success('Currículo excluído com sucesso!');
      if (savedCurriculums.length <= 1) {
        setData(EMPTY_DATA);
        setMode('chat');
      }
      queryClient.invalidateQueries({ queryKey: ['curriculums', user?.id] });
    },
    onError: (err: any) => toast.error(`Erro ao excluir: ${err.message}`),
  });

  // Iniciar criação de um NOVO currículo do zero com IA
  const handleStartNewCurriculum = () => {
    setData({
      ...EMPTY_DATA,
      id: undefined,
    });
    setMode('chat');
  };

  // Quando a IA gera o currículo pelo Chat Assistant
  const handleCurriculumGenerated = (generatedData: any) => {
    const newId = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : `curr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const updated: CurriculumData = {
      ...EMPTY_DATA,
      ...generatedData,
      id: newId, // Atribui um ID único EXCLUSIVO para este novo currículo
      template: generatedData.recommended_template || 'ats',
    };
    
    setData(updated);
    setMode('editor');
    
    if (user) {
      saveMutation.mutate(updated); // Passa o objeto COMPLETO atualizado diretamente!
    }
  };

  // Melhorar um trecho específico com IA no editor manual
  const handleEnhanceWithAI = async (sectionName: string, textToEnhance: string, onSuccess: (enhanced: string) => void) => {
    if (!textToEnhance.trim()) {
      toast.error('Digite algum texto antes de pedir a melhoria ao Lucas.');
      return;
    }
    setIsEnhancingSection(sectionName);
    toast.info(`Lucas refinando texto da seção [${sectionName}]...`);

    try {
      const { data: resData, error } = await supabase.functions.invoke('curriculum-ai-assistant', {
        body: {
          action: 'enhance_section',
          sectionName,
          textToEnhance,
        },
      });

      if (error) throw error;
      if (resData?.enhancedText) {
        onSuccess(resData.enhancedText);
        toast.success(`Seção [${sectionName}] aprimorada com sucesso por Lucas!`);
      }
    } catch (err: any) {
      toast.error(`Falha ao melhorar com Lucas: ${err.message || 'Erro inesperado'}`);
    } finally {
      setIsEnhancingSection(null);
    }
  };

  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);

  // Baixar arquivo PDF real diretamente (sem tela de impressora do navegador)
  const handleDownloadPDF = async (targetCurriculum?: CurriculumData) => {
    const currentData = targetCurriculum || previewModalCurriculum || data;
    const elementId = previewModalCurriculum ? 'curriculum-preview-modal-element' : 'curriculum-content';
    const element = document.getElementById(elementId) || document.getElementById('curriculum-content');

    if (!element) {
      toast.error('Elemento do currículo não localizado para exportação.');
      return;
    }

    setIsDownloadingPDF(true);
    toast.info('Gerando seu arquivo PDF...');

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, Math.min(imgHeight, pageHeight));

      const namePart = (currentData.full_name || 'Curriculo').replace(/[^a-zA-Z0-9_-]/g, '_');
      const professionPart = (currentData.profession || 'Voe_Certo').replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `Curriculo_${namePart}_${professionPart}.pdf`;

      pdf.save(filename);
      toast.success('Download do arquivo PDF concluído com sucesso!');
    } catch (err: any) {
      console.error('Erro ao gerar PDF:', err);
      window.print();
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  // Helpers para edição manual
  const updateField = (field: keyof CurriculumData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const addExperience = () => {
    setData(prev => ({
      ...prev,
      experience: [...prev.experience, { company: '', role: '', start: '', end: '', description: '' }],
    }));
  };

  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    setData(prev => {
      const updated = [...prev.experience];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, experience: updated };
    });
  };

  const removeExperience = (index: number) => {
    setData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  };

  const addEducation = () => {
    setData(prev => ({
      ...prev,
      education: [...prev.education, { institution: '', degree: '', year: '' }],
    }));
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    setData(prev => {
      const updated = [...prev.education];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, education: updated };
    });
  };

  const removeEducation = (index: number) => {
    setData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  const addCertificate = () => {
    setData(prev => ({
      ...prev,
      certificates: [...prev.certificates, { name: '', issuer: '', year: '' }],
    }));
  };

  const updateCertificate = (index: number, field: keyof Certificate, value: string) => {
    setData(prev => {
      const updated = [...prev.certificates];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, certificates: updated };
    });
  };

  const removeCertificate = (index: number) => {
    setData(prev => ({
      ...prev,
      certificates: prev.certificates.filter((_, i) => i !== index),
    }));
  };

  const addLanguage = () => {
    setData(prev => ({
      ...prev,
      languages: [...prev.languages, { name: '', level: 'Intermediário' }],
    }));
  };

  const updateLanguage = (index: number, field: keyof Language, value: string) => {
    setData(prev => {
      const updated = [...prev.languages];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, languages: updated };
    });
  };

  const removeLanguage = (index: number) => {
    setData(prev => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index),
    }));
  };

  const addSkill = () => {
    if (!newSkill.trim()) return;
    setData(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
    setNewSkill('');
  };

  const removeSkill = (index: number) => {
    setData(prev => ({ ...prev, skills: prev.skills.filter((_, i) => i !== index) }));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col print:bg-white print:p-0">
      <div className="print:hidden">
        <Header />
      </div>

      <main className="flex-1 container mx-auto px-4 py-8 print:p-0 print:m-0">
        {/* State 0: Carregando dados do servidor */}
        {loadingSaved ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-xs font-semibold">Carregando sua galeria de currículos...</p>
          </div>
        ) : (
          <>
            {/* Banner de Título Superior (Oculto na impressão) */}
            <div className="print:hidden mb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
                <div>
                  <h1 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
                    <FileText className="w-8 h-8 text-primary" />
                    Galeria de Currículos com IA
                  </h1>
                  <p className="text-muted-foreground mt-1 text-sm font-medium">
                    Crie e gerencie currículos profissionais otimizados para a aviação civil e mercado corporativo.
                  </p>
                </div>

                {/* Alternador de Modo de Navegação */}
                <div className="flex items-center gap-2 bg-muted/60 p-1.5 rounded-[5px] border border-border shrink-0">
                  {savedCurriculums.length > 0 && (
                    <Button
                      variant={mode === 'dashboard' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setMode('dashboard')}
                      className="gap-2 font-bold text-xs rounded-[5px]"
                    >
                      <Layout className="w-4 h-4" />
                      Galeria ({savedCurriculums.length})
                    </Button>
                  )}

                  <Button
                    variant={mode === 'chat' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={handleStartNewCurriculum}
                    className="gap-2 font-bold text-xs rounded-[5px]"
                  >
                    <img src="/images/avatars/lucas.jpg" alt="Lucas" className="w-5 h-5 rounded-full object-cover border border-amber-400 shrink-0" style={{ width: '20px', height: '20px' }} />
                    + Criar com Lucas
                  </Button>

                  {data.full_name && (
                    <Button
                      variant={mode === 'editor' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setMode('editor')}
                      className="gap-2 font-bold text-xs rounded-[5px]"
                    >
                      <Edit3 className="w-4 h-4" />
                      Editar Currículo
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* MODO 1: DASHBOARD / GALERIA DE CURRÍCULOS (LISTA DE CARDS)   */}
            {/* ------------------------------------------------------------- */}
            {mode === 'dashboard' && savedCurriculums.length > 0 && (
              <div className="space-y-6 print:hidden">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black text-foreground flex items-center gap-2">
                      <Layout className="w-5 h-5 text-primary" />
                      Seus Currículos Cadastrados
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Você possui {savedCurriculums.length} currículo(s) salvo(s). Clique em Visualizar para ver o PDF ou em Editar para alterar dados.
                    </p>
                  </div>

                  <Button
                    onClick={handleStartNewCurriculum}
                    className="gap-2 font-bold text-xs bg-primary text-primary-foreground hover:bg-primary/90 rounded-[5px]"
                  >
                    <img src="/images/avatars/lucas.jpg" alt="Lucas" className="w-5 h-5 rounded-full object-cover border border-amber-400 shrink-0" style={{ width: '20px', height: '20px' }} />
                    + Criar Novo com Lucas
                  </Button>
                </div>

                {/* Lista em Grid dos Currículos Salvos */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savedCurriculums.map((curr) => {
                    const templateObj = TEMPLATES.find(t => t.id === (curr.template || 'ats').toLowerCase());

                    return (
                      <Card key={curr.id} className="border-border bg-card shadow-sm hover:shadow-md transition-shadow rounded-[5px] flex flex-col justify-between">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-2">
                            <Badge variant="outline" className="text-[10px] font-bold border-primary/30 text-primary rounded-[5px]">
                              {templateObj?.name || 'Digital / ATS'}
                            </Badge>
                            {curr.updated_at && (
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono">
                                <Clock className="w-3 h-3" />
                                {format(new Date(curr.updated_at), 'dd/MM/yyyy', { locale: ptBR })}
                              </span>
                            )}
                          </div>
                          <CardTitle className="text-base font-black text-foreground mt-2 line-clamp-1">
                            {curr.profession || 'Currículo sem cargo'}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground font-medium">{curr.full_name}</p>
                        </CardHeader>

                        <CardContent className="pt-0 space-y-4">
                          <div className="text-[11px] text-muted-foreground space-y-1 bg-muted/30 p-2.5 rounded-[5px] border border-border">
                            {curr.city && <p className="truncate">📍 {curr.city}</p>}
                            {curr.phone && <p className="truncate">📞 {curr.phone}</p>}
                            {curr.email && <p className="truncate">✉️ {curr.email}</p>}
                          </div>

                          {/* Botões de Ação do Card */}
                          <div className="flex items-center gap-2 pt-2 border-t border-border">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => setPreviewModalCurriculum(curr)}
                              className="gap-1.5 font-bold text-xs flex-1 rounded-[5px]"
                            >
                              <Eye className="w-3.5 h-3.5" /> Visualizar
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setData(curr);
                                setMode('editor');
                              }}
                              className="gap-1.5 font-bold text-xs rounded-[5px]"
                            >
                              <Edit3 className="w-3.5 h-3.5" /> Editar
                            </Button>

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                if (curr.id && window.confirm(`Deseja excluir o currículo "${curr.profession}"?`)) {
                                  deleteMutation.mutate(curr.id);
                                }
                              }}
                              className="h-9 w-9 p-0 text-destructive hover:bg-destructive/10 rounded-[5px]"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* MODO 2: CONVERSA COM IA (CHAT ASSISTANT)                      */}
            {/* ------------------------------------------------------------- */}
            {mode === 'chat' && (
              <div className="print:hidden py-4">
                <CurriculumChatAssistant
                  onCurriculumGenerated={handleCurriculumGenerated}
                  userEmail={user?.email}
                  userName={user?.user_metadata?.full_name}
                />
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* MODO 3: EDITOR & VISUALIZAÇÃO                                 */}
            {/* ------------------------------------------------------------- */}
            {mode === 'editor' && (
              <div className="space-y-6">
                {/* Template Selector Bar (Oculto na impressão) */}
                <Card className="print:hidden border-border bg-card shadow-sm rounded-[5px]">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <div>
                        <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                          <Layout className="w-5 h-5 text-primary" />
                          Escolha o Modelo de Currículo
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Alterne entre os modelos otimizados conforme o tipo de vaga ou envio desejado.
                        </p>
                      </div>

                      {/* Ações Rápidas de Salvar & Baixar */}
                      <div className="flex items-center gap-2">
                        {user && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => saveMutation.mutate()}
                            disabled={saveMutation.isPending}
                            className="gap-2 font-bold text-xs rounded-[5px]"
                          >
                            {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Salvar
                          </Button>
                        )}

                        <Button
                          size="sm"
                          onClick={handleDownloadPDF}
                          className="gap-2 font-bold text-xs bg-primary text-primary-foreground hover:bg-primary/90 rounded-[5px]"
                        >
                          <Download className="w-4 h-4" />
                          Baixar PDF
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setMode('dashboard')}
                          className="gap-2 font-bold text-xs text-muted-foreground hover:text-foreground rounded-[5px]"
                        >
                          <Layout className="w-4 h-4" />
                          Voltar à Galeria
                        </Button>
                      </div>
                    </div>

                    {/* Grid dos 3 Modelos */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {TEMPLATES.map((tmpl) => {
                        const isSelected = (data.template || 'ats').toLowerCase() === tmpl.id;
                        const isRecommended = data.recommended_template === tmpl.id;
                        const Icon = tmpl.icon;

                        return (
                          <div
                            key={tmpl.id}
                            onClick={() => updateField('template', tmpl.id)}
                            className={`
                              cursor-pointer p-4 rounded-[5px] border-2 transition-all relative flex flex-col justify-between
                              ${isSelected ? 'border-primary bg-primary/5 shadow-md' : 'border-border hover:border-primary/40 bg-muted/20'}
                            `}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-sm text-foreground flex items-center gap-2">
                                  <Icon className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                                  {tmpl.name}
                                </span>
                                <Badge variant={isSelected ? 'default' : 'secondary'} className="text-[10px] font-bold rounded-[5px]">
                                  {tmpl.badge}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                                {tmpl.desc}
                              </p>
                            </div>

                            {isRecommended && (
                              <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-[5px] border border-amber-500/20 mt-2">
                                <Sparkles className="w-3 h-3 shrink-0" /> Recomendado pela IA para sua situação
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Justificativa da Recomendação da IA (se houver) */}
                    {data.recommendation_reason && (
                      <div className="mt-4 p-3 rounded-[5px] bg-primary/5 border border-primary/20 text-xs text-primary flex items-start gap-2">
                        <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" />
                        <span><strong>Por que a IA escolheu este modelo:</strong> {data.recommendation_reason}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Split Screen: Form Editor (Esquerda) vs Curriculum Preview (Direita) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Formulário de Edição Manual (Oculto na impressão) */}
                  <div className="print:hidden lg:col-span-5 space-y-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList className="grid grid-cols-4 w-full bg-muted/60">
                        <TabsTrigger value="dados" className="text-xs font-bold">Dados</TabsTrigger>
                        <TabsTrigger value="experiencia" className="text-xs font-bold">Experiência</TabsTrigger>
                        <TabsTrigger value="formacao" className="text-xs font-bold">Formação</TabsTrigger>
                        <TabsTrigger value="extras" className="text-xs font-bold">Extras</TabsTrigger>
                      </TabsList>

                      {/* TAB 1: Dados Pessoais & Resumo */}
                      <TabsContent value="dados" className="space-y-4 mt-4">
                        <Card className="rounded-[5px]">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                              <User className="w-4 h-4 text-primary" /> Dados Pessoais & Objetivo
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <Label className="text-xs font-bold">Nome Completo</Label>
                              <Input
                                value={data.full_name}
                                onChange={(e) => updateField('full_name', e.target.value)}
                                placeholder="Ex: Ana Maria Silva"
                                className="mt-1 text-xs rounded-[5px]"
                              />
                            </div>

                            <div>
                              <Label className="text-xs font-bold">Cargo Desejado / Área</Label>
                              <Input
                                value={data.profession}
                                onChange={(e) => updateField('profession', e.target.value)}
                                placeholder="Ex: Comissária de Bordo / ANAC CCT"
                                className="mt-1 text-xs rounded-[5px]"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label className="text-xs font-bold">E-mail</Label>
                                <Input
                                  value={data.email}
                                  onChange={(e) => updateField('email', e.target.value)}
                                  placeholder="seu.email@exemplo.com"
                                  className="mt-1 text-xs rounded-[5px]"
                                />
                              </div>
                              <div>
                                <Label className="text-xs font-bold">Telefone</Label>
                                <Input
                                  value={data.phone}
                                  onChange={(e) => updateField('phone', e.target.value)}
                                  placeholder="(11) 98888-7777"
                                  className="mt-1 text-xs rounded-[5px]"
                                />
                              </div>
                            </div>

                            <div>
                              <Label className="text-xs font-bold">Cidade e Estado</Label>
                              <Input
                                value={data.city}
                                onChange={(e) => updateField('city', e.target.value)}
                                placeholder="Ex: São Paulo - SP"
                                className="mt-1 text-xs rounded-[5px]"
                              />
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <Label className="text-xs font-bold">Resumo / Perfil Profissional</Label>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={isEnhancingSection === 'summary'}
                                  onClick={() => handleEnhanceWithAI('Resumo Profissional', data.summary, (enhanced) => updateField('summary', enhanced))}
                                  className="h-6 px-2 text-[10px] text-primary hover:bg-primary/10 gap-1 font-bold rounded-[5px]"
                                >
                                  {isEnhancingSection === 'summary' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-amber-500" />}
                                  Melhorar com IA
                                </Button>
                              </div>
                              <Textarea
                                rows={4}
                                value={data.summary}
                                onChange={(e) => updateField('summary', e.target.value)}
                                placeholder="Breve resumo com suas qualificações..."
                                className="text-xs leading-relaxed rounded-[5px]"
                              />
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      {/* TAB 2: Experiência Profissional */}
                      <TabsContent value="experiencia" className="space-y-4 mt-4">
                        <Card className="rounded-[5px]">
                          <CardHeader className="pb-3 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                              <Briefcase className="w-4 h-4 text-primary" /> Histórico Profissional
                            </CardTitle>
                            <Button size="sm" variant="outline" onClick={addExperience} className="h-7 text-xs font-bold gap-1 rounded-[5px]">
                              <Plus className="w-3.5 h-3.5" /> Adicionar
                            </Button>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {data.experience.length === 0 ? (
                              <p className="text-xs text-muted-foreground text-center py-4">Nenhuma experiência adicionada. Clique em Adicionar se tiver histórico prévio.</p>
                            ) : (
                              data.experience.map((exp, idx) => (
                                <div key={idx} className="p-3 border border-border rounded-[5px] bg-muted/20 space-y-3 relative">
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-primary">Experiência #{idx + 1}</span>
                                    <Button variant="ghost" size="icon" onClick={() => removeExperience(idx)} className="h-6 w-6 text-destructive rounded-[5px]">
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                  </div>

                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <Label className="text-[10px] font-bold">Empresa</Label>
                                      <Input
                                        value={exp.company}
                                        onChange={(e) => updateExperience(idx, 'company', e.target.value)}
                                        placeholder="Ex: Latam / Hotel XYZ"
                                        className="text-xs h-8 rounded-[5px]"
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-[10px] font-bold">Cargo</Label>
                                      <Input
                                        value={exp.role}
                                        onChange={(e) => updateExperience(idx, 'role', e.target.value)}
                                        placeholder="Ex: Atendente de Solo"
                                        className="text-xs h-8 rounded-[5px]"
                                      />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <Label className="text-[10px] font-bold">Início</Label>
                                      <Input
                                        value={exp.start}
                                        onChange={(e) => updateExperience(idx, 'start', e.target.value)}
                                        placeholder="Ex: 2021"
                                        className="text-xs h-8 rounded-[5px]"
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-[10px] font-bold">Fim</Label>
                                      <Input
                                        value={exp.end}
                                        onChange={(e) => updateExperience(idx, 'end', e.target.value)}
                                        placeholder="Ex: 2023 ou Atual"
                                        className="text-xs h-8 rounded-[5px]"
                                      />
                                    </div>
                                  </div>

                                  <div>
                                    <div className="flex items-center justify-between mb-1">
                                      <Label className="text-[10px] font-bold">Atividades e Conquistas</Label>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        disabled={isEnhancingSection === `exp_${idx}`}
                                        onClick={() => handleEnhanceWithAI('Descrição da Experiência', exp.description, (enhanced) => updateExperience(idx, 'description', enhanced))}
                                        className="h-5 px-1.5 text-[9px] text-primary hover:bg-primary/10 gap-1 font-bold rounded-[5px]"
                                      >
                                        {isEnhancingSection === `exp_${idx}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-amber-500" />}
                                        Refinar com IA
                                      </Button>
                                    </div>
                                    <Textarea
                                      rows={2}
                                      value={exp.description}
                                      onChange={(e) => updateExperience(idx, 'description', e.target.value)}
                                      placeholder="Descrição das responsabilidades..."
                                      className="text-xs rounded-[5px]"
                                    />
                                  </div>
                                </div>
                              ))
                            )}
                          </CardContent>
                        </Card>
                      </TabsContent>

                      {/* TAB 3: Formação Acadêmica */}
                      <TabsContent value="formacao" className="space-y-4 mt-4">
                        <Card className="rounded-[5px]">
                          <CardHeader className="pb-3 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                              <GraduationCap className="w-4 h-4 text-primary" /> Formação Acadêmica
                            </CardTitle>
                            <Button size="sm" variant="outline" onClick={addEducation} className="h-7 text-xs font-bold gap-1 rounded-[5px]">
                              <Plus className="w-3.5 h-3.5" /> Adicionar
                            </Button>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {data.education.map((edu, idx) => (
                              <div key={idx} className="p-3 border border-border rounded-[5px] bg-muted/20 space-y-2 relative">
                                <div className="flex justify-between items-center">
                                  <span className="text-xs font-bold text-primary">Formação #{idx + 1}</span>
                                  <Button variant="ghost" size="icon" onClick={() => removeEducation(idx)} className="h-6 w-6 text-destructive rounded-[5px]">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <Label className="text-[10px] font-bold">Curso / Grau</Label>
                                    <Input
                                      value={edu.degree}
                                      onChange={(e) => updateEducation(idx, 'degree', e.target.value)}
                                      placeholder="Ex: Aviação Civil"
                                      className="text-xs h-8 rounded-[5px]"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-[10px] font-bold">Instituição</Label>
                                    <Input
                                      value={edu.institution}
                                      onChange={(e) => updateEducation(idx, 'institution', e.target.value)}
                                      placeholder="Ex: Anhembi Morumbi"
                                      className="text-xs h-8 rounded-[5px]"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-[10px] font-bold">Ano de Conclusão</Label>
                                  <Input
                                    value={edu.year}
                                    onChange={(e) => updateEducation(idx, 'year', e.target.value)}
                                    placeholder="Ex: 2023"
                                    className="text-xs h-8 rounded-[5px]"
                                  />
                                </div>
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      </TabsContent>

                      {/* TAB 4: Certificados, Idiomas & Habilidades */}
                      <TabsContent value="extras" className="space-y-4 mt-4">
                        <Card className="rounded-[5px]">
                          <CardHeader className="pb-3 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                              <Award className="w-4 h-4 text-primary" /> Cursos & Certificações ANAC
                            </CardTitle>
                            <Button size="sm" variant="outline" onClick={addCertificate} className="h-7 text-xs font-bold gap-1 rounded-[5px]">
                              <Plus className="w-3.5 h-3.5" /> Adicionar
                            </Button>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            {data.certificates.map((cert, idx) => (
                              <div key={idx} className="p-2 border border-border rounded-[5px] bg-muted/20 grid grid-cols-12 gap-2 items-center">
                                <div className="col-span-5">
                                  <Input
                                    value={cert.name}
                                    onChange={(e) => updateCertificate(idx, 'name', e.target.value)}
                                    placeholder="Ex: CCT ANAC Comissário"
                                    className="text-xs h-7 rounded-[5px]"
                                  />
                                </div>
                                <div className="col-span-4">
                                  <Input
                                    value={cert.issuer}
                                    onChange={(e) => updateCertificate(idx, 'issuer', e.target.value)}
                                    placeholder="Órgão/Escola"
                                    className="text-xs h-7 rounded-[5px]"
                                  />
                                </div>
                                <div className="col-span-2">
                                  <Input
                                    value={cert.year}
                                    onChange={(e) => updateCertificate(idx, 'year', e.target.value)}
                                    placeholder="Ano"
                                    className="text-xs h-7 rounded-[5px]"
                                  />
                                </div>
                                <div className="col-span-1 text-right">
                                  <Button variant="ghost" size="icon" onClick={() => removeCertificate(idx)} className="h-6 w-6 text-destructive rounded-[5px]">
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </CardContent>
                        </Card>

                        <Card className="rounded-[5px]">
                          <CardHeader className="pb-3 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                              <Globe className="w-4 h-4 text-primary" /> Idiomas
                            </CardTitle>
                            <Button size="sm" variant="outline" onClick={addLanguage} className="h-7 text-xs font-bold gap-1 rounded-[5px]">
                              <Plus className="w-3.5 h-3.5" /> Adicionar
                            </Button>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            {data.languages.map((lang, idx) => (
                              <div key={idx} className="flex gap-2 items-center">
                                <Input
                                  value={lang.name}
                                  onChange={(e) => updateLanguage(idx, 'name', e.target.value)}
                                  placeholder="Idioma (ex: Inglês)"
                                  className="text-xs h-8 flex-1 rounded-[5px]"
                                />
                                <Input
                                  value={lang.level}
                                  onChange={(e) => updateLanguage(idx, 'level', e.target.value)}
                                  placeholder="Nível (ex: Avançado)"
                                  className="text-xs h-8 flex-1 rounded-[5px]"
                                />
                                <Button variant="ghost" size="icon" onClick={() => removeLanguage(idx)} className="h-8 w-8 text-destructive rounded-[5px]">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            ))}
                          </CardContent>
                        </Card>

                        <Card className="rounded-[5px]">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                              <Star className="w-4 h-4 text-primary" /> Competências & Habilidades
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex gap-2">
                              <Input
                                value={newSkill}
                                onChange={(e) => setNewSkill(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                                placeholder="Ex: Gestão de Crises, CRM, Atendimento VIP..."
                                className="text-xs h-8 flex-1 rounded-[5px]"
                              />
                              <Button size="sm" onClick={addSkill} className="h-8 text-xs font-bold rounded-[5px]">Adicionar</Button>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {data.skills.map((skill, idx) => (
                                <Badge key={idx} variant="secondary" className="gap-1 text-xs rounded-[5px]">
                                  {skill}
                                  <X className="w-3 h-3 cursor-pointer hover:text-destructive" onClick={() => removeSkill(idx)} />
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>
                  </div>

                  {/* Pré-visualização do Currículo (Visualização Direta na Direita) */}
                  <div className="lg:col-span-7 print:col-span-12">
                    <div className="sticky top-20">
                      <div className="print:hidden mb-3 flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-success" />
                          Visualização em Tempo Real ({TEMPLATES.find(t => t.id === (data.template || 'ats').toLowerCase())?.name})
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          Formato A4 (210mm x 297mm)
                        </span>
                      </div>

                      <CurriculumPreview data={data} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal de Pré-visualização na Galeria */}
      {previewModalCurriculum && (
        <Dialog open={!!previewModalCurriculum} onOpenChange={(open) => !open && setPreviewModalCurriculum(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6 rounded-[5px]">
            <DialogHeader className="pb-3 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-lg font-black text-foreground">
                    {previewModalCurriculum.profession || 'Pré-visualização do Currículo'}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    {previewModalCurriculum.full_name} • Modelo {TEMPLATES.find(t => t.id === (previewModalCurriculum.template || 'ats').toLowerCase())?.name}
                  </DialogDescription>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    disabled={isDownloadingPDF}
                    onClick={() => handleDownloadPDF(previewModalCurriculum)}
                    className="gap-2 font-bold text-xs bg-primary text-primary-foreground hover:bg-primary/90 rounded-[5px]"
                  >
                    {isDownloadingPDF ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    Baixar PDF
                  </Button>
                </div>
              </div>
            </DialogHeader>

            <div id="curriculum-preview-modal-element" className="py-4 bg-white">
              <CurriculumPreview data={previewModalCurriculum} />
            </div>
          </DialogContent>
        </Dialog>
      )}

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
