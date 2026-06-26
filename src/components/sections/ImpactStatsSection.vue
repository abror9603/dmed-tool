<script setup lang="ts">
import { impactStats } from '../../data/landing.data'
import AnimatedCounter from '../ui/AnimatedCounter.vue'

// O'zbek tilida izoh:
// ImpactStatsSection - Loyihaning erishgan natijalari va statistikalarini aks ettiradi.
// AnimatedCounter komponenti orqali raqamlar sahifa scroll qilinganda silliq o'sib boradi.
</script>

<template>
  <section id="stats" class="py-20 transition-colors duration-300 bg-white dark:bg-slate-900 border-t border-b border-slate-200/50 dark:border-slate-800/50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <!-- Sarlavhalar -->
      <div 
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 600 } }"
        class="text-center max-w-3xl mx-auto mb-16"
      >
        <h2 class="text-xs font-bold text-brand-primary uppercase tracking-wider">Erishilgan Natijalar</h2>
        <p class="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
          Loyihaning amaliy ta'sir ko'rsatkichlari
        </p>
        <p class="mt-4 text-base sm:text-lg text-slate-500 dark:text-slate-400">
          Pilot hududlardagi sinovlar natijasida tizimimizning yuqori samaradorligi isbotlandi.
        </p>
      </div>

      <!-- Statistikalar to'plami -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div
          v-for="(stat, index) in impactStats"
          :key="stat.id"
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 600, delay: index * 100 } }"
          class="flex flex-col items-center justify-between p-6 sm:p-8 rounded-2xl border bg-slate-50 dark:bg-brand-dark/30 border-slate-200/80 dark:border-slate-800/60 transition-all duration-300 hover:shadow-lg"
        >
          <!-- Animatsiya qilinuvchi raqam -->
          <div class="mb-4">
            <AnimatedCounter 
              :value="stat.value" 
              :suffix="stat.suffix" 
              :duration="2000"
            />
          </div>
          
          <!-- Sarlavha va ta'rif -->
          <div class="text-center">
            <h3 class="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
              {{ stat.label }}
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {{ stat.description }}
            </p>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>
