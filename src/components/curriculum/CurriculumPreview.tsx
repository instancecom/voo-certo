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
  const isElite = data.template === 'elite';
  const isExecutivo = data.template === 'executivo';
  const isModerno = data.template === 'moderno';

  // Primary colors based on new templates
  const primaryColor = isElite ? 'text-[#1A233A]' : isExecutivo ? 'text-slate-900' : 'text-blue-600';
  const primaryBg = isElite ? 'bg-[#1A233A]' : isExecutivo ? 'bg-slate-900' : 'bg-blue-600';
  const accentColor = isElite ? 'text-blue-500' : isExecutivo ? 'text-slate-400' : 'text-blue-400';

  const SectionTitle = ({ children, icon: Icon }: { children: React.ReactNode, icon: any }) => (
    <div className={`flex items-center gap-2 mb-4 ${isExecutivo ? 'justify-center border-b pb-2' : 'border-b-2 border-slate-100 pb-1'}`}>
      {!isExecutivo && (
        <div className={`p-1.5 rounded-[4px] ${primaryBg} bg-opacity-10`}>
          <Icon className={`w-3.5 h-3.5 ${primaryColor}`} />
        </div>
      )}
      <h3 className={`text-[11px] font-black uppercase tracking-[0.2em] ${primaryColor}`}>{children}</h3>
    </div>
  );

  return (
    <Card id="curriculum-content" className={`
      w-full max-w-[210mm] mx-auto min-h-[297mm] bg-white text-slate-900 shadow-none rounded-none border-none 
        flex flex-col overflow-hidden relative print:shadow-none print:w-[210mm] print:h-[297mm]
        ${isExecutivo ? 'font-serif' : 'font-sans'}
      `}>
        
        {/* Template-specific Header */}
        <header className={`
          relative z-10 px-10 pt-14 pb-10
          ${isElite ? 'bg-[#1A233A] text-white' : ''}
          ${isExecutivo ? 'text-center pt-16 pb-12' : ''}
          ${isModerno ? 'bg-slate-50 border-b border-slate-200' : ''}
        `}>
          <h1 className={`
            font-black tracking-tight uppercase leading-tight mb-3
            ${isElite ? 'text-white' : 'text-slate-900'}
            ${(data.full_name?.length || 0) > 35 ? 'text-xl' : (data.full_name?.length || 0) > 25 ? 'text-2xl' : 'text-3xl md:text-4xl'}
          `}>
            {data.full_name || 'Seu Nome Completo'}
          </h1>
          <p className={`
            text-sm font-bold uppercase tracking-[0.4em] mb-6
            ${isElite ? 'text-blue-400' : isExecutivo ? 'text-slate-500' : 'text-blue-600'}
          `}>
            {data.profession || 'Cargo Desejado'}
          </p>

          <div className={`
            flex flex-wrap gap-x-8 gap-y-3 text-[10px] font-bold
            ${isElite ? 'text-slate-300' : 'text-slate-500'}
            ${isExecutivo ? 'justify-center border-t border-slate-100 pt-6' : 'justify-start'}
          `}>
            {data.email && <div className="flex items-center gap-2"><Mail className="w-4 h-4 opacity-70" /> {data.email}</div>}
            {data.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 opacity-70" /> {data.phone}</div>}
            {data.city && <div className="flex items-center gap-2"><MapPin className="w-4 h-4 opacity-70" /> {data.city}</div>}
          </div>
        </header>

        {/* Body Layout */}
        <div className={`
          flex-1 flex flex-col md:flex-row gap-0
        `}>
          
          {/* Sidebar - only for Elite and Moderno */}
          {(isElite || isModerno) && (
            <aside className={`
              w-full md:w-[32%] px-8 py-12 flex flex-col gap-10
              ${isElite ? 'bg-slate-50 border-r border-slate-100' : 'bg-white order-2 border-l border-slate-100'}
            `}>
              {/* Skills */}
              {data.skills.length > 0 && (
                <section>
                  <SectionTitle icon={Star}>Competências</SectionTitle>
                  <div className="flex flex-wrap gap-2">
                    {data.skills.map((skill, i) => (
                      <div 
                        key={i} 
                        className={`text-[9px] font-bold py-1.5 px-2.5 rounded-[4px] border ${isElite ? 'bg-white border-slate-200' : 'bg-blue-50 border-blue-100'} text-slate-700`}
                      >
                        {skill}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Languages */}
              {data.languages.length > 0 && (
                <section>
                  <SectionTitle icon={Globe}>Idiomas</SectionTitle>
                  <div className="space-y-4">
                    {data.languages.map((lang, i) => (
                      <div key={i} className="px-1">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-[10px] font-black text-slate-800 uppercase">{lang.name}</span>
                          <span className="text-[8px] font-bold text-slate-400 uppercase">{lang.level}</span>
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
                  <div className="space-y-5">
                    {data.certificates.map((cert, i) => (
                      <div key={i} className="group">
                        <h5 className="text-[10px] font-black text-slate-900 leading-tight uppercase group-hover:text-blue-600 transition-colors">{cert.name}</h5>
                        <p className="text-[9px] font-bold text-slate-400 mt-1">{cert.issuer} • {cert.year}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </aside>
          )}

          {/* Main Column */}
          <div className={`
            flex-1 px-10 py-12 space-y-10
            ${isExecutivo ? 'max-w-4xl mx-auto' : ''}
            ${isModerno ? 'order-1' : ''}
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
                <div className="space-y-8">
                  {data.experience.map((exp, i) => (
                    <div key={i} className="relative pl-6 border-l-2 border-slate-100">
                      <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-white ${primaryBg}`} />
                      <div className="flex justify-between items-baseline mb-2">
                        <h4 className="text-xs font-black text-slate-900 uppercase">{exp.role}</h4>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded bg-slate-100 ${accentColor}`}>
                          {exp.start} — {exp.end || 'Atual'}
                        </span>
                      </div>
                      <p className={`text-[10px] font-black ${primaryColor} mb-3 opacity-80`}>{exp.company}</p>
                      {exp.description && (
                        <p className="text-[10px] text-slate-500 leading-relaxed text-justify">
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
                <div className={`grid ${isExecutivo ? 'grid-cols-1' : 'grid-cols-2'} gap-6`}>
                  {data.education.map((edu, i) => (
                    <div key={i} className="group">
                      <h4 className="text-[10px] font-black text-slate-800 leading-tight mb-1 uppercase group-hover:text-blue-600 transition-colors">{edu.degree}</h4>
                      <p className="text-[9px] font-bold text-slate-500">{edu.institution}</p>
                      <p className={`text-[9px] font-black ${primaryColor} mt-1.5 opacity-60 uppercase tracking-widest`}>{edu.year}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* If Executivo, show skills/langs at the bottom */}
            {isExecutivo && (
              <div className="grid grid-cols-2 gap-10 pt-10 border-t border-slate-100">
                {data.skills.length > 0 && (
                  <section>
                    <SectionTitle icon={Star}>Competências</SectionTitle>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {data.skills.map((skill, i) => (
                        <span key={i} className="text-[9px] font-bold text-slate-600">{skill} •</span>
                      ))}
                    </div>
                  </section>
                )}
                {data.languages.length > 0 && (
                  <section>
                    <SectionTitle icon={Globe}>Idiomas</SectionTitle>
                    <div className="space-y-1 text-center">
                      {data.languages.map((lang, i) => (
                        <p key={i} className="text-[10px] font-black text-slate-800 uppercase">{lang.name} - {lang.level}</p>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="px-10 py-8 border-t border-slate-50 text-center">
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.5em]">Gerado via voocerto.com.br</p>
        </footer>

    </Card>
  );
}
