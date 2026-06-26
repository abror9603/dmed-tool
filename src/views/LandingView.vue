<script setup lang="ts">
import SiteHeader from '../components/layout/SiteHeader.vue'
import HeroSection from '../components/sections/HeroSection.vue'
import HowItWorksSection from '../components/sections/HowItWorksSection.vue'
import CtaSection from '../components/sections/CtaSection.vue'
import SiteFooter from '../components/layout/SiteFooter.vue'

// O'zbek tilida izoh:
// LandingView - Barcha bo'limlarni (Hero, Muammo, Ishlash tizimi, Statistika, Simulyator, CTA va Footer) birlashtiruvchi bosh sahifa.
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <!-- Navigatsiya paneli -->
    <SiteHeader />

    <!-- Asosiy sahifa tarkibi -->
    <main class="flex-grow">
      
      <!-- 1. Kirish (Hero) bo'limi -->
      <HeroSection />

      <!-- 3. Tizim qanday ishlashi bo'limi -->
      <HowItWorksSection />

      <!-- 6. Harakatga chaqiruv (CTA) bo'limi -->
      <CtaSection />

    </main>

    <!-- Pastki qism (Footer) -->
    <SiteFooter />
  </div>
</template>
