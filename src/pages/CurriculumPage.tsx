import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  User, Briefcase, GraduationCap, Award, Plus, Trash2,
  Download, Save, Loader2, Lock, FileText, Sparkles, Layout, Globe, Star, ArrowRight, Shield
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
import { CurriculumPreview } from '@/components/curriculum/CurriculumPreview';

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
  { id: 'elite', name: 'Elite', icon: Shield, desc: 'Alta performance (Navy)' },
  { id: 'executivo', name: 'Executivo', icon: Briefcase, desc: 'Minimalista e sério' },
  { id: 'moderno', name: 'Skyline', icon: Sparkles, desc: 'Moderno e dinâmico' },
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
          template: saved.template || 'elite',
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
      toast.success('Currículo salvo com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['curriculum'] });
    },
    onError: () => toast.error('Erro ao salvar currículo.'),
  });

  // Handlers
  const addExperience = () => setData(p => ({ ...p, experience: [...p.experience, { company: '', role: '', start: '', end: '', description: '' }] }));
  const updateExperience = (i: number, field: keyof Experience, value: string) => setData(p => ({ ...p, experience: p.experience.map((e, idx) => idx === i ? { ...e, [field]: value } : e) }));
  const removeExperience = (i: number) => setData(p => ({ ...p, experience: p.experience.filter((_, idx) => idx !== i) }));
  
  const addEducation = () => setData(p => ({ ...p, education: [...p.education, { institution: '', degree: '', year: '' }] }));
  const updateEducation = (i: number, field: keyof Education, value: string) => setData(p => ({ ...p, education: p.education.map((e, idx) => idx === i ? { ...e, [field]: value } : e) }));
  
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
      const h = pdf.internal.pageSize.getHeight();
      let y = 0;

      const template = data.template || 'elite';
      const isElite = template === 'elite';
      const isExecutivo = template === 'executivo';
      const isModerno = template === 'moderno';

      const colors = {
        elite: { p: [26, 35, 58] as [number, number, number], light: [248, 250, 252] as [number, number, number] },
        executivo: { p: [15, 23, 42] as [number, number, number], light: [255, 255, 255] as [number, number, number] },
        moderno: { p: [37, 99, 235] as [number, number, number], light: [248, 250, 252] as [number, number, number] },
      };
      const c = colors[template as keyof typeof colors] || colors.elite;

      // Header
      if (isElite) {
        pdf.setFillColor(...c.p);
        pdf.rect(0, 0, w, 50, 'F');
        pdf.setTextColor(255, 255, 255);
      } else if (isExecutivo) {
        pdf.setTextColor(...c.p);
      } else {
        pdf.setFillColor(248, 250, 252);
        pdf.rect(0, 0, w, 50, 'F');
        pdf.setDrawColor(226, 232, 240);
        pdf.line(0, 50, w, 50);
        pdf.setTextColor(...c.p);
      }

      // Name & Profession
      pdf.setFont('helvetica', 'bold');
      
      // Dynamic Font Size for Name
      const name = data.full_name.toUpperCase();
      let nameFontSize = 24;
      if (name.length > 20) nameFontSize = 20;
      if (name.length > 30) nameFontSize = 16;
      if (name.length > 40) nameFontSize = 14;
      
      pdf.setFontSize(nameFontSize);
      
      if (isExecutivo) {
        pdf.text(name, w / 2, 25, { align: 'center' });
        pdf.setFontSize(10);
        pdf.setTextColor(100);
        pdf.text(data.profession.toUpperCase(), w / 2, 33, { align: 'center' });
      } else {
        pdf.text(name, 15, 25);
        pdf.setFontSize(10);
        pdf.setTextColor(isElite ? 150 : c.p[0], isElite ? 150 : c.p[1], isElite ? 150 : c.p[2]);
        pdf.text(data.profession.toUpperCase(), 15, 33);
      }

      // Contact Info
      pdf.setFontSize(8);
      pdf.setTextColor(isElite ? 200 : 120);
      const contactStr = [data.email, data.phone, data.city].filter(Boolean).join('  |  ');
      if (isExecutivo) pdf.text(contactStr, w / 2, 42, { align: 'center' });
      else pdf.text(contactStr, 15, 42);

      // Reset text color for body
      pdf.setTextColor(30, 41, 59);
      y = 65;

      // Layout structure
      const hasSidebar = isElite || isModerno;
      const contentW = hasSidebar ? w * 0.58 : w - 30;
      const sidebarX = isElite ? 15 : w * 0.65;
      const mainX = isElite ? w * 0.38 : 15;
      const sidebarW = w * 0.28;

      if (isElite) {
         pdf.setFillColor(248, 250, 252);
         pdf.rect(0, 50, w * 0.35, h - 50, 'F');
         pdf.setDrawColor(241, 245, 249);
         pdf.line(w * 0.35, 50, w * 0.35, h);
      } else if (isModerno) {
         pdf.setDrawColor(241, 245, 249);
         pdf.line(w * 0.62, 50, w * 0.62, h);
      }

      const sectionTitle = (title: string, xPos: number, width: number) => {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...c.p);
        pdf.text(title.toUpperCase(), xPos, y);
        y += 2;
        pdf.setDrawColor(241, 245, 249);
        pdf.line(xPos, y, xPos + width, y);
        y += 8;
        pdf.setTextColor(40, 40, 40);
      };

      const checkPage = (added: number) => {
        if (y + added > 280) { 
           pdf.addPage(); 
           y = 20; 
           if (isElite) {
             pdf.setFillColor(248, 250, 252);
             pdf.rect(0, 0, w * 0.35, h, 'F');
             pdf.setDrawColor(241, 245, 249);
             pdf.line(w * 0.35, 0, w * 0.35, h);
           }
        }
      };

      // Helper for Sidebar content
      const drawSidebar = () => {
        const savedY = y;
        y = 65;
        const x = sidebarX;
        const width = sidebarW;

        if (data.skills.length > 0) {
          sectionTitle('Competências', x, width);
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(8);
          data.skills.forEach(s => {
            pdf.text(`• ${s}`, x, y);
            y += 5;
          });
          y += 10;
        }

        if (data.languages.length > 0) {
          sectionTitle('Idiomas', x, width);
          data.languages.forEach(l => {
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(8);
            pdf.text(l.name.toUpperCase(), x, y);
            pdf.setFont('helvetica', 'normal');
            pdf.text(l.level, x + width, y, { align: 'right' });
            y += 6;
          });
          y += 10;
        }

        if (data.certificates.length > 0) {
          sectionTitle('Certificações', x, width);
          data.certificates.forEach(cert => {
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(8);
            pdf.text(cert.name, x, y);
            y += 4;
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(7);
            pdf.setTextColor(120);
            pdf.text(`${cert.issuer} (${cert.year})`, x, y);
            y += 8;
            pdf.setTextColor(40, 40, 40);
          });
        }
        
        return y;
      };

      // Draw Sidebar if needed
      let sidebarEndY = 0;
      if (hasSidebar) sidebarEndY = drawSidebar();

      // Main Content
      y = 65;
      const mainContentX = mainX;
      const mainContentW = contentW;

      if (data.summary) {
        sectionTitle('Perfil Profissional', mainContentX, mainContentW);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        const lines = pdf.splitTextToSize(data.summary, mainContentW);
        pdf.text(lines, mainContentX, y);
        y += (lines.length * 4.5) + 12;
      }

      if (data.experience.length > 0) {
        sectionTitle('Trajetória Profissional', mainContentX, mainContentW);
        data.experience.forEach(exp => {
          checkPage(30);
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(10);
          pdf.text(exp.role.toUpperCase(), mainContentX, y);
          pdf.setFontSize(8);
          pdf.setTextColor(...c.p);
          pdf.text(`${exp.company.toUpperCase()} | ${exp.start} - ${exp.end || 'Atual'}`, mainContentX, y + 5);
          y += 10;
          if (exp.description) {
            pdf.setTextColor(80);
            pdf.setFont('helvetica', 'normal');
            const descLines = pdf.splitTextToSize(exp.description, mainContentW - 2);
            pdf.text(descLines, mainContentX, y);
            y += (descLines.length * 4.2) + 6;
          }
        });
        y += 8;
      }

      if (data.education.length > 0) {
        sectionTitle('Formação Acadêmica', mainContentX, mainContentW);
        data.education.forEach(edu => {
          checkPage(15);
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(9);
          pdf.text(edu.degree.toUpperCase(), mainContentX, y);
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(8);
          pdf.text(`${edu.institution.toUpperCase()} (${edu.year})`, mainContentX, y + 4);
          y += 12;
        });
      }

      // Executivo specific skills/langs at bottom
      if (isExecutivo) {
         y += 10;
         pdf.setDrawColor(241, 245, 249);
         pdf.line(15, y, w - 15, y);
         y += 10;
         
         const half = (w - 40) / 2;
         const startY = y;
         
         if (data.skills.length > 0) {
            sectionTitle('Competências', 15, half);
            pdf.setFontSize(8);
            pdf.text(data.skills.join('  •  '), 15, y);
         }
         
         y = startY;
         if (data.languages.length > 0) {
            sectionTitle('Idiomas', 25 + half, half);
            pdf.setFontSize(8);
            pdf.text(data.languages.map(l => `${l.name} (${l.level})`).join('  •  '), 25 + half, y);
         }
      }

      pdf.save(`curriculo_${data.full_name.replace(/\s+/g, '_').toLowerCase()}.pdf`);
    } catch (error) {
      console.error(error);
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
          <Card className="max-w-md p-10 text-center border-2 rounded-[5px] shadow-xl">
            <div className="w-20 h-20 rounded-[5px] bg-muted flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-muted-foreground opacity-30" />
            </div>
            <h2 className="text-2xl font-black mb-2">Acesso Restrito</h2>
            <p className="text-muted-foreground mb-8">Faça login para criar seu currículo profissional na aviação.</p>
            <Button asChild className="h-12 px-8 rounded-[5px] font-bold"><Link to="/auth">Fazer Login</Link></Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
      <Header />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <header className="mb-12 text-center lg:text-left flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 justify-center lg:justify-start">
                <Badge className="bg-primary/10 text-primary border-none font-black px-3 py-1 rounded-[5px] text-[10px]">CAREER BUILDER</Badge>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-foreground tracking-tighter">
                Construtor de Currículo
              </h1>
              <p className="text-muted-foreground font-medium max-w-xl">
                Crie um perfil profissional vencedor e baixe em PDF.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} variant="outline" className="h-12 px-6 rounded-[5px] border-2 font-bold bg-white/50 backdrop-blur-sm hover:bg-white transition-all">
                {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Salvar Progresso
              </Button>
              <Button onClick={downloadPDF} disabled={isGenerating} variant="accent" className="h-12 px-8 rounded-[5px] font-black shadow-xl shadow-accent/20 group hover:scale-105 transition-all">
                {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2 group-hover:bounce" />}
                Baixar PDF agora
              </Button>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Editor Sidebar */}
            <div className={`lg:col-span-5 space-y-6 ${mode === 'preview' ? 'hidden lg:block' : ''}`}>
               <Card className="rounded-[5px] border-2 shadow-sm overflow-hidden bg-white/80 backdrop-blur-xl border-slate-200">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <div className="px-6 pt-6">
                      <TabsList className="grid grid-cols-5 bg-slate-100/50 p-1.5 h-12 rounded-xl border border-slate-200/50 backdrop-blur-sm">
                        <TabsTrigger value="modelo" title="Modelo" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-300">
                          <Layout className="w-4 h-4" />
                        </TabsTrigger>
                        <TabsTrigger value="dados" title="Dados" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-300">
                          <User className="w-4 h-4" />
                        </TabsTrigger>
                        <TabsTrigger value="experiencia" title="Experiências" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-300">
                          <Briefcase className="w-4 h-4" />
                        </TabsTrigger>
                        <TabsTrigger value="formacao" title="Formação" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-300">
                          <GraduationCap className="w-4 h-4" />
                        </TabsTrigger>
                        <TabsTrigger value="extras" title="Extras" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-300">
                          <Award className="w-4 h-4" />
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    <div className="p-6">
                      <TabsContent value="modelo" className="mt-0 space-y-4">
                        <div className="space-y-1 mb-6">
                          <h3 className="font-black text-sm uppercase tracking-widest text-primary">1. Escolha o Estilo</h3>
                          <p className="text-xs text-muted-foreground">O layout ideal para seu momento de carreira.</p>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          {TEMPLATES.map(t => (
                            <button
                              key={t.id}
                              onClick={() => setData(p => ({ ...p, template: t.id }))}
                              className={`p-4 rounded-[5px] border-2 transition-all flex items-center gap-4 text-left ${data.template === t.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-slate-100 hover:border-primary/20 bg-slate-50/50'}`}
                            >
                              <div className={`w-10 h-10 rounded-[5px] flex items-center justify-center ${data.template === t.id ? 'bg-primary text-white' : 'bg-white text-slate-400 border'}`}>
                                <t.icon className="w-5 h-5" />
                              </div>
                              <div className="flex-1">
                                <span className={`text-xs font-black uppercase block ${data.template === t.id ? 'text-primary' : 'text-slate-600'}`}>{t.name}</span>
                                <span className="text-[10px] text-muted-foreground font-medium">{t.desc}</span>
                              </div>
                              {data.template === t.id && <Star className="w-4 h-4 text-primary fill-primary" />}
                            </button>
                          ))}
                        </div>
                        <Button className="w-full mt-6 rounded-[5px] font-bold h-11" onClick={() => setActiveTab('dados')}>Próximo Passo: Dados Pessoais <ArrowRight className="w-4 h-4 ml-2" /></Button>
                      </TabsContent>

                  <TabsContent value="dados" className="mt-0 space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label className="font-black text-[10px] uppercase ml-1 opacity-70">Nome Completo</Label>
                        <Input placeholder="Seu nome" value={data.full_name} onChange={e => setData(p => ({ ...p, full_name: e.target.value }))} className="h-11 rounded-[5px]" />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-black text-[10px] uppercase ml-1 opacity-70">Cargo / Profissão</Label>
                        <Input placeholder="Ex: Comissário de Voo" value={data.profession} onChange={e => setData(p => ({ ...p, profession: e.target.value }))} className="h-11 rounded-[5px]" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="font-black text-[10px] uppercase ml-1 opacity-70">E-mail</Label>
                          <Input placeholder="email@exemplo.com" value={data.email} onChange={e => setData(p => ({ ...p, email: e.target.value }))} className="h-11 rounded-[5px]" />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-black text-[10px] uppercase ml-1 opacity-70">Telefone</Label>
                          <Input placeholder="(00) 00000-0000" value={data.phone} onChange={e => setData(p => ({ ...p, phone: e.target.value }))} className="h-11 rounded-[5px]" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="font-black text-[10px] uppercase ml-1 opacity-70">Cidade/UF</Label>
                        <Input placeholder="Ex: São Paulo, SP" value={data.city} onChange={e => setData(p => ({ ...p, city: e.target.value }))} className="h-11 rounded-[5px]" />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-black text-[10px] uppercase ml-1 opacity-70">Resumo Profissional</Label>
                        <Textarea placeholder="Breve resumo sobre você..." value={data.summary} onChange={e => setData(p => ({ ...p, summary: e.target.value }))} className="rounded-[5px] min-h-[120px]" />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="experiencia" className="mt-0 space-y-4">
                    <div className="flex items-center justify-between mb-4">
                       <h3 className="font-black text-xs uppercase tracking-widest text-primary">Experiências</h3>
                       <Button variant="outline" size="sm" onClick={addExperience} className="rounded-[5px] h-8 px-3 border-2"><Plus className="w-3 h-3 mr-1" /> Novo</Button>
                    </div>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                      {data.experience.map((exp, i) => (
                        <div key={i} className="p-4 rounded-[5px] border-2 bg-white/50 relative group space-y-3">
                          <Button variant="ghost" size="sm" onClick={() => removeExperience(i)} className="absolute top-2 right-2 h-7 w-7 p-0 rounded-[5px] text-red-500 hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" /></Button>
                          <Input placeholder="Empresa" value={exp.company} onChange={e => updateExperience(i, 'company', e.target.value)} className="h-10 rounded-[5px]" />
                          <Input placeholder="Cargo" value={exp.role} onChange={e => updateExperience(i, 'role', e.target.value)} className="h-10 rounded-[5px]" />
                          <div className="grid grid-cols-2 gap-3">
                            <Input placeholder="Início" value={exp.start} onChange={e => updateExperience(i, 'start', e.target.value)} className="h-10 rounded-[5px]" />
                            <Input placeholder="Fim (ou Atual)" value={exp.end} onChange={e => updateExperience(i, 'end', e.target.value)} className="h-10 rounded-[5px]" />
                          </div>
                          <Textarea placeholder="Atividades principais..." value={exp.description} onChange={e => updateExperience(i, 'description', e.target.value)} className="rounded-[5px] min-h-[80px] text-xs" />
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="formacao" className="mt-0 space-y-4">
                    <div className="flex items-center justify-between mb-4">
                       <h3 className="font-black text-xs uppercase tracking-widest text-primary">Educação</h3>
                       <Button variant="outline" size="sm" onClick={addEducation} className="rounded-[5px] h-8 px-3 border-2"><Plus className="w-3 h-3 mr-1" /> Novo</Button>
                    </div>
                    <div className="space-y-4">
                      {data.education.map((edu, i) => (
                        <div key={i} className="p-4 rounded-[5px] border-2 bg-white/50 space-y-3">
                          <Input placeholder="Instituição" value={edu.institution} onChange={e => updateEducation(i, 'institution', e.target.value)} className="h-10 rounded-[5px]" />
                          <Input placeholder="Grau / Curso" value={edu.degree} onChange={e => updateEducation(i, 'degree', e.target.value)} className="h-10 rounded-[5px]" />
                          <Input placeholder="Ano de Conclusão" value={edu.year} onChange={e => updateEducation(i, 'year', e.target.value)} className="h-10 rounded-[5px]" />
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="extras" className="mt-0 space-y-8">
                    <div className="space-y-4">
                      <Label className="font-black text-[10px] uppercase ml-1 opacity-70">Competências</Label>
                      <div className="flex gap-2">
                        <Input placeholder="Ex: Liderança" value={newSkill} onChange={e => setNewSkill(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSkill()} className="h-11 rounded-[5px]" />
                        <Button variant="outline" onClick={addSkill} className="h-11 rounded-[5px] bg-white"><Plus className="w-4 h-4" /></Button>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {data.skills.map((s, i) => (
                          <Badge key={i} variant="secondary" className="px-3 py-1.5 rounded-[5px] font-bold text-[10px] cursor-pointer hover:bg-red-50 hover:text-red-500 border-2" onClick={() => setData(p => ({ ...p, skills: p.skills.filter((_, idx) => idx !== i) }))}>{s} ✕</Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                      <div className="flex items-center justify-between">
                         <Label className="font-black text-[10px] uppercase ml-1 opacity-70">Idiomas</Label>
                         <Button variant="ghost" size="sm" onClick={addLanguage} className="h-7 text-xs font-black text-primary"><Plus className="w-3 h-3 mr-1" /> ADICIONAR</Button>
                      </div>
                      <div className="space-y-3">
                        {data.languages.map((l, i) => (
                          <div key={i} className="flex gap-2">
                            <Input placeholder="Idioma" value={l.name} onChange={e => setData(p => ({ ...p, languages: p.languages.map((item, idx) => idx === i ? { ...item, name: e.target.value } : item) }))} className="h-10 rounded-[5px] flex-1" />
                            <Select value={l.level} onValueChange={v => setData(p => ({ ...p, languages: p.languages.map((item, idx) => idx === i ? { ...item, level: v } : item) }))}>
                              <SelectTrigger className="w-[120px] h-10 rounded-[5px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Básico">Básico</SelectItem>
                                <SelectItem value="Intermediário">Intermediário</SelectItem>
                                <SelectItem value="Avançado">Avançado</SelectItem>
                                <SelectItem value="Fluente">Fluente</SelectItem>
                                <SelectItem value="Nativo">Nativo</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                      <div className="flex items-center justify-between">
                         <Label className="font-black text-[10px] uppercase ml-1 opacity-70">Certificações</Label>
                         <Button variant="ghost" size="sm" onClick={addCertificate} className="h-7 text-xs font-black text-primary"><Plus className="w-3 h-3 mr-1" /> ADICIONAR</Button>
                      </div>
                      <div className="space-y-3">
                        {data.certificates.map((c, i) => (
                          <div key={i} className="p-3 border-2 rounded-[5px] bg-white/30 space-y-2">
                             <Input placeholder="Nome do Certificado" value={c.name} onChange={e => setData(p => ({ ...p, certificates: p.certificates.map((item, idx) => idx === i ? { ...item, name: e.target.value } : item) }))} className="h-9 rounded-[5px]" />
                             <div className="grid grid-cols-2 gap-2">
                               <Input placeholder="Emissor" value={c.issuer} onChange={e => setData(p => ({ ...p, certificates: p.certificates.map((item, idx) => idx === i ? { ...item, issuer: e.target.value } : item) }))} className="h-9 rounded-[5px]" />
                               <Input placeholder="Ano" value={c.year} onChange={e => setData(p => ({ ...p, certificates: p.certificates.map((item, idx) => idx === i ? { ...item, year: e.target.value } : item) }))} className="h-9 rounded-[5px]" />
                             </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                    </div>
                  </Tabs>
              </Card>
            </div>

            {/* Preview Column */}
            <div className={`lg:col-span-7 ${mode === 'edit' ? 'hidden lg:block' : ''}`}>
              <div className="sticky top-24">
                <div className="bg-white rounded-[5px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden transition-all duration-700 transform hover:scale-[1.01]">
                   <CurriculumPreview data={data} />
                </div>
                <div className="mt-4 flex items-center justify-center gap-2">
                   <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full border border-slate-200">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Preview em tempo real</span>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Mobile Mode Toggle */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 lg:hidden z-50">
        <Button onClick={() => setMode(p => p === 'edit' ? 'preview' : 'edit')} className="rounded-[5px] h-12 px-6 shadow-2xl font-black uppercase tracking-widest text-[10px] gap-2">
          {mode === 'edit' ? <><Sparkles className="w-4 h-4" /> Visualizar</> : <><Plus className="w-4 h-4" /> Editar Dados</>}
        </Button>
      </div>
    </div>
  );
}
