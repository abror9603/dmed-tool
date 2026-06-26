<script setup lang="ts">
import { ref, inject, type Ref } from 'vue'
import { ArrowLeft, Copy, Check, Key, ClipboardList, Send, ShieldAlert, ChevronRight, Sun, Moon } from 'lucide-vue-next'

// O'zbek tilida izoh:
// DocsView - Eskiz.uz API hujjatlari namunasidagi kabi 3-panelli dasturchilar hujjatlar sahifasi.
// Chap panelda navigatsiya, o'rtada API parametrlari, o'ngda esa qorong'u kod bloklari joylashgan.

const theme = inject<Ref<'light' | 'dark'>>('theme')
const toggleTheme = inject<() => void>('toggleTheme')

// Tanlangan dasturlash tili (curl, js, python)
const selectedLanguage = ref<'curl' | 'js' | 'python'>('curl')

// Kopiya qilinganligini bildirish holati
const copiedEndpoint = ref<string | null>(null)

const copyToClipboard = (text: string, id: string) => {
  navigator.clipboard.writeText(text)
  copiedEndpoint.value = id
  setTimeout(() => {
    copiedEndpoint.value = null
  }, 2000)
}

// Navigatsiya uchun faol bo'lim
const activeSection = ref<'intro' | 'auth' | 'fetch-details' | 'send-sms' | 'confirm-visit'>('intro')

const scrollToSection = (id: 'intro' | 'auth' | 'fetch-details' | 'send-sms' | 'confirm-visit') => {
  activeSection.value = id
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

// Kod namunalarini xavfsiz saqlash (Template escaping muammolarini oldini olish uchun)
const snippets = {
  login: {
    curl: `curl --location --request POST 'https://api.dmedtool.uz/v1/auth/token' \\
--header 'Content-Type: application/json' \\
--data-raw '{
  "client_id": "clinic_toshkent_01",
  "client_secret": "sec_key_abc123xyz"
}'`,
    js: `fetch('https://api.dmedtool.uz/v1/auth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    client_id: 'clinic_toshkent_01',
    client_secret: 'sec_key_abc123xyz'
  })
}).then(res => res.json());`,
    python: `import requests

url = "https://api.dmedtool.uz/v1/auth/token"
payload = {
    "client_id": "clinic_toshkent_01",
    "client_secret": "sec_key_abc123xyz"
}
response = requests.post(url, json=payload)
print(response.json())`
  },
  fetchDetails: {
    curl: `curl --location --request POST 'https://api.dmedtool.uz/v1/patients/fetch-details' \\
--header 'Authorization: Bearer <token>' \\
--header 'Content-Type: application/json' \\
--data-raw '{
  "citizen_id": "98765432101234",
  "secret_key": "sec_key_abc123xyz"
}'`,
    js: `fetch('https://api.dmedtool.uz/v1/patients/fetch-details', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    citizen_id: '98765432101234',
    secret_key: 'sec_key_abc123xyz'
  })
}).then(res => res.json());`,
    python: `import requests

url = "https://api.dmedtool.uz/v1/patients/fetch-details"
headers = {
    "Authorization": "Bearer <token>",
    "Content-Type": "application/json"
}
payload = {
    "citizen_id": "98765432101234",
    "secret_key": "sec_key_abc123xyz"
}
response = requests.post(url, json=payload, headers=headers)
print(response.json())`
  },
  sendSms: {
    curl: `curl --location --request POST 'https://api.dmedtool.uz/v1/notifications/send-sms' \\
--header 'Authorization: Bearer <token>' \\
--header 'Content-Type: application/json' \\
--data-raw '{
  "citizen_id": "98765432101234",
  "doctor_id": "DOC-9921"
}'`,
    js: `fetch('https://api.dmedtool.uz/v1/notifications/send-sms', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    citizen_id: '98765432101234',
    doctor_id: 'DOC-9921'
  })
}).then(res => res.json());`,
    python: `import requests

url = "https://api.dmedtool.uz/v1/notifications/send-sms"
headers = {
    "Authorization": "Bearer <token>",
    "Content-Type": "application/json"
}
payload = {
    "citizen_id": "98765432101234",
    "doctor_id": "DOC-9921"
}
response = requests.post(url, json=payload, headers=headers)
print(response.json())`
  },
  confirmVisit: {
    curl: `curl --location --request POST 'https://api.dmedtool.uz/v1/visits/confirm' \\
--header 'Authorization: Bearer <token>' \\
--header 'Content-Type: application/json' \\
--data-raw '{
  "visit_id": "VIS-48392",
  "doctor_id": "DOC-9921",
  "confirmation_status": "confirmed"
}'`,
    js: `fetch('https://api.dmedtool.uz/v1/visits/confirm', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    visit_id: 'VIS-48392',
    doctor_id: 'DOC-9921',
    confirmation_status: 'confirmed'
  })
}).then(res => res.json());`,
    python: `import requests

url = "https://api.dmedtool.uz/v1/visits/confirm"
headers = {
    "Authorization": "Bearer <token>",
    "Content-Type": "application/json"
}
payload = {
    "visit_id": "VIS-48392",
    "doctor_id": "DOC-9921",
    "confirmation_status": "confirmed"
}
response = requests.post(url, json=payload, headers=headers)
print(response.json())`
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-white dark:bg-brand-dark transition-colors duration-300">
    
    <!-- Hujjatlar sahifasi yuqori navigatsiyasi (Sub-header) -->
    <div class="h-14 border-b border-slate-200 dark:border-slate-800 bg-slate-50/95 dark:bg-brand-dark/95 backdrop-blur sticky top-0 z-40 px-4 flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <a 
          href="#/" 
          class="flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-brand-primary dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft class="w-4 h-4" />
          <span>Asosiy sahifaga qaytish</span>
        </a>
        <span class="h-4 w-px bg-slate-300 dark:bg-slate-700"></span>
        <span class="text-sm font-bold text-slate-800 dark:text-white font-sans">DMED Tool API Integratsiya Hujjatlari</span>
      </div>

      <!-- Kun / Tun rejimi -->
      <div class="flex items-center space-x-2">
        <button
          @click="toggleTheme"
          class="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Mavzuni o'zgartirish"
        >
          <Sun v-if="theme === 'dark'" class="w-4 h-4 text-amber-400" />
          <Moon v-else class="w-4 h-4 text-slate-600" />
        </button>
        <span class="text-xs px-2 py-0.5 bg-brand-primary/10 text-brand-primary rounded font-bold uppercase font-mono">v2.0 API</span>
      </div>
    </div>

    <!-- Asosiy 3-panelli blok -->
    <div class="flex flex-1 flex-col md:flex-row relative">
      
      <!-- 1. Chap panel: Navigatsiya (Sidebar) -->
      <aside class="w-full md:w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-brand-dark/40 p-4 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto hidden md:block select-none">
        <div class="space-y-6">
          <div>
            <h3 class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Kirish</h3>
            <ul class="space-y-1">
              <li>
                <button 
                  @click="scrollToSection('intro')"
                  class="w-full flex items-center justify-between text-left text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                  :class="activeSection === 'intro' ? 'bg-brand-primary/10 text-brand-primary' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'"
                >
                  <span>API Kirish</span>
                  <ChevronRight class="w-3.5 h-3.5 opacity-60" />
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">API Resurslari</h3>
            <ul class="space-y-1">
              <li>
                <button 
                  @click="scrollToSection('auth')"
                  class="w-full flex items-center justify-between text-left text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                  :class="activeSection === 'auth' ? 'bg-brand-primary/10 text-brand-primary' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'"
                >
                  <span class="flex items-center space-x-2">
                    <Key class="w-3.5 h-3.5 text-brand-primary shrink-0" />
                    <span>1. Avtorizatsiya</span>
                  </span>
                  <ChevronRight class="w-3.5 h-3.5 opacity-60" />
                </button>
              </li>
              <li>
                <button 
                  @click="scrollToSection('fetch-details')"
                  class="w-full flex items-center justify-between text-left text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                  :class="activeSection === 'fetch-details' ? 'bg-brand-primary/10 text-brand-primary' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'"
                >
                  <span class="flex items-center space-x-2">
                    <ClipboardList class="w-3.5 h-3.5 text-brand-primary shrink-0" />
                    <span>2. Bemor & Shifokor Ma'lumotlari</span>
                  </span>
                  <ChevronRight class="w-3.5 h-3.5 opacity-60" />
                </button>
              </li>
              <li>
                <button 
                  @click="scrollToSection('send-sms')"
                  class="w-full flex items-center justify-between text-left text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                  :class="activeSection === 'send-sms' ? 'bg-brand-primary/10 text-brand-primary' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'"
                >
                  <span class="flex items-center space-x-2">
                    <Send class="w-3.5 h-3.5 text-brand-primary shrink-0" />
                    <span>3. Shifokorga SMS Yuborish</span>
                  </span>
                  <ChevronRight class="w-3.5 h-3.5 opacity-60" />
                </button>
              </li>
              <li>
                <button 
                  @click="scrollToSection('confirm-visit')"
                  class="w-full flex items-center justify-between text-left text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                  :class="activeSection === 'confirm-visit' ? 'bg-brand-primary/10 text-brand-primary' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'"
                >
                  <span class="flex items-center space-x-2">
                    <ShieldAlert class="w-3.5 h-3.5 text-brand-primary shrink-0" />
                    <span>4. Tashrifni Tasdiqlash</span>
                  </span>
                  <ChevronRight class="w-3.5 h-3.5 opacity-60" />
                </button>
              </li>
            </ul>
          </div>
        </div>
      </aside>

      <!-- 2 & 3. O'rta va O'ng panel tarkibi (Scrollable) -->
      <div class="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-y-auto">
        
        <!-- API Kirish qismi -->
        <div id="intro" class="border-b border-slate-200 dark:border-slate-800 grid grid-cols-1 lg:grid-cols-2">
          <!-- O'rta: Kirish matni -->
          <div class="p-6 sm:p-8 space-y-4">
            <h1 class="text-3xl font-black text-slate-900 dark:text-white font-sans">DMED Tool API Hujjatlari</h1>
            <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              Ushbu API hamkor klinika va shifoxonalarga bemorning JSHIR (PINFL) kodi hamda maxfiy integratsiya kaliti (secret_key) orqali milliy DMED ma'lumotlar bazasidan tegishli shifokor va tashxis tafsilotlarini olishga hamda ularni SMS orqali oilaviy shifokorga yo'naltirishga xizmat qiladi.
            </p>
            <div class="p-4 rounded-xl border border-blue-500/10 bg-blue-500/5 text-blue-600 dark:text-blue-400 text-xs font-medium space-y-1">
              <span class="font-bold block">Base URL:</span>
              <code class="bg-blue-500/10 px-2 py-0.5 rounded text-[11px] block sm:inline-block font-mono mt-1">https://api.dmedtool.uz/v1</code>
            </div>
          </div>
          <!-- O'ng: Tushuntirish misoli -->
          <div class="bg-slate-950 p-6 sm:p-8 flex flex-col justify-center border-t lg:border-t-0 border-slate-800 text-slate-300">
            <div class="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">So'rovlar Formati</span>
              <span class="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded uppercase font-mono">JSON API</span>
            </div>
            <p class="text-xs text-slate-400 leading-relaxed font-medium">
              Barcha so'rovlar HTTP orqali JSON formatda uzatiladi. Har bir so'rovda avtorizatsiya tokeni bo'lishi majburiydir (Avtorizatsiya endpointidan tashqari).
            </p>
          </div>
        </div>

        <!-- API Resurslari: Avtorizatsiya -->
        <div id="auth" class="border-b border-slate-200 dark:border-slate-800 grid grid-cols-1 lg:grid-cols-2">
          <!-- O'rta: API parametrlari -->
          <div class="p-6 sm:p-8 space-y-6">
            <div class="space-y-2">
              <span class="text-[10px] font-bold text-brand-primary bg-brand-primary/10 px-2.5 py-0.5 rounded uppercase font-mono">Authorization</span>
              <h2 class="text-2xl font-bold text-slate-900 dark:text-white font-sans">1. Avtorizatsiya (Token olish)</h2>
              <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Tizim bilan xavfsiz bog'lanish uchun klinikaning integratsiya ID-si (`client_id`) va integratsiya maxfiy kaliti (`client_secret`) yordamida vaqtinchalik Bearer token olinadi.
              </p>
            </div>

            <!-- POST login endpoint -->
            <div class="space-y-4">
              <div class="flex items-center space-x-2 text-xs">
                <span class="px-2 py-0.5 rounded bg-emerald-500 text-white font-bold uppercase text-[10px] font-mono">POST</span>
                <code class="font-mono font-bold text-slate-800 dark:text-slate-200">/auth/token</code>
              </div>
              
              <!-- Parametrlar jadvali -->
              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr class="border-b border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500">
                      <th class="py-2 font-bold">Parametr</th>
                      <th class="py-2 font-bold">Turi</th>
                      <th class="py-2 font-bold">Majburiy</th>
                      <th class="py-2 font-bold">Tavsif</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    <tr>
                      <td class="py-2.5 font-mono font-bold text-brand-primary">client_id</td>
                      <td class="py-2.5 font-mono">string</td>
                      <td class="py-2.5 text-red-500 font-semibold font-sans">Ha</td>
                      <td class="py-2.5">Klinikaning API integratsiya identifikatori</td>
                    </tr>
                    <tr>
                      <td class="py-2.5 font-mono font-bold text-brand-primary">client_secret</td>
                      <td class="py-2.5 font-mono">string</td>
                      <td class="py-2.5 text-red-500 font-semibold font-sans">Ha</td>
                      <td class="py-2.5">Klinikaga berilgan shaxsiy secret key kaliti</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <!-- O'ng: Kod misoli va response -->
          <div class="bg-slate-950 p-6 sm:p-8 space-y-6 text-slate-300 font-mono text-xs border-t lg:border-t-0 border-slate-800">
            <div class="flex items-center justify-between border-b border-slate-800 pb-3">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Misol so'rovi (Request)</span>
              <div class="flex space-x-2 text-[10px] font-bold">
                <button @click="selectedLanguage = 'curl'" :class="selectedLanguage === 'curl' ? 'text-brand-primary font-black' : 'text-slate-500 hover:text-slate-300'">CURL</button>
                <button @click="selectedLanguage = 'js'" :class="selectedLanguage === 'js' ? 'text-brand-primary font-black' : 'text-slate-500 hover:text-slate-300'">JS</button>
                <button @click="selectedLanguage = 'python'" :class="selectedLanguage === 'python' ? 'text-brand-primary font-black' : 'text-slate-500 hover:text-slate-300'">Python</button>
              </div>
            </div>

            <div class="relative bg-slate-900 rounded-xl p-4 border border-slate-800 group">
              <button 
                @click="copyToClipboard(snippets.login[selectedLanguage], 'login')"
                class="absolute right-3 top-3 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Check v-if="copiedEndpoint === 'login'" class="w-4 h-4 text-emerald-500" />
                <Copy v-else class="w-4 h-4" />
              </button>
              <pre class="overflow-x-auto leading-relaxed"><code>{{ snippets.login[selectedLanguage] }}</code></pre>
            </div>

            <!-- JSON javobi -->
            <div class="space-y-3">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block border-b border-slate-800 pb-2">Javob namunasi (Response)</span>
              <div class="bg-slate-900 rounded-xl p-4 border border-slate-800 overflow-x-auto">
                <pre class="leading-relaxed"><code>{
  "message": "token_generated",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in": 86400
  }
}</code></pre>
              </div>
            </div>
          </div>
        </div>

        <!-- API Resurslari: Bemor va Shifokor Ma'lumotlarini Olish -->
        <div id="fetch-details" class="border-b border-slate-200 dark:border-slate-800 grid grid-cols-1 lg:grid-cols-2">
          <!-- O'rta: API parametrlari -->
          <div class="p-6 sm:p-8 space-y-6">
            <div class="space-y-2">
              <span class="text-[10px] font-bold text-brand-primary bg-brand-primary/10 px-2.5 py-0.5 rounded uppercase font-mono">Fetch Details</span>
              <h2 class="text-2xl font-bold text-slate-900 dark:text-white font-sans">2. Bemor va Shifokor ma'lumotlarini olish</h2>
              <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Hamkor klinika bemorning **JSHIR** (PINFL) kodi va o'zlarining shaxsiy **secret_key** qiymatini yuborib, milliy DMED bazasidan bemorning oxirgi tashxisi va unga biriktirilgan oilaviy shifokor tafsilotlarini tortib oladi.
              </p>
            </div>

            <div class="space-y-4">
              <div class="flex items-center space-x-2 text-xs">
                <span class="px-2 py-0.5 rounded bg-emerald-500 text-white font-bold uppercase text-[10px] font-mono">POST</span>
                <code class="font-mono font-bold text-slate-800 dark:text-slate-200">/patients/fetch-details</code>
              </div>
              
              <!-- Parametrlar jadvali -->
              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr class="border-b border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500">
                      <th class="py-2 font-bold">Parametr</th>
                      <th class="py-2 font-bold">Turi</th>
                      <th class="py-2 font-bold">Majburiy</th>
                      <th class="py-2 font-bold">Tavsif</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    <tr>
                      <td class="py-2.5 font-mono font-bold text-brand-primary">citizen_id</td>
                      <td class="py-2.5 font-mono">string</td>
                      <td class="py-2.5 text-red-500 font-semibold font-sans">Ha</td>
                      <td class="py-2.5">Bemorning 14 xonali milliy JSHIR (PINFL) kodi</td>
                    </tr>
                    <tr>
                      <td class="py-2.5 font-mono font-bold text-brand-primary">secret_key</td>
                      <td class="py-2.5 font-mono">string</td>
                      <td class="py-2.5 text-red-500 font-semibold font-sans">Ha</td>
                      <td class="py-2.5">Hamkorlik integratsiya paroli (Secret Key)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <!-- O'ng: Kod misoli va response -->
          <div class="bg-slate-950 p-6 sm:p-8 space-y-6 text-slate-300 font-mono text-xs border-t lg:border-t-0 border-slate-800">
            <div class="flex items-center justify-between border-b border-slate-800 pb-3">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Misol so'rovi (Request)</span>
              <div class="flex space-x-2 text-[10px] font-bold">
                <button @click="selectedLanguage = 'curl'" :class="selectedLanguage === 'curl' ? 'text-brand-primary font-black' : 'text-slate-500 hover:text-slate-300'">CURL</button>
                <button @click="selectedLanguage = 'js'" :class="selectedLanguage === 'js' ? 'text-brand-primary font-black' : 'text-slate-500 hover:text-slate-300'">JS</button>
                <button @click="selectedLanguage = 'python'" :class="selectedLanguage === 'python' ? 'text-brand-primary font-black' : 'text-slate-500 hover:text-slate-300'">Python</button>
              </div>
            </div>

            <div class="relative bg-slate-900 rounded-xl p-4 border border-slate-800 group">
              <button 
                @click="copyToClipboard(snippets.fetchDetails[selectedLanguage], 'fetchDetails')"
                class="absolute right-3 top-3 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Check v-if="copiedEndpoint === 'fetchDetails'" class="w-4 h-4 text-emerald-500" />
                <Copy v-else class="w-4 h-4" />
              </button>
              <pre class="overflow-x-auto leading-relaxed"><code>{{ snippets.fetchDetails[selectedLanguage] }}</code></pre>
            </div>

            <!-- JSON javobi -->
            <div class="space-y-3">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block border-b border-slate-800 pb-2">Javob namunasi (Response)</span>
              <div class="bg-slate-900 rounded-xl p-4 border border-slate-800 overflow-x-auto">
                <pre class="leading-relaxed"><code>{
  "status": "success",
  "data": {
    "patient": {
      "name": "Jasur Alimov",
      "citizen_id": "98765432101234",
      "diagnosis": "O'pka pnevmoniyasi (J18)",
      "discharged_from": "Toshkent shahar 1-son klinik shifoxonasi"
    },
    "assigned_doctor": {
      "id": "DOC-9921",
      "name": "Dr. Alisher S.",
      "phone": "+998901234567",
      "clinic": "Chilonzor 3-son oilaviy poliklinikasi"
    }
  }
}</code></pre>
              </div>
            </div>
          </div>
        </div>

        <!-- API Resurslari: Shifokorga SMS Yuborish -->
        <div id="send-sms" class="border-b border-slate-200 dark:border-slate-800 grid grid-cols-1 lg:grid-cols-2">
          <!-- O'rta: API parametrlari -->
          <div class="p-6 sm:p-8 space-y-6">
            <div class="space-y-2">
              <span class="text-[10px] font-bold text-brand-primary bg-brand-primary/10 px-2.5 py-0.5 rounded uppercase font-mono">SMS Notification</span>
              <h2 class="text-2xl font-bold text-slate-900 dark:text-white font-sans">3. Shifokorga SMS Xabarnoma Yuborish</h2>
              <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Tizim shifokor va bemor ma'lumotlarini aniqlagandan so'ng, ushbu endpoint orqali oilaviy shifokorga bemorning holati haqida Eskiz.uz shlyuzi orqali tezkor SMS yuboriladi.
              </p>
            </div>

            <div class="space-y-4">
              <div class="flex items-center space-x-2 text-xs">
                <span class="px-2 py-0.5 rounded bg-emerald-500 text-white font-bold uppercase text-[10px] font-mono">POST</span>
                <code class="font-mono font-bold text-slate-800 dark:text-slate-200">/notifications/send-sms</code>
              </div>
              
              <!-- Parametrlar jadvali -->
              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr class="border-b border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500">
                      <th class="py-2 font-bold">Parametr</th>
                      <th class="py-2 font-bold">Turi</th>
                      <th class="py-2 font-bold">Majburiy</th>
                      <th class="py-2 font-bold">Tavsif</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    <tr>
                      <td class="py-2.5 font-mono font-bold text-brand-primary">citizen_id</td>
                      <td class="py-2.5 font-mono">string</td>
                      <td class="py-2.5 text-red-500 font-semibold font-sans">Ha</td>
                      <td class="py-2.5">Bemorning 14 xonali JSHIR kodi</td>
                    </tr>
                    <tr>
                      <td class="py-2.5 font-mono font-bold text-brand-primary">doctor_id</td>
                      <td class="py-2.5 font-mono">string</td>
                      <td class="py-2.5 text-red-500 font-semibold font-sans">Ha</td>
                      <td class="py-2.5">Xabarnoma yuboriladigan oilaviy shifokor ID kodi</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <!-- O'ng: Kod misoli va response -->
          <div class="bg-slate-950 p-6 sm:p-8 space-y-6 text-slate-300 font-mono text-xs border-t lg:border-t-0 border-slate-800">
            <div class="flex items-center justify-between border-b border-slate-800 pb-3">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Misol so'rovi (Request)</span>
              <div class="flex space-x-2 text-[10px] font-bold">
                <button @click="selectedLanguage = 'curl'" :class="selectedLanguage === 'curl' ? 'text-brand-primary font-black' : 'text-slate-500 hover:text-slate-300'">CURL</button>
                <button @click="selectedLanguage = 'js'" :class="selectedLanguage === 'js' ? 'text-brand-primary font-black' : 'text-slate-500 hover:text-slate-300'">JS</button>
                <button @click="selectedLanguage = 'python'" :class="selectedLanguage === 'python' ? 'text-brand-primary font-black' : 'text-slate-500 hover:text-slate-300'">Python</button>
              </div>
            </div>

            <div class="relative bg-slate-900 rounded-xl p-4 border border-slate-800 group">
              <button 
                @click="copyToClipboard(snippets.sendSms[selectedLanguage], 'sendSms')"
                class="absolute right-3 top-3 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Check v-if="copiedEndpoint === 'sendSms'" class="w-4 h-4 text-emerald-500" />
                <Copy v-else class="w-4 h-4" />
              </button>
              <pre class="overflow-x-auto leading-relaxed"><code>{{ snippets.sendSms[selectedLanguage] }}</code></pre>
            </div>

            <!-- JSON javobi -->
            <div class="space-y-3">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block border-b border-slate-800 pb-2">Javob namunasi (Response)</span>
              <div class="bg-slate-900 rounded-xl p-4 border border-slate-800 overflow-x-auto">
                <pre class="leading-relaxed"><code>{
  "status": "success",
  "message": "sms_notification_dispatched",
  "data": {
    "sms_id": "sms_998127391",
    "recipient_phone": "+998901234567",
    "delivery_status": "sent"
  }
}</code></pre>
              </div>
            </div>
          </div>
        </div>

        <!-- API Resurslari: Tashrifni Tasdiqlash va Vaqt Limiti -->
        <div id="confirm-visit" class="border-b border-slate-200 dark:border-slate-800 grid grid-cols-1 lg:grid-cols-2">
          <!-- O'rta: API parametrlari -->
          <div class="p-6 sm:p-8 space-y-6">
            <div class="space-y-2">
              <span class="text-[10px] font-bold text-red-500 bg-red-500/10 px-2.5 py-0.5 rounded uppercase font-mono">Timeout Rules & Confirmation</span>
              <h2 class="text-2xl font-bold text-slate-900 dark:text-white font-sans">4. Tashrifni tasdiqlash va vaqt limiti qoidalari</h2>
              <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">
                SMS xabarnoma yuborilgach, oilaviy shifokor tizimda uy ko'rigini belgilangan vaqt ichida tasdiqlashi shart. Agar belgilangan vaqtda tasdiqlanmasa, tizim avtomatik zaxira shifokorga yo'naltiradi (Fail-Safe Rerouting).
              </p>
            </div>

            <!-- Vaqt limitlari jadvali -->
            <div class="space-y-3 bg-red-500/5 border border-red-500/10 p-4 rounded-xl">
              <h3 class="text-xs font-bold text-red-500 uppercase tracking-wider">Tasdiqlash muddati qoidalari:</h3>
              <ul class="text-xs text-slate-600 dark:text-slate-300 list-disc pl-5 space-y-1 font-medium">
                <li><span class="font-bold">Kritik xavf (Critical Risk):</span> shifokor <span class="text-red-500 font-bold">4 soat</span> ichida tasdiqlashi kerak.</li>
                <li><span class="font-bold">Yuqori xavf (High Risk):</span> shifokor <span class="text-red-500 font-bold">12 soat</span> ichida tasdiqlashi kerak.</li>
                <li><span class="font-bold">O'rtacha/Past xavf (Moderate/Low):</span> shifokor <span class="text-emerald-500 font-bold">24 soat</span> ichida tasdiqlashi kerak.</li>
              </ul>
              <p class="text-[10px] text-slate-400">
                * Agar tasdiqlash kechiksa, tizim zaxira shifokorga yo'naltirilganligi to'g'risida klinika boshqaruviga ogohlantirish beradi.
              </p>
            </div>

            <!-- POST confirm endpoint -->
            <div class="space-y-4">
              <div class="flex items-center space-x-2 text-xs">
                <span class="px-2 py-0.5 rounded bg-emerald-500 text-white font-bold uppercase text-[10px] font-mono">POST</span>
                <code class="font-mono font-bold text-slate-800 dark:text-slate-200">/visits/confirm</code>
              </div>
              
              <!-- Parametrlar jadvali -->
              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr class="border-b border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500">
                      <th class="py-2 font-bold">Parametr</th>
                      <th class="py-2 font-bold">Turi</th>
                      <th class="py-2 font-bold">Majburiy</th>
                      <th class="py-2 font-bold">Tavsif</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    <tr>
                      <td class="py-2.5 font-mono font-bold text-brand-primary">visit_id</td>
                      <td class="py-2.5 font-mono">string</td>
                      <td class="py-2.5 text-red-500 font-semibold font-sans">Ha</td>
                      <td class="py-2.5">Tashrifning unikal identifikatori</td>
                    </tr>
                    <tr>
                      <td class="py-2.5 font-mono font-bold text-brand-primary">doctor_id</td>
                      <td class="py-2.5 font-mono">string</td>
                      <td class="py-2.5 text-red-500 font-semibold font-sans">Ha</td>
                      <td class="py-2.5">Tasdiqlovchi shifokor kodi</td>
                    </tr>
                    <tr>
                      <td class="py-2.5 font-mono font-bold text-brand-primary">confirmation_status</td>
                      <td class="py-2.5 font-mono">string</td>
                      <td class="py-2.5 text-red-500 font-semibold font-sans">Ha</td>
                      <td class="py-2.5">Qabul qilish holati (`confirmed` yoki `rejected`)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <!-- O'ng: Kod misoli va response -->
          <div class="bg-slate-950 p-6 sm:p-8 space-y-6 text-slate-300 font-mono text-xs border-t lg:border-t-0 border-slate-800">
            <div class="flex items-center justify-between border-b border-slate-800 pb-3">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Misol so'rovi (Request)</span>
              <div class="flex space-x-2 text-[10px] font-bold">
                <button @click="selectedLanguage = 'curl'" :class="selectedLanguage === 'curl' ? 'text-brand-primary font-black' : 'text-slate-500 hover:text-slate-300'">CURL</button>
                <button @click="selectedLanguage = 'js'" :class="selectedLanguage === 'js' ? 'text-brand-primary font-black' : 'text-slate-500 hover:text-slate-300'">JS</button>
                <button @click="selectedLanguage = 'python'" :class="selectedLanguage === 'python' ? 'text-brand-primary font-black' : 'text-slate-500 hover:text-slate-300'">Python</button>
              </div>
            </div>

            <div class="relative bg-slate-900 rounded-xl p-4 border border-slate-800 group">
              <button 
                @click="copyToClipboard(snippets.confirmVisit[selectedLanguage], 'confirmVisit')"
                class="absolute right-3 top-3 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Check v-if="copiedEndpoint === 'confirmVisit'" class="w-4 h-4 text-emerald-500" />
                <Copy v-else class="w-4 h-4" />
              </button>
              <pre class="overflow-x-auto leading-relaxed"><code>{{ snippets.confirmVisit[selectedLanguage] }}</code></pre>
            </div>

            <!-- JSON javobi -->
            <div class="space-y-3">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block border-b border-slate-800 pb-2">Javob namunasi (Response)</span>
              <div class="bg-slate-900 rounded-xl p-4 border border-slate-800 overflow-x-auto">
                <pre class="leading-relaxed"><code>{
  "status": "success",
  "message": "visit_confirmation_received",
  "data": {
    "visit_id": "VIS-48392",
    "confirmed_at": "2026-06-26T14:15:00Z",
    "timeout_timer_status": "cancelled"
  }
}</code></pre>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>
