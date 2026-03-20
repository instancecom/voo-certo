import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  User, Briefcase, GraduationCap, Award, Plus, Trash2,
  Download, Save, Loader2, Lock, FileText, Sparkles, Layout
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePlan } from '@/hooks/usePlan';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface Experience {
  company: string;
  role: string;
  start: string;
  end: string;
  description: string;
}

interface Education {
  institution: string;
  degree: string;
  year: string;
}

interface Certificate {
  name: string;
  issuer: string;
  year: string;
}

interface Language {
  name: string;
  level: string;
}

interface CurriculumData {
  full_name: string;
  email: string;
  phone: string;
  city: string;
  profession: string;
  summary: string;
  experience: Experience[];
  education: Education[];
  certificates: Certificate[];
  languages: Language[];
  skills: string[];
  photo_url: string;
  template: string;
}

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
  photo_url: '',
  template: 'classico',
};

const TEMPLATES = [
  { id: 'classico', name: 'Clássico', icon: FileText, desc: 'Clean e cronológico' },
  { id: 'moderno', name: 'Moderno', icon: Sparkles, desc: 'Destaque em habilidades' },
  { id: 'criativo', name: 'Criativo', icon: Layout, desc: 'Layout assimétrico' },
];

export default function CurriculumPage() {
  const { user } = useAuth();
  const { canSaveCurriculum } = usePlan();
  const queryClient = useQueryClient();
  const [data, setData] = useState<CurriculumData>(EMPTY_DATA);
  const [newSkill, setNewSkill] = useState('');
  const [activeTab, setActiveTab] = useState('dados');
  const [isGenerating, setIsGenerating] = useState(false);
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const previewRef = useRef<HTMLDivElement>(null);

  const { isLoading: loadingSaved } = useQuery({
    queryKey: ['curriculum', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data: saved } = await supabase
        .from('curriculum_data')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (saved) {
        setData({
          full_name: saved.full_name || '',
          email: saved.email || '',
          phone: saved.phone || '',
          city: saved.city || '',
          profession: saved.profession || '',
          summary: saved.summary || '',
          experience: (saved.experience as unknown as Experience[]) || [],
          education: (saved.education as unknown as Education[]) || [],
          certificates: (saved.certificates as unknown as Certificate[]) || [],
          languages: (saved.languages as unknown as Language[]) || [],
          skills: saved.skills || [],
          photo_url: saved.photo_url || '',
          template: saved.template || 'classico',
        });
      }
      return saved;
    },
    enabled: !!user,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const payload = {
        user_id: user.id,
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        city: data.city,
        profession: data.profession,
        summary: data.summary,
        experience: data.experience as unknown as Record<string, unknown>[],
        education: data.education as unknown as Record<string, unknown>[],
        certificates: data.certificates as unknown as Record<string, unknown>[],
        languages: data.languages as unknown as Record<string, unknown>[],
        skills: data.skills,
        photo_url: data.photo_url,
        template: data.template,
      };
      const { error } = await (supabase.from('curriculum_data') as any).upsert(payload, { onConflict: 'user_id' });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Currículo salvo! Acesse seu perfil para baixar.');
      queryClient.invalidateQueries({ queryKey: ['curriculum'] });
    },
    onError: () => toast.error('Erro ao salvar currículo'),
  });

  const addExperience = () => setData(p => ({ ...p, experience: [...p.experience, { company: '', role: '', start: '', end: '', description: '' }] }));
  const updateExperience = (i: number, field: keyof Experience, value: string) => setData(p => ({ ...p, experience: p.experience.map((e, idx) => idx === i ? { ...e, [field]: value } : e) }));
  const removeExperience = (i: number) => setData(p => ({ ...p, experience: p.experience.filter((_, idx) => idx !== i) }));
  const addCertificate = () => setData(p => ({ ...p, certificates: [...p.certificates, { name: '', issuer: '', year: '' }] }));
  const addLanguage = () => setData(p => ({ ...p, languages: [...p.languages, { name: '', level: 'Básico' }] }));
  const addSkill = () => {
    if (newSkill.trim() && !data.skills.includes(newSkill.trim())) {
      setData(p => ({ ...p, skills: [...p.skills, newSkill.trim()] }));
      setNewSkill('');
    }
  };

  const downloadPDF = async () => {
    setIsGenerating(true);
    try {
      const { default: jsPDF } = await import('jspdf');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const w = pdf.internal.pageSize.getWidth();
      let y = 0;

      const template = data.template || 'classico';

      // Color schemes per template
      const colors = {
        classico: { primary: [30, 58, 95] as [number, number, number], accent: [100, 116, 139] as [number, number, number], bg: [245, 247, 250] as [number, number, number] },
        moderno: { primary: [37, 99, 235] as [number, number, number], accent: [217, 119, 6] as [number, number, number], bg: [239, 246, 255] as [number, number, number] },
        criativo: { primary: [124, 58, 237] as [number, number, number], accent: [236, 72, 153] as [number, number, number], bg: [250, 245, 255] as [number, number, number] },
      };
      const c = colors[template as keyof typeof colors] || colors.classico;

      // === HEADER ===
      if (template === 'criativo') {
        // Asymmetric header
        pdf.setFillColor(...c.primary);
        pdf.rect(0, 0, w * 0.65, 45, 'F');
        pdf.setFillColor(...c.accent);
        pdf.rect(w * 0.65, 0, w * 0.35, 45, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        pdf.text(data.full_name || 'Seu Nome', 15, 18);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        pdf.text(data.profession || 'Cargo desejado', 15, 26);
        pdf.setFontSize(8);
        const contactR = [data.email, data.phone, data.city].filter(Boolean);
        contactR.forEach((c, i) => pdf.text(c, w * 0.65 + 5, 15 + i * 5));
        y = 52;
      } else if (template === 'moderno') {
        pdf.setFillColor(...c.primary);
        pdf.rect(0, 0, w, 40, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(22);
        pdf.setFont('helvetica', 'bold');
        pdf.text(data.full_name || 'Seu Nome', w / 2, 16, { align: 'center' });
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        pdf.text(data.profession || 'Cargo desejado', w / 2, 24, { align: 'center' });
        pdf.setFontSize(8);
        pdf.text([data.email, data.phone, data.city].filter(Boolean).join('  •  '), w / 2, 32, { align: 'center' });
        y = 48;
      } else {
        // Clássico
        pdf.setFillColor(...c.primary);
        pdf.rect(0, 0, w, 38, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        pdf.text(data.full_name || 'Seu Nome', 15, 16);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(data.profession || 'Cargo desejado', 15, 24);
        pdf.setFontSize(8);
        pdf.text([data.email, data.phone, data.city].filter(Boolean).join('  •  '), 15, 32);
        y = 45;
      }

      pdf.setTextColor(30, 30, 30);

      const addSection = (title: string) => {
        if (y > 270) { pdf.addPage(); y = 15; }
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...c.primary);
        pdf.text(title.toUpperCase(), 15, y);
        y += 2;
        pdf.setDrawColor(...c.primary);
        pdf.setLineWidth(0.5);
        pdf.line(15, y, w - 15, y);
        y += 6;
        pdf.setTextColor(50, 50, 50);
      };

      const checkPage = (need: number) => {
        if (y + need > 280) { pdf.addPage(); y = 15; }
      };

      // Summary
      if (data.summary) {
        addSection('Resumo Profissional');
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        const lines = pdf.splitTextToSize(data.summary, w - 30);
        checkPage(lines.length * 4);
        pdf.text(lines, 15, y);
        y += lines.length * 4 + 6;
      }

      // Experience
      if (data.experience.length > 0) {
        addSection('Experiência Profissional');
        data.experience.forEach(exp => {
          checkPage(20);
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'bold');
          pdf.text(exp.role || 'Cargo', 15, y);
          y += 4;
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(100, 100, 100);
          pdf.text(`${exp.company} • ${exp.start} – ${exp.end || 'Atual'}`, 15, y);
          y += 4;
          pdf.setTextColor(50, 50, 50);
          if (exp.description) {
            const dl = pdf.splitTextToSize(exp.description, w - 30);
            checkPage(dl.length * 4);
            pdf.text(dl, 15, y);
            y += dl.length * 4;
          }
          y += 4;
        });
      }

      // Education
      if (data.education.length > 0) {
        addSection('Formação Acadêmica');
        data.education.forEach(edu => {
          checkPage(10);
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'bold');
          pdf.text(edu.degree || 'Curso', 15, y);
          y += 4;
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'normal');
          pdf.text(`${edu.institution} • ${edu.year}`, 15, y);
          y += 6;
        });
      }

      // Certificates
      if (data.certificates.length > 0) {
        addSection('Certificados');
        data.certificates.forEach(cert => {
          checkPage(6);
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'normal');
          pdf.text(`• ${cert.name}${cert.issuer ? ` – ${cert.issuer}` : ''}${cert.year ? ` (${cert.year})` : ''}`, 15, y);
          y += 5;
        });
        y += 3;
      }

      // Skills
      if (data.skills.length > 0) {
        addSection('Competências');
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        if (template === 'moderno') {
          // Pill-style for moderno
          let xPos = 15;
          data.skills.forEach(skill => {
            const sw = pdf.getTextWidth(skill) + 8;
            if (xPos + sw > w - 15) { y += 7; xPos = 15; }
            checkPage(8);
            pdf.setFillColor(...c.bg);
            pdf.roundedRect(xPos, y - 3.5, sw, 6, 2, 2, 'F');
            pdf.setTextColor(...c.primary);
            pdf.text(skill, xPos + 4, y);
            pdf.setTextColor(50, 50, 50);
            xPos += sw + 3;
          });
          y += 10;
        } else {
          const skillText = data.skills.join('  •  ');
          const sl = pdf.splitTextToSize(skillText, w - 30);
          checkPage(sl.length * 4);
          pdf.text(sl, 15, y);
          y += sl.length * 4 + 4;
        }
      }

      // Languages
      if (data.languages.length > 0) {
        addSection('Idiomas');
        data.languages.forEach(l => {
          checkPage(6);
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'normal');
          pdf.text(`• ${l.name} – ${l.level}`, 15, y);
          y += 5;
        });
      }

      // Footer
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(7);
        pdf.setTextColor(180, 180, 180);
        pdf.text('Gerado pelo Voo Certo • voocerto.com.br', w / 2, 290, { align: 'center' });
      }

      pdf.save(`curriculo-${data.full_name?.replace(/\s+/g, '-').toLowerCase() || 'voocerto'}.pdf`);
      toast.success('PDF gerado com sucesso!');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao gerar PDF.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-12 flex items-center justify-center">
          <div className="text-center p-8 rounded-2xl bg-card border border-border max-w-md">
            <Lock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Acesso Restrito</h2>
            <p className="text-muted-foreground mb-6">Faça login para criar seu currículo profissional.</p>
            <Button asChild><Link to="/auth">Fazer Login</Link></Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const selectedTemplate = TEMPLATES.find(t => t.id === data.template) || TEMPLATES[0];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="mb-8 text-center lg:text-left"
          >
            <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground mb-2 tracking-tight">
              Construtor de Currículo
            </h1>
            <p className="text-muted-foreground text-sm max-w-2xl mx-auto lg:mx-0">
              Crie seu currículo profissional de forma rápida. Salve seus dados com segurança e baixe o PDF pronto para o mercado.
            </p>
          </motion.div>

          {/* Template Selector */}
          <div className="mb-8">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 px-1">
              Escolha seu Modelo
            </h2>
            <div className="flex overflow-x-auto pb-4 gap-4 lg:grid lg:grid-cols-3 lg:overflow-x-visible lg:pb-0 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
              {TEMPLATES.map(t => {
                const Icon = t.icon;
                const active = data.template === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setData(p => ({ ...p, template: t.id }))}
                    className={`relative flex-shrink-0 w-[160px] lg:w-full p-5 rounded-2xl border-2 transition-all text-left group ${
                      active
                        ? 'border-accent bg-accent/5 shadow-xl shadow-accent/10'
                        : 'border-border bg-card hover:border-muted-foreground/30'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                      active ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground group-hover:bg-muted/80'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-foreground mb-1">{t.name}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{t.desc}</p>
                    {active && (
                      <motion.div 
                        layoutId="activeTemplate"
                        className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-accent shadow-[0_0_10px_rgba(245,158,11,0.5)]" 
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action buttons - Improved for mobile */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="flex-1 flex gap-3">
              <Button size="sm" variant={mode === 'edit' ? 'default' : 'outline'} onClick={() => setMode('edit')} className="flex-1 lg:hidden rounded-xl h-12 font-bold">
                Editar Dados
              </Button>
              <Button size="sm" variant={mode === 'preview' ? 'default' : 'outline'} onClick={() => setMode('preview')} className="flex-1 lg:hidden rounded-xl h-12 font-bold">
                Preview PDF
              </Button>
            </div>
            
            <div className="flex gap-3">
              {canSaveCurriculum ? (
                <Button 
                  onClick={() => saveMutation.mutate()} 
                  disabled={saveMutation.isPending} 
                  variant="outline"
                  className="flex-1 sm:flex-none h-12 px-6 rounded-xl font-bold border-2"
                >
                  {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Salvar
                </Button>
              ) : (
                <Button variant="outline" disabled className="flex-1 sm:flex-none h-12 opacity-60 rounded-xl px-4 border-2">
                  <Lock className="w-4 h-4 mr-2" />
                  Salvar Pro
                </Button>
              )}
              <Button 
                onClick={downloadPDF} 
                disabled={isGenerating} 
                variant="accent"
                className="flex-1 sm:flex-none h-12 px-8 rounded-xl font-extrabold shadow-lg shadow-accent/20"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                Baixar PDF
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Editor */}
            <div className={mode === 'preview' ? 'hidden lg:block' : ''}>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-card rounded-2xl border-2 p-2 sm:p-4 shadow-sm">
                <TabsList className="grid grid-cols-4 mb-8 bg-muted/50 p-1.5 h-14 rounded-xl">
                  <TabsTrigger value="dados" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-accent data-[state=active]:shadow-sm"><User className="w-5 h-5 md:mr-2" /><span className="hidden md:inline">Dados</span></TabsTrigger>
                  <TabsTrigger value="experiencia" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-accent data-[state=active]:shadow-sm"><Briefcase className="w-5 h-5 md:mr-2" /><span className="hidden md:inline">Carreira</span></TabsTrigger>
                  <TabsTrigger value="formacao" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-accent data-[state=active]:shadow-sm"><GraduationCap className="w-5 h-5 md:mr-2" /><span className="hidden md:inline">Educação</span></TabsTrigger>
                  <TabsTrigger value="extras" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-accent data-[state=active]:shadow-sm"><Award className="w-5 h-5 md:mr-2" /><span className="hidden md:inline">Extras</span></TabsTrigger>
                </TabsList>
                
                <TabsContent value="dados" className="mt-0 space-y-6">
                  <div className="px-1">
                    <h3 className="text-xl font-bold text-foreground mb-1">Dados Pessoais</h3>
                    <p className="text-sm text-muted-foreground mb-6">Suas informações de contato básicas.</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label className="text-sm font-bold ml-1">Nome Completo</Label>
                        <Input 
                          value={data.full_name} 
                          onChange={e => setData(p => ({ ...p, full_name: e.target.value }))} 
                          placeholder="Ex: João Silva" 
                          className="h-12 rounded-xl bg-muted/30 border-2 focus-visible:border-accent"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-bold ml-1">Cargo Desejado</Label>
                        <Input 
                          value={data.profession} 
                          onChange={e => setData(p => ({ ...p, profession: e.target.value }))} 
                          placeholder="Ex: Comissário de Voo" 
                          className="h-12 rounded-xl bg-muted/30 border-2 focus-visible:border-accent"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-bold ml-1">E-mail de Contato</Label>
                        <Input 
                          value={data.email} 
                          onChange={e => setData(p => ({ ...p, email: e.target.value }))} 
                          placeholder="seu@email.com" 
                          className="h-12 rounded-xl bg-muted/30 border-2 focus-visible:border-accent"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-bold ml-1">Telefone / WhatsApp</Label>
                        <Input 
                          value={data.phone} 
                          onChange={e => setData(p => ({ ...p, phone: e.target.value }))} 
                          placeholder="(11) 99999-9999" 
                          className="h-12 rounded-xl bg-muted/30 border-2 focus-visible:border-accent"
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label className="text-sm font-bold ml-1">Cidade e Estado</Label>
                        <Input 
                          value={data.city} 
                          onChange={e => setData(p => ({ ...p, city: e.target.value }))} 
                          placeholder="São Paulo, SP" 
                          className="h-12 rounded-xl bg-muted/30 border-2 focus-visible:border-accent"
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label className="text-sm font-bold ml-1">Objetivo Profissional</Label>
                        <Textarea 
                          value={data.summary} 
                          onChange={e => setData(p => ({ ...p, summary: e.target.value }))} 
                          placeholder="Conte resumidamente sobre sua carreira e objetivos..." 
                          rows={5} 
                          className="rounded-xl bg-muted/30 border-2 focus-visible:border-accent resize-none p-4"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="experiencia" className="mt-0 space-y-6">
                  <div className="px-1">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-foreground mb-1">Experiência Profissional</h3>
                        <p className="text-sm text-muted-foreground">Adicione suas passagens por empresas.</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={addExperience} className="rounded-xl border-accent text-accent hover:bg-accent hover:text-white transition-all h-10 shadow-sm">
                        <Plus className="w-4 h-4 mr-2" /> <span className="hidden sm:inline">Adicionar</span>
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {data.experience.length === 0 && (
                        <div className="text-center py-10 bg-muted/20 rounded-2xl border-2 border-dashed border-border">
                          <Briefcase className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-20" />
                          <p className="text-muted-foreground text-sm">Nenhuma experiência adicionada.</p>
                        </div>
                      )}
                      
                      {data.experience.map((exp, i) => (
                        <Card key={i} className="rounded-2xl border-2 overflow-hidden hover:border-accent/30 transition-colors bg-card shadow-sm">
                          <CardContent className="p-4 sm:p-6 space-y-4">
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                                  <Briefcase className="w-4 h-4 text-accent" />
                                </div>
                                <span className="font-bold text-sm text-foreground">Experiência {i + 1}</span>
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => removeExperience(i)} className="rounded-lg h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <Label className="text-[11px] font-bold uppercase text-muted-foreground ml-1">Empresa</Label>
                                <Input 
                                  placeholder="Ex: Companhia Aérea X" 
                                  value={exp.company} 
                                  onChange={e => updateExperience(i, 'company', e.target.value)} 
                                  className="h-11 rounded-xl bg-muted/20 border-border focus-visible:border-accent"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <Label className="text-[11px] font-bold uppercase text-muted-foreground ml-1">Cargo</Label>
                                <Input 
                                  placeholder="Ex: Comissário" 
                                  value={exp.role} 
                                  onChange={e => updateExperience(i, 'role', e.target.value)} 
                                  className="h-11 rounded-xl bg-muted/20 border-border focus-visible:border-accent"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <Label className="text-[11px] font-bold uppercase text-muted-foreground ml-1">Data Início</Label>
                                <Input 
                                  placeholder="MM/AAAA" 
                                  value={exp.start} 
                                  onChange={e => updateExperience(i, 'start', e.target.value)} 
                                  className="h-11 rounded-xl bg-muted/20 border-border focus-visible:border-accent"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <Label className="text-[11px] font-bold uppercase text-muted-foreground ml-1">Data Fim</Label>
                                <Input 
                                  placeholder="MM/AAAA ou Atual" 
                                  value={exp.end} 
                                  onChange={e => updateExperience(i, 'end', e.target.value)} 
                                  className="h-11 rounded-xl bg-muted/20 border-border focus-visible:border-accent"
                                />
                              </div>
                              <div className="space-y-1.5 sm:col-span-2">
                                <Label className="text-[11px] font-bold uppercase text-muted-foreground ml-1">Descrição</Label>
                                <Textarea 
                                  placeholder="Descreva suas principais responsabilidades..." 
                                  rows={3} 
                                  value={exp.description} 
                                  onChange={e => updateExperience(i, 'description', e.target.value)} 
                                  className="rounded-xl bg-muted/20 border-border focus-visible:border-accent resize-none"
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="formacao" className="mt-0 space-y-6">
                  <div className="px-1">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-foreground mb-1">Formação Acadêmica</h3>
                        <p className="text-sm text-muted-foreground">Seu histórico educacional.</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setData(p => ({ ...p, education: [...p.education, { institution: '', degree: '', year: '' }] }))} className="rounded-xl border-accent text-accent hover:bg-accent hover:text-white h-10 shadow-sm">
                        <Plus className="w-4 h-4 mr-2" /> <span className="hidden sm:inline">Adicionar</span>
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {data.education.length === 0 && (
                        <div className="text-center py-10 bg-muted/20 rounded-2xl border-2 border-dashed border-border">
                          <GraduationCap className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-20" />
                          <p className="text-muted-foreground text-sm">Nenhuma formação adicionada.</p>
                        </div>
                      )}

                      {data.education.map((edu, i) => (
                        <Card key={i} className="rounded-2xl border-2 hover:border-accent/30 transition-colors bg-card shadow-sm">
                          <CardContent className="p-4 sm:p-6 space-y-4">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                                  <GraduationCap className="w-4 h-4 text-accent" />
                                </div>
                                <span className="font-bold text-sm text-foreground">Formação {i + 1}</span>
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => setData(p => ({ ...p, education: p.education.filter((_, idx) => idx !== i) }))} className="rounded-lg h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1.5 sm:col-span-2">
                                <Label className="text-[11px] font-bold uppercase text-muted-foreground ml-1">Instituição</Label>
                                <Input 
                                  placeholder="Ex: Universidade de São Paulo" 
                                  value={edu.institution} 
                                  onChange={e => setData(p => ({ ...p, education: p.education.map((ed, idx) => idx === i ? { ...ed, institution: e.target.value } : ed) }))} 
                                  className="h-11 rounded-xl bg-muted/20 border-border focus-visible:border-accent"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <Label className="text-[11px] font-bold uppercase text-muted-foreground ml-1">Curso / Grau</Label>
                                <Input 
                                  placeholder="Ex: Bacharelado em Aviação" 
                                  value={edu.degree} 
                                  onChange={e => setData(p => ({ ...p, education: p.education.map((ed, idx) => idx === i ? { ...ed, degree: e.target.value } : ed) }))} 
                                  className="h-11 rounded-xl bg-muted/20 border-border focus-visible:border-accent"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <Label className="text-[11px] font-bold uppercase text-muted-foreground ml-1">Ano Conclusão</Label>
                                <Input 
                                  placeholder="Ex: 2023" 
                                  value={edu.year} 
                                  onChange={e => setData(p => ({ ...p, education: p.education.map((ed, idx) => idx === i ? { ...ed, year: e.target.value } : ed) }))} 
                                  className="h-11 rounded-xl bg-muted/20 border-border focus-visible:border-accent"
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="extras" className="space-y-4">
                  <Card>
                    <CardHeader><CardTitle className="text-sm">Certificados</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      {data.certificates.map((cert, i) => (
                        <div key={i} className="flex gap-2 items-center">
                          <Input placeholder="Certificado" value={cert.name} onChange={e => setData(p => ({ ...p, certificates: p.certificates.map((c, idx) => idx === i ? { ...c, name: e.target.value } : c) }))} className="flex-1" />
                          <Input placeholder="Emissor" value={cert.issuer} onChange={e => setData(p => ({ ...p, certificates: p.certificates.map((c, idx) => idx === i ? { ...c, issuer: e.target.value } : c) }))} className="flex-1" />
                          <Input placeholder="Ano" className="w-20" value={cert.year} onChange={e => setData(p => ({ ...p, certificates: p.certificates.map((c, idx) => idx === i ? { ...c, year: e.target.value } : c) }))} />
                          <Button variant="ghost" size="sm" onClick={() => setData(p => ({ ...p, certificates: p.certificates.filter((_, idx) => idx !== i) }))}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" onClick={addCertificate}><Plus className="w-4 h-4 mr-2" /> Adicionar</Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader><CardTitle className="text-sm">Idiomas</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      {data.languages.map((lang, i) => (
                        <div key={i} className="flex gap-2 items-center">
                          <Input placeholder="Idioma" value={lang.name} onChange={e => setData(p => ({ ...p, languages: p.languages.map((l, idx) => idx === i ? { ...l, name: e.target.value } : l) }))} />
                          <Select value={lang.level} onValueChange={v => setData(p => ({ ...p, languages: p.languages.map((l, idx) => idx === i ? { ...l, level: v } : l) }))}>
                            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {['Básico', 'Intermediário', 'Avançado', 'Fluente', 'Nativo'].map(lv => <SelectItem key={lv} value={lv}>{lv}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <Button variant="ghost" size="sm" onClick={() => setData(p => ({ ...p, languages: p.languages.filter((_, idx) => idx !== i) }))}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" onClick={addLanguage}><Plus className="w-4 h-4 mr-2" /> Adicionar</Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader><CardTitle className="text-sm">Competências</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex gap-2">
                        <Input placeholder="Ex: Liderança, Excel, Gestão..." value={newSkill} onChange={e => setNewSkill(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSkill()} />
                        <Button variant="outline" onClick={addSkill}><Plus className="w-4 h-4" /></Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {data.skills.map((skill, i) => (
                          <Badge key={i} variant="secondary" className="cursor-pointer" onClick={() => setData(p => ({ ...p, skills: p.skills.filter((_, idx) => idx !== i) }))}>
                            {skill} ✕
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Preview */}
            <div className={mode === 'edit' ? 'hidden lg:block' : ''}>
              <div className="sticky top-24 space-y-4">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">Visualização Real</h3>
                  </div>
                  <Badge variant="outline" className="bg-accent/5 text-accent border-accent/20 px-3 py-1 rounded-full text-[10px] font-bold">
                    Modelo: {selectedTemplate.name}
                  </Badge>
                </div>
                
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-b from-accent/20 to-transparent rounded-[2rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                  <div className="relative">
                    <CurriculumPreview data={data} />
                  </div>
                </div>

                <p className="text-center text-[10px] text-muted-foreground italic">
                  * Este é um preview simplificado. O PDF final terá formatação profissional.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

/* ===== Preview Component ===== */
function CurriculumPreview({ data }: { data: CurriculumData }) {
  const t = data.template || 'classico';

  const headerStyles: Record<string, { bg: string; accent: string }> = {
    classico: { bg: '#1e3a5f', accent: '#64748b' },
    moderno: { bg: '#2563eb', accent: '#d97706' },
    criativo: { bg: '#7c3aed', accent: '#ec4899' },
  };
  const style = headerStyles[t] || headerStyles.classico;

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-xl text-[#1e293b]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 11 }}>
      {/* Header */}
      {t === 'criativo' ? (
        <div className="flex">
          <div style={{ background: style.bg, flex: '0 0 65%', padding: '1.5rem', color: 'white' }}>
            <p style={{ fontSize: 18, fontWeight: 700 }}>{data.full_name || 'Seu Nome'}</p>
            <p style={{ fontSize: 11, opacity: 0.85 }}>{data.profession || 'Cargo desejado'}</p>
          </div>
          <div style={{ background: style.accent, flex: '0 0 35%', padding: '1.5rem', color: 'white', fontSize: 9 }}>
            {data.email && <p>{data.email}</p>}
            {data.phone && <p>{data.phone}</p>}
            {data.city && <p>{data.city}</p>}
          </div>
        </div>
      ) : (
        <div style={{ background: style.bg, color: 'white', padding: '1.5rem', textAlign: t === 'moderno' ? 'center' : 'left' }}>
          <p style={{ fontSize: 18, fontWeight: 700 }}>{data.full_name || 'Seu Nome'}</p>
          <p style={{ fontSize: 11, opacity: 0.85 }}>{data.profession || 'Cargo desejado'}</p>
          <p style={{ fontSize: 9, opacity: 0.6, marginTop: 4 }}>{[data.email, data.phone, data.city].filter(Boolean).join('  •  ')}</p>
        </div>
      )}

      <div style={{ padding: '1rem 1.5rem' }}>
        {data.summary && (
          <div style={{ marginBottom: 12 }}>
            <SectionTitle label="Resumo" color={style.bg} />
            <p style={{ fontSize: 10, lineHeight: 1.6 }}>{data.summary}</p>
          </div>
        )}

        {data.experience.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <SectionTitle label="Experiência" color={style.bg} />
            {data.experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <p style={{ fontWeight: 600, fontSize: 11 }}>{exp.role || 'Cargo'}</p>
                <p style={{ fontSize: 9, color: '#64748b' }}>{exp.company} • {exp.start} – {exp.end || 'Atual'}</p>
                {exp.description && <p style={{ fontSize: 9, color: '#475569' }}>{exp.description}</p>}
              </div>
            ))}
          </div>
        )}

        {data.education.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <SectionTitle label="Formação" color={style.bg} />
            {data.education.map((edu, i) => (
              <p key={i} style={{ fontSize: 10 }}>{edu.degree} — {edu.institution} ({edu.year})</p>
            ))}
          </div>
        )}

        {data.skills.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <SectionTitle label="Competências" color={style.bg} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {data.skills.map((s, i) => (
                <span key={i} style={{ background: `${style.bg}15`, color: style.bg, borderRadius: 10, padding: '2px 8px', fontSize: 9, fontWeight: 500 }}>{s}</span>
              ))}
            </div>
          </div>
        )}

        {data.languages.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <SectionTitle label="Idiomas" color={style.bg} />
            {data.languages.map((l, i) => <p key={i} style={{ fontSize: 10 }}>• {l.name} – {l.level}</p>)}
          </div>
        )}

        {data.certificates.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <SectionTitle label="Certificados" color={style.bg} />
            {data.certificates.map((c, i) => <p key={i} style={{ fontSize: 10 }}>• {c.name}{c.issuer ? ` – ${c.issuer}` : ''}{c.year ? ` (${c.year})` : ''}</p>)}
          </div>
        )}
      </div>

      <div style={{ background: style.bg, color: 'rgba(255,255,255,0.4)', padding: '6px 16px', fontSize: 8, textAlign: 'center' }}>
        Gerado pelo Voo Certo
      </div>
    </div>
  );
}

function SectionTitle({ label, color }: { label: string; color: string }) {
  return (
    <p style={{ fontSize: 11, fontWeight: 700, color, borderBottom: `2px solid ${color}`, paddingBottom: 2, marginBottom: 6 }}>
      {label.toUpperCase()}
    </p>
  );
}
