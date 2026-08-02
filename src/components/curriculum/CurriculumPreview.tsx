import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, MapPin, Award, GraduationCap, Briefcase, Star, FileText, CheckCircle2, Sparkles, Shield } from 'lucide-react';

export interface Experience {
  company: string;
  role: string;
  start: string;
  end: string;
  description: string;
}

export interface Education {
  institution: string;
  degree: string;
  year: string;
}

export interface Certificate {
  name: string;
  issuer: string;
  year: string;
}

export interface Language {
  name: string;
  level: string;
}

export interface CurriculumData {
  id?: string;
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
  template: string; // 'ats' | 'geral' | 'presencial' (or legacy fallback)
  recommended_template?: string;
  recommendation_reason?: string;
  updated_at?: string;
}

interface CurriculumPreviewProps {
  data: CurriculumData;
}

export function CurriculumPreview({ data }: CurriculumPreviewProps) {
  // Normalize template name
  const templateMode = (data.template || 'ats').toLowerCase();
  const isATS = templateMode === 'ats' || templateMode === 'classico';
  const isGeral = templateMode === 'geral' || templateMode === 'executivo';
  const isPresencial = templateMode === 'presencial' || templateMode === 'elite' || templateMode === 'moderno';

  return (
    <Card 
      id="curriculum-content" 
      className={`
        w-full max-w-[210mm] mx-auto min-h-[297mm] bg-white text-slate-900 shadow-xl rounded-none border-none 
        flex flex-col overflow-hidden relative print:shadow-none print:w-[210mm] print:h-[297mm] print:m-0
        ${isATS ? 'font-sans text-[11pt]' : isGeral ? 'font-sans text-[10.5pt]' : 'font-sans text-[11pt]'}
      `}
    >
      {/* ------------------------------------------------------------- */}
      {/* MODELO 1: DIGITAL / ATS (Optimized for Gupy, Catho, LinkedIn) */}
      {/* ------------------------------------------------------------- */}
      {isATS && (
        <div className="p-10 flex-1 flex flex-col justify-between">
          <div>
            {/* ATS Header */}
            <header className="border-b-2 border-slate-900 pb-5 mb-6">
              <h1 className="text-3xl font-bold uppercase tracking-tight text-slate-900 mb-1">
                {data.full_name || 'Seu Nome Completo'}
              </h1>
              <p className="text-base font-semibold text-slate-700 uppercase tracking-wide mb-3">
                {data.profession || 'Cargo Desejado'}
              </p>
              <div className="flex flex-wrap gap-y-1 gap-x-4 text-xs text-slate-600 font-medium">
                {data.city && <span>📍 {data.city}</span>}
                {data.phone && <span>📞 {data.phone}</span>}
                {data.email && <span>✉️ {data.email}</span>}
              </div>
            </header>

            {/* Resumo Profissional */}
            {data.summary && (
              <section className="mb-6">
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-2">
                  Resumo Profissional
                </h2>
                <p className="text-xs text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                  {data.summary}
                </p>
              </section>
            )}

            {/* Experiência Profissional */}
            {data.experience && data.experience.length > 0 && (
              <section className="mb-6">
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-3">
                  Experiência Profissional
                </h2>
                <div className="space-y-4">
                  {data.experience.map((exp, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs font-bold text-slate-900">{exp.role}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{exp.start} - {exp.end || 'Atual'}</span>
                      </div>
                      <p className="text-[11px] font-semibold text-slate-700">{exp.company}</p>
                      {exp.description && (
                        <p className="text-[10.5px] text-slate-600 mt-1 leading-normal whitespace-pre-line">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Formação Acadêmica */}
            {data.education && data.education.length > 0 && (
              <section className="mb-6">
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-3">
                  Formação Acadêmica
                </h2>
                <div className="space-y-2">
                  {data.education.map((edu, idx) => (
                    <div key={idx} className="flex justify-between items-baseline">
                      <div>
                        <span className="text-xs font-bold text-slate-900">{edu.degree}</span>
                        <span className="text-xs text-slate-600"> — {edu.institution}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{edu.year}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Idiomas & Certificações em 2 colunas texto */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              {data.languages && data.languages.length > 0 && (
                <section>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-2">
                    Idiomas
                  </h2>
                  <ul className="text-xs text-slate-700 space-y-1">
                    {data.languages.map((lang, idx) => (
                      <li key={idx}>
                        <span className="font-semibold">{lang.name}:</span> {lang.level}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {data.certificates && data.certificates.length > 0 && (
                <section>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-2">
                    Cursos e Certificações
                  </h2>
                  <ul className="text-xs text-slate-700 space-y-1">
                    {data.certificates.map((cert, idx) => (
                      <li key={idx}>
                        <span className="font-semibold">{cert.name}</span> ({cert.issuer} - {cert.year})
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>

            {/* Habilidades & Competências */}
            {data.skills && data.skills.length > 0 && (
              <section>
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-2">
                  Competências Chave
                </h2>
                <p className="text-xs text-slate-700 leading-normal">
                  {data.skills.join(' • ')}
                </p>
              </section>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODELO 2: PROFISSIONAL GERAL (Ideal for PDF email attachments) */}
      {/* ------------------------------------------------------------- */}
      {isGeral && (
        <div className="flex-1 flex flex-col justify-between">
          {/* Top Navy Header Banner */}
          <header className="bg-slate-900 text-white px-10 py-10 border-b-4 border-sky-500">
            <h1 className="text-3xl font-black uppercase tracking-tight text-white mb-1">
              {data.full_name || 'Seu Nome Completo'}
            </h1>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-sky-400 mb-4">
              {data.profession || 'Cargo Desejado'}
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-300 font-medium pt-2 border-t border-slate-800">
              {data.city && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-sky-400" /> {data.city}</span>}
              {data.phone && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-sky-400" /> {data.phone}</span>}
              {data.email && <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-sky-400" /> {data.email}</span>}
            </div>
          </header>

          <div className="p-10 flex-1 space-y-6">
            {/* Resumo */}
            {data.summary && (
              <section>
                <div className="flex items-center gap-2 mb-2 pb-1 border-b border-slate-200">
                  <FileText className="w-4 h-4 text-sky-600" />
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">Perfil Profissional</h2>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {data.summary}
                </p>
              </section>
            )}

            {/* Experiência */}
            {data.experience && data.experience.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3 pb-1 border-b border-slate-200">
                  <Briefcase className="w-4 h-4 text-sky-600" />
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">Trajetória Profissional</h2>
                </div>
                <div className="space-y-4">
                  {data.experience.map((exp, idx) => (
                    <div key={idx} className="relative pl-4 border-l-2 border-sky-100">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <span className="text-xs font-bold text-slate-900">{exp.role}</span>
                        <Badge variant="outline" className="text-[9px] font-mono border-slate-200 text-slate-500">
                          {exp.start} - {exp.end || 'Atual'}
                        </Badge>
                      </div>
                      <p className="text-[11px] font-semibold text-sky-700 mb-1">{exp.company}</p>
                      {exp.description && (
                        <p className="text-[10.5px] text-slate-600 leading-relaxed">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Formação Acadêmica */}
            {data.education && data.education.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3 pb-1 border-b border-slate-200">
                  <GraduationCap className="w-4 h-4 text-sky-600" />
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">Formação Acadêmica</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {data.education.map((edu, idx) => (
                    <div key={idx} className="p-2.5 rounded bg-slate-50 border border-slate-100">
                      <p className="text-xs font-bold text-slate-900">{edu.degree}</p>
                      <p className="text-[11px] text-slate-600">{edu.institution}</p>
                      <p className="text-[9px] font-mono text-slate-400 mt-1">{edu.year}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Grid Idiomas & Certificações */}
            <div className="grid grid-cols-2 gap-6">
              {data.languages && data.languages.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-2 pb-1 border-b border-slate-200">
                    <Star className="w-4 h-4 text-sky-600" />
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">Idiomas</h2>
                  </div>
                  <div className="space-y-1.5">
                    {data.languages.map((lang, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-800">{lang.name}</span>
                        <span className="text-[10px] text-sky-700 bg-sky-50 px-2 py-0.5 rounded font-medium">{lang.level}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {data.certificates && data.certificates.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-2 pb-1 border-b border-slate-200">
                    <Award className="w-4 h-4 text-sky-600" />
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">Certificações</h2>
                  </div>
                  <div className="space-y-1.5">
                    {data.certificates.map((cert, idx) => (
                      <div key={idx} className="text-xs">
                        <p className="font-semibold text-slate-800">{cert.name}</p>
                        <p className="text-[10px] text-slate-500">{cert.issuer} • {cert.year}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Habilidades */}
            {data.skills && data.skills.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-2 pb-1 border-b border-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-sky-600" />
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">Competências Destacadas</h2>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {data.skills.map((skill, idx) => (
                    <Badge key={idx} variant="secondary" className="bg-slate-100 text-slate-800 border-slate-200 text-[10px] font-semibold">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODELO 3: PRESENCIAL / IMPRESSO (High visual impact for paper) */}
      {/* ------------------------------------------------------------- */}
      {isPresencial && (
        <div className="flex-1 flex flex-col justify-between">
          {/* High Contrast Top Header */}
          <header className="bg-slate-950 text-white px-10 pt-12 pb-10 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-full bg-amber-500/10 skew-x-12 transform origin-top-right" />
            
            <div className="relative z-10">
              <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white mb-2">
                {data.full_name || 'Seu Nome Completo'}
              </h1>
              <div className="inline-block px-3 py-1 rounded bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-widest mb-6">
                {data.profession || 'Cargo Desejado'}
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-300 font-medium pt-3 border-t border-slate-800">
                {data.city && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-amber-400" /> {data.city}</span>}
                {data.phone && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-amber-400" /> {data.phone}</span>}
                {data.email && <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-amber-400" /> {data.email}</span>}
              </div>
            </div>
          </header>

          <div className="p-10 flex-1 space-y-6 bg-white">
            {/* Resumo */}
            {data.summary && (
              <section className="bg-slate-50 p-4 rounded-lg border-l-4 border-amber-400">
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-900 mb-1.5">Objetivo & Perfil</h2>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {data.summary}
                </p>
              </section>
            )}

            {/* Experiência */}
            {data.experience && data.experience.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-5 bg-amber-400 rounded-sm" />
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">Experiência de Trabalho</h2>
                </div>
                <div className="space-y-4">
                  {data.experience.map((exp, idx) => (
                    <div key={idx} className="p-3.5 rounded-lg border border-slate-200 bg-white">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-xs font-black text-slate-900">{exp.role}</span>
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                          {exp.start} - {exp.end || 'Atual'}
                        </span>
                      </div>
                      <p className="text-[11px] font-bold text-slate-600 mb-2">{exp.company}</p>
                      {exp.description && (
                        <p className="text-[10.5px] text-slate-600 leading-relaxed">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Formação Acadêmica & Idiomas */}
            <div className="grid grid-cols-2 gap-6">
              {data.education && data.education.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-5 bg-amber-400 rounded-sm" />
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">Formação</h2>
                  </div>
                  <div className="space-y-2">
                    {data.education.map((edu, idx) => (
                      <div key={idx} className="border-b border-slate-100 pb-2">
                        <p className="text-xs font-bold text-slate-900">{edu.degree}</p>
                        <p className="text-[10px] text-slate-600">{edu.institution} • {edu.year}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {data.languages && data.languages.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-5 bg-amber-400 rounded-sm" />
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">Idiomas</h2>
                  </div>
                  <div className="space-y-2">
                    {data.languages.map((lang, idx) => (
                      <div key={idx} className="flex justify-between items-center border-b border-slate-100 pb-1.5 text-xs">
                        <span className="font-bold text-slate-900">{lang.name}</span>
                        <span className="text-[10px] font-semibold text-slate-600">{lang.level}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Certificações & Habilidades */}
            <div className="grid grid-cols-2 gap-6">
              {data.certificates && data.certificates.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-5 bg-amber-400 rounded-sm" />
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">Cursos & Certificações</h2>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    {data.certificates.map((cert, idx) => (
                      <div key={idx}>
                        <p className="font-bold text-slate-900">{cert.name}</p>
                        <p className="text-[10px] text-slate-500">{cert.issuer} ({cert.year})</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {data.skills && data.skills.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-5 bg-amber-400 rounded-sm" />
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">Habilidades</h2>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {data.skills.map((skill, idx) => (
                      <Badge key={idx} className="bg-slate-900 text-white hover:bg-slate-800 text-[9.5px] font-bold">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
