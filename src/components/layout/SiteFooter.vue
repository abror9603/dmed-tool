<script setup lang="ts">
import { Heart } from 'lucide-vue-next'
</script>

<template>
  <footer class="border-t transition-colors duration-300 border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-brand-dark dark:text-slate-400">
    <div class="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div class="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
        
        <!-- Chap tomonda: Mualliflik va yil -->
        <div class="flex items-center space-x-1 text-sm">
          <span>&copy; {{ new Date().getFullYear() }}</span>
          <span class="font-semibold text-slate-800 dark:text-slate-200">DMED Tool</span>
          <span>. Barcha huquqlar himoyalangan.</span>
        </div>

        <!-- O'rtada: Milliy ekotizim bilan integratsiya statusi -->
        <div class="flex items-center space-x-2 text-xs">
          <span class="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span class="font-medium text-emerald-600 dark:text-emerald-400">DMED Ekotizimi bilan faol integratsiya</span>
        </div>

        <!-- O'ng tomonda: O'zbekistonda tayyorlanganligi haqida belgi -->
        <div class="flex items-center space-x-1 text-sm">
          <span>O'zbekistonda</span>
          <Heart class="w-4 h-4 text-red-500 fill-current animate-pulse" />
          <span>bilan yaratilgan</span>
        </div>

      </div>
    </div>
  </footer>
</template>
