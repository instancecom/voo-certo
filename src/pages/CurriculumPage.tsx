import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  User, Briefcase, GraduationCap, Award, Globe, Plus, Trash2,
  Download, Save, Loader2, Lock, Plane, Camera
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
  profession: 'Comissário de Voo',
  summary: '',
  experience: [],
  education: [],
  certificates: [],
  languages: [],
  skills: [],
  photo_url: '',
  template: 'aviation',
};

const PROFESSIONS = ['Comissário de Voo', 'Piloto Comercial', 'Piloto Privado', 'Despachante Operacional', 'Controlador de Tráfego Aéreo', 'Técnico em Manutenção'];

export default function CurriculumPage() {
  const { user } = useAuth();
  const [data, setData] = useState<CurriculumData>(EMPTY_DATA);
  const [newSkill, setNewSkill] = useState('');
  const [activeTab, setActiveTab] = useState('dados');
  const [isGenerating, setIsGenerating] = useState(false);
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
          profession: saved.profession || 'Comissário de Voo',
          summary: saved.summary || '',
          experience: (saved.experience as unknown as Experience[]) || [],
          education: (saved.education as unknown as Education[]) || [],
          certificates: (saved.certificates as unknown as Certificate[]) || [],
          languages: (saved.languages as unknown as Language[]) || [],
          skills: saved.skills || [],
          photo_url: saved.photo_url || '',
          template: saved.template || 'aviation',
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
    onSuccess: () => toast.success('Currículo salvo!'),
    onError: () => toast.error('Erro ao salvar currículo'),
  });

  const addExperience = () => {
    setData(prev => ({
      ...prev,
      experience: [...prev.experience, { company: '', role: '', start: '', end: '', description: '' }],
    }));
  };

  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    setData(prev => ({
      ...prev,
      experience: prev.experience.map((e, i) => i === index ? { ...e, [field]: value } : e),
    }));
  };

  const removeExperience = (index: number) => {
    setData(prev => ({ ...prev, experience: prev.experience.filter((_, i) => i !== index) }));
  };

  const addCertificate = () => {
    setData(prev => ({
      ...prev,
      certificates: [...prev.certificates, { name: '', issuer: '', year: '' }],
    }));
  };

  const addLanguage = () => {
    setData(prev => ({
      ...prev,
      languages: [...prev.languages, { name: '', level: 'Básico' }],
    }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !data.skills.includes(newSkill.trim())) {
      setData(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
      setNewSkill('');
    }
  };

  const downloadPDF = async () => {
    setIsGenerating(true);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const { default: jsPDF } = await import('jspdf');

      if (!previewRef.current) return;
      const canvas = await html2canvas(previewRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = (canvas.height * pageWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);
      pdf.save(`curriculo-${data.full_name || 'voocerto'}.pdf`);
      toast.success('PDF gerado com sucesso!');
    } catch (err) {
      toast.error('Erro ao gerar PDF. Tente novamente.');
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Construtor de Currículo</h1>
            <p className="text-muted-foreground">Templates profissionais para aviação civil. Gere seu PDF em segundos.</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form */}
            <div>
              <div className="flex gap-3 mb-6">
                <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} variant="outline">
                  {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Salvar
                </Button>
                <Button onClick={downloadPDF} disabled={isGenerating}>
                  {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                  Gerar PDF
                </Button>
              </div>

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
                          <Label>Profissão</Label>
                          <Select value={data.profession} onValueChange={v => setData(p => ({ ...p, profession: v }))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {PROFESSIONS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                            </SelectContent>
                          </Select>
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
                        <Textarea
                          value={data.summary}
                          onChange={e => setData(p => ({ ...p, summary: e.target.value }))}
                          placeholder="Breve descrição da sua trajetória profissional..."
                          rows={4}
                        />
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
                          <Button variant="ghost" size="sm" onClick={() => removeExperience(i)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                        <Input placeholder="Empresa/Companhia" value={exp.company} onChange={e => updateExperience(i, 'company', e.target.value)} />
                        <Input placeholder="Cargo" value={exp.role} onChange={e => updateExperience(i, 'role', e.target.value)} />
                        <div className="grid grid-cols-2 gap-2">
                          <Input placeholder="Início (mm/aaaa)" value={exp.start} onChange={e => updateExperience(i, 'start', e.target.value)} />
                          <Input placeholder="Fim (mm/aaaa ou atual)" value={exp.end} onChange={e => updateExperience(i, 'end', e.target.value)} />
                        </div>
                        <Textarea placeholder="Descrição das atividades..." rows={2} value={exp.description} onChange={e => updateExperience(i, 'description', e.target.value)} />
                      </CardContent>
                    </Card>
                  ))}
                  <Button variant="outline" className="w-full" onClick={addExperience}>
                    <Plus className="w-4 h-4 mr-2" /> Adicionar Experiência
                  </Button>
                </TabsContent>

                <TabsContent value="formacao" className="space-y-4">
                  {data.education.map((edu, i) => (
                    <Card key={i}>
                      <CardContent className="pt-4 space-y-3">
                        <div className="flex justify-between">
                          <span className="font-medium text-sm">Formação {i + 1}</span>
                          <Button variant="ghost" size="sm" onClick={() => setData(p => ({ ...p, education: p.education.filter((_, idx) => idx !== i) }))}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                        <Input placeholder="Instituição" value={edu.institution} onChange={e => setData(p => ({ ...p, education: p.education.map((ed, idx) => idx === i ? { ...ed, institution: e.target.value } : ed) }))} />
                        <Input placeholder="Curso/Habilitação" value={edu.degree} onChange={e => setData(p => ({ ...p, education: p.education.map((ed, idx) => idx === i ? { ...ed, degree: e.target.value } : ed) }))} />
                        <Input placeholder="Ano de conclusão" value={edu.year} onChange={e => setData(p => ({ ...p, education: p.education.map((ed, idx) => idx === i ? { ...ed, year: e.target.value } : ed) }))} />
                      </CardContent>
                    </Card>
                  ))}
                  <Button variant="outline" className="w-full" onClick={() => setData(p => ({ ...p, education: [...p.education, { institution: '', degree: '', year: '' }] }))}>
                    <Plus className="w-4 h-4 mr-2" /> Adicionar Formação
                  </Button>
                </TabsContent>

                <TabsContent value="extras" className="space-y-4">
                  {/* Certificados */}
                  <Card>
                    <CardHeader><CardTitle className="text-sm">Certificados & Habilitações</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      {data.certificates.map((cert, i) => (
                        <div key={i} className="flex gap-2 items-center">
                          <Input placeholder="Nome do certificado" value={cert.name} onChange={e => setData(p => ({ ...p, certificates: p.certificates.map((c, idx) => idx === i ? { ...c, name: e.target.value } : c) }))} />
                          <Input placeholder="Ano" className="w-20" value={cert.year} onChange={e => setData(p => ({ ...p, certificates: p.certificates.map((c, idx) => idx === i ? { ...c, year: e.target.value } : c) }))} />
                          <Button variant="ghost" size="sm" onClick={() => setData(p => ({ ...p, certificates: p.certificates.filter((_, idx) => idx !== i) }))}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" onClick={addCertificate}>
                        <Plus className="w-4 h-4 mr-2" /> Adicionar Certificado
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Idiomas */}
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
                          <Button variant="ghost" size="sm" onClick={() => setData(p => ({ ...p, languages: p.languages.filter((_, idx) => idx !== i) }))}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" onClick={addLanguage}>
                        <Plus className="w-4 h-4 mr-2" /> Adicionar Idioma
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Skills */}
                  <Card>
                    <CardHeader><CardTitle className="text-sm">Competências</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex gap-2">
                        <Input placeholder="Ex: CRM, First Aid, PBAC..." value={newSkill} onChange={e => setNewSkill(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSkill()} />
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
            <div className="hidden lg:block">
              <div className="sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">Preview</h3>
                  <Badge variant="outline">Template Aviation</Badge>
                </div>
                <div
                  ref={previewRef}
                  className="bg-white rounded-xl overflow-hidden shadow-xl"
                  style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: '#1e293b' }}
                >
                  {/* Header */}
                  <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5986 100%)', color: 'white', padding: '2rem' }}>
                    <div className="flex items-center gap-4">
                      <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
                        ✈️
                      </div>
                      <div>
                        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{data.full_name || 'Seu Nome'}</h1>
                        <p style={{ fontSize: 13, opacity: 0.85, margin: '4px 0 0' }}>{data.profession}</p>
                        <p style={{ fontSize: 11, opacity: 0.7, margin: '2px 0 0' }}>
                          {[data.city, data.phone, data.email].filter(Boolean).join(' • ')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.5rem' }}>
                    {/* Left */}
                    <div>
                      {data.summary && (
                        <div style={{ marginBottom: '1rem' }}>
                          <h2 style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f', borderBottom: '2px solid #1e3a5f', paddingBottom: 4, marginBottom: 8 }}>OBJETIVO</h2>
                          <p style={{ fontSize: 11, lineHeight: 1.6 }}>{data.summary}</p>
                        </div>
                      )}

                      {data.experience.length > 0 && (
                        <div style={{ marginBottom: '1rem' }}>
                          <h2 style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f', borderBottom: '2px solid #1e3a5f', paddingBottom: 4, marginBottom: 8 }}>EXPERIÊNCIA</h2>
                          {data.experience.map((exp, i) => (
                            <div key={i} style={{ marginBottom: 10 }}>
                              <p style={{ fontSize: 12, fontWeight: 600, margin: 0 }}>{exp.role || 'Cargo'}</p>
                              <p style={{ fontSize: 11, color: '#475569', margin: '2px 0' }}>{exp.company} • {exp.start} – {exp.end || 'Atual'}</p>
                              {exp.description && <p style={{ fontSize: 10, color: '#64748b', margin: 0 }}>{exp.description}</p>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right */}
                    <div>
                      {data.certificates.length > 0 && (
                        <div style={{ marginBottom: '1rem' }}>
                          <h2 style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f', borderBottom: '2px solid #1e3a5f', paddingBottom: 4, marginBottom: 8 }}>CERTIFICADOS</h2>
                          {data.certificates.map((c, i) => (
                            <p key={i} style={{ fontSize: 11, margin: '3px 0' }}>• {c.name} {c.year && `(${c.year})`}</p>
                          ))}
                        </div>
                      )}

                      {data.languages.length > 0 && (
                        <div style={{ marginBottom: '1rem' }}>
                          <h2 style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f', borderBottom: '2px solid #1e3a5f', paddingBottom: 4, marginBottom: 8 }}>IDIOMAS</h2>
                          {data.languages.map((l, i) => (
                            <p key={i} style={{ fontSize: 11, margin: '3px 0' }}>• {l.name} – {l.level}</p>
                          ))}
                        </div>
                      )}

                      {data.skills.length > 0 && (
                        <div>
                          <h2 style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f', borderBottom: '2px solid #1e3a5f', paddingBottom: 4, marginBottom: 8 }}>COMPETÊNCIAS</h2>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {data.skills.map((s, i) => (
                              <span key={i} style={{ background: '#e8f0fe', color: '#1e3a5f', borderRadius: 12, padding: '2px 8px', fontSize: 10, fontWeight: 500 }}>{s}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div style={{ background: '#1e3a5f', color: 'rgba(255,255,255,0.5)', padding: '8px 24px', fontSize: 9, textAlign: 'center' }}>
                    Gerado pelo Voo Certo • voocerto.com.br
                  </div>
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
