import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, MapPin, Linkedin, Globe, Award, GraduationCap, Briefcase, Star, Info } from 'lucide-react';

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
  template: string;
}

interface CurriculumPreviewProps {
  data: CurriculumData;
}

export function CurriculumPreview({ data }: CurriculumPreviewProps) {
  const SectionTitle = ({ children, icon: Icon, color }: { children: React.ReactNode, icon: any, color?: string }) => (
    <div className={`flex items-center gap-2 mb-4 border-b pb-1 ${color || 'border-slate-100'}`}>
      <Icon className={`w-4 h-4 ${color ? '' : 'text-primary'}`} />
      <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] ${color ? '' : 'text-primary'}`}>{children}</h3>
    </div>
  );

  // Template-specific styles
  const isModern = data.template === 'moderno';
  const isCreative = data.template === 'criativo';

  return (
    <Card className="bg-white text-slate-900 shadow-2xl p-6 md:p-10 min-h-[842px] rounded-none border-none animate-fade-in origin-top transition-all duration-500 overflow-hidden relative">
      {/* Background decoration for modern/creative */}
      {isModern && <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-3xl" />}
      {isCreative && <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/5 rounded-full -ml-24 -mb-24 blur-3xl" />}

      {/* Header section */}
      <div className={`mb-10 ${isModern ? 'text-left border-l-8 border-primary pl-6' : 'text-center'}`}>
        <h1 className="text-3xl font-black tracking-tighter text-slate-900 mb-2 uppercase break-words leading-none">
          {data.full_name || 'Seu Nome Completo'}
        </h1>
        <p className="text-sm font-bold text-primary mb-4 uppercase tracking-widest">{data.profession || 'Cargo Desejado'}</p>
        
        <div className={`flex flex-wrap ${isModern ? 'justify-start' : 'justify-center'} gap-x-4 gap-y-1.5 text-[10px] font-bold text-slate-400`}>
          {data.email && (
            <div className="flex items-center gap-1.5">
              <Mail className="w-3 h-3 text-slate-300" /> {data.email}
            </div>
          )}
          {data.phone && (
            <div className="flex items-center gap-1.5">
              <Phone className="w-3 h-3 text-slate-300" /> {data.phone}
            </div>
          )}
          {data.city && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-slate-300" /> {data.city}
            </div>
          )}
        </div>
      </div>

      <div className={`grid grid-cols-1 ${isModern || isCreative ? 'md:grid-cols-12' : 'md:grid-cols-1'} gap-8 md:gap-12`}>
        {/* Main content column */}
        <div className={(isModern || isCreative) ? "md:col-span-8 space-y-10" : "space-y-10"}>
          {/* Summary */}
          {data.summary && (
            <div>
              <SectionTitle icon={Info}>Perfil Profissional</SectionTitle>
              <p className="text-[11px] leading-relaxed text-slate-600 font-medium whitespace-pre-wrap">
                {data.summary}
              </p>
            </div>
          )}

          {/* Experience */}
          {data.experience.length > 0 && (
            <div>
              <SectionTitle icon={Briefcase}>Trajetória Profissional</SectionTitle>
              <div className="space-y-6">
                {data.experience.map((exp, i) => (
                  <div key={i} className="group">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="text-xs font-black text-slate-900 tracking-tight uppercase">{exp.role}</h4>
                      <span className="text-[9px] font-black text-slate-400 tabular-nums">
                        {exp.start} — {exp.end || 'Atual'}
                      </span>
                    </div>
                    <p className="text-[10px] font-bold text-primary mb-2 opacity-80">{exp.company}</p>
                    {exp.description && (
                      <p className="text-[10px] text-slate-500 leading-relaxed font-medium pl-3 border-l-2 border-slate-100 group-hover:border-primary/20 transition-colors">
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {data.education.length > 0 && (
            <div>
              <SectionTitle icon={GraduationCap}>Formação Acadêmica</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.education.map((edu, i) => (
                  <div key={i} className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                    <h4 className="text-[10px] font-black text-slate-800 leading-tight mb-1 uppercase">{edu.degree}</h4>
                    <p className="text-[9px] font-bold text-slate-500">{edu.institution}</p>
                    <p className="text-[8px] font-black text-primary/60 mt-1 uppercase">{edu.year}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar column (only for modern/creative) */}
        <div className={(isModern || isCreative) ? "md:col-span-4 space-y-10" : "space-y-10 border-t pt-10"}>
          {/* Skills */}
          {data.skills.length > 0 && (
            <div>
              <SectionTitle icon={Star}>Competências</SectionTitle>
              <div className="flex flex-wrap gap-1.5">
                {data.skills.map((skill, i) => (
                  <Badge 
                    key={i} 
                    variant="outline" 
                    className="border-slate-200 text-slate-600 font-bold px-2 py-0.5 rounded-md text-[8px] uppercase tracking-wider"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {data.languages.length > 0 && (
            <div>
              <SectionTitle icon={Globe}>Idiomas</SectionTitle>
              <div className="space-y-2">
                {data.languages.map((lang, i) => (
                  <div key={i} className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-tighter">{lang.name}</span>
                    <div className="h-1 flex-1 mx-3 bg-slate-100 rounded-full relative overflow-hidden">
                      <div className="absolute inset-y-0 left-0 bg-primary/40 rounded-full" style={{ width: lang.level === 'Fluente' || lang.level === 'Nativo' ? '100%' : lang.level === 'Avançado' ? '80%' : lang.level === 'Intermediário' ? '50%' : '25%' }} />
                    </div>
                    <span className="text-[8px] font-black text-slate-400">{lang.level}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certificates */}
          {data.certificates.length > 0 && (
            <div>
              <SectionTitle icon={Award}>Certificações</SectionTitle>
              <div className="space-y-3">
                {data.certificates.map((cert, i) => (
                  <div key={i} className="relative pl-3 before:absolute before:left-0 before:top-1.5 before:w-1 before:h-1 before:bg-primary/30 before:rounded-full">
                    <h5 className="text-[9px] font-black text-slate-900 leading-tight uppercase underline decoration-slate-100">{cert.name}</h5>
                    <p className="text-[8px] font-bold text-slate-400">{cert.issuer} • {cert.year}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer watermark */}
      <div className="mt-16 text-center opacity-20 pointer-events-none">
        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.5em]">Gerado via voocerto.com.br</p>
      </div>
    </Card>
  );
}
