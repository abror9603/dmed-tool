<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Hospital, BrainCircuit, Home } from 'lucide-vue-next';

defineOptions({ name: 'PatientJourneyDiagram' });

const animate = ref(false);

onMounted(() => {
  setTimeout(() => {
    animate.value = true;
  }, 200);
});
</script>

<template>
  <div class="relative w-full overflow-hidden py-4 flex flex-col items-center justify-center">
    
    <div class="hidden md:flex items-center justify-between w-full max-w-lg relative select-none">
      
      <div class="absolute top-[28px] left-[50px] right-[270px] h-[2px] bg-slate-200 dark:bg-brand-tealMid overflow-hidden">
        <div 
          class="h-full bg-brand-accent transition-all duration-[1200ms] ease-out origin-left"
          :class="[animate ? 'scale-x-100' : 'scale-x-0']"
        ></div>
      </div>

      <div class="absolute top-[28px] left-[270px] right-[50px] h-[2px] bg-slate-200 dark:bg-brand-tealMid overflow-hidden">
        <div 
          class="h-full bg-brand-accent transition-all duration-[1200ms] ease-out delay-[1000ms] origin-left"
          :class="[animate ? 'scale-x-100' : 'scale-x-0']"
        ></div>
      </div>

      <div 
        class="flex flex-col items-center z-10"
        v-motion
        :initial="{ opacity: 0, y: 15 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 500, ease: 'easeOut' } }"
      >
        <div class="flex h-14 w-14 items-center justify-center rounded-xl bg-white dark:bg-brand-navy border border-slate-200 dark:border-surface-border shadow shadow-brand-accent/5 transition-all duration-300">
          <Hospital class="h-6 w-6 text-brand-accent animate-pulse" />
        </div>
        <span class="mt-2 text-[10px] font-bold text-slate-800 dark:text-white">Hospital</span>
      </div>

      <div 
        class="flex flex-col items-center z-10"
        v-motion
        :initial="{ opacity: 0, y: 15 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 500, delay: 500, ease: 'easeOut' } }"
      >
        <div class="flex h-14 w-14 items-center justify-center rounded-xl bg-white dark:bg-brand-navy border-2 border-brand-accent/50 shadow-[0_0_12px_rgba(0,188,212,0.15)] hover:scale-105 transition-all duration-300">
          <BrainCircuit class="h-6 w-6 text-brand-accent" />
        </div>
        <span class="mt-2 text-[10px] font-bold text-brand-accent uppercase">AI Routing</span>
      </div>

      <div 
        class="flex flex-col items-center z-10"
        v-motion
        :initial="{ opacity: 0, y: 15 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 500, delay: 1500, ease: 'easeOut' } }"
      >
        <div class="flex h-14 w-14 items-center justify-center rounded-xl bg-white dark:bg-brand-navy border border-slate-200 dark:border-surface-border shadow shadow-brand-accent/5 transition-all duration-300">
          <Home class="h-6 w-6 text-brand-accent" />
        </div>
        <span class="mt-2 text-[10px] font-bold text-slate-800 dark:text-white">Family Clinic</span>
      </div>
      
    </div>

    <div class="flex md:hidden flex-col items-center gap-4 select-none w-full">
      <div class="flex items-center gap-2">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-brand-navy border border-slate-200 dark:border-surface-border shadow-md">
          <Hospital class="h-5 w-5 text-brand-accent" />
        </div>
        <span class="text-xs font-bold text-slate-800 dark:text-white">Hospital</span>
      </div>
      <div class="h-4 w-0.5 bg-brand-accent animate-pulse"></div>
      <div class="flex items-center gap-2">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-brand-navy border-2 border-brand-accent/50 shadow">
          <BrainCircuit class="h-5 w-5 text-brand-accent" />
        </div>
        <span class="text-xs font-bold text-brand-accent uppercase">AI Routing</span>
      </div>
      <div class="h-4 w-0.5 bg-brand-accent animate-pulse"></div>
      <div class="flex items-center gap-2">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-brand-navy border border-slate-200 dark:border-surface-border shadow-md">
          <Home class="h-5 w-5 text-brand-accent" />
        </div>
        <span class="text-xs font-bold text-slate-800 dark:text-white">Family Clinic</span>
      </div>
    </div>
    
  </div>
</template>
