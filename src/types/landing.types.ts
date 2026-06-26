/**
 * CTA tugmasi konfiguratsiyasi va dizayni
 */
export interface CtaButton {
  label: string;                  // Tugma yozuvi (masalan, "Demo So'rash")
  href: string;                   // Havola (url yoki #ID)
  variant: 'primary' | 'secondary' | 'ghost'; // Tugma ko'rinishi turi
}

/**
 * Hero bo'limi kontenti
 */
export interface HeroContent {
  headline: string;               // Asosiy urg'u berilgan sarlavha
  subheadline: string;            // Sarlavha ostidagi tushuntirish
  primaryCta: CtaButton;          // Asosiy harakat tugmasi
  secondaryCta: CtaButton;        // Ikkinchi darajali tugma
}

/**
 * Tizim ishlash jarayonining har bir qadami (Workflow)
 */
export interface WorkflowStep {
  stepNumber: number;             // Bosqich raqami (1-4)
  icon: string;                   // Lucide ikonkasi nomi
  title: string;                  // Bosqich nomi
  description: string;            // Batafsil tushuntirish
  highlightColor: string;         // Uslub uchun rang klassi (masalan, text-brand-accent)
}

/**
 * Loyiha natijalari va statistik ko'rsatkichlari (Impact Stats)
 */
export interface ImpactStat {
  id: string;                     // Unikal identifikator
  value: number;                  // Animatsiya bo'luvchi yakuniy raqam
  suffix: string;                 // Raqam oxiriga qo'shiladigan belgi (masalan, "%", " min")
  label: string;                  // Ko'rsatkich qisqa sarlavhasi
  description: string;            // Ko'rsatkich haqida izoh
}

/**
 * AI skoring xavflilik darajalari
 */
export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';

/**
 * Simulyatorda turli xil bemor ssenariylari modeli
 */
export interface SimulatorScenario {
  riskLevel: RiskLevel;           // Xavflilik darajasi
  patientContext: string;         // Bemorning tibbiy holati tavsifi (Masalan: "72 yosh, insultdan keyingi holat")
  aiScore: number;                // AI tomonidan aniqlangan ball (0-100)
  aiDecision: string;             // AI ning ushbu xulosaga kelish sababi
  routingOutcome: string;         // Yo'naltirish natijasi va belgilangan muddat
  badgeColor: string;             // Holatga mos keluvchi rang klassi
}
