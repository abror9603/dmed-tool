<script setup lang="ts">
import { workflowSteps } from '../../data/landing.data'
import StepCard from '../ui/StepCard.vue'
import PatientJourneyDiagram from '../ui/PatientJourneyDiagram.vue'

// O'zbek tilida izoh:
// HowItWorksSection - Tizimning bosqichma-bosqich ishlash mexanizmini tushuntiradi.
// Bu erda PatientJourneyDiagram vizual ko'rinish va StepCard har bir bosqichni batafsil ochib beradi.
</script>

<template>
  <section id="how-it-works" class="py-20 transition-colors duration-300 bg-slate-50 dark:bg-brand-dark">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <!-- Sarlavhalar -->
      <div 
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 600 } }"
        class="text-center max-w-3xl mx-auto mb-12"
      >
        <h2 class="text-xs font-bold text-brand-primary uppercase tracking-wider">Ishlash Mexanizmi</h2>
        <p class="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
          DMED Tool qanday ishlaydi?
        </p>
        <p class="mt-4 text-base sm:text-lg text-slate-500 dark:text-slate-400">
          Shifoxonadan chiqqan bemor oilaviy shifokor ko'rigigacha bo'lgan to'liq avtomatlashtirilgan jarayon yo'li.
        </p>
      </div>

      <!-- Bemor sayohati diagrammasi (PatientJourneyDiagram) -->
      <div 
        v-motion
        :initial="{ opacity: 0, scale: 0.95 }"
        :visibleOnce="{ opacity: 1, scale: 1, transition: { duration: 800 } }"
        class="mb-16 bg-white dark:bg-brand-tealDark/20 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 sm:p-8 shadow-sm backdrop-blur-sm"
      >
        <h3 class="text-center text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">
          Bemorning marshrutizatsiya oqimi (AI routing flow)
        </h3>
        <PatientJourneyDiagram />
      </div>

      <!-- Bosqichlar to'plami (Steps Grid) -->
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
