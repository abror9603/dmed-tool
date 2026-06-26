<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useLandingContent } from '../../composables/useLandingContent'
import StepCard from '../ui/StepCard.vue'
import PatientJourneyDiagram from '../ui/PatientJourneyDiagram.vue'

const { t } = useI18n()
const { workflowSteps } = useLandingContent()
</script>

<template>
  <section id="how-it-works" class="py-20 transition-colors duration-300 bg-slate-50 dark:bg-brand-dark">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 600 } }"
        class="text-center max-w-3xl mx-auto mb-12"
      >
        <h2 class="text-xs font-bold text-brand-primary uppercase tracking-wider">{{ t('howItWorks.eyebrow') }}</h2>
        <p class="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
          {{ t('howItWorks.title') }}
        </p>
        <p class="mt-4 text-base sm:text-lg text-slate-500 dark:text-slate-400">
          {{ t('howItWorks.subtitle') }}
        </p>
      </div>

      <div
        v-motion
        :initial="{ opacity: 0, scale: 0.95 }"
        :visibleOnce="{ opacity: 1, scale: 1, transition: { duration: 800 } }"
        class="mb-16 bg-white dark:bg-brand-tealDark/20 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 sm:p-8 shadow-sm backdrop-blur-sm"
      >
        <h3 class="text-center text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">
          {{ t('howItWorks.flowTitle') }}
        </h3>
        <PatientJourneyDiagram />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StepCard
          v-for="(step, index) in workflowSteps"
          :key="step.stepNumber"
          :step="step"
          v-motion
          :initial="{ opacity: 0, y: 30 }"
          :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 600, delay: index * 100 } }"
        />
      </div>
    </div>
  </section>
</template>
