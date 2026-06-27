<script setup lang="ts">
import SiteHeader from '../components/layout/SiteHeader.vue'
import HeroSection from '../components/sections/HeroSection.vue'
import HowItWorksSection from '../components/sections/HowItWorksSection.vue'
import ClinicRegistrationSection from '../components/sections/ClinicRegistrationSection.vue'
import CtaSection from '../components/sections/CtaSection.vue'
import SiteFooter from '../components/layout/SiteFooter.vue'

/** Public marketing page — composes landing sections in scroll order. */
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <SiteHeader />

    <main class="flex-grow">
      <HeroSection />
      <HowItWorksSection />
      <ClinicRegistrationSection />
      <CtaSection />
    </main>

    <SiteFooter />
  </div>
</template>
