import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  User, Briefcase, GraduationCap, Award, Plus, Trash2, X, ChevronLeft,
  Download, Save, Loader2, Lock, FileText, Sparkles, Layout, Globe, Star, ArrowRight, Shield, MessageSquare, Edit3, CheckCircle2, Lightbulb, Eye, Calendar, Clock, MapPin, Mail
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
  const { canSaveCurriculum, planLabel } = usePlan();
  const queryClient = useQueryClient();
  
  // Modes: 'dashboard' (Galeria em Lista) | 'chat' (Criador IA) | 'editor' (Edição Manual)
  const [mode, setMode] = useState<'dashboard' | 'chat' | 'editor'>('dashboard');
  const [data, setData] = useState<CurriculumData>(EMPTY_DATA);
  const [newSkill, setNewSkill] = useState('');
  const [editorSection, setEditorSection] = useState<'dados' | 'resumo' | 'experiencia' | 'formacao' | 'certificados' | 'extras' | 'template'>('dados');
  const [mobileEditorView, setMobileEditorView] = useState<'edit' | 'preview'>('edit');
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
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) localList = parsed;
        }

        // Limpa e migra chaves legadas para evitar currículos fantasmas
        const legacyKeys = ['voo_certo_curriculums', 'voo_certo_curriculum', 'curriculum_data', 'voecerto_curriculum'];
        legacyKeys.forEach(legacyKey => {
          const legacy = localStorage.getItem(legacyKey);
          if (legacy) {
            try {
              const parsed = JSON.parse(legacy);
              if (Array.isArray(parsed)) {
                parsed.forEach(p => {
                  if (p && (p.id || p.profession)) {
                    const exists = localList.some(item => (item.id && item.id === p.id) || (item.profession && item.profession === p.profession));
                    if (!exists) localList.push(p);
                  }
                });
              } else if (parsed && typeof parsed === 'object') {
                if (!localList.some(item => item.id === parsed.id || item.profession === parsed.profession)) {
                  localList.push(parsed);
                }
              }
            } catch (e) {}
            localStorage.removeItem(legacyKey);
          }
        });

        localStorage.setItem(localKey, JSON.stringify(localList));
      } catch (e) {
        console.warn('Erro ao ler/migrar localStorage de currículos:', e);
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
        const key = item.id || item.profession || `local_${Math.random()}`;
        if (!mergedMap.has(key)) {
          mergedMap.set(key, { ...item, id: item.id || key });
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

  // Galeria é sempre o ponto de entrada — o usuário navega para o chat via botão
  useEffect(() => {
    if (!loadingSaved && mode !== 'chat' && mode !== 'editor') {
      setMode('dashboard');
    }
  }, [loadingSaved]);

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

      // 1. Salva no localStorage
      const localKey = `voo_certo_curriculums_${user.id}`;
      let currentLocalList: CurriculumData[] = [];
      try {
        const stored = localStorage.getItem(localKey);
        if (stored) currentLocalList = JSON.parse(stored);
      } catch (e) {}

      const idx = currentLocalList.findIndex(c => c.id === targetId || (c.profession && c.profession === curriculumToSave.profession));
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
    mutationFn: async (currToDelete: CurriculumData | string) => {
      if (!user) throw new Error('Usuário não autenticado');

      const targetId = typeof currToDelete === 'string' ? currToDelete : currToDelete.id;
      const targetProfession = typeof currToDelete === 'string' ? currToDelete : currToDelete.profession;

      // 1. Limpa de TODAS as chaves possíveis no localStorage
      const keysToClean = [
        `voo_certo_curriculums_${user.id}`,
        'voo_certo_curriculums',
        'voo_certo_curriculum',
        'curriculum_data',
        'voecerto_curriculum'
      ];

      keysToClean.forEach(key => {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
              const filtered = parsed.filter((item: any) => {
                if (targetId && item.id === targetId) return false;
                if (targetProfession && item.profession === targetProfession) return false;
                return true;
              });
              if (filtered.length > 0) {
                localStorage.setItem(key, JSON.stringify(filtered));
              } else {
                localStorage.removeItem(key);
              }
            } else if (parsed && typeof parsed === 'object') {
              if ((targetId && parsed.id === targetId) || (targetProfession && parsed.profession === targetProfession)) {
                localStorage.removeItem(key);
              }
            }
          }
        } catch (e) {}
      });

      // 2. Remove do Supabase por ID (se existir)
      if (targetId) {
        const { error: idError } = await supabase
          .from('curriculum_data')
          .delete()
          .eq('id', targetId);
        if (idError) console.warn('Aviso ao deletar por ID no Supabase:', idError.message);
      }

      // 3. Remove do Supabase por profissão e user_id (para garantir caso o registro não tivesse ID)
      if (targetProfession) {
        const { error: profError } = await supabase
          .from('curriculum_data')
          .delete()
          .eq('user_id', user.id)
          .eq('profession', targetProfession);
        if (profError) console.warn('Aviso ao deletar por profissão no Supabase:', profError.message);
      }
    },
    onSuccess: (_, currToDelete) => {
      const targetId = typeof currToDelete === 'string' ? currToDelete : currToDelete.id;
      const targetProfession = typeof currToDelete === 'string' ? currToDelete : currToDelete.profession;

      toast.success('Currículo excluído com sucesso!');

      // Atualização síncrona imediata no cache do React Query
      queryClient.setQueryData(['curriculums', user?.id], (old: CurriculumData[] | undefined) => {
        if (!old) return [];
        return old.filter(item => {
          if (targetId && item.id === targetId) return false;
          if (targetProfession && item.profession === targetProfession) return false;
          return true;
        });
      });

      if (savedCurriculums.length <= 1) {
        setData(EMPTY_DATA);
        setMode('dashboard');
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
      id: newId,
      template: generatedData.recommended_template || 'ats',
    };
    
    setData(updated);
    setMode('editor'); // Abre direto no editor para o usuário revisar antes de salvar
    toast.info('Revise seu currículo e clique em Salvar quando estiver pronto!');
  };

  // Melhorar um trecho específico com IA no editor manual
  const handleEnhanceWithAI = async (sectionName: string, textToEnhance: string, onSuccess: (enhanced: string) => void) => {
    if (!textToEnhance.trim()) {
      toast.error('Digite algum texto antes de pedir a melhoria ao Mike.');
      return;
    }
    setIsEnhancingSection(sectionName);
    toast.info(`Mike refinando texto da seção [${sectionName}]...`);

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
        toast.success(`Seção [${sectionName}] aprimorada com sucesso por Mike!`);
      }
    } catch (err: any) {
      toast.error(`Falha ao melhorar com Mike: ${err.message || 'Erro inesperado'}`);
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

  // MODO CHAT TELA CHEIA (Sem Header/Footer, 100% da tela)
  if (mode === 'chat') {
    return (
      <div className="fixed inset-0 z-50 h-[100dvh] w-screen bg-background flex flex-col overflow-hidden">
        <CurriculumChatAssistant
          onCurriculumGenerated={handleCurriculumGenerated}
          onBackToGallery={() => setMode('dashboard')}
          userEmail={user?.email}
          userName={user?.user_metadata?.full_name}
        />
      </div>
    );
  }

  // MODO EDITOR TELA CHEIA (Estilo ChatGPT / Studio Workspace)
  if (mode === 'editor') {
    const activeTemplateObj = TEMPLATES.find(t => t.id === (data.template || 'ats').toLowerCase());

    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Aeronauta';
    const initials = displayName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p: string) => p[0]?.toUpperCase())
      .join('') || 'VC';

    const SECTIONS = [
      { id: 'dados', label: 'Dados Pessoais', icon: User, desc: 'Nome, contato e localização' },
      { id: 'resumo', label: 'Resumo Profissional', icon: FileText, desc: 'Perfil e objetivo na aviação' },
      { id: 'experiencia', label: 'Experiências', icon: Briefcase, count: data.experience?.length || 0, desc: 'Histórico profissional' },
      { id: 'formacao', label: 'Formação Acadêmica', icon: GraduationCap, count: data.education?.length || 0, desc: 'Escolaridade e cursos' },
      { id: 'certificados', label: 'Cursos & ANAC', icon: Award, count: data.certificates?.length || 0, desc: 'CCT, CMS e licenças' },
      { id: 'extras', label: 'Idiomas & Habilidades', icon: Globe, count: (data.languages?.length || 0) + (data.skills?.length || 0), desc: 'Idiomas e competências' },
      { id: 'template', label: 'Modelo de Currículo', icon: Layout, desc: 'Layout ATS, Geral ou Presencial' },
    ];

    const currentSectionIndex = SECTIONS.findIndex(s => s.id === editorSection);
    const prevSection = currentSectionIndex > 0 ? SECTIONS[currentSectionIndex - 1] : null;
    const nextSection = currentSectionIndex < SECTIONS.length - 1 ? SECTIONS[currentSectionIndex + 1] : null;

    return (
      <div className="flex flex-col h-[100dvh] w-screen bg-background overflow-hidden fixed inset-0 z-50 select-text overscroll-none">
        
        {/* ── TOPBAR SUPERIOR ── */}
        <header className="h-14 border-b border-border/80 px-3.5 sm:px-5 flex items-center justify-between shrink-0 bg-card/95 backdrop-blur-md z-20">
          
          {/* DESKTOP HEADER */}
          <div className="hidden lg:flex items-center gap-3 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMode('dashboard')}
              className="h-8 px-2.5 gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground rounded-[5px]"
            >
              <ChevronLeft className="w-4 h-4 text-primary" />
              <span>Galeria</span>
            </Button>

            <div className="h-4 w-px bg-border" />

            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-[4px] overflow-hidden border border-border bg-slate-900 shrink-0">
                <img
                  src="/images/avatars/mike_character_curiculum.png"
                  alt="Mike"
                  className="w-full h-full object-cover block"
                />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm font-black text-foreground truncate">
                  {data.profession || data.full_name || 'Editar Currículo'}
                </h1>
                <p className="text-[10px] text-muted-foreground truncate">
                  Modelo: <span className="text-foreground font-semibold">{activeTemplateObj?.name || 'Digital / ATS'}</span>
                </p>
              </div>
            </div>
          </div>

          {/* MOBILE HEADER (ULTRA MINIMALISTA) */}
          <div className="flex lg:hidden items-center justify-between w-full">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMode('dashboard')}
              className="h-8 px-2 gap-1 text-xs font-bold text-muted-foreground hover:text-foreground rounded-[5px]"
            >
              <ChevronLeft className="w-4 h-4 text-primary" />
              <span>Galeria</span>
            </Button>

            <div className="text-center min-w-0 px-2 flex-1">
              <span className="text-xs font-black text-foreground block truncate">
                {mobileEditorView === 'preview' 
                  ? 'Prévia do PDF' 
                  : `${currentSectionIndex + 1}/7 • ${SECTIONS[currentSectionIndex].label}`}
              </span>
            </div>

            <Button
              variant={mobileEditorView === 'preview' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMobileEditorView(mobileEditorView === 'preview' ? 'edit' : 'preview')}
              className={`h-8 px-3 text-xs font-bold rounded-[5px] gap-1 shrink-0 ${
                mobileEditorView === 'preview'
                  ? 'bg-[#0f172a] text-white hover:bg-slate-800'
                  : 'border-border text-foreground hover:bg-muted'
              }`}
            >
              {mobileEditorView === 'preview' ? (
                <>
                  <Edit3 className="w-3.5 h-3.5" /> Editar
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" /> Prévia
                </>
              )}
            </Button>
          </div>

          {/* DESKTOP ACTIONS */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            {user && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
                className="h-8 px-3 gap-1.5 font-bold text-xs rounded-[5px] border-border/80 hover:bg-muted"
              >
                {saveMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5 text-primary" />
                )}
                <span>Salvar</span>
              </Button>
            )}

            <Button
              size="sm"
              onClick={() => handleDownloadPDF()}
              disabled={isDownloadingPDF}
              className="h-8 px-3.5 gap-1.5 font-bold text-xs bg-primary text-primary-foreground hover:bg-primary/90 rounded-[5px] shadow-sm"
            >
              {isDownloadingPDF ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>Baixar PDF</span>
            </Button>
          </div>
        </header>

        {/* ── BARRA FINA DE PROGRESSO NO MOBILE (Passos 1 a 7) ── */}
        {mobileEditorView === 'edit' && (
          <div className="flex lg:hidden items-center gap-1.5 px-4 py-2 border-b border-border/60 bg-muted/20 shrink-0">
            {SECTIONS.map((sec, idx) => {
              const isDone = idx < currentSectionIndex;
              const isCurrent = idx === currentSectionIndex;
              return (
                <button
                  key={sec.id}
                  onClick={() => setEditorSection(sec.id as any)}
                  className={`h-1.5 flex-1 rounded-full transition-all ${
                    isCurrent
                      ? 'bg-primary'
                      : isDone
                      ? 'bg-primary/40'
                      : 'bg-muted-foreground/20'
                  }`}
                  title={sec.label}
                />
              );
            })}
          </div>
        )}

        {/* ── CORPO PRINCIPAL (SIDEBAR + WORKSPACE SPLIT) ── */}
        <div className="flex flex-1 overflow-hidden h-[calc(100dvh-3.5rem)]">
          
          {/* ── SIDEBAR DESKTOP (ESTILO CHATGPT STUDIO) ── */}
          <aside className="hidden md:flex flex-col w-64 border-r border-border/80 bg-muted/15 justify-between shrink-0 p-3 h-full">
            <div className="space-y-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleStartNewCurriculum}
                className="w-full justify-start gap-2 text-xs font-bold bg-card border-border/80 hover:bg-muted text-foreground rounded-[5px] h-9 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Novo com Mike IA
              </Button>

              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 mb-1.5">
                  Seções de Edição
                </p>
                {SECTIONS.map((sec) => {
                  const Icon = sec.icon;
                  const isSelected = editorSection === sec.id;

                  return (
                    <button
                      key={sec.id}
                      onClick={() => setEditorSection(sec.id as any)}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-[5px] text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-primary/10 text-primary font-bold shadow-xs'
                          : 'text-foreground/75 hover:bg-muted/60 hover:text-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className="truncate">{sec.label}</span>
                      </div>
                      {typeof sec.count === 'number' && sec.count > 0 && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                          isSelected ? 'bg-primary text-primary-foreground font-bold' : 'bg-muted text-muted-foreground'
                        }`}>
                          {sec.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Perfil no rodapé da Sidebar */}
            <div className="pt-3 border-t border-border/80 flex items-center gap-2.5 px-1">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-foreground truncate">{displayName}</p>
                <p className="text-[10px] text-muted-foreground font-medium capitalize">
                  Plano {planLabel || 'Gratuito'}
                </p>
              </div>
            </div>
          </aside>

          {/* ── WORKSPACE SPLIT (EDITOR + PREVIEW) ── */}
          <div className="flex-1 flex overflow-hidden">
            
            {/* ── PAINEL DE FORMULÁRIO / EDIÇÃO ── */}
            <div className={`
              flex-1 lg:max-w-xl xl:max-w-2xl overflow-y-auto p-4 sm:p-6 space-y-6 border-r border-border/70 bg-background pb-24 lg:pb-6
              ${mobileEditorView === 'preview' ? 'hidden lg:block' : 'block'}
            `}>

              {/* SEÇÃO: DADOS PESSOAIS */}
              {editorSection === 'dados' && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <User className="w-4 h-4 text-primary" /> Dados Pessoais & Contato
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Informações básicas de identificação e canais de contato com os recrutadores.
                    </p>
                  </div>

                  <Card className="rounded-[5px] border-border/80 shadow-xs">
                    <CardContent className="p-4 sm:p-5 space-y-4">
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
                        <Label className="text-xs font-bold">Cargo Desejado / Área de Atuação</Label>
                        <Input
                          value={data.profession}
                          onChange={(e) => updateField('profession', e.target.value)}
                          placeholder="Ex: Comissária de Bordo / ANAC CCT"
                          className="mt-1 text-xs rounded-[5px]"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                          <Label className="text-xs font-bold">Telefone com DDD</Label>
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
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* SEÇÃO: RESUMO & PERFIL */}
              {editorSection === 'resumo' && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" /> Resumo Profissional & Objetivo
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Apresentação executiva rápida focada no perfil que as companhias aéreas buscam.
                    </p>
                  </div>

                  <Card className="rounded-[5px] border-border/80 shadow-xs">
                    <CardContent className="p-4 sm:p-5 space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <Label className="text-xs font-bold">Texto do Resumo</Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isEnhancingSection === 'summary'}
                            onClick={() => handleEnhanceWithAI('Resumo Profissional', data.summary, (enhanced) => updateField('summary', enhanced))}
                            className="h-7 px-2.5 text-xs text-primary hover:bg-primary/10 gap-1 font-bold rounded-[5px] border border-primary/20"
                          >
                            {isEnhancingSection === 'summary' ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            )}
                            <span>Melhorar com Mike IA</span>
                          </Button>
                        </div>
                        <Textarea
                          rows={6}
                          value={data.summary}
                          onChange={(e) => updateField('summary', e.target.value)}
                          placeholder="Ex: Profissional dedicado com foco em segurança de voo e excelência no atendimento..."
                          className="text-xs leading-relaxed rounded-[5px]"
                        />
                      </div>

                      <div className="p-3 bg-muted/40 rounded-[5px] border border-border/60 text-[11px] text-muted-foreground space-y-1">
                        <p className="font-bold text-foreground flex items-center gap-1.5">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Dica de Ouro do Mike
                        </p>
                        <p>
                          Destaque palavras-chave como <strong>Segurança Operacional</strong>, <strong>Banca ANAC</strong>, <strong>Atendimento Humanizado</strong> e <strong>Gestão de Recursos de Tripulação (CRM)</strong>.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* SEÇÃO: EXPERIÊNCIA PROFISSIONAL */}
              {editorSection === 'experiencia' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-primary" /> Experiência Profissional
                      </h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Histórico de empresas, funções anteriores e realizações relevantes.
                      </p>
                    </div>

                    <Button
                      size="sm"
                      onClick={addExperience}
                      className="h-8 px-3 text-xs font-bold gap-1 rounded-[5px] shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" /> Adicionar
                    </Button>
                  </div>

                  {data.experience.length === 0 ? (
                    <div className="p-8 text-center border border-dashed border-border rounded-[5px] bg-muted/20 space-y-2">
                      <Briefcase className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                      <p className="text-xs font-bold text-foreground">Nenhuma experiência cadastrada</p>
                      <p className="text-[11px] text-muted-foreground">Adicione experiências anteriores ou clique no botão abaixo.</p>
                      <Button size="sm" variant="outline" onClick={addExperience} className="mt-2 text-xs font-bold rounded-[5px]">
                        <Plus className="w-3.5 h-3.5 mr-1" /> Adicionar Primeira Experiência
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {data.experience.map((exp, idx) => (
                        <Card key={idx} className="rounded-[5px] border-border/80 shadow-xs">
                          <CardContent className="p-4 space-y-3">
                            <div className="flex justify-between items-center pb-2 border-b border-border/60">
                              <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                                <Briefcase className="w-3.5 h-3.5" /> Experiência #{idx + 1}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeExperience(idx)}
                                className="h-7 px-2 text-destructive hover:bg-destructive/10 rounded-[5px] text-xs font-semibold gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Excluir
                              </Button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              <div>
                                <Label className="text-[10px] font-bold">Empresa</Label>
                                <Input
                                  value={exp.company}
                                  onChange={(e) => updateExperience(idx, 'company', e.target.value)}
                                  placeholder="Ex: Latam Airlines / Hotel Fasano"
                                  className="text-xs h-8 rounded-[5px] mt-0.5"
                                />
                              </div>
                              <div>
                                <Label className="text-[10px] font-bold">Cargo / Função</Label>
                                <Input
                                  value={exp.role}
                                  onChange={(e) => updateExperience(idx, 'role', e.target.value)}
                                  placeholder="Ex: Atendente de Solo / Recepcionista"
                                  className="text-xs h-8 rounded-[5px] mt-0.5"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              <div>
                                <Label className="text-[10px] font-bold">Período de Início</Label>
                                <Input
                                  value={exp.start}
                                  onChange={(e) => updateExperience(idx, 'start', e.target.value)}
                                  placeholder="Ex: Jan 2021"
                                  className="text-xs h-8 rounded-[5px] mt-0.5"
                                />
                              </div>
                              <div>
                                <Label className="text-[10px] font-bold">Período de Término</Label>
                                <Input
                                  value={exp.end}
                                  onChange={(e) => updateExperience(idx, 'end', e.target.value)}
                                  placeholder="Ex: Dez 2023 ou Atual"
                                  className="text-xs h-8 rounded-[5px] mt-0.5"
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
                                  className="h-6 px-2 text-[10px] text-primary hover:bg-primary/10 gap-1 font-bold rounded-[5px]"
                                >
                                  {isEnhancingSection === `exp_${idx}` ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                  )}
                                  Refinar com IA
                                </Button>
                              </div>
                              <Textarea
                                rows={3}
                                value={exp.description}
                                onChange={(e) => updateExperience(idx, 'description', e.target.value)}
                                placeholder="Descreva suas principais responsabilidades, atendimento a clientes, protocolos seguidos..."
                                className="text-xs rounded-[5px]"
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SEÇÃO: FORMAÇÃO ACADÊMICA */}
              {editorSection === 'formacao' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-primary" /> Formação Acadêmica
                      </h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Escolaridade regular, cursos técnicos ou graduação superior.
                      </p>
                    </div>

                    <Button
                      size="sm"
                      onClick={addEducation}
                      className="h-8 px-3 text-xs font-bold gap-1 rounded-[5px] shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" /> Adicionar
                    </Button>
                  </div>

                  {data.education.length === 0 ? (
                    <div className="p-8 text-center border border-dashed border-border rounded-[5px] bg-muted/20 space-y-2">
                      <GraduationCap className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                      <p className="text-xs font-bold text-foreground">Nenhuma formação cadastrada</p>
                      <p className="text-[11px] text-muted-foreground">Ex: Ensino Médio Completo, Ciências Aeronáuticas...</p>
                      <Button size="sm" variant="outline" onClick={addEducation} className="mt-2 text-xs font-bold rounded-[5px]">
                        <Plus className="w-3.5 h-3.5 mr-1" /> Adicionar Formação
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {data.education.map((edu, idx) => (
                        <Card key={idx} className="rounded-[5px] border-border/80 shadow-xs">
                          <CardContent className="p-4 space-y-3">
                            <div className="flex justify-between items-center pb-2 border-b border-border/60">
                              <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                                <GraduationCap className="w-3.5 h-3.5" /> Formação #{idx + 1}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeEducation(idx)}
                                className="h-7 px-2 text-destructive hover:bg-destructive/10 rounded-[5px] text-xs font-semibold gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Excluir
                              </Button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              <div>
                                <Label className="text-[10px] font-bold">Curso / Grau</Label>
                                <Input
                                  value={edu.degree}
                                  onChange={(e) => updateEducation(idx, 'degree', e.target.value)}
                                  placeholder="Ex: Ensino Médio / Ciências Aeronáuticas"
                                  className="text-xs h-8 rounded-[5px] mt-0.5"
                                />
                              </div>
                              <div>
                                <Label className="text-[10px] font-bold">Instituição de Ensino</Label>
                                <Input
                                  value={edu.institution}
                                  onChange={(e) => updateEducation(idx, 'institution', e.target.value)}
                                  placeholder="Ex: Escola Estadual / Anhembi Morumbi"
                                  className="text-xs h-8 rounded-[5px] mt-0.5"
                                />
                              </div>
                            </div>

                            <div>
                              <Label className="text-[10px] font-bold">Ano de Conclusão / Situação</Label>
                              <Input
                                value={edu.year}
                                onChange={(e) => updateEducation(idx, 'year', e.target.value)}
                                placeholder="Ex: Concluído em 2023 ou Cursando 4º Semestre"
                                className="text-xs h-8 rounded-[5px] mt-0.5"
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SEÇÃO: CURSOS & CERTIFICAÇÕES ANAC */}
              {editorSection === 'certificados' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                        <Award className="w-4 h-4 text-primary" /> Cursos & Certificações ANAC
                      </h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        CCT/CMS ANAC, cursos homologados, Primeiros Socorros e licenças aeronáuticas.
                      </p>
                    </div>

                    <Button
                      size="sm"
                      onClick={addCertificate}
                      className="h-8 px-3 text-xs font-bold gap-1 rounded-[5px] shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" /> Adicionar
                    </Button>
                  </div>

                  {data.certificates.length === 0 ? (
                    <div className="p-8 text-center border border-dashed border-border rounded-[5px] bg-muted/20 space-y-2">
                      <Award className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                      <p className="text-xs font-bold text-foreground">Nenhuma certificação adicionada</p>
                      <p className="text-[11px] text-muted-foreground">Ex: CCT ANAC Comissário de Voo, Curso de Sobrevivência na Selva...</p>
                      <Button size="sm" variant="outline" onClick={addCertificate} className="mt-2 text-xs font-bold rounded-[5px]">
                        <Plus className="w-3.5 h-3.5 mr-1" /> Adicionar Certificação
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {data.certificates.map((cert, idx) => (
                        <Card key={idx} className="rounded-[5px] border-border/80 shadow-xs">
                          <CardContent className="p-3.5 space-y-2.5">
                            <div className="flex justify-between items-center pb-1.5 border-b border-border/60">
                              <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                                <Award className="w-3.5 h-3.5" /> Certificação #{idx + 1}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeCertificate(idx)}
                                className="h-6 px-2 text-destructive hover:bg-destructive/10 rounded-[5px] text-xs font-semibold gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Excluir
                              </Button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                              <div className="sm:col-span-6">
                                <Label className="text-[10px] font-bold">Nome do Curso / Certificado</Label>
                                <Input
                                  value={cert.name}
                                  onChange={(e) => updateCertificate(idx, 'name', e.target.value)}
                                  placeholder="Ex: CCT ANAC Comissário(a)"
                                  className="text-xs h-8 rounded-[5px] mt-0.5"
                                />
                              </div>
                              <div className="sm:col-span-4">
                                <Label className="text-[10px] font-bold">Órgão Emissor / Escola</Label>
                                <Input
                                  value={cert.issuer}
                                  onChange={(e) => updateCertificate(idx, 'issuer', e.target.value)}
                                  placeholder="Ex: ANAC / Escola de Aviação"
                                  className="text-xs h-8 rounded-[5px] mt-0.5"
                                />
                              </div>
                              <div className="sm:col-span-2">
                                <Label className="text-[10px] font-bold">Ano / Vigência</Label>
                                <Input
                                  value={cert.year}
                                  onChange={(e) => updateCertificate(idx, 'year', e.target.value)}
                                  placeholder="Ex: 2024"
                                  className="text-xs h-8 rounded-[5px] mt-0.5"
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SEÇÃO: IDIOMAS & COMPETÊNCIAS */}
              {editorSection === 'extras' && (
                <div className="space-y-5">
                  {/* Idiomas */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                          <Globe className="w-4 h-4 text-primary" /> Idiomas
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Idiomas com proficiência informada (Básico a Fluente / ICAO).
                        </p>
                      </div>

                      <Button
                        size="sm"
                        onClick={addLanguage}
                        className="h-8 px-3 text-xs font-bold gap-1 rounded-[5px] shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" /> Adicionar
                      </Button>
                    </div>

                    {data.languages.length === 0 ? (
                      <div className="p-5 text-center border border-dashed border-border rounded-[5px] bg-muted/20">
                        <p className="text-xs text-muted-foreground">Nenhum idioma adicionado ainda.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {data.languages.map((lang, idx) => (
                          <div key={idx} className="flex gap-2 items-center bg-card p-2 rounded-[5px] border border-border/80">
                            <Input
                              value={lang.name}
                              onChange={(e) => updateLanguage(idx, 'name', e.target.value)}
                              placeholder="Idioma (ex: Inglês, Espanhol)"
                              className="text-xs h-8 flex-1 rounded-[5px]"
                            />
                            <Input
                              value={lang.level}
                              onChange={(e) => updateLanguage(idx, 'level', e.target.value)}
                              placeholder="Nível (ex: Intermediário / ICAO 4)"
                              className="text-xs h-8 flex-1 rounded-[5px]"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeLanguage(idx)}
                              className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-[5px] shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Competências */}
                  <div className="space-y-3 pt-3 border-t border-border/70">
                    <div>
                      <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                        <Star className="w-4 h-4 text-primary" /> Competências & Habilidades
                      </h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Habilidades comportamentais e técnicas valorizadas na aviação civil.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                        placeholder="Ex: Segurança Operacional, CRM, Atendimento VIP..."
                        className="text-xs h-8 flex-1 rounded-[5px]"
                      />
                      <Button size="sm" onClick={addSkill} className="h-8 px-4 text-xs font-bold rounded-[5px]">
                        Adicionar
                      </Button>
                    </div>

                    {data.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 p-3 bg-muted/20 border border-border/60 rounded-[5px]">
                        {data.skills.map((skill, idx) => (
                          <Badge key={idx} variant="secondary" className="gap-1.5 text-xs py-1 px-2.5 rounded-[5px]">
                            {skill}
                            <X className="w-3 h-3 cursor-pointer hover:text-destructive transition-colors" onClick={() => removeSkill(idx)} />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SEÇÃO: MODELO & TEMPLATE */}
              {editorSection === 'template' && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <Layout className="w-4 h-4 text-primary" /> Escolha o Modelo de Currículo
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Alterne entre os layouts aprovados conforme a modalidade de candidatura da vaga.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {TEMPLATES.map((tmpl) => {
                      const isSelected = (data.template || 'ats').toLowerCase() === tmpl.id;
                      const isRecommended = data.recommended_template === tmpl.id;
                      const Icon = tmpl.icon;

                      return (
                        <div
                          key={tmpl.id}
                          onClick={() => updateField('template', tmpl.id)}
                          className={`
                            cursor-pointer p-4 rounded-[5px] border-2 transition-all flex flex-col justify-between
                            ${isSelected ? 'border-primary bg-primary/5 shadow-sm' : 'border-border/80 hover:border-primary/40 bg-card'}
                          `}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-bold text-sm text-foreground flex items-center gap-2">
                                <Icon className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                                {tmpl.name}
                              </span>
                              <Badge variant={isSelected ? 'default' : 'secondary'} className="text-[10px] font-bold rounded-[5px]">
                                {tmpl.badge}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">{tmpl.desc}</p>
                          </div>
                          {isRecommended && (
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-[5px] border border-amber-500/20 mt-3 w-fit">
                              <Sparkles className="w-3 h-3 shrink-0" /> Recomendado pela IA
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {data.recommendation_reason && (
                    <div className="p-3.5 rounded-[5px] bg-primary/5 border border-primary/20 text-xs text-primary flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" />
                      <span><strong>Por que a IA escolheu este modelo:</strong> {data.recommendation_reason}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Navegação entre seções DESKTOP (Voltar / Avançar) */}
              <div className="hidden lg:flex pt-4 border-t border-border/80 items-center justify-between">
                {prevSection ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditorSection(prevSection.id as any)}
                    className="text-xs font-semibold rounded-[5px] h-8 px-3"
                  >
                    ← {prevSection.label}
                  </Button>
                ) : <div />}

                {nextSection && (
                  <Button
                    size="sm"
                    onClick={() => setEditorSection(nextSection.id as any)}
                    className="text-xs font-bold rounded-[5px] h-8 px-3.5 bg-muted hover:bg-muted/80 text-foreground border border-border"
                  >
                    {nextSection.label} →
                  </Button>
                )}
              </div>
            </div>

            {/* ── PAINEL DIREITO: PRÉVIA EM TEMPO REAL (A4) ── */}
            <div className={`
              flex-1 bg-muted/30 p-4 sm:p-6 overflow-y-auto flex flex-col items-center justify-start pb-24 lg:pb-6
              ${mobileEditorView === 'edit' ? 'hidden lg:flex' : 'flex'}
            `}>
              <div className="w-full max-w-[210mm] space-y-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                  <span className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                    Visualização em Tempo Real ({activeTemplateObj?.name || 'Digital / ATS'})
                  </span>
                  <span className="font-mono text-[10px] hidden sm:inline">Formato A4 (210mm × 297mm)</span>
                </div>

                <div className="shadow-lg rounded-[2px] overflow-hidden border border-border/80 bg-white">
                  <CurriculumPreview data={data} />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── BARRA FIXA DE AÇÃO NO MOBILE (RODAPÉ) ── */}
        <div className="flex lg:hidden items-center justify-between p-3 border-t border-border bg-card/95 backdrop-blur-md shrink-0 gap-2 z-20">
          {mobileEditorView === 'edit' ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                disabled={currentSectionIndex === 0}
                onClick={() => prevSection && setEditorSection(prevSection.id as any)}
                className="text-xs font-semibold rounded-[5px] h-9 px-3 disabled:opacity-30"
              >
                ← Anterior
              </Button>

              {user && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => saveMutation.mutate()}
                  disabled={saveMutation.isPending}
                  className="text-xs font-bold rounded-[5px] h-9 px-3 border-border hover:bg-muted"
                >
                  {saveMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5 text-primary" />}
                  <span className="hidden xs:inline">Salvar</span>
                </Button>
              )}

              {nextSection ? (
                <Button
                  size="sm"
                  onClick={() => setEditorSection(nextSection.id as any)}
                  className="text-xs font-bold rounded-[5px] h-9 px-4 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Próximo →
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => setMobileEditorView('preview')}
                  className="text-xs font-bold rounded-[5px] h-9 px-4 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Ver Prévia →
                </Button>
              )}
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMobileEditorView('edit')}
                className="text-xs font-bold rounded-[5px] h-9 px-3 border-border"
              >
                ← Voltar a Editar
              </Button>

              <Button
                size="sm"
                onClick={() => handleDownloadPDF()}
                disabled={isDownloadingPDF}
                className="text-xs font-bold rounded-[5px] h-9 px-4 bg-primary text-primary-foreground hover:bg-primary/90 flex-1 ml-2"
              >
                {isDownloadingPDF ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Download className="w-3.5 h-3.5 mr-1" />}
                Baixar PDF
              </Button>
            </>
          )}
        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col print:bg-white print:p-0">
      <div className="print:hidden">
        <Header />
      </div>

      <main className="flex-1 container mx-auto px-4 pt-20 sm:pt-24 pb-12 print:p-0 print:m-0">

        {/* Loading */}
        {loadingSaved ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-xs font-semibold">Carregando sua galeria...</p>
          </div>
        ) : (
          <>
            {/* ================================================================ */}
            {/* MODO GALERIA (dashboard)                                          */}
            {/* ================================================================ */}
            {mode === 'dashboard' && (
              <div className="space-y-8 print:hidden">

                {/* Header da Galeria */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight flex items-center gap-2.5">
                      <FileText className="w-7 h-7 text-primary shrink-0" />
                      Meus Currículos
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                      {savedCurriculums.length > 0
                        ? `${savedCurriculums.length} currículo${savedCurriculums.length > 1 ? 's' : ''} salvo${savedCurriculums.length > 1 ? 's' : ''}`
                        : 'Crie seu primeiro currículo profissional com ajuda da IA'}
                    </p>
                  </div>

                  {savedCurriculums.length > 0 && (
                    <Button
                      variant="outline"
                      onClick={handleStartNewCurriculum}
                      className="gap-2 font-semibold text-xs sm:text-sm bg-muted/60 hover:bg-muted border-border text-foreground rounded-[5px] h-10 px-5 shadow-none shrink-0"
                    >
                      <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                      Criar Currículo
                    </Button>
                  )}
                </div>

                {/* ─── EMPTY STATE ────────────────────────────────────────── */}
                {savedCurriculums.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-20 text-center gap-6"
                  >
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                      <FileText className="w-10 h-10 text-primary" />
                    </div>
                    <div className="space-y-2 max-w-sm">
                      <h2 className="text-xl font-black text-foreground">Nenhum currículo ainda</h2>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Crie seu primeiro currículo profissional em minutos com a ajuda do Mike, nossa IA especializada em aviação civil.
                      </p>
                    </div>
                    <Button
                      onClick={handleStartNewCurriculum}
                      className="gap-2.5 font-semibold text-sm bg-muted/80 hover:bg-muted border border-border text-foreground rounded-[5px] h-12 px-8 shadow-none"
                      variant="outline"
                    >
                      <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                      Criar meu primeiro Currículo com Mike
                    </Button>
                  </motion.div>
                )}

                {/* ─── NETFLIX GRID ───────────────────────────────────────── */}
                {savedCurriculums.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                    {savedCurriculums.map((curr) => {
                      const templateObj = TEMPLATES.find(t => t.id === (curr.template || 'ats').toLowerCase());

                      return (
                        <motion.div
                          key={curr.id}
                          initial={{ opacity: 0, scale: 0.97 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.2 }}
                          className="group relative bg-card border border-border/80 rounded-[5px] overflow-hidden shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
                        >
                          {/* Faixa de cor no topo — estilo Netflix */}
                          <div className="h-1.5 w-full bg-gradient-to-r from-primary via-sky-500 to-primary/40" />

                          {/* Conteúdo principal */}
                          <div className="p-4 sm:p-5">
                            <div className="flex items-start justify-between gap-2 mb-3">
                              <Badge
                                variant="outline"
                                className="text-[10px] font-bold border-amber-400/40 text-amber-600 dark:text-amber-400 bg-amber-400/10 rounded-[5px] uppercase shrink-0"
                              >
                                {templateObj?.name || 'Digital / ATS'}
                              </Badge>
                              {curr.updated_at && (
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono shrink-0">
                                  <Clock className="w-3 h-3" />
                                  {format(new Date(curr.updated_at), 'dd/MM/yy', { locale: ptBR })}
                                </span>
                              )}
                            </div>

                            <h3 className="font-black text-base text-foreground line-clamp-1 mb-0.5">
                              {curr.profession || 'Sem cargo definido'}
                            </h3>
                            <p className="text-xs text-muted-foreground font-semibold mb-3 truncate">{curr.full_name}</p>

                            {(curr.city || curr.email) && (
                              <div className="text-[11px] text-muted-foreground space-y-0.5 mb-4">
                                {curr.city && <p className="truncate flex items-center gap-1"><MapPin className="w-3 h-3 text-muted-foreground/70 shrink-0" /> {curr.city}</p>}
                                {curr.email && <p className="truncate flex items-center gap-1"><Mail className="w-3 h-3 text-muted-foreground/70 shrink-0" /> {curr.email}</p>}
                              </div>
                            )}

                            {/* Ações — sempre visíveis no mobile, hover no desktop */}
                            <div className="flex items-center gap-2 pt-3 border-t border-border/70
                                            sm:opacity-0 sm:translate-y-1
                                            sm:group-hover:opacity-100 sm:group-hover:translate-y-0
                                            transition-all duration-200">
                              <Button
                                size="sm"
                                onClick={() => setPreviewModalCurriculum(curr)}
                                className="gap-1.5 font-bold text-xs flex-1 rounded-[5px] bg-[#0f172a] text-white hover:bg-slate-800 shadow-sm h-8"
                              >
                                <Eye className="w-3.5 h-3.5" /> Visualizar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => { setData(curr); setMode('editor'); }}
                                className="gap-1.5 font-bold text-xs rounded-[5px] border-border hover:bg-muted h-8"
                              >
                                <Edit3 className="w-3.5 h-3.5" /> Editar
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  if (window.confirm(`Excluir o currículo "${curr.profession || 'selecionado'}"?`)) {
                                    deleteMutation.mutate(curr);
                                  }
                                }}
                                className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 rounded-[5px] shrink-0"
                                title="Excluir"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal de Pré-visualização */}
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
