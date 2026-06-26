<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useCounterAnimation } from '../../composables/useCounterAnimation';
import { useScrollReveal } from '../../composables/useScrollReveal';

defineOptions({ name: 'AnimatedCounter' });

const props = withDefaults(
  defineProps<{
    value: number;
    suffix?: string;
    duration?: number;
  }>(),
  {
    suffix: '',
    duration: 1500,
  }
);

const containerRef = ref<HTMLElement | null>(null);
const { count, animateCount } = useCounterAnimation();
const { isVisible, observeElement } = useScrollReveal();

watch(isVisible, (newVal) => {
  if (newVal) {
    animateCount(props.value, props.duration);
  }
});

onMounted(() => {
  if (containerRef.value) {
    observeElement(containerRef.value);
  }
});
</script>

<template>
  <div 
    ref="containerRef" 
    class="flex flex-col items-center justify-center text-center select-none"
    role="status"
    :aria-label="`${value}${suffix}`"
  >
    <span class="text-4xl font-extrabold tracking-tighter text-slate-800 dark:text-white sm:text-5xl md:text-6xl tabular-nums">
      {{ count }}{{ suffix }}
    </span>
  </div>
</template>
