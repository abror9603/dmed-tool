/** Call-to-action button configuration for landing sections. */
export interface CtaButton {
  label: string
  href: string
  variant: 'primary' | 'secondary' | 'ghost'
}

/** Hero section content model. */
export interface HeroContent {
  headline: string
  subheadline: string
  primaryCta: CtaButton
  secondaryCta: CtaButton
}

/** A single step in the product workflow diagram. */
export interface WorkflowStep {
  stepNumber: number
  icon: string
  title: string
  description: string
  highlightColor: string
}
