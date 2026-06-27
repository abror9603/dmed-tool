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

