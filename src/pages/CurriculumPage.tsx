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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-1">Construtor de Currículo</h1>
            <p className="text-muted-foreground text-sm">Crie seu currículo profissional. Salve os dados e baixe o PDF quando quiser.</p>
          </motion.div>

          {/* Template Selector */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {TEMPLATES.map(t => {
              const Icon = t.icon;
              const active = data.template === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setData(p => ({ ...p, template: t.id }))}
                  className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                    active
                      ? 'border-accent bg-accent/10 shadow-md'
                      : 'border-border bg-card hover:border-muted-foreground/30'
                  }`}
                >
                  <Icon className={`w-5 h-5 mb-2 ${active ? 'text-accent' : 'text-muted-foreground'}`} />
                  <p className={`text-sm font-semibold ${active ? 'text-foreground' : 'text-foreground'}`}>{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.desc}</p>
                  {active && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent" />}
                </button>
              );
            })}
          </div>

          {/* Mobile mode toggle */}
          <div className="flex gap-2 mb-4 lg:hidden">
            <Button size="sm" variant={mode === 'edit' ? 'default' : 'outline'} onClick={() => setMode('edit')} className="flex-1">
              Editar
            </Button>
            <Button size="sm" variant={mode === 'preview' ? 'default' : 'outline'} onClick={() => setMode('preview')} className="flex-1">
              Preview
            </Button>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mb-6">
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} variant="outline">
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Salvar
            </Button>
            <Button onClick={downloadPDF} disabled={isGenerating} variant="accent">
              {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
              Download PDF
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Editor */}
            <div className={mode === 'preview' ? 'hidden lg:block' : ''}>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-4 mb-6">
                  <TabsTrigger value="dados"><User className="w-4 h-4" /></TabsTrigger>
                  <TabsTrigger value="experiencia"><Briefcase className="w-4 h-4" /></TabsTrigger>
                  <TabsTrigger value="formacao"><GraduationCap className="w-4 h-4" /></TabsTrigger>
                  <TabsTrigger value="extras"><Award className="w-4 h-4" /></TabsTrigger>
                </TabsList>

                <TabsContent value="dados" className="space-y-4">
                  <Card>
                    <CardHeader><CardTitle className="text-base">Dados Pessoais</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label>Nome Completo</Label>
                          <Input value={data.full_name} onChange={e => setData(p => ({ ...p, full_name: e.target.value }))} placeholder="Seu nome" />
                        </div>
                        <div>
                          <Label>Cargo Desejado</Label>
                          <Input value={data.profession} onChange={e => setData(p => ({ ...p, profession: e.target.value }))} placeholder="Ex: Desenvolvedor, Analista..." />
                        </div>
                        <div>
                          <Label>E-mail</Label>
                          <Input value={data.email} onChange={e => setData(p => ({ ...p, email: e.target.value }))} placeholder="seu@email.com" />
                        </div>
                        <div>
                          <Label>Telefone</Label>
                          <Input value={data.phone} onChange={e => setData(p => ({ ...p, phone: e.target.value }))} placeholder="(11) 99999-9999" />
                        </div>
                        <div>
                          <Label>Cidade / Estado</Label>
                          <Input value={data.city} onChange={e => setData(p => ({ ...p, city: e.target.value }))} placeholder="São Paulo, SP" />
                        </div>
                      </div>
                      <div>
                        <Label>Resumo Profissional</Label>
                        <Textarea value={data.summary} onChange={e => setData(p => ({ ...p, summary: e.target.value }))} placeholder="Breve descrição da sua trajetória..." rows={4} />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="experiencia" className="space-y-4">
                  {data.experience.map((exp, i) => (
                    <Card key={i}>
                      <CardContent className="pt-4 space-y-3">
                        <div className="flex justify-between">
                          <span className="font-medium text-sm">Experiência {i + 1}</span>
                          <Button variant="ghost" size="sm" onClick={() => removeExperience(i)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                        </div>
                        <Input placeholder="Empresa" value={exp.company} onChange={e => updateExperience(i, 'company', e.target.value)} />
                        <Input placeholder="Cargo" value={exp.role} onChange={e => updateExperience(i, 'role', e.target.value)} />
                        <div className="grid grid-cols-2 gap-2">
                          <Input placeholder="Início" value={exp.start} onChange={e => updateExperience(i, 'start', e.target.value)} />
                          <Input placeholder="Fim (ou Atual)" value={exp.end} onChange={e => updateExperience(i, 'end', e.target.value)} />
                        </div>
                        <Textarea placeholder="Descrição das atividades..." rows={2} value={exp.description} onChange={e => updateExperience(i, 'description', e.target.value)} />
                      </CardContent>
                    </Card>
                  ))}
                  <Button variant="outline" className="w-full" onClick={addExperience}><Plus className="w-4 h-4 mr-2" /> Adicionar Experiência</Button>
                </TabsContent>

                <TabsContent value="formacao" className="space-y-4">
                  {data.education.map((edu, i) => (
                    <Card key={i}>
                      <CardContent className="pt-4 space-y-3">
                        <div className="flex justify-between">
                          <span className="font-medium text-sm">Formação {i + 1}</span>
                          <Button variant="ghost" size="sm" onClick={() => setData(p => ({ ...p, education: p.education.filter((_, idx) => idx !== i) }))}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                        </div>
                        <Input placeholder="Instituição" value={edu.institution} onChange={e => setData(p => ({ ...p, education: p.education.map((ed, idx) => idx === i ? { ...ed, institution: e.target.value } : ed) }))} />
                        <Input placeholder="Curso / Grau" value={edu.degree} onChange={e => setData(p => ({ ...p, education: p.education.map((ed, idx) => idx === i ? { ...ed, degree: e.target.value } : ed) }))} />
                        <Input placeholder="Ano de conclusão" value={edu.year} onChange={e => setData(p => ({ ...p, education: p.education.map((ed, idx) => idx === i ? { ...ed, year: e.target.value } : ed) }))} />
                      </CardContent>
                    </Card>
                  ))}
                  <Button variant="outline" className="w-full" onClick={() => setData(p => ({ ...p, education: [...p.education, { institution: '', degree: '', year: '' }] }))}><Plus className="w-4 h-4 mr-2" /> Adicionar Formação</Button>
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
              <div className="sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground text-sm">Preview — {selectedTemplate.name}</h3>
                </div>
                <CurriculumPreview data={data} />
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
