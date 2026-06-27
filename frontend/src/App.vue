<script setup lang="ts">
/**
 * Root shell — provides theme toggle via `provide` for public pages and login.
 */
import { onMounted, provide, ref } from 'vue'
import { RouterView } from 'vue-router'
import { STORAGE_KEYS } from './config/app'

const theme = ref<'light' | 'dark'>('dark')

function toggleTheme(): void {
  const nextTheme = theme.value === 'light' ? 'dark' : 'light'
  theme.value = nextTheme
  document.documentElement.classList.toggle('dark', nextTheme === 'dark')
  localStorage.setItem(STORAGE_KEYS.THEME, nextTheme)
}

onMounted(() => {
  const savedTheme = (localStorage.getItem(STORAGE_KEYS.THEME) || 'dark') as 'light' | 'dark'
  theme.value = savedTheme
  document.documentElement.classList.toggle('dark', savedTheme === 'dark')
})

provide('theme', theme)
provide('toggleTheme', toggleTheme)
</script>

<template>
  <div class="min-h-screen bg-slate-50 font-sans text-slate-900 transition-colors duration-300 dark:bg-brand-dark dark:text-slate-100">
    <RouterView />
  </div>
</template>

<style>
html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}
</style>
