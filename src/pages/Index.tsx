import { PageTransition } from '@/components/PageTransition';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { HeroSection } from '@/components/landing/HeroSection';
import { NextStepSection } from '@/components/landing/NextStepSection';
import { FeaturesTicker } from '@/components/landing/FeaturesTicker';

import { ExamModesSection } from '@/components/landing/ExamModesSection';
import { DashboardPreviewSection } from '@/components/landing/DashboardPreviewSection';
import { MikeAssistantSection } from '@/components/landing/MikeAssistantSection';
import { CareerGuidesSection } from '@/components/landing/CareerGuidesSection';
import { InsigniasSection } from '@/components/landing/InsigniasSection';



import { PricingCards } from '@/components/landing/PricingCards';
import { FAQSection } from '@/components/landing/FAQSection';
import { CTASection } from '@/components/landing/CTASection';
import { Crown } from 'lucide-react';

const PLANS = [
  {
    id: 'completo',
    name: 'Completo',
    price: 'R$ 29,90',
    period: '/mês',
    icon: Crown,
    description: 'Acesso total a todas as ferramentas para acelerar sua aprovação',
    features: [
      'Modo Livre com IA',
      'Modo Banca oficial ANAC ilimitado',
      'Modo Bloco liberado',
      'Chat IA com Mike (10 msgs/questão, até 80/dia)',
      'Diagnóstico de Desempenho com Mike',
      'Progresso completo e histórico',
      'Conquistas até o nível Platina',
      'Selo "Aprovado ANAC" (LinkedIn)',
      'Gerador de Currículo IA ilimitado (modelo ATS/Digital)',
    ],
    highlight: true,
    popular: true,
    checkoutLink: '/premium?plan=completo',
  },
];

export default function Index() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
        {/* Structured Data for SEO */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'Voe Certo',
            description: 'Plataforma de preparação e acompanhamento de carreira para aviação civil — simulados ANAC, mentoria de IA e selo LinkedIn.',
            operatingSystem: 'Web, Android, iOS',
            applicationCategory: 'EducationalApplication',
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.9',
              ratingCount: '1250',
            },
            offers: {
              '@type': 'Offer',
              price: '19.90',
              priceCurrency: 'BRL',
            },
          })}
        </script>

        {/* 1. Header */}
        <Header />

        {/* 2. Hero Section */}
        <HeroSection />

        {/* 2.1 Tarja Animada de Recursos (Ticker) */}
        <NextStepSection />

        {/* Tarja de Recursos Animada */}
        <FeaturesTicker />

        {/* 3. Modos de Simulado */}
        
        <ExamModesSection />
        <DashboardPreviewSection />

        {/* 4. Assistente Mike */}
        <MikeAssistantSection />

        {/* 4.1 Insígnias de Progresso */}
        <InsigniasSection />

        {/* 4.2 Guias de Carreira */}
        <CareerGuidesSection />


        

        
        

        
        

        {/* 8. Planos & Preços */}
        <PricingCards plans={PLANS} />

        {/* 9. Perguntas Frequentes (FAQ) */}
        <FAQSection />

        {/* 10. CTA Final */}
        <CTASection />

        {/* 11. Footer */}
        <Footer />
      </div>
    </PageTransition>
  );
}
