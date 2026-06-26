<script setup lang="ts">
import { computed } from 'vue';
import type { WorkflowStep } from '../../types/landing.types';
import { Hospital, BrainCircuit, BellRing, ShieldCheck } from 'lucide-vue-next';

defineOptions({ name: 'StepCard' });

const props = defineProps<{
  step: WorkflowStep;
}>();

const iconComponent = computed(() => {
  switch (props.step.icon) {
    case 'Hospital':
      return Hospital;
    case 'BrainCircuit':
      return BrainCircuit;
    case 'BellRing':
      return BellRing;
    case 'ShieldCheck':
      return ShieldCheck;
    default:
      return BrainCircuit;
  }
});
</script>

<template>
  <div 
    class="relative flex flex-col flex-1 rounded-2xl border border-slate-200 dark:border-surface-border bg-white dark:bg-brand-tealDark/30 p-6 shadow-sm dark:shadow-none backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-accent/40 hover:bg-slate-50/80 dark:hover:bg-brand-tealDark/50 group"
  >
    <div class="absolute -top-4 left-6 flex h-8 w-8 items-center justify-center rounded-full bg-brand-accent text-brand-navy text-sm font-black border-2 border-white dark:border-brand-navy shadow-[0_0_15px_rgba(0,188,212,0.3)]">
      {{ step.stepNumber }}
    </div>

    <div class="mt-2 mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 dark:bg-brand-tealMid/50 text-brand-accent border border-slate-200 dark:border-brand-tealLight/20 group-hover:scale-110 transition-transform duration-300">
      <component :is="iconComponent" class="h-6 w-6 text-brand-accent" />
    </div>

    <h3 class="text-base font-bold text-slate-800 dark:text-white tracking-wide mb-2 group-hover:text-brand-accent transition-colors duration-200">
      {{ step.title }}
    </h3>
    <p class="text-xs text-slate-600 dark:text-gray-400 leading-relaxed font-medium">
      {{ step.description }}
    </p>

    <div class="absolute left-0 top-1/4 h-1/2 w-0.5 bg-brand-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-r"></div>
  </div>
</template>
