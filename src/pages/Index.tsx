import { PageTransition } from '@/components/PageTransition';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { HeroSection } from '@/components/landing/HeroSection';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { MentorCards } from '@/components/landing/MentorCards';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { PlatformPreview } from '@/components/landing/PlatformPreview';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { PricingCards } from '@/components/landing/PricingCards';
import { FAQSection } from '@/components/landing/FAQSection';
import { CTASection } from '@/components/landing/CTASection';
import { Plane, Zap, Crown } from 'lucide-react';

const PLANS = [
  {
    id: 'solo',
    name: 'Solo',
    price: 'R$ 19,90',
    period: '/mês',
    icon: Plane,
    description: 'Ideal para quem está iniciando os estudos teóricos',
    features: [
      'Modo Livre e Bloco ilimitados',
      'Modo Banca oficial ANAC ilimitado',
      'Chat IA com Mike (2 msgs/questão)',
      'Guia de Carreiras completo da aviação',
      'Histórico e métricas de desempenho',
      'Conquistas: Medalhas Bronze e Prata',
      'Selo de Aprovação para LinkedIn',
      'Gerador de Currículo IA (1 currículo)',
    ],
    highlight: false,
    popular: false,
    checkoutLink: '/premium?plan=solo',
  },
  {
    id: 'tripulante',
    name: 'Tripulante',
    price: 'R$ 39,90',
    period: '/mês',
    icon: Zap,
    description: 'O melhor custo-benefício para acelerar sua aprovação',
    features: [
      'Tudo do plano Solo',
      'Chat IA com Mike (5 msgs/questão)',
      'Diagnóstico de Desempenho com Mike',
      'Conquistas: Bronze, Prata e Ouro',
      'Selo de Aprovação para LinkedIn',
      'Gerador de Currículo IA (até 3 currículos)',
      'Suporte prioritário da equipe',
    ],
    highlight: true,
    popular: true,
    checkoutLink: '/premium?plan=tripulante',
  },
  {
    id: 'comandante',
    name: 'Comandante',
    price: 'R$ 79,90',
    period: '/mês',
    icon: Crown,
    description: 'A preparação definitiva para garantir sua vaga no mercado',
    features: [
      'Tudo do plano Tripulante',
      'Chat IA Turbo com Mike (15 msgs/questão)',
      'Diagnóstico com Mike ilimitado',
      'Todas as Conquistas: Bronze, Prata, Ouro e Platina',
      'Selo de Aprovação para LinkedIn',
      'Gerador de Currículo IA (galeria ilimitada)',
      'Acesso antecipado a novos módulos',
    ],
    highlight: false,
    popular: false,
    checkoutLink: '/premium?plan=comandante',
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
            description: 'Plataforma de simulados com padrão ANAC, mentoria de IA e ferramentas de carreira para aviação civil.',
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

        {/* 2. Hero */}
        <HeroSection />

        {/* 3. Problema / Dor do candidato */}
        <ProblemSection />

        {/* 4. Mike — o assistente de IA */}
        <MentorCards />

        {/* 5. Funcionalidades reais em layout alternado */}
        <FeaturesSection />

        {/* 6. Preview interativo da plataforma */}
        <PlatformPreview />

        {/* 7. Planos & Preços */}
        <PricingCards plans={PLANS} />

        {/* 8. Depoimentos */}
        <TestimonialsSection />

        {/* 9. FAQ */}
        <FAQSection />

        {/* 10. CTA Final */}
        <CTASection />

        {/* 11. Footer */}
        <Footer />
      </div>
    </PageTransition>
  );
}
