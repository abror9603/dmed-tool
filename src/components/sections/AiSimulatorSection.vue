<script setup lang="ts">
import { Brain, ShieldAlert, Cpu } from 'lucide-vue-next'
import RiskSimulatorWidget from '../ui/RiskSimulatorWidget.vue'

// O'zbek tilida izoh:
// AiSimulatorSection - Bemorlarning holatini tahlil qiluvchi AI tizimini simulyatsiya qiluvchi bo'lim.
// Foydalanuvchilar turli xil xavf darajalarini bosib, tizimning qaror qabul qilish mantiqini ko'ra oladilar.
</script>

<template>
  <section id="simulator" class="py-20 transition-colors duration-300 bg-slate-50 dark:bg-brand-dark">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        <!-- Chap ustun: Tushuntirishlar va AI xususiyatlari -->
        <div 
          v-motion
          :initial="{ opacity: 0, x: -30 }"
          :visibleOnce="{ opacity: 1, x: 0, transition: { duration: 800 } }"
          class="lg:col-span-5 space-y-6"
        >
          <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-brand-accent/20 bg-brand-accent/5 text-brand-accent dark:bg-brand-accent/10 text-xs font-semibold uppercase tracking-wider">
            <Brain class="w-4 h-4" />
            <span>Sun'iy Intellekt Algoritmi</span>
          </div>

          <h2 class="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
            AI Xavflilik darajasi va marshrutlash tahlili
          </h2>

          <p class="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
            Bizning Sun'iy Intellekt modelimiz shifoxonadan chiqqan bemorlarning klinik ko'rsatkichlarini (masalan, yoshi, saturatsiyasi, operatsiyadan keyingi holati, tana harorati) tahlil qilib, ularga 0 dan 100 gacha shkala bo'yicha shoshilinchlik ballini hisoblab beradi.
          </p>

          <div class="space-y-4">
            
            <div class="flex items-start space-x-3">
              <div class="p-2 rounded-lg bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20 shrink-0">
                <Cpu class="w-5 h-5" />
              </div>
              <div>
                <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100">Klinik ma'lumotlar tahlili</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Bemorning elektron kasallik varaqasidan olingan o'tkir asoratlar va hayotiy ko'rsatkichlar tahlil qilinadi.
                </p>
              </div>
            </div>

            <div class="flex items-start space-x-3">
              <div class="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 shrink-0">
                <ShieldAlert class="w-5 h-5" />
              </div>
              <div>
                <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100">Avtomatik zaxira yo'naltirish</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Agar biriktirilgan shifokor joriy vaqtda band bo'lsa yoki ishda bo'lmasa, bildirishnoma avtomatik ravishda poliklinikadagi zaxira shifokorga yo'naltiriladi.
                </p>
              </div>
            </div>

          </div>
        </div>

        <!-- O'ng ustun: Simulyator Vidjeti -->
        <div 
          v-motion
          :initial="{ opacity: 0, x: 30 }"
          :visibleOnce="{ opacity: 1, x: 0, transition: { duration: 800, delay: 200 } }"
          class="lg:col-span-7"
        >
          <RiskSimulatorWidget />
        </div>

      </div>

    </div>
  </section>
</template>
