import { ref } from 'vue';
import { useIntersectionObserver, type MaybeElementRef } from '@vueuse/core';

/**
 * Scroll reveal triggers.
 */
export function useScrollReveal() {
  const isVisible = ref(false);
  
  const observeElement = (targetElement: MaybeElementRef, threshold: number = 0.15) => {
    const { stop } = useIntersectionObserver(
      targetElement,
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          isVisible.value = true;
          stop();
        }
      },
      { threshold }
    );
  };

  return {
    isVisible,
    observeElement
  };
}
