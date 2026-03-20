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
      let y = 0;

      const template = data.template || 'classico';
      const colors = {
        classico: { p: [30, 58, 95] as [number, number, number] },
        moderno: { p: [37, 99, 235] as [number, number, number] },
        criativo: { p: [124, 58, 237] as [number, number, number] },
      };
      const c = colors[template as keyof typeof colors] || colors.classico;

      // Clean simple PDF generator for MVP
      pdf.setFillColor(...c.p);
      pdf.rect(0, 0, w, 35, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(22);
      pdf.setFont('helvetica', 'bold');
      pdf.text(data.full_name || 'CURRÍCULO', 15, 18);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(data.profession || '', 15, 26);
      pdf.setFontSize(8);
      pdf.text([data.email, data.phone, data.city].filter(Boolean).join(' • '), 15, 31);
      
      y = 45;
      pdf.setTextColor(50, 50, 50);

      const section = (t: string) => {
        if (y > 270) { pdf.addPage(); y = 15; }
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...c.p);
        pdf.text(t.toUpperCase(), 15, y);
        y += 2;
        pdf.setDrawColor(...c.p);
        pdf.line(15, y, w - 15, y);
        y += 6;
        pdf.setTextColor(50, 50, 50);
      };

      if (data.summary) {
        section('Perfil');
        pdf.setFontSize(9);
        const lines = pdf.splitTextToSize(data.summary, w - 30);
        pdf.text(lines, 15, y);
        y += (lines.length * 4) + 6;
      }

      if (data.experience.length > 0) {
        section('Experiência');
        data.experience.forEach(e => {
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'bold');
          pdf.text(e.role, 15, y);
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(8);
          pdf.text(`${e.company} | ${e.start} - ${e.end || 'Atual'}`, 15, y + 4);
          y += 9;
          if (e.description) {
            pdf.setFontSize(8);
            const dl = pdf.splitTextToSize(e.description, w-30);
            pdf.text(dl, 15, y);
            y += (dl.length * 4) + 2;
          }
          y += 3;
        });
      }

      if (data.education.length > 0) {
        section('Educação');
        data.education.forEach(e => {
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'bold');
          pdf.text(e.degree, 15, y);
          pdf.setFont('helvetica', 'normal');
          pdf.text(`${e.institution} (${e.year})`, 15, y + 4);
          y += 10;
        });
      }

      if (data.skills.length > 0) {
        section('Habilidades');
        pdf.setFontSize(9);
        pdf.text(data.skills.join(' • '), 15, y);
        y += 8;
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
          <Card className="max-w-md p-10 text-center border-2 rounded-[2rem] shadow-xl">
            <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-muted-foreground opacity-30" />
            </div>
            <h2 className="text-2xl font-black mb-2">Acesso Restrito</h2>
            <p className="text-muted-foreground mb-8">Faça login para criar seu currículo profissional na aviação.</p>
            <Button asChild className="h-12 px-8 rounded-xl font-bold"><Link to="/auth">Fazer Login</Link></Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const selectedTemplate = TEMPLATES.find(t => t.id === data.template) || TEMPLATES[0];

  return (
    <div className="min-h-screen bg-background bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
      <Header />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <header className="mb-12 text-center lg:text-left flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 justify-center lg:justify-start">
                <Badge className="bg-primary/10 text-primary border-none font-black px-3 py-1 rounded-lg text-[10px]">CAREER BUILDER</Badge>
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
                <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} variant="outline" className="h-12 px-6 rounded-xl border-2 font-bold bg-white/50 backdrop-blur-sm">
                  {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Salvar Progresso
                </Button>
              ) : (
                <Button variant="outline" disabled className="h-12 px-6 rounded-xl border-2 opacity-50"><Lock className="w-4 h-4 mr-2" /> Salvar Pro</Button>
              )}
              <Button onClick={downloadPDF} disabled={isGenerating} variant="accent" className="h-12 px-8 rounded-xl font-black shadow-xl shadow-accent/20">
                {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                Baixar PDF
              </Button>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Editor Sidebar */}
            <div className={`lg:col-span-5 space-y-8 ${mode === 'preview' ? 'hidden lg:block' : ''}`}>
              <Card className="rounded-[2.5rem] border-2 shadow-sm overflow-hidden bg-card/60 backdrop-blur-xl">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="p-4 sm:p-6">
                  <TabsList className="grid grid-cols-4 mb-8 bg-muted/60 p-1 h-14 rounded-2xl">
                    <TabsTrigger value="dados" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg"><User className="w-5 h-5" /></TabsTrigger>
                    <TabsTrigger value="experiencia" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg"><Briefcase className="w-5 h-5" /></TabsTrigger>
                    <TabsTrigger value="formacao" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg"><GraduationCap className="w-5 h-5" /></TabsTrigger>
                    <TabsTrigger value="extras" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg"><Award className="w-5 h-5" /></TabsTrigger>
                  </TabsList>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Dados Content */}
                      {activeTab === 'dados' && (
                        <div className="space-y-6">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground ml-1">Nome Completo</Label>
                              <Input value={data.full_name} onChange={e => setData(p => ({ ...p, full_name: e.target.value }))} className="h-12 rounded-2xl bg-white border-2 border-primary/5 focus-visible:border-primary/20" />
                            </div>
                            <div className="space-y-2">
                              <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground ml-1">Cargo Desejado</Label>
                              <Input value={data.profession} onChange={e => setData(p => ({ ...p, profession: e.target.value }))} className="h-12 rounded-2xl bg-white border-2 border-primary/5 focus-visible:border-primary/20" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground ml-1">E-mail</Label>
                                <Input value={data.email} onChange={e => setData(p => ({ ...p, email: e.target.value }))} className="h-12 rounded-2xl bg-white border-2 border-primary/5 focus-visible:border-primary/20" />
                              </div>
                              <div className="space-y-2">
                                <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground ml-1">Telefone</Label>
                                <Input value={data.phone} onChange={e => setData(p => ({ ...p, phone: e.target.value }))} className="h-12 rounded-2xl bg-white border-2 border-primary/5 focus-visible:border-primary/20" />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground ml-1">Perfil Profissional</Label>
                              <Textarea value={data.summary} onChange={e => setData(p => ({ ...p, summary: e.target.value }))} className="rounded-2xl bg-white border-2 border-primary/5 min-h-[150px] resize-none" />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Experiência Content */}
                      {activeTab === 'experiencia' && (
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <h3 className="font-black text-lg">Experiências</h3>
                            <Button variant="outline" size="sm" onClick={addExperience} className="rounded-xl border-2"><Plus className="w-4 h-4 mr-2" /> Novo</Button>
                          </div>
                          <div className="space-y-4">
                            {data.experience.map((exp, i) => (
                              <Card key={i} className="p-4 rounded-2xl border-2 border-primary/5 bg-white/50 relative group">
                                <Button variant="ghost" size="sm" onClick={() => removeExperience(i)} className="absolute top-2 right-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4 text-red-400" /></Button>
                                <div className="space-y-3">
                                  <Input placeholder="Empresa" value={exp.company} onChange={e => updateExperience(i, 'company', e.target.value)} className="h-10 rounded-xl" />
                                  <Input placeholder="Cargo" value={exp.role} onChange={e => updateExperience(i, 'role', e.target.value)} className="h-10 rounded-xl" />
                                  <div className="grid grid-cols-2 gap-3">
                                    <Input placeholder="Início" value={exp.start} onChange={e => updateExperience(i, 'start', e.target.value)} className="h-10 rounded-xl" />
                                    <Input placeholder="Fim" value={exp.end} onChange={e => updateExperience(i, 'end', e.target.value)} className="h-10 rounded-xl" />
                                  </div>
                                  <Textarea placeholder="Descrição" value={exp.description} onChange={e => updateExperience(i, 'description', e.target.value)} className="rounded-xl min-h-[80px]" />
                                </div>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Formação Content */}
                      {activeTab === 'formacao' && (
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <h3 className="font-black text-lg">Educação</h3>
                            <Button variant="outline" size="sm" onClick={addEducation} className="rounded-xl border-2"><Plus className="w-4 h-4 mr-2" /> Novo</Button>
                          </div>
                          <div className="space-y-4">
                            {data.education.map((edu, i) => (
                              <Card key={i} className="p-4 rounded-2xl border-2 border-primary/5 bg-white/50">
                                <div className="space-y-3">
                                  <Input placeholder="Instituição" value={edu.institution} onChange={e => updateEducation(i, 'institution', e.target.value)} className="h-10 rounded-xl" />
                                  <Input placeholder="Curso" value={edu.degree} onChange={e => updateEducation(i, 'degree', e.target.value)} className="h-10 rounded-xl" />
                                  <Input placeholder="Ano" value={edu.year} onChange={e => updateEducation(i, 'year', e.target.value)} className="h-10 rounded-xl" />
                                </div>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Extras Content */}
                      {activeTab === 'extras' && (
                        <div className="space-y-8">
                          <div className="space-y-4">
                            <h4 className="font-black flex items-center gap-2"><Star className="w-4 h-4 text-accent" /> Competências</h4>
                            <div className="flex gap-2">
                              <Input placeholder="Liderança, Excel..." value={newSkill} onChange={e => setNewSkill(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSkill()} className="h-11 rounded-xl" />
                              <Button variant="outline" onClick={addSkill} className="h-11 rounded-xl"><Plus className="w-4 h-4" /></Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {data.skills.map((s, i) => (
                                <Badge key={i} variant="secondary" className="px-3 py-1 cursor-pointer hover:bg-red-50 hover:text-red-500 transition-colors" onClick={() => setData(p => ({ ...p, skills: p.skills.filter((_, idx) => idx !== i) }))}>{s} ✕</Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <h4 className="font-black flex items-center gap-2"><Globe className="w-4 h-4 text-primary" /> Idiomas</h4>
                            <Button variant="outline" size="sm" onClick={addLanguage} className="rounded-xl"><Plus className="w-4 h-4 mr-2" /> Adicionar Idioma</Button>
                            {data.languages.map((l, i) => (
                              <div key={i} className="flex gap-2">
                                <Input value={l.name} onChange={e => setData(p => ({ ...p, languages: p.languages.map((val, idx) => idx === i ? { ...val, name: e.target.value } : val) }))} className="h-10 rounded-xl" />
                                <Select value={l.level} onValueChange={v => setData(p => ({ ...p, languages: p.languages.map((val, idx) => idx === i ? { ...val, level: v } : val) }))}>
                                  <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    {['Básico', 'Intermediário', 'Avançado', 'Fluente', 'Nativo'].map(lv => <SelectItem key={lv} value={lv}>{lv}</SelectItem>)}
                                  </SelectContent>
                                </Select>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </Tabs>
              </Card>

              {/* Template Selector Card */}
              <Card className="p-6 rounded-[2.5rem] border-2 bg-card/60 backdrop-blur-xl">
                <h3 className="font-black mb-6 flex items-center gap-2"><Layout className="w-5 h-5 text-primary" /> Modelo do Documento</h3>
                <div className="grid grid-cols-3 gap-3">
                  {TEMPLATES.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setData(p => ({ ...p, template: t.id }))}
                      className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${data.template === t.id ? 'border-primary bg-primary/5 text-primary ring-4 ring-primary/5' : 'border-primary/5 grayscale opacity-60 hover:opacity-100 hover:grayscale-0'}`}
                    >
                      <t.icon className="w-6 h-6" />
                      <span className="text-[10px] font-black uppercase tracking-wider">{t.name}</span>
                    </button>
                  ))}
                </div>
              </Card>
            </div>

            {/* Desktop Preview / Mobile View Control */}
            <div className={`lg:col-span-7 space-y-6 ${mode === 'edit' ? 'hidden lg:block' : ''}`}>
              <div className="flex items-center justify-between mb-4 lg:hidden">
                <Button variant="ghost" onClick={() => setMode('edit')} className="rounded-xl font-bold"><ArrowLeft className="w-4 h-4 mr-2" /> Voltar para Edição</Button>
              </div>
              
              <div className="sticky top-24">
                <div className="bg-slate-300 p-1 rounded-t-[2.5rem] border-x-4 border-t-4 border-white inline-flex items-center px-6 py-2 gap-3 translate-y-1 relative z-10 shadow-sm">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                  </div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Voo Certo Previewer v2.0</span>
                </div>
                <div className="shadow-2xl rounded-b-[2.5rem] overflow-hidden border-4 border-white shadow-primary/5 transform-gpu transition-all duration-700">
                  <CurriculumPreview data={data} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// ArrowLeft re-import or definition if missing in top imports
function ArrowLeft({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
    </svg>
  );
}
