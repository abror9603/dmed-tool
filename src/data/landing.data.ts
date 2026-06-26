import type { HeroContent, WorkflowStep, ImpactStat, SimulatorScenario } from '../types/landing.types';

/**
 * Hero bo'limi uchun matnlar va harakatlar
 */
export const heroContent: HeroContent = {
  headline: "O'zbekistonda har bir bemorning shifokorga yetib borishi kafolatlansin",
  subheadline: "Shifoxonadan chiqqan bemorlarni nazorat qilish va mahalliy oilaviy shifokorlarga avtomatik yo'naltirish imkonini beruvchi Sun'iy Intellekt tizimi.",
  primaryCta: {
    label: "Get started",
    href: "#how-it-works",
    variant: 'primary'
  },
  secondaryCta: {
    label: "Docs",
    href: "#/docs",
    variant: 'secondary'
  }
};

/**
 * Muammo bo'limi uchun ma'lumotlar (Zone 2)
 */
export const problemCards = [
  {
    id: 'problem-1',
    icon: 'AlertTriangle',
    stat: '23%',
    label: 'Qayta yotqizish darajasi',
    description: 'Bemorlarning 23%i shifoxonadan chiqqandan keyin birinchi 30 kun ichida tibbiy e\'tiborsizlik sababli qayta shifoxonaga yotqiziladi.',
    accentClass: 'border-l-4 border-risk-critical'
  },
  {
    id: 'problem-2',
    icon: 'Clock',
    stat: '72 soat',
    label: 'Xabardorlik kechikishi',
    description: 'Mahalliy oilaviy shifokor o\'z hududidagi bemorning shifoxonadan chiqqanligi to\'g\'risida o\'rtacha 3 kundan keyin xabar topadi.',
    accentClass: 'border-l-4 border-risk-moderate'
  },
  {
    id: 'problem-3',
    icon: 'ShieldAlert',
    stat: '0% nazorat',
    label: 'Zaxira tizimining yo\'qligi',
    description: 'Agar biriktirilgan shifokor mehnat ta\'tilida yoki band bo\'lsa, bemor hech qanday monitoringlarsiz e\'tibordan chetda qoladi.',
    accentClass: 'border-l-4 border-risk-critical'
  }
];

/**
 * Tizim qanday ishlashi bosqichlari (Zone 3)
 */
export const workflowSteps: WorkflowStep[] = [
  {
    stepNumber: 1,
    icon: 'Hospital',
    title: 'Chiqish Aniqlandi',
    description: 'DMED milliy ekotizimi bilan integratsiya orqali bemorning shifoxonadan javob berilganligi avtomatik ravishda aniqlanadi.',
    highlightColor: 'text-brand-accent'
  },
  {
    stepNumber: 2,
    icon: 'BrainCircuit',
    title: 'AI Baholash',
    description: 'Sun\'iy Intellekt modeli bemorning klinik ko\'rsatkichlarini tahlil qilib, uy tashrifi zarurligini 0 dan 100 ballgacha baholaydi.',
    highlightColor: 'text-brand-accent'
  },
  {
    stepNumber: 3,
    icon: 'BellRing',
    title: 'Tezkor Xabarnoma',
    description: 'AI tomonidan baholangan ma\'lumotlar va shoshilinchlik darajasi shifokorga xavfsiz mobil tizim orqali darhol yuboriladi.',
    highlightColor: 'text-brand-accent'
  },
  {
    stepNumber: 4,
    icon: 'ShieldCheck',
    title: 'Zaxira Yo\'naltirish',
    description: 'Agar birinchi shifokor ishda bo\'lmasa, AI bildirishnomani poliklinikadagi zaxira shifokorga avtomatik yo\'naltiradi.',
    highlightColor: 'text-brand-accent'
  }
];

/**
 * Natijalar ko'rsatkichlari (Zone 4)
 */
export const impactStats: ImpactStat[] = [
  {
    id: 'stat-1',
    value: 34,
    suffix: '%',
    label: 'Qayta yotqizishlar kamaydi',
    description: 'Loyiha sinovdan o\'tkazilgan pilot tumanlarda shifoxonaga qayta yotish darajasi pasaydi.'
  },
  {
    id: 'stat-2',
    value: 14,
    suffix: ' min',
    label: 'O\'rtacha bildirish vaqti',
    description: 'Bemor shifoxonadan chiqqan vaqtdan shifokor xabar topgunigacha bo\'lgan tezkorlik.'
  },
  {
    id: 'stat-3',
    value: 97,
    suffix: '%',
    label: 'AI yo\'naltirish aniqligi',
    description: 'AI modelining xavflilik darajasini baholash va to\'g\'ri shifokorga yo\'naltirish aniqligi.'
  },
  {
    id: 'stat-4',
    value: 218,
    suffix: '+',
    label: 'Muvaffaqiyatli uy tashrifi',
    description: 'Post-discharge nazorati doirasida muvaffaqiyatli amalga oshirilgan ko\'riklar.'
  }
];

/**
 * AI Simulyatori stsenariylari (Zone 5)
 */
export const simulatorScenarios: SimulatorScenario[] = [
  {
    riskLevel: 'low',
    patientContext: 'Bemor 34 yoshda, o\'tkir appenditsit operatsiyasidan keyin ahvoli barqaror ravishda shifoxonadan chiqarilgan. Harorati normal, jismoniy faoliyati qisman tiklangan.',
    aiScore: 28,
    aiDecision: 'Klinik ko\'rsatkichlar xavfsiz. O\'tkir asoratlar xavfi minimal. Jismoniy choklar bitish jarayoni ijobiy dinamikada.',
    routingOutcome: 'Muntazam kuzatuv — 7 kun ichida poliklinika ko\'rigi yoki telefon qo\'ng\'irog\'i.',
    badgeColor: 'border-risk-low bg-risk-low/10 text-risk-low'
  },
  {
    riskLevel: 'moderate',
    patientContext: 'Bemor 52 yoshda, pnevmoniyadan keyingi sog\'ayish bosqichida. Kislorod saturatsiyasi 95%, biroz yo\'tal va holsizlik saqlanib qolgan.',
    aiScore: 58,
    aiDecision: 'O\'pka ventilyatsiyasi barqaror, ammo asoratlanish xavfini kamaytirish uchun nafas olish mashqlari va saturatsiyani davomiy tekshirib borish lozim.',
    routingOutcome: 'Tezlashtirilgan tashrif — 48 soat ichida uy sharoitida shifokor ko\'rigi.',
    badgeColor: 'border-risk-moderate bg-risk-moderate/10 text-risk-moderate'
  },
  {
    riskLevel: 'high',
    patientContext: 'Bemor 67 yoshda, kardiologiya markazidan gipertoniya xuruji va aritmiya tashxisi bilan chiqarilgan. Qon bosimi tez-tez o\'zgarib turadi.',
    aiScore: 82,
    aiDecision: 'Kardiologik asoratlar va insult xavfi yuqori. Dorilar rejimini qat\'iy nazorat qilish va EKG ko\'rsatkichlarini zudlik bilan tekshirish talab etiladi.',
    routingOutcome: 'Shoshilinch tashrif — bugunun o\'zida oilaviy shifokorning uyga tashrifi.',
    badgeColor: 'border-brand-accent bg-brand-accent/10 text-brand-accent animate-pulse'
  },
  {
    riskLevel: 'critical',
    patientContext: 'Bemor 71 yoshda, surunkali yurak yetishmovchiligi dekompensatsiyasi bilan shifoxonadan chiqqan. Asosiy oilaviy shifokor joriy vaqtda mehnat ta\'tilida.',
    aiScore: 94,
    aiDecision: 'O\'ta yuqori hayotiy xavf darajasi. Birinchi shifokor mavjud emasligi sababli, tizim avtomatik zaxira shifokorini aniqladi.',
    routingOutcome: 'Favqulodda yo\'naltirish — zaxira shifokor faollashtirildi, 4 soat ichida tashrif buyuriladi.',
    badgeColor: 'border-risk-critical bg-risk-critical/10 text-risk-critical animate-bounce shadow-[0_0_15px_rgba(220,38,38,0.3)]'
  }
];
