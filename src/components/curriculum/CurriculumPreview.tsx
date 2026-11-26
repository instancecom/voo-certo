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
  return (
    <Card 
      id="curriculum-content" 
      className="w-full max-w-[210mm] mx-auto min-h-[297mm] bg-white text-slate-900 shadow-xl rounded-none border-none flex flex-col overflow-hidden relative print:shadow-none print:w-[210mm] print:h-[297mm] print:m-0 font-sans text-[11pt]"
    >
      {/* ------------------------------------------------------------- */}
      {/* MODELO ÚNICO: DIGITAL / ATS (Optimized for Gupy, Catho, LinkedIn) */}
      {/* ------------------------------------------------------------- */}
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
    </Card>
  );
}
