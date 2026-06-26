<script setup lang="ts">
import { ref, computed } from 'vue';
import type { RiskLevel, SimulatorScenario } from '../../types/landing.types';
import { simulatorScenarios } from '../../data/landing.data';
import { BrainCircuit, Clock, ShieldCheck, HeartPulse } from 'lucide-vue-next';

defineOptions({ name: 'RiskSimulatorWidget' });

const selectedRisk = ref<RiskLevel>('low');

const currentScenario = computed((): SimulatorScenario => {
  return simulatorScenarios.find(s => s.riskLevel === selectedRisk.value) || simulatorScenarios[0]!;
});

const radius = 50;
const stroke = 10;
const normalizedRadius = radius - stroke * 2;
const circumference = normalizedRadius * 2 * Math.PI;

const strokeDashoffset = computed(() => {
  return circumference - (currentScenario.value.aiScore / 100) * circumference;
});

const riskColors = {
  low: '#059669',
  moderate: '#D97706',
  high: '#EA580C',
  critical: '#DC2626'
};

const currentScoreColor = computed(() => {
  return riskColors[selectedRisk.value];
});
</script>

<template>
  <div 
    class="w-full rounded-2xl border border-slate-200 dark:border-surface-border bg-white dark:bg-brand-tealDark/30 p-6 md:p-8 shadow-xl dark:shadow-2xl relative"
    role="region"
    aria-label="AI Xavf Simulyatori"
  >
    <div class="flex flex-wrap gap-2 mb-6 justify-center">
      <button
        v-for="scenario in simulatorScenarios"
        :key="scenario.riskLevel"
        @click="selectedRisk = scenario.riskLevel"
        class="rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider border transition-all duration-300 focus:outline-none"
        :class="[
          selectedRisk === scenario.riskLevel
            ? 'bg-brand-accent text-brand-navy border-brand-accent shadow-[0_0_15px_rgba(0,188,212,0.35)] font-black'
            : 'bg-slate-50 dark:bg-brand-deepNavy/60 text-slate-500 dark:text-gray-400 border-slate-200 dark:border-surface-border hover:bg-slate-100 dark:hover:bg-brand-tealMid/20 hover:text-slate-800 dark:hover:text-white'
        ]"
      >
        {{ scenario.riskLevel }} risk
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-6 items-center">
      <div class="flex flex-col items-center justify-center text-center">
        <div class="relative flex items-center justify-center">
          <svg
            :height="radius * 2"
            :width="radius * 2"
            class="transform -rotate-90 transition-transform duration-500"
          >
            <circle
              class="stroke-slate-100 dark:stroke-white/5"
              fill="transparent"
              :stroke-width="stroke"
              :r="normalizedRadius"
              :cx="radius"
              :cy="radius"
            />
            <circle
              :stroke="currentScoreColor"
              fill="transparent"
              :stroke-width="stroke"
              stroke-linecap="round"
              :stroke-dasharray="circumference + ' ' + circumference"
              :style="{ strokeDashoffset, transition: 'stroke-dashoffset 800ms cubic-bezier(0.4, 0, 0.2, 1), stroke 400ms ease' }"
              :r="normalizedRadius"
              :cx="radius"
              :cy="radius"
            />
          </svg>
          
          <div class="absolute flex flex-col items-center justify-center">
            <span 
              class="text-3xl font-black tracking-tighter text-slate-800 dark:text-white transition-all duration-300"
              :style="{ color: currentScoreColor }"
            >
              {{ currentScenario.aiScore }}
            </span>
            <span class="text-[9px] font-bold text-slate-400 dark:text-gray-500 -mt-1 tracking-widest">AI SCORE</span>
          </div>
        </div>
        <span 
          class="mt-3 text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded border transition-all duration-300"
          :style="{ color: currentScoreColor, borderColor: `${currentScoreColor}30`, backgroundColor: `${currentScoreColor}10` }"
        >
          {{ selectedRisk }} LEVEL
        </span>
      </div>

      <div class="relative min-h-[160px] flex flex-col justify-between">
        <Transition name="fade-slide" mode="out-in">
          <div :key="selectedRisk" class="space-y-4">
            <div>
              <span class="text-[9px] font-black text-slate-400 dark:text-brand-accent uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                <HeartPulse class="h-3.5 w-3.5 text-brand-accent" />
                Bemor holati (Clinical Context)
              </span>
              <p class="text-xs text-slate-700 dark:text-gray-200 leading-relaxed font-medium">
                {{ currentScenario.patientContext }}
              </p>
            </div>

            <div class="bg-slate-50 dark:bg-brand-deepNavy/40 border border-slate-200 dark:border-surface-border rounded-xl p-3.5 shadow-inner">
              <span class="text-[9px] font-black text-slate-400 dark:text-brand-accent uppercase tracking-widest flex items-center gap-1.5 mb-1">
                <BrainCircuit class="h-3.5 w-3.5 text-brand-accent" />
                AI Qaror Tahlili (Reasoning)
              </span>
              <p class="text-[11px] text-slate-600 dark:text-gray-300 leading-relaxed font-medium">
                {{ currentScenario.aiDecision }}
              </p>
            </div>

            <div class="flex items-center gap-2">
              <Clock class="h-4 w-4 text-brand-accent flex-shrink-0" />
              <div class="flex-1">
                <span class="text-[9px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest block -mb-0.5">Avtomat Yo'naltirish Natijasi</span>
                <span 
                  class="text-xs font-bold transition-all duration-300"
                  :style="{ color: currentScoreColor }"
                >
                  {{ currentScenario.routingOutcome }}
                </span>
              </div>
            </div>
          </div>
        </Transition>
      </div>

    </div>
  </div>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

@media (prefers-reduced-motion: reduce) {
  .fade-slide-enter-active,
  .fade-slide-leave-active {
    transition: none !important;
  }
}
</style>
