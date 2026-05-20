import fs from 'fs';
import path from 'path';

const ICON_PATHS = {
  Plane: '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3.5c-.5-.5-2.5 0-4 1.5L13.5 8.5 5.3 6.7c-.9-.2-1.8.3-2 1.2-.2.6 0 1.2.4 1.6l6.8 4.3-3 3-3.6-.9c-.6-.2-1.3 0-1.7.5-.4.5-.4 1.3 0 1.7l1.9 1.9 1.9 1.9c.4.4 1.2.4 1.7 0 .5-.4.7-1.1.5-1.7l-.9-3.6 3-3 4.3 6.8c.4.4 1 .6 1.6.4.9-.2 1.4-1.1 1.2-2z"/>',
  TrendingUp: '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
  Shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  CalendarCheck: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="m9 16 2 2 4-4"/>',
  Wind: '<path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/>',
  Compass: '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
  Radio: '<circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/>',
  AlertTriangle: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  LogIn: '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>',
  HelpCircle: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  Star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  Sparkle: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  Headphones: '<path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>',
  ShieldCheck: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  Calendar: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  CheckCircle: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
  Layers: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polygon points="2 17 12 22 22 17"/><polygon points="2 12 12 17 22 12"/>',
  Users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  Sparkles: '<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5.5 5 3Z"/><path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5Z"/>',
  Flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  MessageCircle: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
  CloudSun: '<path d="M12 2v2M4.93 4.93l1.41 1.41M20 12h2M17.66 17.66l1.41 1.41M12 20v2M6.34 17.66l-1.41 1.41M2 12h2M14 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3a5 5 0 0 0 6.6 5.7h10.8a3.5 3.5 0 0 0 0-7z"/>',
  Package: '<line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><polygon points="12 22.08 12 12 3 6.92 3 17.08 12 22.08"/><polygon points="12 22.08 21 17.08 21 6.92 12 12 12 22.08"/><polygon points="12 12 21 6.92 12 2 3 6.92 12 12"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
  Award: '<circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>',
  Heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  User: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  Crown: '<path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7z"/>',
  BadgeCheck: '<path d="M3.85 8.62a4 4 0 0 1-1.78-3.44a4 4 0 0 1 3.44-1.78a4 4 0 0 1 3.44 1.78a4 4 0 0 1 1.78 3.44a4 4 0 0 1-1.78 3.44a4 4 0 0 1-3.44 1.78a4 4 0 0 1-3.44-1.78zm4.15 4.38l2 2 4-4"/>',
  Sunrise: '<path d="M12 2v8M5.22 10.22l1.42 1.42M12 22h10M17.36 10.22l-1.42 1.42M22 22H2M16 22a4 4 0 0 0-8 0"/>',
  GraduationCap: '<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/>',
  Globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  ShieldAlert: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
  Database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/>',
  Medal: '<path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 3.28a2 2 0 0 1 2.24-.4L12 4.75l5.36-1.87a2 2 0 0 1 2.24.4l1.61 1.66a2 2 0 0 1 .13 2.2L16.79 15"/><circle cx="12" cy="12" r="7"/>',
  Mic: '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"/>',
  Zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  FolderCheck: '<path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z"/><path d="m9 13 2 2 4-4"/>',
  Gauge: '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
  PlaneTakeoff: '<path d="M2 22h20M6.3 20.3a24 24 0 0 1 12-16.7l.7 1.3a22 22 0 0 0-11 15.4zM21 16a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v7z"/>',
  Trophy: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34M12 2a6 6 0 0 0-6 6v3.5c0 3.3 2.7 6 6 6s6-2.7 6-6V8a6 6 0 0 0-6-6z"/>',
  Building: '<rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="9" y1="22" x2="9" y2="16"/><line x1="15" y1="22" x2="15" y2="16"/><line x1="9" y1="16" x2="15" y2="16"/><path d="M8 6h2v2H8zm6 0h2v2h-2zm-6 4h2v2H8zm6 0h2v2h-2zm-6 4h2v2H8zm6 0h2v2h-2z"/>',
  Feather: '<path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" y1="8" x2="2" y2="22"/><line x1="17.5" y1="15" x2="9" y2="20.5"/>',
  CalendarDays: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/>',
  Gem: '<polygon points="12 2 22 8.5 17 21 7 21 2 8.5 12 2"/><polygon points="12 2 17 8.5 12 22 7 8.5 12 2"/><line x1="2" y1="8.5" x2="22" y2="8.5"/>',
  Languages: '<path d="m5 8 6 6M4 14l6-6M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6"/>',
  Infinity: '<path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 1 0 0-8c-2 0-4 1.33-6 4Z"/>',
  Building2: '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18M18 22H4M14 6h2v2h-2zm0 4h2v2h-2zm0 4h2v2h-2zm0 4h2v2h-2zM8 6h2v2H8zm0 4h2v2H8zm0 4h2v2H8zm0 4h2v2H8z"/>',
  Rocket: '<path d="M4.5 16.5c-1.5 1.26-2.5 3.19-2.5 5.5s3.19 1 5.5-1l1.5-1.5-4.5-3zM12 15l-3-3M22 2c-3 0-10 4-11.5 6L8 10.5 13.5 16l2.5-2.5C18 12 22 5 22 2zM9 15l-4.5 4.5M15 9l4.5-4.5"/>',
  CircleDot: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="1"/>',
  Sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M17.66 6.34l1.41-1.41"/>'
};

const INSIGNIAS_LIST = [
  // Bronze
  { name: 'Primeiro Voo', slug: 'primeiro-voo', rarity: 'bronze', icon: 'Plane' },
  { name: 'Decolagem', slug: 'decolagem', rarity: 'bronze', icon: 'TrendingUp' },
  { name: 'Turbulência Superada', slug: 'turbulencia-superada', rarity: 'bronze', icon: 'Shield' },
  { name: 'Cinto Afivelado', slug: 'cinto-afivelado', rarity: 'bronze', icon: 'CalendarCheck' },
  { name: 'Asa Delta', slug: 'asa-delta', rarity: 'bronze', icon: 'Wind' },
  { name: 'Navegante Básico', slug: 'navegante-basico', rarity: 'bronze', icon: 'Compass' },
  { name: 'Rádio Ligado', slug: 'radio-ligado', rarity: 'bronze', icon: 'Radio' },
  { name: 'Emergência Controlada', slug: 'emergencia-controlada', rarity: 'bronze', icon: 'AlertTriangle' },
  { name: 'Check-in Feito', slug: 'check-in-feito', rarity: 'bronze', icon: 'LogIn' },
  { name: 'Tripulante Novato', slug: 'tripulante-novato', rarity: 'bronze', icon: 'HelpCircle' },

  // Silver
  { name: 'Asa Prateada', slug: 'asa-prateada', rarity: 'silver', icon: 'Star' },
  { name: 'Mestre do Rádio', slug: 'mestre-do-radio', rarity: 'silver', icon: 'Headphones' },
  { name: 'Turbulência Mestre', slug: 'turbulencia-mestre', rarity: 'silver', icon: 'ShieldCheck' },
  { name: '7 Dias no Ar', slug: '7-dias-no-ar', rarity: 'silver', icon: 'Calendar' },
  { name: 'Aprovado na Banca', slug: 'aprovado-na-banca', rarity: 'silver', icon: 'CheckCircle' },
  { name: 'Colecionador de Blocos', slug: 'colecionador-de-blocos', rarity: 'silver', icon: 'Layers' },
  { name: 'Piloto de Cabine', slug: 'piloto-de-cabine', rarity: 'silver', icon: 'Users' },
  { name: 'Estrela em Ascensão', slug: 'estrela-em-ascensao', rarity: 'silver', icon: 'Sparkles' },
  { name: 'Sobrevivente de Emergência', slug: 'sobrevivente-de-emergencia', rarity: 'silver', icon: 'Flame' },
  { name: 'Comunicador Nato', slug: 'comunicador-nato', rarity: 'silver', icon: 'MessageCircle' },
  { name: '30 Dias no Céu', slug: '30-dias-no-ceu', rarity: 'silver', icon: 'CloudSun' },
  { name: 'Conquistador de Blocos', slug: 'conquistador-de-blocos', rarity: 'silver', icon: 'Package' },
  { name: 'Aprovado 3x', slug: 'aprovado-3x', rarity: 'silver', icon: 'Award' },
  { name: 'Mestre da Calma', slug: 'mestre-da-calma', rarity: 'silver', icon: 'Heart' },
  { name: 'Tripulante Prata', slug: 'tripulante-prata', rarity: 'silver', icon: 'User' },

  // Gold
  { name: 'Asa de Ouro', slug: 'asa-de-ouro', rarity: 'gold', icon: 'Crown' },
  { name: 'Comandante de Cabine', slug: 'comandante-de-cabine', rarity: 'gold', icon: 'BadgeCheck' },
  { name: '100 Dias no Ar', slug: '100-dias-no-ar', rarity: 'gold', icon: 'Sunrise' },
  { name: 'Mestre Geral', slug: 'mestre-geral', rarity: 'gold', icon: 'GraduationCap' },
  { name: 'Poliglota Aeronáutico', slug: 'poliglota-aeronautico', rarity: 'gold', icon: 'Globe' },
  { name: 'Sobrevivente Supremo', slug: 'sobrevivente-supremo', rarity: 'gold', icon: 'ShieldAlert' },
  { name: '1000 Questões', slug: '1000-questoes', rarity: 'gold', icon: 'Database' },
  { name: 'Aprovado 10x', slug: 'aprovado-10x', rarity: 'gold', icon: 'Medal' },
  { name: 'Lenda da Entrevista', slug: 'lenda-da-entrevista', rarity: 'gold', icon: 'Mic' },
  { name: 'Treinador Épico', slug: 'treinador-epico', rarity: 'gold', icon: 'Zap' },
  { name: 'Colecionador Supremo', slug: 'colecionador-supremo', rarity: 'gold', icon: 'FolderCheck' },
  { name: 'Estrela do Céu', slug: 'estrela-do-ceu', rarity: 'gold', icon: 'Sparkle' },
  { name: 'Mestre da Pressão', slug: 'mestre-da-pressao', rarity: 'gold', icon: 'Gauge' },
  { name: 'Piloto de Elite', slug: 'piloto-de-elite', rarity: 'gold', icon: 'PlaneTakeoff' },
  { name: 'Capitão de Conquistas', slug: 'capitao-de-conquistas', rarity: 'gold', icon: 'Trophy' },

  // Platinum
  { name: 'Lenda da ANAC', slug: 'lenda-da-anac', rarity: 'platinum', icon: 'Building' },
  { name: 'Asa Imortal', slug: 'asa-imortal', rarity: 'platinum', icon: 'Feather' },
  { name: '365 Dias no Ar', slug: '365-dias-no-ar', rarity: 'platinum', icon: 'CalendarDays' },
  { name: 'Mestre Absoluto', slug: 'mestre-absoluto', rarity: 'platinum', icon: 'Gem' },
  { name: 'Poliglota Supremo', slug: 'poliglota-supremo', rarity: 'platinum', icon: 'Languages' },
  { name: '5000 Questões', slug: '5000-questoes', rarity: 'platinum', icon: 'Infinity' },
  { name: 'Conquistador de Companhias', slug: 'conquistador-de-companhias', rarity: 'platinum', icon: 'Building2' },
  { name: 'Lenda Viva', slug: 'lenda-viva', rarity: 'platinum', icon: 'Rocket' },
  { name: 'Comandante Lendário', slug: 'comandante-lendario', rarity: 'platinum', icon: 'CircleDot' },
  { name: 'Voo Eterno', slug: 'voo-eterno', rarity: 'platinum', icon: 'Sun' }
];

function getBadgeTemplate(rarity, name, innerIconPath) {
  let outerRimColor, outerRingGrad, textGrad, innerAccentColor;

  if (rarity === 'bronze') {
    outerRimColor = 'url(#bronzeRimGrad)';
    outerRingGrad = 'bronzeRimGrad';
    textGrad = 'bronzeGrad';
    innerAccentColor = '#CD7F32';
  } else if (rarity === 'silver') {
    outerRimColor = 'url(#silverRimGrad)';
    outerRingGrad = 'silverRimGrad';
    textGrad = 'silverGrad';
    innerAccentColor = '#C0C0C0';
  } else if (rarity === 'gold') {
    outerRimColor = 'url(#goldRimGrad)';
    outerRingGrad = 'goldRimGrad';
    textGrad = 'goldGrad';
    innerAccentColor = '#D4AF37';
  } else {
    outerRimColor = 'url(#platRimGrad)';
    outerRingGrad = 'platRimGrad';
    textGrad = 'platGrad';
    innerAccentColor = '#00F2FE';
  }

  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <!-- Filter for 3D metallic drop shadow -->
    <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="12" stdDeviation="8" flood-color="#0F172A" flood-opacity="0.6" />
    </filter>
    
    <!-- Gradients by Rarity -->
    <!-- Bronze -->
    <linearGradient id="bronzeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E5A97F" />
      <stop offset="50%" stop-color="#CD7F32" />
      <stop offset="100%" stop-color="#8B4513" />
    </linearGradient>
    <linearGradient id="bronzeRimGrad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#8B4513" />
      <stop offset="30%" stop-color="#CD7F32" />
      <stop offset="70%" stop-color="#E5A97F" />
      <stop offset="100%" stop-color="#CD7F32" />
    </linearGradient>
    
    <!-- Silver -->
    <linearGradient id="silverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F8FAFC" />
      <stop offset="50%" stop-color="#94A3B8" />
      <stop offset="100%" stop-color="#475569" />
    </linearGradient>
    <linearGradient id="silverRimGrad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#475569" />
      <stop offset="30%" stop-color="#94A3B8" />
      <stop offset="70%" stop-color="#F8FAFC" />
      <stop offset="100%" stop-color="#94A3B8" />
    </linearGradient>
    
    <!-- Gold -->
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE047" />
      <stop offset="50%" stop-color="#CA8A04" />
      <stop offset="100%" stop-color="#854D0E" />
    </linearGradient>
    <linearGradient id="goldRimGrad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#854D0E" />
      <stop offset="30%" stop-color="#FDE047" />
      <stop offset="70%" stop-color="#CA8A04" />
      <stop offset="100%" stop-color="#FEF08A" />
    </linearGradient>
    
    <!-- Platinum -->
    <linearGradient id="platGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#22D3EE" />
      <stop offset="50%" stop-color="#3B82F6" />
      <stop offset="100%" stop-color="#8B5CF6" />
    </linearGradient>
    <linearGradient id="platRimGrad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#8B5CF6" />
      <stop offset="50%" stop-color="#EC4899" />
      <stop offset="100%" stop-color="#22D3EE" />
    </linearGradient>
    
    <!-- Metallic Inner Ring highlight -->
    <linearGradient id="metalHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.0" />
    </linearGradient>

    <!-- Inner backgrounds -->
    <radialGradient id="innerBg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#1E293B" />
      <stop offset="75%" stop-color="#0F172A" />
      <stop offset="100%" stop-color="#020617" />
    </radialGradient>
  </defs>

  <!-- Main Medallion group with shadow -->
  <g filter="url(#shadow)">
    <!-- Base Rarity Wings / Aviation Styling behind badge -->
    ${rarity === 'platinum' ? `
      <!-- Tech circular orbit lines -->
      <circle cx="200" cy="200" r="170" fill="none" stroke="url(#platRimGrad)" stroke-width="2" stroke-dasharray="10 15" opacity="0.6" />
      <circle cx="200" cy="200" r="155" fill="none" stroke="#22D3EE" stroke-width="1" stroke-dasharray="5 5" opacity="0.4" />
      <!-- Platinum Diamond Points -->
      <path d="M200 10 L390 200 L200 390 L10 200 Z" fill="none" stroke="url(#platRimGrad)" stroke-width="4" opacity="0.3" />
    ` : ''}

    ${rarity === 'gold' ? `
      <!-- Gold Flight Wings behind the badge -->
      <path d="M60 200 C30 150 10 180 30 220 C50 260 120 230 120 200 Z" fill="url(#goldGrad)" opacity="0.8" />
      <path d="M340 200 C370 150 390 180 370 220 C350 260 280 230 280 200 Z" fill="url(#goldGrad)" opacity="0.8" />
      <path d="M80 180 C50 130 30 160 50 200 C70 240 130 210 130 180 Z" fill="url(#goldRimGrad)" opacity="0.6" />
      <path d="M320 180 C350 130 370 160 350 200 C330 240 270 210 270 180 Z" fill="url(#goldRimGrad)" opacity="0.6" />
    ` : ''}

    ${rarity === 'silver' ? `
      <!-- Silver Winged Plates -->
      <path d="M70 200 C40 170 80 140 120 170 Z" fill="url(#silverGrad)" />
      <path d="M330 200 C360 170 320 140 280 170 Z" fill="url(#silverGrad)" />
      <polygon points="200 25 365 100 365 300 200 375 35 300 35 100" fill="none" stroke="url(#silverRimGrad)" stroke-width="3" opacity="0.4" />
    ` : ''}

    ${rarity === 'bronze' ? `
      <!-- Bronze Rivet Outer circle -->
      <circle cx="200" cy="200" r="148" fill="none" stroke="url(#bronzeRimGrad)" stroke-width="2" opacity="0.5" />
    ` : ''}

    <!-- Main Outer Rim -->
    <circle cx="200" cy="200" r="135" fill="${outerRimColor}" />

    <!-- Inner Metallic Inset -->
    <circle cx="200" cy="200" r="122" fill="url(#innerBg)" stroke="#FFFFFF" stroke-opacity="0.1" stroke-width="1.5" />

    <!-- Glow/Vibrancy behind Icon -->
    <circle cx="200" cy="200" r="65" fill="url(#${textGrad})" opacity="0.12" />

    <!-- Central Icon Path -->
    <g transform="translate(130, 124) scale(5.8)" stroke="url(#${textGrad})" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none">
      ${innerIconPath}
    </g>

    <!-- Outer Rim Rivets / Ornaments -->
    ${rarity === 'platinum' ? `
      <!-- Platinum Stars / Highlights -->
      <polygon points="200 45 204 55 215 55 206 62 209 72 200 66 191 72 194 62 185 55 196 55" fill="#FFFFFF" />
      <polygon points="200 355 204 345 215 345 206 338 209 328 200 334 191 328 194 338 185 345 196 345" fill="#FFFFFF" opacity="0.8" />
      <!-- Cyber Dots -->
      <circle cx="90" cy="200" r="5" fill="#22D3EE" />
      <circle cx="310" cy="200" r="5" fill="#22D3EE" />
    ` : ''}

    ${rarity === 'gold' ? `
      <!-- Gold Stars -->
      <polygon points="200 42 205 52 216 52 207 59 210 69 200 63 190 69 193 59 184 52 195 52" fill="#FDE047" />
      <polygon points="90 120 95 125 105 121 99 130 104 138 95 134 87 139 89 130 83 124 93 123" fill="#CA8A04" opacity="0.8" />
      <polygon points="310 120 305 125 295 121 301 130 296 138 305 134 313 139 311 130 317 124 307 123" fill="#CA8A04" opacity="0.8" />
    ` : ''}

    ${rarity === 'silver' ? `
      <!-- Silver Rivets -->
      <circle cx="200" cy="80" r="3" fill="#E2E8F0" />
      <circle cx="200" cy="320" r="3" fill="#E2E8F0" />
      <circle cx="80" cy="200" r="3" fill="#E2E8F0" />
      <circle cx="320" cy="200" r="3" fill="#E2E8F0" />
      <circle cx="115" cy="115" r="3" fill="#E2E8F0" />
      <circle cx="285" cy="115" r="3" fill="#E2E8F0" />
      <circle cx="115" cy="285" r="3" fill="#E2E8F0" />
      <circle cx="285" cy="285" r="3" fill="#E2E8F0" />
    ` : ''}

    ${rarity === 'bronze' ? `
      <!-- Bronze Rivets -->
      <circle cx="200" cy="80" r="2.5" fill="#CD7F32" opacity="0.8" />
      <circle cx="200" cy="320" r="2.5" fill="#CD7F32" opacity="0.8" />
      <circle cx="80" cy="200" r="2.5" fill="#CD7F32" opacity="0.8" />
      <circle cx="320" cy="200" r="2.5" fill="#CD7F32" opacity="0.8" />
    ` : ''}

    <!-- Shiny Glass Reflection Overlay -->
    <path d="M78 150 C140 100 260 100 322 150 C290 85 110 85 78 150 Z" fill="url(#metalHighlight)" opacity="0.6" />
    
    <!-- Text Curved Path or centered small name -->
    <rect x="130" y="278" width="140" height="24" rx="12" fill="#020617" fill-opacity="0.85" stroke="${innerAccentColor}" stroke-opacity="0.3" stroke-width="1" />
    <text x="200" y="294" font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" font-size="10" font-weight="900" fill="#F8FAFC" text-anchor="middle" letter-spacing="1.5">${name.toUpperCase()}</text>
  </g>
</svg>`;
}

function generate() {
  const dir = path.join('public', 'insignias');
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Directory ${dir} created.`);
  }

  let count = 0;
  for (const insignia of INSIGNIAS_LIST) {
    const iconPath = ICON_PATHS[insignia.icon];
    if (!iconPath) {
      console.warn(`Warning: Path not found for icon ${insignia.icon}`);
      continue;
    }

    const svgContent = getBadgeTemplate(insignia.rarity, insignia.name, iconPath);
    const fileName = `${insignia.slug}.svg`;
    const filePath = path.join(dir, fileName);
    
    fs.writeFileSync(filePath, svgContent, 'utf8');
    count++;
  }

  console.log(`SUCCESS! Generated ${count} premium vector SVG badges in ${dir}.`);
}

generate();
