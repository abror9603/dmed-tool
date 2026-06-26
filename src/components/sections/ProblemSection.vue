<script setup lang="ts">
import { AlertTriangle, Clock, ShieldAlert } from 'lucide-vue-next'
import { problemCards } from '../../data/landing.data'

// Ikonkalar xaritasini tuzamiz, bu Typescript-da dinamik renderlashni xavfsiz qiladi
const iconMap: Record<string, any> = {
  AlertTriangle,
  Clock,
  ShieldAlert
}
</script>

<template>
  <section id="problem" class="py-20 transition-colors duration-300 bg-white dark:bg-slate-900 border-t border-b border-slate-200/50 dark:border-slate-800/50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <!-- Bo'lim sarlavhasi -->
      <div 
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 600 } }"
        class="text-center max-w-3xl mx-auto mb-16"
      >
        <h2 class="text-xs font-bold text-brand-primary uppercase tracking-wider">Mavjud Muammolar</h2>
        <p class="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
          Nega an'anaviy tizimlar ish bermayapti?
        </p>
        <p class="mt-4 text-base sm:text-lg text-slate-500 dark:text-slate-400">
          Mavjud monitoring va xabardor qilish tizimlaridagi uzilishlar bemorlar salomatligiga jiddiy ta'sir ko'rsatmoqda.
        </p>
      </div>

      <!-- Muammo kartalari paneli -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div
          v-for="(card, index) in problemCards"
          :key="card.id"
          v-motion
          :initial="{ opacity: 0, y: 30 }"
          :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 600, delay: index * 150 } }"
          class="relative flex flex-col justify-between p-6 sm:p-8 rounded-2xl border bg-slate-50 hover:bg-white dark:bg-brand-dark/40 dark:hover:bg-brand-dark/60 transition-all duration-300 shadow-sm hover:shadow-md border-slate-200/80 dark:border-slate-800/60"
          :class="card.accentClass"
        >
          <div>
            <!-- Ikonka qismi -->
            <div class="p-3 w-12 h-12 rounded-xl flex items-center justify-center bg-red-500/10 text-red-500 dark:bg-red-500/20 dark:text-red-400 mb-6">
              <component :is="iconMap[card.icon]" class="w-6 h-6" />
            </div>
            
            <!-- Statistika urg'usi -->
            <div class="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
              {{ card.stat }}
            </div>
            
            <!-- Sarlavha -->
            <h3 class="text-lg font-bold text-slate-800 dark:text-slate-100 mb-3">
              {{ card.label }}
            </h3>
            
            <!-- Tushuntirish -->
            <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {{ card.description }}
            </p>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>
