<script setup lang="ts">
import { Calendar, CheckCircle2, MessageSquare, ArrowRight, BookOpen, ShieldCheck } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { useLandingContent } from '../../composables/useLandingContent'

const { t } = useI18n()
const { heroCtas } = useLandingContent()
</script>

<template>
  <section class="relative overflow-hidden py-20 lg:py-28 transition-colors duration-300 bg-slate-50 dark:bg-brand-dark">
    
    <!-- Orqa fondagi yorqin radial dog'lar (Glows) -->
    <div class="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
    <div class="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-brand-secondary/10 rounded-full blur-[100px] pointer-events-none"></div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        
        <!-- Chap ustun: Sarlavha, Ta'rif va CTA tugmalari (Lg: 5/12) -->
        <div 
          v-motion
          :initial="{ opacity: 0, y: 30 }"
          :enter="{ opacity: 1, y: 0, transition: { duration: 800 } }"
          class="lg:col-span-5 space-y-6 text-center lg:text-left"
        >
          
          <!-- Asosiy sarlavha -->
          <h1 class="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            {{ t('hero.headline') }}
            <span class="bg-gradient-to-r from-brand-primary via-blue-500 to-brand-secondary bg-clip-text text-transparent">
              {{ t('hero.headlineHighlight') }}
            </span>
            {{ t('hero.headlineEnd') }}
          </h1>

          <p class="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0">
            {{ t('hero.subheadline') }}
          </p>

          <div class="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
            <a
              :href="heroCtas.primary.href"
              class="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-base font-bold text-white bg-brand-primary hover:bg-brand-primary/95 hover:shadow-lg hover:shadow-brand-primary/25 rounded-xl transition-all duration-200 active:scale-95 group"
            >
              <span>{{ heroCtas.primary.label }}</span>
              <ArrowRight class="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" />
            </a>
            
            <a
              :href="heroCtas.secondary.href"
              class="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-base font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:text-brand-primary dark:text-slate-200 dark:bg-slate-900/60 dark:border-slate-800 dark:hover:bg-slate-800/80 rounded-xl transition-all duration-200 active:scale-95"
            >
              <BookOpen class="w-5 h-5 mr-2" />
              <span>{{ heroCtas.secondary.label }}</span>
            </a>
          </div>

          <div class="flex items-center justify-center lg:justify-start space-x-2 pt-4 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck class="w-4 h-4 text-emerald-500" />
            <span>{{ t('hero.integration') }}</span>
          </div>

        </div>

        <!-- O'ng ustun: Namuna asosidagi vizual qatlamlar (Lg: 7/12) -->
        <div 
          v-motion
          :initial="{ opacity: 0, scale: 0.95 }"
          :enter="{ opacity: 1, scale: 1, transition: { duration: 1000, delay: 200 } }"
          class="lg:col-span-7 relative flex items-center justify-center pt-8 lg:pt-0"
        >
          
          <!-- Asosiy markaziy katta rasm (DMED App Mockup) -->
          <div class="relative w-full max-w-[580px] aspect-[4/3] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-slate-200/60 bg-white dark:border-slate-800/60 dark:bg-slate-950/60 p-2 overflow-hidden transition-all duration-300 group hover:-translate-y-1">
            <div class="w-full h-full rounded-xl overflow-hidden bg-slate-900 relative">
              <img 
                src="/images/dmed_app.png" 
                alt="DMED Tizimi Boshqaruv Paneli" 
                class="w-full h-full object-cover opacity-95 dark:opacity-85"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
            </div>
          </div>

          <!-- 1-katlam: Shifokor Kalendari Vidjeti (Top-Left) -->
          <div 
            v-motion
            :initial="{ opacity: 0, x: -40, y: -20 }"
            :enter="{ opacity: 1, x: 0, y: 0, transition: { duration: 800, delay: 500 } }"
            class="absolute -top-4 -left-4 sm:left-4 w-52 sm:w-60 p-3 sm:p-4 rounded-xl border shadow-lg glass-effect backdrop-blur-lg border-slate-200/80 bg-white/90 dark:bg-slate-900/95 dark:border-slate-800 animate-float"
          >
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center space-x-2">
                <div class="p-1.5 rounded-lg bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20">
                  <Calendar class="w-4 h-4" />
                </div>
                <span class="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">{{ t('hero.widgets.schedule') }}</span>
              </div>
              <span class="inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </div>
            
            <!-- Shifokor jadvali qatori -->
            <div class="space-y-2">
              <div class="flex items-center justify-between p-2 rounded-lg bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50">
                <div>
                  <p class="text-[10px] sm:text-xs font-semibold text-slate-800 dark:text-slate-200">Dr. Alisher S.</p>
                  <p class="text-[8px] sm:text-[10px] text-slate-500 dark:text-slate-400">{{ t('hero.widgets.familyDoctor') }}</p>
                </div>
                <span class="text-[8px] sm:text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">{{ t('hero.widgets.active') }}</span>
              </div>
              
              <!-- Oddiy kalendar mini-seti -->
              <div class="grid grid-cols-7 gap-1 text-[8px] sm:text-[10px] text-center font-medium text-slate-400">
                <span>D</span><span>S</span><span>Ch</span><span>P</span><span>J</span><span class="text-brand-primary font-bold">Shan</span><span>Y</span>
                <span class="text-slate-300 dark:text-slate-700">22</span>
                <span class="text-slate-300 dark:text-slate-700">23</span>
                <span class="text-slate-700 dark:text-slate-200">24</span>
                <span class="text-slate-700 dark:text-slate-200">25</span>
                <span class="bg-brand-primary text-white rounded p-0.5">26</span>
                <span class="text-slate-700 dark:text-slate-200 font-bold">27</span>
                <span class="text-slate-700 dark:text-slate-200">28</span>
              </div>
            </div>
          </div>

          <!-- 2-katlam: SMS Bildirishnoma Vidjeti (Bottom-Left) -->
          <div 
            v-motion
            :initial="{ opacity: 0, x: -30, y: 30 }"
            :enter="{ opacity: 1, x: 0, y: 0, transition: { duration: 800, delay: 700 } }"
            class="absolute -bottom-6 left-0 sm:left-10 w-60 sm:w-72 p-3 sm:p-4 rounded-xl border shadow-lg glass-effect border-slate-200/80 bg-white/95 dark:bg-slate-900/95 dark:border-slate-800"
          >
            <div class="flex items-start space-x-3">
              <div class="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 shrink-0">
                <MessageSquare class="w-4 h-4 sm:w-5 h-5" />
              </div>
              <div class="space-y-1">
                <div class="flex items-center justify-between">
                  <span class="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">{{ t('hero.widgets.smsTitle') }}</span>
                  <span class="text-[9px] text-slate-400 dark:text-slate-500">{{ t('hero.widgets.smsTime') }}</span>
                </div>
                <p class="text-[10px] sm:text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {{ t('hero.widgets.smsBody', { patient: 'J.A.' }) }}
                </p>
                <div class="flex items-center space-x-1 text-[9px] text-emerald-600 dark:text-emerald-400 font-medium pt-1">
                  <CheckCircle2 class="w-3.5 h-3.5" />
                  <span>{{ t('hero.widgets.smsDelivered') }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 3-katlam: Shifokor va Bemor xonadondagi ko'rigi (Bottom-Right / Top-Right) -->
          <div 
            v-motion
            :initial="{ opacity: 0, x: 40, y: 20 }"
            :enter="{ opacity: 1, x: 0, y: 0, transition: { duration: 800, delay: 900 } }"
            class="absolute -right-4 sm:-right-8 top-1/4 sm:top-1/3 w-44 sm:w-52 rounded-2xl border shadow-xl bg-white dark:bg-slate-900 dark:border-slate-800 p-2 overflow-hidden hover:scale-105 transition-transform duration-300"
          >
            <div class="aspect-[4/3] rounded-xl overflow-hidden relative bg-slate-100">
              <img 
                src="/images/patient.png" 
                alt="Shifokor va bemor xonadondagi ko'rik" 
                class="w-full h-full object-cover"
              />
              <div class="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full bg-brand-primary text-white text-[8px] font-bold tracking-wide uppercase">
                {{ t('hero.widgets.visit') }}
              </div>
            </div>

            <div class="mt-2 text-center">
              <p class="text-[10px] font-bold text-slate-800 dark:text-slate-100">{{ t('hero.widgets.homeVisit') }}</p>
              <p class="text-[8px] text-slate-500 dark:text-slate-400">{{ t('hero.widgets.homeVisitDesc') }}</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  </section>
</template>

<style scoped>
/* float animatsiyasi orqali vidjetlar biroz tebranib turadi, bu loyihaga hayotiylik bag'ishlaydi */
.animate-float {
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-8px);
  }
}
</style>
