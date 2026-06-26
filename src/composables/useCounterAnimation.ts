import { ref } from 'vue';

/**
 * Raqamlarni 0 dan boshlab belgilangan qiymatgacha silliq o'stirish animatsiyasi.
 */
export function useCounterAnimation() {
  const count = ref(0);
  const hasAnimated = ref(false);

  const animateCount = (target: number, duration: number = 1500) => {
    if (hasAnimated.value) return;
    hasAnimated.value = true;

    const start = 0;
    const startTime = performance.now();

    const update = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeProgress = progress * (2 - progress);
      
      count.value = Math.floor(start + easeProgress * (target - start));

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        count.value = target;
      }
    };

    requestAnimationFrame(update);
  };

  return {
    count,
    animateCount,
    hasAnimated
  };
}
