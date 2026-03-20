import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  User, Briefcase, GraduationCap, Award, Plus, Trash2,
  Download, Save, Loader2, Lock, FileText, Sparkles, Layout, Globe, Star
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
  { id: 'classico', name: 'Clássico', icon: FileText, desc: 'Organizado e direto' },
  { id: 'moderno', name: 'Moderno', icon: Sparkles, desc: 'Destaque visual' },
  { id: 'criativo', name: 'Criativo', icon: Layout, desc: 'Layout inovador' },
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

      const template = data.template || 'classico';
      const isModern = template === 'moderno';
      const isCreative = template === 'criativo';
      const isClassic = template === 'classico';

      const colors = {
        classico: { p: [30, 41, 59] as [number, number, number], light: [248, 250, 252] as [number, number, number] },
        moderno: { p: [37, 99, 235] as [number, number, number], light: [239, 246, 255] as [number, number, number] },
        criativo: { p: [124, 58, 237] as [number, number, number], light: [245, 243, 255] as [number, number, number] },
      };
      const c = colors[template as keyof typeof colors] || colors.classico;

      // Header background
      if (isCreative) {
        pdf.setFillColor(...c.p);
        pdf.rect(0, 0, w, 40, 'F');
        pdf.setTextColor(255, 255, 255);
      } else if (isModern) {
        pdf.setFillColor(...c.light);
        pdf.rect(0, 0, w, 40, 'F');
        pdf.setFillColor(...c.p);
        pdf.rect(0, 0, 5, 40, 'F');
        pdf.setTextColor(30, 41, 59);
      } else {
        pdf.setFillColor(30, 41, 59);
        pdf.rect(15, 38, w - 30, 1.5, 'F');
        pdf.setTextColor(30, 41, 59);
      }

      // Sidebar background for Modern
      if (isModern) {
        pdf.setFillColor(...c.light);
        pdf.rect(w * 0.65, 40, w * 0.35, h - 40, 'F');
      }

      // Name & Profession
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(22);
      if (isClassic) {
        pdf.text(data.full_name.toUpperCase(), w / 2, 20, { align: 'center' });
        pdf.setFontSize(10);
        pdf.setTextColor(...c.p);
        pdf.text(data.profession.toUpperCase(), w / 2, 28, { align: 'center' });
      } else {
        pdf.text(data.full_name.toUpperCase(), 15, 20);
        pdf.setFontSize(10);
        pdf.setTextColor(isCreative ? 220 : c.p[0], isCreative ? 220 : c.p[1], isCreative ? 220 : c.p[2]);
        pdf.text(data.profession.toUpperCase(), 15, 28);
      }

      // Contact Info
      pdf.setFontSize(8);
      pdf.setTextColor(isCreative ? 230 : 100);
      const contactStr = [data.email, data.phone, data.city].filter(Boolean).join('  •  ');
      if (isClassic) pdf.text(contactStr, w / 2, 34, { align: 'center' });
      else pdf.text(contactStr, 15, 34);

      pdf.setTextColor(50, 50, 50);
      y = 50;

      // Main content width
      const contentW = (isModern) ? w * 0.6 : w - 30;
      const sidebarX = w * 0.68;
      const sidebarW = w * 0.28;

      const section = (title: string, xPos = 15, width = contentW) => {
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...c.p);
        pdf.text(title.toUpperCase(), xPos, y);
        y += 2;
        pdf.setDrawColor(240, 240, 240);
        pdf.line(xPos, y, xPos + width, y);
        y += 6;
        pdf.setTextColor(50, 50, 50);
      };

      // Summary
      if (data.summary) {
        section('Perfil Profissional');
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        const lines = pdf.splitTextToSize(data.summary, contentW);
        pdf.text(lines, 15, y);
        y += (lines.length * 4.5) + 8;
      }

      const checkPage = (added: number) => {
        if (y + added > 280) { pdf.addPage(); y = 20; if (isModern) { pdf.setFillColor(...c.light); pdf.rect(w * 0.65, 0, w * 0.35, h, 'F'); } }
      };

      // Experience
      if (data.experience.length > 0) {
        checkPage(20);
        section('Trajetória Profissional');
        data.experience.forEach(exp => {
          checkPage(25);
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(10);
          pdf.text(exp.role.toUpperCase(), 15, y);
          pdf.setFontSize(8);
          pdf.setTextColor(...c.p);
          pdf.text(`${exp.company.toUpperCase()} | ${exp.start} - ${exp.end || 'Atual'}`, 15, y + 4);
          y += 9;
          if (exp.description) {
            pdf.setTextColor(70);
            pdf.setFont('helvetica', 'normal');
            const descLines = pdf.splitTextToSize(exp.description, contentW - 5);
            pdf.text(descLines, 15, y);
            y += (descLines.length * 4) + 4;
          }
          y += 2;
        });
        y += 6;
      }

      // Education
      if (data.education.length > 0) {
        checkPage(20);
        section('Formação Acadêmica');
        data.education.forEach(edu => {
          checkPage(15);
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(9);
          pdf.text(edu.degree.toUpperCase(), 15, y);
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(8);
          pdf.text(`${edu.institution.toUpperCase()} (${edu.year})`, 15, y + 4);
          y += 10;
        });
      }

      // Sidebar content for Modern/Creative
      if (isModern) {
        const savedY = y;
        y = 50;
        
        if (data.skills.length > 0) {
          section('Competências', sidebarX, sidebarW);
          pdf.setFontSize(8);
          data.skills.forEach(s => {
            pdf.text(`• ${s}`, sidebarX, y);
            y += 4.5;
          });
          y += 8;
        }

        if (data.languages.length > 0) {
          section('Idiomas', sidebarX, sidebarW);
          pdf.setFontSize(8);
          data.languages.forEach(l => {
            pdf.text(`${l.name}: ${l.level}`, sidebarX, y);
            y += 4.5;
          });
          y += 8;
        }

        if (data.certificates.length > 0) {
          section('Certificações', sidebarX, sidebarW);
          pdf.setFontSize(8);
          data.certificates.forEach(cert => {
            pdf.setFont('helvetica', 'bold');
            pdf.text(cert.name, sidebarX, y);
            pdf.setFont('helvetica', 'normal');
            pdf.text(`${cert.issuer} (${cert.year})`, sidebarX, y + 3.5);
            y += 8;
          });
        }
        
        y = Math.max(y, savedY);
      } else {
        // Simple sequential for others
        if (data.skills.length > 0) {
          checkPage(20);
          section('Competências');
          pdf.setFontSize(8);
          pdf.text(data.skills.join('  •  '), 15, y);
          y += 12;
        }
        
        if (data.languages.length > 0) {
          checkPage(20);
          section('Idiomas');
          pdf.setFontSize(8);
          pdf.text(data.languages.map(l => `${l.name} (${l.level})`).join('  •  '), 15, y);
          y += 12;
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
              {canSaveCurriculum ? (
                <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} variant="outline" className="h-12 px-6 rounded-[5px] border-2 font-bold bg-white/50 backdrop-blur-sm">
                  {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Salvar Progresso
                </Button>
              ) : (
                <Button variant="outline" disabled className="h-12 px-6 rounded-[5px] border-2 opacity-50"><Lock className="w-4 h-4 mr-2" /> Salvar Pro</Button>
              )}
              <Button onClick={downloadPDF} disabled={isGenerating} variant="accent" className="h-12 px-8 rounded-[5px] font-black shadow-xl shadow-accent/20">
                {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                Baixar PDF
              </Button>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Editor Sidebar */}
            <div className={`lg:col-span-5 space-y-8 ${mode === 'preview' ? 'hidden lg:block' : ''}`}>
               {/* Controls for Tab switching or other stuff could go here */}
               <Card className="rounded-[5px] border-2 shadow-sm overflow-hidden bg-white/70 backdrop-blur-xl">
                 <div className="p-6 border-b">
                   <h3 className="font-black text-sm uppercase tracking-widest text-primary">Selecione o Modelo</h3>
                   <div className="grid grid-cols-3 gap-3 mt-4">
                     {TEMPLATES.map(t => (
                       <button
                         key={t.id}
                         onClick={() => setData(p => ({ ...p, template: t.id }))}
                         className={`p-3 rounded-[5px] border-2 transition-all flex flex-col items-center gap-2 ${data.template === t.id ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/30 text-muted-foreground'}`}
                       >
                         <t.icon className="w-5 h-5" />
                         <span className="text-[10px] font-black uppercase">{t.name}</span>
                       </button>
                     ))}
                   </div>
                 </div>

                 <Tabs value={activeTab} onValueChange={setActiveTab} className="p-6">
                  <TabsList className="grid grid-cols-4 mb-8 bg-muted/60 p-1 h-14 rounded-[5px]">
                    <TabsTrigger value="dados" className="rounded-[5px] data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg"><User className="w-5 h-5" /></TabsTrigger>
                    <TabsTrigger value="experiencia" className="rounded-[5px] data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg"><Briefcase className="w-5 h-5" /></TabsTrigger>
                    <TabsTrigger value="formacao" className="rounded-[5px] data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg"><GraduationCap className="w-5 h-5" /></TabsTrigger>
                    <TabsTrigger value="extras" className="rounded-[5px] data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg"><Award className="w-5 h-5" /></TabsTrigger>
                  </TabsList>

                  <TabsContent value="dados" className="space-y-4">
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

                  <TabsContent value="experiencia" className="space-y-4">
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

                  <TabsContent value="formacao" className="space-y-4">
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

                  <TabsContent value="extras" className="space-y-8">
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
                </Tabs>
              </Card>
            </div>

            {/* Preview Column */}
            <div className={`lg:col-span-7 ${mode === 'edit' ? 'hidden lg:block' : ''}`}>
              <div className="sticky top-24">
                <div className="bg-slate-200/50 rounded-t-[5px] border-x-4 border-t-4 border-white p-3 flex items-center justify-between">
                  <div className="flex gap-1.5 px-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                  </div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Voo Certo Previewer v2.0</span>
                </div>
                <div className="shadow-2xl rounded-b-[5px] overflow-hidden border-4 border-white shadow-primary/5 transform-gpu transition-all duration-700">
                  <CurriculumPreview data={data} />
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
