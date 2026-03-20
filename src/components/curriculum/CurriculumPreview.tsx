import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, MapPin, Linkedin, Globe, Award, GraduationCap, Briefcase, Star, Info, CheckCircle2 } from 'lucide-react';

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
  const isModern = data.template === 'moderno';
  const isCreative = data.template === 'criativo';
  const isClassic = data.template === 'classico';

  // Primary color based on template
  const primaryColor = isModern ? 'text-blue-600' : isCreative ? 'text-purple-600' : 'text-slate-800';
  const primaryBg = isModern ? 'bg-blue-600' : isCreative ? 'bg-purple-600' : 'bg-slate-800';
  const accentColor = isModern ? 'text-blue-400' : isCreative ? 'text-purple-400' : 'text-slate-400';

  const SectionTitle = ({ children, icon: Icon }: { children: React.ReactNode, icon: any }) => (
    <div className="flex items-center gap-2 mb-3 border-b-2 border-slate-100 pb-1">
      <div className={`p-1 rounded-md ${primaryBg} bg-opacity-10`}>
        <Icon className={`w-3.5 h-3.5 ${primaryColor}`} />
      </div>
      <h3 className={`text-[11px] font-black uppercase tracking-[0.15em] ${primaryColor}`}>{children}</h3>
    </div>
  );

  return (
    <div className="flex justify-center bg-slate-100/50 p-4 md:p-8 min-h-screen">
      {/* 
        A4 Container 
        Width: 210mm (~794px at 96dpi)
        Height: 297mm (~1123px at 96dpi)
      */}
      <Card id="curriculum-content" className={`
        w-full max-w-[210mm] min-h-[297mm] bg-white text-slate-900 shadow-2xl rounded-none border-none 
        flex flex-col overflow-hidden relative print:shadow-none print:w-[210mm] print:h-[297mm]
        ${isCreative ? 'font-sans' : 'font-serif'}
      `}>
        
        {/* Template-specific Header */}
        <header className={`
          relative z-10 px-10 pt-12 pb-8
          ${isModern ? 'bg-slate-50 border-l-[12px] border-blue-600' : ''}
          ${isCreative ? 'bg-purple-600 text-white overflow-hidden' : ''}
          ${isClassic ? 'text-center border-b-4 border-slate-800 pb-10' : ''}
        `}>
          {isCreative && (
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
          )}

          <h1 className={`
            text-3xl md:text-4xl font-black tracking-tight uppercase leading-none mb-2
            ${isCreative ? 'text-white' : 'text-slate-900'}
          `}>
            {data.full_name || 'Seu Nome Completo'}
          </h1>
          <p className={`
            text-xs font-black uppercase tracking-[0.3em] mb-4
            ${isCreative ? 'text-purple-200' : primaryColor}
          `}>
            {data.profession || 'Cargo Desejado'}
          </p>

          <div className={`
            flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-bold
            ${isCreative ? 'text-purple-100/80' : 'text-slate-500'}
            ${isClassic ? 'justify-center' : 'justify-start'}
          `}>
            {data.email && <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 opacity-70" /> {data.email}</div>}
            {data.phone && <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 opacity-70" /> {data.phone}</div>}
            {data.city && <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 opacity-70" /> {data.city}</div>}
          </div>
        </header>

        {/* Body Layout */}
        <div className={`
          flex-1 grid grid-cols-1 md:grid-cols-12 gap-0 
          ${isClassic ? 'px-10 py-10' : ''}
        `}>
          
          {/* Main Column */}
          <div className={`
            ${(isModern || isCreative) ? 'md:col-span-8 px-10 py-10 order-1' : 'md:col-span-12'}
            space-y-8
          `}>
            {/* Summary */}
            {data.summary && (
              <section>
                <SectionTitle icon={Info}>Perfil Profissional</SectionTitle>
                <p className="text-[11px] leading-relaxed text-slate-600 font-medium text-justify">
                  {data.summary}
                </p>
              </section>
            )}

            {/* Experience */}
            {data.experience.length > 0 && (
              <section>
                <SectionTitle icon={Briefcase}>Trajetória Profissional</SectionTitle>
                <div className="space-y-6">
                  {data.experience.slice(0, 4).map((exp, i) => (
                    <div key={i} className="relative pl-4 before:absolute before:left-0 before:top-1.5 before:bottom-1 before:w-[1.5px] before:bg-slate-100 hover:before:bg-blue-200 transition-colors">
                      <div className="flex justify-between items-baseline mb-1">
                        <h4 className="text-[11px] font-black text-slate-900 uppercase">{exp.role}</h4>
                        <span className={`text-[9px] font-black ${accentColor}`}>
                          {exp.start} — {exp.end || 'Atual'}
                        </span>
                      </div>
                      <p className={`text-[10px] font-black ${primaryColor} mb-2`}>{exp.company}</p>
                      {exp.description && (
                        <p className="text-[10px] text-slate-500 leading-snug text-justify break-words">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Education */}
            {data.education.length > 0 && (
              <section>
                <SectionTitle icon={GraduationCap}>Formação Acadêmica</SectionTitle>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {data.education.map((edu, i) => (
                    <div key={i} className="bg-slate-50/50 p-3 rounded-lg border border-slate-100 border-l-4 border-l-slate-200">
                      <h4 className="text-[10px] font-black text-slate-800 leading-tight mb-1 uppercase">{edu.degree}</h4>
                      <p className="text-[9px] font-bold text-slate-500">{edu.institution}</p>
                      <p className={`text-[9px] font-black ${primaryColor} mt-1 opacity-70 uppercase`}>{edu.year}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar Column */}
          {(isModern || isCreative) && (
            <aside className={`
              md:col-span-4 px-8 py-10 order-2 flex flex-col gap-8
              ${isModern ? 'bg-slate-50' : 'bg-slate-50/30 border-l border-slate-100'}
            `}>
              {/* Skills */}
              {data.skills.length > 0 && (
                <section>
                  <SectionTitle icon={Star}>Competências</SectionTitle>
                  <div className="flex flex-wrap gap-2">
                    {data.skills.map((skill, i) => (
                      <div 
                        key={i} 
                        className={`text-[9px] font-bold py-1 px-2 rounded-full flex items-center gap-1 ${primaryBg} bg-opacity-5 ${primaryColor}`}
                      >
                        <CheckCircle2 className="w-2.5 h-2.5 opacity-50" /> {skill}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Languages */}
              {data.languages.length > 0 && (
                <section>
                  <SectionTitle icon={Globe}>Idiomas</SectionTitle>
                  <div className="space-y-3">
                    {data.languages.map((lang, i) => (
                      <div key={i} className="px-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-black text-slate-700 uppercase tracking-tighter">{lang.name}</span>
                          <span className="text-[8px] font-black text-slate-400 uppercase">{lang.level}</span>
                        </div>
                        <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${primaryBg}`} 
                            style={{ 
                              width: lang.level === 'Fluente' || lang.level === 'Nativo' ? '100%' : 
                                     lang.level === 'Avançado' ? '80%' : 
                                     lang.level === 'Intermediário' ? '50%' : '25%' 
                            }} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Certificates */}
              {data.certificates.length > 0 && (
                <section>
                  <SectionTitle icon={Award}>Certificações</SectionTitle>
                  <div className="space-y-4">
                    {data.certificates.map((cert, i) => (
                      <div key={i}>
                        <h5 className="text-[10px] font-black text-slate-900 leading-tight uppercase">{cert.name}</h5>
                        <p className="text-[9px] font-bold text-slate-400">{cert.issuer} • {cert.year}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </aside>
          )}
        </div>

        {/* Footer */}
        <footer className="px-10 py-6 border-t border-slate-50 text-center">
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">Gerado via voocerto.com.br</p>
        </footer>

      </Card>
    </div>
  );
}
