<script setup lang="ts">
import { ref, provide, onMounted } from 'vue'
import LandingView from './views/LandingView.vue'
import DocsView from './views/DocsView.vue'
import ClinicsDashboardView from './views/ClinicsDashboardView.vue'

// Har bir muhim joylarga va funksiyalarga o'zbek tilida komentariya qoldirib ketamiz
// Global mavzu holati (light yoki dark)
const theme = ref<'light' | 'dark'>('dark')

// Hash-routing holatini boshqarish (bosh sahifa, hujjatlar, yoki klinikalar boshqaruvi)
const currentView = ref<'landing' | 'docs' | 'clinics'>('landing')

const checkHash = () => {
  if (window.location.hash.startsWith('#/docs') || window.location.hash === '#docs') {
    currentView.value = 'docs'
  } else if (window.location.hash.startsWith('#/clinics') || window.location.hash === '#clinics') {
    currentView.value = 'clinics'
  } else {
    currentView.value = 'landing'
  }
}

// Mavzuni almashtirish funksiyasi
const toggleTheme = () => {
  if (theme.value === 'light') {
    theme.value = 'dark'
    document.documentElement.classList.add('dark')
    localStorage.setItem('dmed-theme', 'dark')
  } else {
    theme.value = 'light'
    document.documentElement.classList.remove('dark')
    localStorage.setItem('dmed-theme', 'light')
  }
}

// Komponent yuklanganda saqlangan mavzuni va hash yo'lini aniqlash
onMounted(() => {
  checkHash()
  window.addEventListener('hashchange', checkHash)

  const savedTheme = (localStorage.getItem('dmed-theme') || 'dark') as 'light' | 'dark'
  theme.value = savedTheme
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
})

// Barcha ichki komponentlar foydalanishi uchun mavzu holati va almashtirish funksiyasini ulashamiz (Provide/Inject)
provide('theme', theme)
provide('toggleTheme', toggleTheme)
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 dark:bg-brand-dark dark:text-slate-100 transition-colors duration-300 font-sans">
    <DocsView v-if="currentView === 'docs'" />
    <ClinicsDashboardView v-else-if="currentView === 'clinics'" />
    <LandingView v-else />
  </div>
</template>

<style>
/* Global animatsiyalar va dizayn elementlari */
html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}
</style>
