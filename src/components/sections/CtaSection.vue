<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ArrowRight, BookOpen, HeartPulse } from 'lucide-vue-next'

const { t } = useI18n()
</script>

<template>
  <section class="relative py-20 overflow-hidden bg-slate-900 text-white">
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.15),transparent_40%)]"></div>
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.15),transparent_40%)]"></div>

    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
      <div
        v-motion
        :initial="{ opacity: 0, scale: 0.8 }"
        :visibleOnce="{ opacity: 1, scale: 1, transition: { duration: 500 } }"
        class="inline-flex items-center justify-center p-3 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary mb-6"
      >
        <HeartPulse class="w-8 h-8" />
      </div>

      <h2
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 600 } }"
        class="text-3xl sm:text-4xl font-extrabold tracking-tight max-w-3xl mx-auto leading-tight"
      >
        {{ t('cta.title') }}
      </h2>

      <p
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 600, delay: 100 } }"
        class="mt-4 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed"
      >
        {{ t('cta.subtitle') }}
      </p>

      <div
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 600, delay: 200 } }"
        class="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8"
      >
        <a
          href="#clinic-registration"
          class="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-base font-bold text-white bg-brand-primary hover:bg-brand-primary/90 hover:shadow-lg hover:shadow-brand-primary/25 rounded-xl transition-all duration-200 active:scale-95 group"
        >
          <span>{{ t('common.getStarted') }}</span>
          <ArrowRight class="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" />
        </a>

        <RouterLink
          to="/docs/intro"
          class="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-base font-bold text-slate-300 bg-slate-800/60 border border-slate-700 hover:bg-slate-800 hover:text-white rounded-xl transition-all duration-200 active:scale-95"
        >
          <BookOpen class="w-5 h-5 mr-2" />
          <span>{{ t('common.docs') }}</span>
        </RouterLink>
      </div>

      <p
        v-motion
        :initial="{ opacity: 0 }"
        :visibleOnce="{ opacity: 1, transition: { duration: 1000, delay: 450 } }"
        class="mt-6 text-xs text-slate-500"
      >
        {{ t('cta.footnote') }}
      </p>
    </div>
  </section>
</template>
