<script setup lang="ts">
import { ref, inject, computed, type Ref } from 'vue'
import { ArrowLeft, Copy, Check, Key, Hospital, Settings, RefreshCw, Trash2, Edit2, ShieldAlert, ChevronRight, Sun, Moon } from 'lucide-vue-next'
import { apiClient } from '../services/clinics'

// O'zbek tilida izoh:
// DocsView - Klinikalar API-lari uchun 3-panelli batafsil hujjatlar sahifasi.
// Chap tomonda sidebar navigatsiya, o'rtada API sarlavhalari va jadvallar, o'ngda esa Request/Response kod namunalari.

const theme = inject<Ref<'light' | 'dark'>>('theme')
const toggleTheme = inject<() => void>('toggleTheme')

const selectedLanguage = ref<'curl' | 'js' | 'python'>('curl')
const copiedEndpoint = ref<string | null>(null)

const copyToClipboard = (text: string, id: string) => {
  navigator.clipboard.writeText(text)
  copiedEndpoint.value = id
  setTimeout(() => {
    copiedEndpoint.value = null
  }, 2000)
}

const activeCategory = ref<'intro' | 'clinics' | 'users' | 'doctors' | 'patients' | 'prescriptions'>('intro')
const activeEndpoint = ref('post-clinic')

const clinicsEndpoints = [
  { id: 'post-clinic', label: '1. Yaratish (POST)' },
  { id: 'get-clinics', label: '2. Barcha klinikalar (GET)' },
  { id: 'get-clinic-id', label: '3. ID bo\'yicha (GET)' },
  { id: 'get-clinics-status', label: '4. Status bo\'yicha (GET)' },
  { id: 'put-clinic', label: '5. Tahrirlash (PUT)' },
  { id: 'patch-status', label: '6. Status patch (PATCH)' },
  { id: 'delete-clinic', label: '7. O\'chirish (DELETE)' },
  { id: 'validate-key', label: '8. Key validatsiya (GET)' }
]

const usersEndpoints = [
  { id: 'get-users', label: '1. Barcha foydalanuvchilar (GET)' },
  { id: 'get-user-id', label: '2. ID bo\'yicha (GET)' },
  { id: 'delete-user', label: '3. O\'chirish (DELETE)' },
  { id: 'create-user', label: '4. Yaratish (POST)' },
  { id: 'edit-user', label: '5. Tahrirlash (PUT)' }
]

const scrollToEndpoint = (id: string) => {
  activeEndpoint.value = id
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

// Ngrok API manzili (sukut bo'yicha)
const defaultApiUrl = 'https://3ed4-185-139-137-95.ngrok-free.app'
const apiUrl = ref(localStorage.getItem('dmed-api-url') || defaultApiUrl)

// Kod namunalari to'plami (computed orqali dinamik qilinadi)
const snippets = computed(() => ({
  create: {
    curl: `curl --location --request POST '${apiUrl.value}/api/v1/clinics' \\
--header 'Content-Type: application/json' \\
--data-raw '{
  "name": "Shifo Med",
  "address": "Toshkent sh., Chilonzor 5-daha",
  "phone": "+998901234567",
  "email": "contact@shifomed.uz"
}'`,
    js: `fetch('${apiUrl.value}/api/v1/clinics', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  },
  body: JSON.stringify({
    name: 'Shifo Med',
    address: 'Toshkent sh., Chilonzor 5-daha',
    phone: '+998901234567',
    email: 'contact@shifomed.uz'
  })
}).then(res => res.json());`,
    python: `import requests

url = "${apiUrl.value}/api/v1/clinics"
headers = {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true"
}
payload = {
    "name": "Shifo Med",
    "address": "Toshkent sh., Chilonzor 5-daha",
    "phone": "+998901234567",
    "email": "contact@shifomed.uz"
}
response = requests.post(url, json=payload, headers=headers)
print(response.json())`
  },
  getAll: {
    curl: `curl --location '${apiUrl.value}/api/v1/clinics' \\
--header 'ngrok-skip-browser-warning: true'`,
    js: `fetch('${apiUrl.value}/api/v1/clinics', {
  method: 'GET',
  headers: { 'ngrok-skip-browser-warning': 'true' }
}).then(res => res.json());`,
    python: `import requests

url = "${apiUrl.value}/api/v1/clinics"
headers = { "ngrok-skip-browser-warning": "true" }
response = requests.get(url, headers=headers)
print(response.json())`
  },
  getOne: {
    curl: `curl --location '${apiUrl.value}/api/v1/clinics/12' \\
--header 'ngrok-skip-browser-warning: true'`,
    js: `fetch('${apiUrl.value}/api/v1/clinics/12', {
  method: 'GET',
  headers: { 'ngrok-skip-browser-warning': 'true' }
}).then(res => res.json());`,
    python: `import requests

url = "${apiUrl.value}/api/v1/clinics/12"
headers = { "ngrok-skip-browser-warning": "true" }
response = requests.get(url, headers=headers)
print(response.json())`
  },
  getByStatus: {
    curl: `curl --location '${apiUrl.value}/api/v1/clinics/status/ACTIVE' \\
--header 'ngrok-skip-browser-warning: true'`,
    js: `fetch('${apiUrl.value}/api/v1/clinics/status/ACTIVE', {
  method: 'GET',
  headers: { 'ngrok-skip-browser-warning': 'true' }
}).then(res => res.json());`,
    python: `import requests

url = "${apiUrl.value}/api/v1/clinics/status/ACTIVE"
headers = { "ngrok-skip-browser-warning": "true" }
response = requests.get(url, headers=headers)
print(response.json())`
  },
  update: {
    curl: `curl --location --request PUT '${apiUrl.value}/api/v1/clinics/12' \\
--header 'Content-Type: application/json' \\
--data-raw '{
  "name": "Shifo Med Yangilangan",
  "address": "Toshkent sh., Chilonzor 7-daha",
  "phone": "+998907654321",
  "email": "new@shifomed.uz"
}'`,
    js: `fetch('${apiUrl.value}/api/v1/clinics/12', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  },
  body: JSON.stringify({
    name: 'Shifo Med Yangilangan',
    address: 'Toshkent sh., Chilonzor 7-daha',
    phone: '+998907654321',
    email: 'new@shifomed.uz'
  })
}).then(res => res.json());`,
    python: `import requests

url = "${apiUrl.value}/api/v1/clinics/12"
headers = {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true"
}
payload = {
    "name": "Shifo Med Yangilangan",
    "address": "Toshkent sh., Chilonzor 7-daha",
    "phone": "+998907654321",
    "email": "new@shifomed.uz"
}
response = requests.put(url, json=payload, headers=headers)
print(response.json())`
  },
  patchStatus: {
    curl: `curl --location --request PATCH '${apiUrl.value}/api/v1/clinics/12/status' \\
--header 'ngrok-skip-browser-warning: true'`,
    js: `fetch('${apiUrl.value}/api/v1/clinics/12/status', {
  method: 'PATCH',
  headers: { 'ngrok-skip-browser-warning': 'true' }
}).then(res => res.json());`,
    python: `import requests

url = "${apiUrl.value}/api/v1/clinics/12/status"
headers = { "ngrok-skip-browser-warning": "true" }
response = requests.patch(url, headers=headers)
print(response.json())`
  },
  delete: {
    curl: `curl --location --request DELETE '${apiUrl.value}/api/v1/clinics/12' \\
--header 'ngrok-skip-browser-warning: true'`,
    js: `fetch('${apiUrl.value}/api/v1/clinics/12', {
  method: 'DELETE',
  headers: { 'ngrok-skip-browser-warning': 'true' }
}).then(res => res.json());`,
    python: `import requests

url = "${apiUrl.value}/api/v1/clinics/12"
headers = { "ngrok-skip-browser-warning": "true" }
response = requests.delete(url, headers=headers)
print(response.json())`
  },
  validate: {
    curl: `curl --location '${apiUrl.value}/api/v1/clinics/validate-key?secretKey=sec_key_abc123xyz'`,
    js: `fetch('${apiUrl.value}/api/v1/clinics/validate-key?secretKey=sec_key_abc123xyz', {
  method: 'GET'
}).then(res => res.json());`,
    python: `import requests

url = "${apiUrl.value}/api/v1/clinics/validate-key"
params = { "secretKey": "sec_key_abc123xyz" }
response = requests.get(url, params=params)
print(response.json())`
  },
  userGetAll: {
    curl: `curl --location '${apiUrl.value}/sdg/uz?accountType=ADMIN&page=0&size=30' \\
--header 'ngrok-skip-browser-warning: true'`,
    js: `fetch('${apiUrl.value}/sdg/uz?accountType=ADMIN&page=0&size=30', {
  method: 'GET',
  headers: { 'ngrok-skip-browser-warning': 'true' }
}).then(res => res.json());`,
    python: `import requests

url = "${apiUrl.value}/sdg/uz"
params = {
    "accountType": "ADMIN",
    "page": 0,
    "size": 30
}
headers = { "ngrok-skip-browser-warning": "true" }
response = requests.get(url, params=params, headers=headers)
print(response.json())`
  },
  userGetOne: {
    curl: `curl --location '${apiUrl.value}/sdg/uz/1' \\
--header 'ngrok-skip-browser-warning: true'`,
    js: `fetch('${apiUrl.value}/sdg/uz/1', {
  method: 'GET',
  headers: { 'ngrok-skip-browser-warning': 'true' }
}).then(res => res.json());`,
    python: `import requests

url = "${apiUrl.value}/sdg/uz/1"
headers = { "ngrok-skip-browser-warning": "true" }
response = requests.get(url, headers=headers)
print(response.json())`
  },
  userDelete: {
    curl: `curl --location --request DELETE '${apiUrl.value}/sdg/uz/1' \\
--header 'ngrok-skip-browser-warning: true'`,
    js: `fetch('${apiUrl.value}/sdg/uz/1', {
  method: 'DELETE',
  headers: { 'ngrok-skip-browser-warning': 'true' }
}).then(res => res.json());`,
    python: `import requests

url = "${apiUrl.value}/sdg/uz/1"
headers = { "ngrok-skip-browser-warning": "true" }
response = requests.delete(url, headers=headers)
print(response.json())`
  },
  userCreate: {
    curl: `curl --location --request POST '${apiUrl.value}/sdg/uz/admin' \\
--header 'Content-Type: application/json' \\
--header 'ngrok-skip-browser-warning: true' \\
--data-raw '{
  "accountType": "ADMIN",
  "address": "Sirdaryo",
  "addressDistrict": "Sirdaryo",
  "addressMFY": "Sirdaryo",
  "addressRegion": "Sirdaryo",
  "courseId": 1,
  "creatorId": 1,
  "dateBirth": "2026-06-26",
  "email": "sirdaryo@gmail.com",
  "firstName": "Olima",
  "genderType": "AYOL",
  "group": "master",
  "id": 1,
  "lastName": "Olimova",
  "password": "olima",
  "phoneNumber": "12345678",
  "school": "1-maktab"
}'`,
    js: `fetch('${apiUrl.value}/sdg/uz/admin', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  },
  body: JSON.stringify({
    accountType: "ADMIN",
    address: "Sirdaryo",
    addressDistrict: "Sirdaryo",
    addressMFY: "Sirdaryo",
    addressRegion: "Sirdaryo",
    courseId: 1,
    creatorId: 1,
    dateBirth: "2026-06-26",
    email: "sirdaryo@gmail.com",
    firstName: "Olima",
    genderType: "AYOL",
    group: "master",
    id: 1,
    lastName: "Olimova",
    password: "olima",
    phoneNumber: "12345678",
    school: "1-maktab"
  })
}).then(res => res.json());`,
    python: `import requests

url = "${apiUrl.value}/sdg/uz/admin"
headers = {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true"
}
payload = {
    "accountType": "ADMIN",
    "address": "Sirdaryo",
    "addressDistrict": "Sirdaryo",
    "addressMFY": "Sirdaryo",
    "addressRegion": "Sirdaryo",
    "courseId": 1,
    "creatorId": 1,
    "dateBirth": "2026-06-26",
    "email": "sirdaryo@gmail.com",
    "firstName": "Olima",
    "genderType": "AYOL",
    "group": "master",
    "id": 1,
    "lastName": "Olimova",
    "password": "olima",
    "phoneNumber": "12345678",
    "school": "1-maktab"
}
response = requests.post(url, json=payload, headers=headers)
print(response.json())`
  },
  userEdit: {
    curl: `curl --location --request PUT '${apiUrl.value}/sdg/uz/edit' \\
--header 'Content-Type: application/json' \\
--header 'ngrok-skip-browser-warning: true' \\
--data-raw '{
  "accountType": "ADMIN",
  "address": "string",
  "addressDistrict": "string",
  "addressMFY": "string",
  "addressRegion": "string",
  "courseId": 0,
  "creatorId": 0,
  "dateBirth": "2026-06-26",
  "email": "string",
  "firstName": "string",
  "genderType": "AYOL",
  "group": "string",
  "id": 0,
  "lastName": "string",
  "password": "string",
  "phoneNumber": "string",
  "school": "string"
}'`,
    js: `fetch('${apiUrl.value}/sdg/uz/edit', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  },
  body: JSON.stringify({
    accountType: "ADMIN",
    address: "string",
    addressDistrict: "string",
    addressMFY: "string",
    addressRegion: "string",
    courseId: 0,
    creatorId: 0,
    dateBirth: "2026-06-26",
    email: "string",
    firstName: "string",
    genderType: "AYOL",
    group: "string",
    id: 0,
    lastName: "string",
    password: "string",
    phoneNumber: "string",
    school: "string"
  })
}).then(res => res.json());`,
    python: `import requests

url = "${apiUrl.value}/sdg/uz/edit"
headers = {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true"
}
payload = {
    "accountType": "ADMIN",
    "address": "string",
    "addressDistrict": "string",
    "addressMFY": "string",
    "addressRegion": "string",
    "courseId": 0,
    "creatorId": 0,
    "dateBirth": "2026-06-26",
    "email": "string",
    "firstName": "string",
    "genderType": "AYOL",
    "group": "string",
    "id": 0,
    "lastName": "string",
    "password": "string",
    "phoneNumber": "string",
    "school": "string"
}
response = requests.put(url, json=payload, headers=headers)
print(response.json())`
  }
}))

// Playground interaktiv holati
interface PlaygroundItem {
  tab: 'example' | 'playground'
  loading: boolean
  params: Record<string, string>
  body: string
  response: {
    status: number
    statusText: string
    time: number
    data: any
  } | null
}

interface PlaygroundState {
  create: PlaygroundItem
  getAll: PlaygroundItem
  getOne: PlaygroundItem
  getByStatus: PlaygroundItem
  update: PlaygroundItem
  patchStatus: PlaygroundItem
  delete: PlaygroundItem
  validate: PlaygroundItem
  userGetAll: PlaygroundItem
  userGetOne: PlaygroundItem
  userDelete: PlaygroundItem
  userCreate: PlaygroundItem
  userEdit: PlaygroundItem
}

const playground = ref<PlaygroundState>({
  create: {
    tab: 'example',
    loading: false,
    params: {},
    body: JSON.stringify({
      name: "Shifo Med",
      address: "Toshkent sh., Chilonzor 5-daha",
      phone: "+998901234567",
      email: "contact@shifomed.uz"
    }, null, 2),
    response: null
  },
  getAll: {
    tab: 'example',
    loading: false,
    params: {},
    body: '',
    response: null
  },
  getOne: {
    tab: 'example',
    loading: false,
    params: { id: '12' },
    body: '',
    response: null
  },
  getByStatus: {
    tab: 'example',
    loading: false,
    params: { status: 'ACTIVE' },
    body: '',
    response: null
  },
  update: {
    tab: 'example',
    loading: false,
    params: { id: '12' },
    body: JSON.stringify({
      name: "Shifo Med Yangilangan",
      address: "Toshkent sh., Chilonzor 7-daha",
      phone: "+998907654321",
      email: "new@shifomed.uz"
    }, null, 2),
    response: null
  },
  patchStatus: {
    tab: 'example',
    loading: false,
    params: { id: '12' },
    body: '',
    response: null
  },
  delete: {
    tab: 'example',
    loading: false,
    params: { id: '12' },
    body: '',
    response: null
  },
  validate: {
    tab: 'example',
    loading: false,
    params: { secretKey: 'sec_key_abc123xyz' },
    body: '',
    response: null
  },
  userGetAll: {
    tab: 'example',
    loading: false,
    params: {
      accountType: 'ADMIN',
      email: '',
      firstName: '',
      genderType: '',
      group: '',
      lastName: '',
      page: '0',
      phoneNumber: '',
      school: '',
      size: '30'
    },
    body: '',
    response: null
  },
  userGetOne: {
    tab: 'example',
    loading: false,
    params: { id: '1' },
    body: '',
    response: null
  },
  userDelete: {
    tab: 'example',
    loading: false,
    params: { id: '1' },
    body: '',
    response: null
  },
  userCreate: {
    tab: 'example',
    loading: false,
    params: {},
    body: JSON.stringify({
      accountType: "ADMIN",
      address: "Sirdaryo",
      addressDistrict: "Sirdaryo",
      addressMFY: "Sirdaryo",
      addressRegion: "Sirdaryo",
      courseId: 1,
      creatorId: 1,
      dateBirth: "2026-06-26",
      email: "sirdaryo@gmail.com",
      firstName: "Olima",
      genderType: "AYOL",
      group: "master",
      id: 1,
      lastName: "Olimova",
      password: "olima",
      phoneNumber: "12345678",
      school: "1-maktab"
    }, null, 2),
    response: null
  },
  userEdit: {
    tab: 'example',
    loading: false,
    params: {},
    body: JSON.stringify({
      accountType: "ADMIN",
      address: "string",
      addressDistrict: "string",
      addressMFY: "string",
      addressRegion: "string",
      courseId: 0,
      creatorId: 0,
      dateBirth: "2026-06-26",
      email: "string",
      firstName: "string",
      genderType: "AYOL",
      group: "string",
      id: 0,
      lastName: "string",
      password: "string",
      phoneNumber: "string",
      school: "string"
    }, null, 2),
    response: null
  }
})

// Jonli so'rov yuborish funksiyasi
const runPlaygroundRequest = async (key: keyof PlaygroundState) => {
  const item = playground.value[key]
  if (!item) return
  
  item.loading = true
  item.response = null
  
  const startTime = performance.now()
  try {
    let response
    
    if (key === 'create') {
      const payload = JSON.parse(item.body)
      response = await apiClient.post('/api/v1/clinics', payload)
    } else if (key === 'getAll') {
      response = await apiClient.get('/api/v1/clinics')
    } else if (key === 'getOne') {
      response = await apiClient.get(`/api/v1/clinics/${item.params.id}`)
    } else if (key === 'getByStatus') {
      response = await apiClient.get(`/api/v1/clinics/status/${item.params.status}`)
    } else if (key === 'update') {
      const payload = JSON.parse(item.body)
      response = await apiClient.put(`/api/v1/clinics/${item.params.id}`, payload)
    } else if (key === 'patchStatus') {
      response = await apiClient.patch(`/api/v1/clinics/${item.params.id}/status`)
    } else if (key === 'delete') {
      response = await apiClient.delete(`/api/v1/clinics/${item.params.id}`)
    } else if (key === 'validate') {
      response = await apiClient.get('/api/v1/clinics/validate-key', {
        params: { secretKey: item.params.secretKey }
      })
    } else if (key === 'userGetAll') {
      const paramsObj: Record<string, string> = {}
      for (const k in item.params) {
        if (item.params[k] !== undefined && item.params[k] !== '') {
          paramsObj[k] = item.params[k]
        }
      }
      response = await apiClient.get('/sdg/uz', { params: paramsObj })
    } else if (key === 'userGetOne') {
      response = await apiClient.get(`/sdg/uz/${item.params.id}`)
    } else if (key === 'userDelete') {
      response = await apiClient.delete(`/sdg/uz/${item.params.id}`)
    } else if (key === 'userCreate') {
      const payload = JSON.parse(item.body)
      response = await apiClient.post('/sdg/uz/admin', payload)
    } else if (key === 'userEdit') {
      const payload = JSON.parse(item.body)
      response = await apiClient.put('/sdg/uz/edit', payload)
    }

    const endTime = performance.now()
    const timeTaken = Math.round(endTime - startTime)

    if (response) {
      item.response = {
        status: response.status,
        statusText: response.statusText,
        time: timeTaken,
        data: response.data
      }
    }
  } catch (error: any) {
    const endTime = performance.now()
    const timeTaken = Math.round(endTime - startTime)
    
    const status = error.response ? error.response.status : 0
    const statusText = error.response ? error.response.statusText : 'Tarmoq Xatoligi'
    const errorData = error.response ? error.response.data : {
      xabar: error.message || "Serverga bog'lanib bo'lmadi. Base URL va tarmoq ulanishini tekshiring.",
      tavsiyalar: [
        "Backend ishlayotganligini tekshiring.",
        "CORS sozlamalari to'g'ri ekanligini tekshiring.",
        "ngrok URL manzili to'g'riligini tekshiring."
      ]
    }
    
    item.response = {
      status,
      statusText,
      time: timeTaken,
      data: errorData
    }
  } finally {
    item.loading = false
  }
}

// LocalStorage helpers for template access
const saveApiUrl = () => {
  localStorage.setItem('dmed-api-url', apiUrl.value)
}

const resetApiUrl = () => {
  apiUrl.value = defaultApiUrl
  localStorage.setItem('dmed-api-url', defaultApiUrl)
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-white dark:bg-brand-dark transition-colors duration-300">
    
    <!-- Yuqori panel (Sub-header) -->
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
        <span class="text-sm font-bold text-slate-800 dark:text-white font-sans">Clinics API Hujjatlari</span>
      </div>

      <!-- Kun/Tun rejimi -->
      <div class="flex items-center space-x-2">
        <button
          @click="toggleTheme"
          class="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Mavzuni o'zgartirish"
        >
          <Sun v-if="theme === 'dark'" class="w-4 h-4 text-amber-400" />
          <Moon v-else class="w-4 h-4 text-slate-600" />
        </button>
        <span class="text-xs px-2 py-0.5 bg-brand-primary/10 text-brand-primary rounded font-bold uppercase font-mono">v1.0 API</span>
      </div>
    </div>

    <!-- Asosiy 3-panelli blok -->
    <div class="flex flex-1 flex-col md:flex-row relative">
      
      <!-- 1. Chap panel: Navigatsiya (Sidebar) -->
      <aside class="w-full md:w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-brand-dark/40 p-4 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto hidden md:block select-none">
        <div class="space-y-6">
          <div>
            <h3 class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Tushuntirish</h3>
            <ul class="space-y-1">
              <li>
                <button 
                  @click="activeCategory = 'intro'"
                  class="w-full flex items-center justify-between text-left text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                  :class="activeCategory === 'intro' ? 'bg-brand-primary/10 text-brand-primary' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'"
                >
                  <span>API Kirish</span>
                  <ChevronRight class="w-3.5 h-3.5 opacity-60" />
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 font-sans">API Turkumlari</h3>
            <ul class="space-y-1">
              <li>
                <button 
                  @click="activeCategory = 'clinics'"
                  class="w-full flex items-center justify-between text-left text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                  :class="activeCategory === 'clinics' ? 'bg-brand-primary/10 text-brand-primary' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'"
                >
                  <span class="flex items-center space-x-2">
                    <Hospital class="w-3.5 h-3.5 text-brand-primary shrink-0" />
                    <span>Klinikalar API</span>
                  </span>
                  <span class="px-1.5 py-0.5 text-[9px] bg-emerald-500/10 text-emerald-500 rounded font-bold font-mono">Faol</span>
                </button>
              </li>
              <li>
                <button 
                  @click="activeCategory = 'users'"
                  class="w-full flex items-center justify-between text-left text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                  :class="activeCategory === 'users' ? 'bg-brand-primary/10 text-brand-primary' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'"
                >
                  <span class="flex items-center space-x-2">
                    <Hospital class="w-3.5 h-3.5 text-brand-primary shrink-0" />
                    <span>Foydalanuvchilar API</span>
                  </span>
                  <span class="px-1.5 py-0.5 text-[9px] bg-emerald-500/10 text-emerald-500 rounded font-bold font-mono">Faol</span>
                </button>
              </li>
              <li>
                <button 
                  @click="activeCategory = 'doctors'"
                  class="w-full flex items-center justify-between text-left text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                  :class="activeCategory === 'doctors' ? 'bg-brand-primary/10 text-brand-primary' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'"
                >
                  <span class="flex items-center space-x-2">
                    <Hospital class="w-3.5 h-3.5 text-slate-400 shrink-0 opacity-60" />
                    <span>Shifokorlar API</span>
                  </span>
                  <span class="px-1.5 py-0.5 text-[9px] bg-slate-500/10 text-slate-400 rounded font-bold font-mono">Mock</span>
                </button>
              </li>
              <li>
                <button 
                  @click="activeCategory = 'patients'"
                  class="w-full flex items-center justify-between text-left text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                  :class="activeCategory === 'patients' ? 'bg-brand-primary/10 text-brand-primary' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'"
                >
                  <span class="flex items-center space-x-2">
                    <Hospital class="w-3.5 h-3.5 text-slate-400 shrink-0 opacity-60" />
                    <span>Bemorlar API</span>
                  </span>
                  <span class="px-1.5 py-0.5 text-[9px] bg-slate-500/10 text-slate-400 rounded font-bold font-mono">Mock</span>
                </button>
              </li>
              <li>
                <button 
                  @click="activeCategory = 'prescriptions'"
                  class="w-full flex items-center justify-between text-left text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                  :class="activeCategory === 'prescriptions' ? 'bg-brand-primary/10 text-brand-primary' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'"
                >
                  <span class="flex items-center space-x-2">
                    <Hospital class="w-3.5 h-3.5 text-slate-400 shrink-0 opacity-60" />
                    <span>Retseptlar API</span>
                  </span>
                  <span class="px-1.5 py-0.5 text-[9px] bg-slate-500/10 text-slate-400 rounded font-bold font-mono">Mock</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </aside>

      <!-- 2 & 3. O'rta va O'ng panel (Scrollable) -->
      <div class="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-y-auto font-sans">
        
        <!-- API Kirish -->
        <div v-if="activeCategory === 'intro'" id="intro" class="border-b border-slate-200 dark:border-slate-800 grid grid-cols-1 lg:grid-cols-2">
          <div class="p-6 sm:p-8 space-y-4">
            <h1 class="text-3xl font-black text-slate-900 dark:text-white">Klinikalar boshqaruv API integratsiyasi</h1>
            <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              Ushbu API klinikalar ro'yxatini shakllantirish, ularni tahrirlash, o'chirish hamda integratsiya uchun maxfiy kalit (Secret Key) generatsiya qilish imkonini beradi.
            </p>
            <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-xs font-medium space-y-2">
              <span class="font-bold text-slate-700 dark:text-slate-300 block">Base URL sozlash (ngrok manzili):</span>
              <div class="flex items-center space-x-2">
                <input 
                  type="text" 
                  v-model="apiUrl" 
                  @input="saveApiUrl"
                  class="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-primary" 
                  placeholder="https://your-ngrok.ngrok-free.app"
                />
                <button 
                  @click="resetApiUrl" 
                  class="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors font-semibold"
                >
                  Asliga Qaytish
                </button>
              </div>
              <p class="text-[10px] text-slate-400">
                Ushbu manzil barcha API so'rovlari va namunalarda avtomatik yangilanadi.
              </p>
            </div>
          </div>
          <div class="bg-slate-950 p-6 sm:p-8 flex flex-col justify-center border-t lg:border-t-0 border-slate-800 text-slate-300">
            <div class="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">So'rovlar sharti</span>
              <span class="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded uppercase font-mono">Real-time HTTP</span>
            </div>
            <p class="text-xs text-slate-400 leading-relaxed font-medium">
              Ushbu ngrok API-ga so'rov yuborishda <code>ngrok-skip-browser-warning: true</code> sarlavhasini qo'shish majburiydir, aks holda ngrok-ning o'zining warning sahifasi qaytadi.
            </p>
          </div>
        </div>

        <!-- Klinikalar API Turkumi -->
        <div v-if="activeCategory === 'clinics'" class="flex-1 flex flex-col">
          <!-- Sub-navigation pills inside Clinics API -->
          <div class="sticky top-14 z-30 bg-slate-50/90 dark:bg-brand-dark/90 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex gap-2 overflow-x-auto select-none">
            <button 
              v-for="ep in clinicsEndpoints" 
              :key="ep.id"
              @click="scrollToEndpoint(ep.id)"
              class="px-3 py-1 text-xs font-semibold rounded-full border transition-all shrink-0"
              :class="activeEndpoint === ep.id ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-350 border-slate-200 dark:border-slate-800 hover:border-brand-primary-light'"
            >
              {{ ep.label }}
            </button>
          </div>

          <!-- 1. POST /api/v1/clinics -->
          <div id="post-clinic" class="border-b border-slate-200 dark:border-slate-800 grid grid-cols-1 lg:grid-cols-2">
          <div class="p-6 sm:p-8 space-y-6">
            <div class="space-y-2">
              <span class="text-[10px] font-bold text-brand-primary bg-brand-primary/10 px-2.5 py-0.5 rounded uppercase font-mono">POST</span>
              <h2 class="text-2xl font-bold text-slate-900 dark:text-white">1. Yangi klinika yaratish</h2>
              <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Tizimda yangi hamkor klinikani ro'yxatga olish so'rovi.
              </p>
            </div>
            <div class="space-y-4">
              <code class="font-mono font-bold text-xs bg-slate-100 dark:bg-slate-800 p-2 rounded block">POST /api/v1/clinics</code>
              
              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr class="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold">
                      <th class="py-2">Parametr</th>
                      <th class="py-2">Turi</th>
                      <th class="py-2">Majburiy</th>
                      <th class="py-2">Tavsif</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    <tr>
                      <td class="py-2 font-mono font-bold text-brand-primary">name</td>
                      <td class="py-2">string</td>
                      <td class="py-2 text-red-500 font-semibold">Ha</td>
                      <td class="py-2">Klinika nomi</td>
                    </tr>
                    <tr>
                      <td class="py-2 font-mono font-bold text-brand-primary">address</td>
                      <td class="py-2">string</td>
                      <td class="py-2 text-red-500 font-semibold">Ha</td>
                      <td class="py-2">Klinika joylashgan manzil</td>
                    </tr>
                    <tr>
                      <td class="py-2 font-mono font-bold text-brand-primary">phone</td>
                      <td class="py-2">string</td>
                      <td class="py-2 text-red-500 font-semibold">Ha</td>
                      <td class="py-2">Klinika aloqa raqami</td>
                    </tr>
                    <tr>
                      <td class="py-2 font-mono font-bold text-brand-primary">email</td>
                      <td class="py-2">string</td>
                      <td class="py-2 text-red-500 font-semibold">Ha</td>
                      <td class="py-2">Elektron pochta manzili</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          <div class="bg-slate-950 p-6 sm:p-8 space-y-6 text-slate-300 font-mono text-xs border-t lg:border-t-0 border-slate-800">
            <div class="flex items-center justify-between border-b border-slate-800 pb-3">
              <div class="flex space-x-4">
                <button 
                  @click="playground.create.tab = 'example'" 
                  :class="playground.create.tab === 'example' ? 'text-brand-primary border-b-2 border-brand-primary pb-3 -mb-3 font-bold' : 'text-slate-500 hover:text-slate-300 pb-3 -mb-3'"
                >
                  Namuna
                </button>
                <button 
                  @click="playground.create.tab = 'playground'" 
                  :class="playground.create.tab === 'playground' ? 'text-brand-primary border-b-2 border-brand-primary pb-3 -mb-3 font-bold' : 'text-slate-500 hover:text-slate-300 pb-3 -mb-3'"
                >
                  Playground 🧪
                </button>
              </div>
              <div v-if="playground.create.tab === 'example'" class="flex space-x-2 text-[10px] font-bold">
                <button @click="selectedLanguage = 'curl'" :class="selectedLanguage === 'curl' ? 'text-brand-primary font-black' : 'text-slate-500 hover:text-slate-300'">CURL</button>
                <button @click="selectedLanguage = 'js'" :class="selectedLanguage === 'js' ? 'text-brand-primary font-black' : 'text-slate-500 hover:text-slate-300'">JS</button>
                <button @click="selectedLanguage = 'python'" :class="selectedLanguage === 'python' ? 'text-brand-primary font-black' : 'text-slate-500 hover:text-slate-300'">Python</button>
              </div>
            </div>
            
            <div v-if="playground.create.tab === 'example'" class="space-y-6">
              <div class="relative bg-slate-900 rounded-xl p-4 border border-slate-800 group">
                <button @click="copyToClipboard(snippets.create[selectedLanguage], 'create')" class="absolute right-3 top-3 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Check v-if="copiedEndpoint === 'create'" class="w-4 h-4 text-emerald-500" />
                  <Copy v-else class="w-4 h-4" />
                </button>
                <pre class="overflow-x-auto leading-relaxed"><code>{{ snippets.create[selectedLanguage] }}</code></pre>
              </div>
              <div class="space-y-3">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block border-b border-slate-800 pb-2">Response namunasi</span>
                <div class="bg-slate-900 rounded-xl p-4 border border-slate-800 overflow-x-auto">
                  <pre class="leading-relaxed"><code>{
  "id": 12,
  "name": "Shifo Med",
  "address": "Toshkent sh., Chilonzor 5-daha",
  "phone": "+998901234567",
  "email": "contact@shifomed.uz",
  "status": "INACTIVE",
  "secretKey": null
}</code></pre>
                </div>
              </div>
            </div>
            
            <div v-else class="space-y-4">
              <div class="space-y-2">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Request Body (JSON)</span>
                <textarea 
                  v-model="playground.create.body" 
                  rows="6"
                  class="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-200 focus:outline-none focus:border-brand-primary"
                ></textarea>
              </div>
              
              <button 
                @click="runPlaygroundRequest('create')"
                :disabled="playground.create.loading"
                class="w-full py-2.5 px-4 bg-brand-primary hover:bg-brand-primary/95 text-white font-bold rounded-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span v-if="playground.create.loading" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                <span>{{ playground.create.loading ? 'So\'rov yuborilmoqda...' : 'So\'rov yuborish (Send Request)' }}</span>
              </button>
              
              <div v-if="playground.create.response" class="space-y-3">
                <div class="flex items-center justify-between border-t border-slate-800 pt-3">
                  <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Natija (Response)</span>
                  <div class="flex space-x-3 text-[10px] font-mono">
                    <span :class="playground.create.response.status >= 200 && playground.create.response.status < 300 ? 'text-emerald-500' : 'text-red-500'">
                      Status: {{ playground.create.response.status }} {{ playground.create.response.statusText }}
                    </span>
                    <span class="text-slate-400">
                      Vaqt: {{ playground.create.response.time }} ms
                    </span>
                  </div>
                </div>
                <div class="bg-slate-900 rounded-xl p-4 border border-slate-800 overflow-x-auto max-h-72">
                  <pre class="leading-relaxed"><code class="text-slate-200">{{ JSON.stringify(playground.create.response.data, null, 2) }}</code></pre>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. GET /api/v1/clinics -->
        <div id="get-clinics" class="border-b border-slate-200 dark:border-slate-800 grid grid-cols-1 lg:grid-cols-2">
          <div class="p-6 sm:p-8 space-y-6">
            <div class="space-y-2">
              <span class="text-[10px] font-bold text-brand-primary bg-brand-primary/10 px-2.5 py-0.5 rounded uppercase font-mono">GET</span>
              <h2 class="text-2xl font-bold text-slate-900 dark:text-white">2. Barcha klinikalarni olish</h2>
              <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Tizimdagi barcha ro'yxatdan o'tgan klinikalar ro'yxatini yuklash so'rovi.
              </p>
            </div>
            <div class="space-y-4">
              <code class="font-mono font-bold text-xs bg-slate-100 dark:bg-slate-800 p-2 rounded block">GET /api/v1/clinics</code>
            </div>
          </div>
          
          <div class="bg-slate-950 p-6 sm:p-8 space-y-6 text-slate-300 font-mono text-xs border-t lg:border-t-0 border-slate-800">
            <div class="flex items-center justify-between border-b border-slate-800 pb-3">
              <div class="flex space-x-4">
                <button 
                  @click="playground.getAll.tab = 'example'" 
                  :class="playground.getAll.tab === 'example' ? 'text-brand-primary border-b-2 border-brand-primary pb-3 -mb-3 font-bold' : 'text-slate-500 hover:text-slate-300 pb-3 -mb-3'"
                >
                  Namuna
                </button>
                <button 
                  @click="playground.getAll.tab = 'playground'" 
                  :class="playground.getAll.tab === 'playground' ? 'text-brand-primary border-b-2 border-brand-primary pb-3 -mb-3 font-bold' : 'text-slate-500 hover:text-slate-300 pb-3 -mb-3'"
                >
                  Playground 🧪
                </button>
              </div>
              <div v-if="playground.getAll.tab === 'example'" class="flex space-x-2 text-[10px] font-bold">
                <button @click="selectedLanguage = 'curl'" :class="selectedLanguage === 'curl' ? 'text-brand-primary font-black' : 'text-slate-500 hover:text-slate-300'">CURL</button>
                <button @click="selectedLanguage = 'js'" :class="selectedLanguage === 'js' ? 'text-brand-primary font-black' : 'text-slate-500 hover:text-slate-300'">JS</button>
                <button @click="selectedLanguage = 'python'" :class="selectedLanguage === 'python' ? 'text-brand-primary font-black' : 'text-slate-500 hover:text-slate-300'">Python</button>
              </div>
            </div>
            
            <div v-if="playground.getAll.tab === 'example'" class="space-y-6">
              <div class="relative bg-slate-900 rounded-xl p-4 border border-slate-800">
                <pre class="overflow-x-auto leading-relaxed"><code>{{ snippets.getAll[selectedLanguage] }}</code></pre>
              </div>
              <div class="space-y-3">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block border-b border-slate-800 pb-2">Response namunasi</span>
                <div class="bg-slate-900 rounded-xl p-4 border border-slate-800 overflow-x-auto">
                  <pre class="leading-relaxed"><code>[
  {
    "id": 12,
    "name": "Shifo Med",
    "address": "Toshkent sh., Chilonzor 5-daha",
    "phone": "+998901234567",
    "email": "contact@shifomed.uz",
    "status": "ACTIVE",
    "secretKey": "sec_key_abc123xyz"
  }
]</code></pre>
                </div>
              </div>
            </div>
            
            <div v-else class="space-y-4">
              <p class="text-xs text-slate-400">Parametrlar talab qilinmaydi. So'rov yuborish tugmasini bosing.</p>
              
              <button 
                @click="runPlaygroundRequest('getAll')"
                :disabled="playground.getAll.loading"
                class="w-full py-2.5 px-4 bg-brand-primary hover:bg-brand-primary/95 text-white font-bold rounded-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span v-if="playground.getAll.loading" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                <span>{{ playground.getAll.loading ? 'So\'rov yuborilmoqda...' : 'So\'rov yuborish (Send Request)' }}</span>
              </button>
              
              <div v-if="playground.getAll.response" class="space-y-3">
                <div class="flex items-center justify-between border-t border-slate-800 pt-3">
                  <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Natija (Response)</span>
                  <div class="flex space-x-3 text-[10px] font-mono">
                    <span :class="playground.getAll.response.status >= 200 && playground.getAll.response.status < 300 ? 'text-emerald-500' : 'text-red-500'">
                      Status: {{ playground.getAll.response.status }} {{ playground.getAll.response.statusText }}
                    </span>
                    <span class="text-slate-400">
                      Vaqt: {{ playground.getAll.response.time }} ms
                    </span>
                  </div>
                </div>
                <div class="bg-slate-900 rounded-xl p-4 border border-slate-800 overflow-x-auto max-h-72">
                  <pre class="leading-relaxed"><code class="text-slate-200">{{ JSON.stringify(playground.getAll.response.data, null, 2) }}</code></pre>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. GET /api/v1/clinics/{id} -->
        <div id="get-clinic-id" class="border-b border-slate-200 dark:border-slate-800 grid grid-cols-1 lg:grid-cols-2">
          <div class="p-6 sm:p-8 space-y-6">
            <div class="space-y-2">
              <span class="text-[10px] font-bold text-brand-primary bg-brand-primary/10 px-2.5 py-0.5 rounded uppercase font-mono">GET</span>
              <h2 class="text-2xl font-bold text-slate-900 dark:text-white">3. ID bo'yicha klinika olish</h2>
              <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Unikal ID raqami orqali bitta klinika tafsilotlarini yuklash.
              </p>
            </div>
            <div class="space-y-4 font-mono text-xs">
              <code class="font-mono font-bold text-xs bg-slate-100 dark:bg-slate-800 p-2 rounded block">GET /api/v1/clinics/{id}</code>
            </div>
          </div>
          
          <div class="bg-slate-950 p-6 sm:p-8 space-y-6 text-slate-300 font-mono text-xs border-t lg:border-t-0 border-slate-800">
            <div class="flex items-center justify-between border-b border-slate-800 pb-3">
              <div class="flex space-x-4">
                <button 
                  @click="playground.getOne.tab = 'example'" 
                  :class="playground.getOne.tab === 'example' ? 'text-brand-primary border-b-2 border-brand-primary pb-3 -mb-3 font-bold' : 'text-slate-500 hover:text-slate-300 pb-3 -mb-3'"
                >
                  Namuna
                </button>
                <button 
                  @click="playground.getOne.tab = 'playground'" 
                  :class="playground.getOne.tab === 'playground' ? 'text-brand-primary border-b-2 border-brand-primary pb-3 -mb-3 font-bold' : 'text-slate-500 hover:text-slate-300 pb-3 -mb-3'"
                >
                  Playground 🧪
                </button>
              </div>
              <div v-if="playground.getOne.tab === 'example'" class="flex space-x-2 text-[10px] font-bold">
                <button @click="selectedLanguage = 'curl'" :class="selectedLanguage === 'curl' ? 'text-brand-primary font-black' : 'text-slate-500 hover:text-slate-300'">CURL</button>
                <button @click="selectedLanguage = 'js'" :class="selectedLanguage === 'js' ? 'text-brand-primary font-black' : 'text-slate-500 hover:text-slate-300'">JS</button>
                <button @click="selectedLanguage = 'python'" :class="selectedLanguage === 'python' ? 'text-brand-primary font-black' : 'text-slate-500 hover:text-slate-300'">Python</button>
              </div>
            </div>
            
            <div v-if="playground.getOne.tab === 'example'" class="space-y-6">
              <div class="relative bg-slate-900 rounded-xl p-4 border border-slate-800">
                <pre class="overflow-x-auto leading-relaxed"><code>{{ snippets.getOne[selectedLanguage] }}</code></pre>
              </div>
              <div class="space-y-3">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block border-b border-slate-800 pb-2">Response namunasi</span>
                <div class="bg-slate-900 rounded-xl p-4 border border-slate-800 overflow-x-auto">
                  <pre class="leading-relaxed"><code>{
  "id": 12,
  "name": "Shifo Med",
  "address": "Toshkent sh., Chilonzor 5-daha",
  "phone": "+998901234567",
  "email": "contact@shifomed.uz",
  "status": "ACTIVE",
  "secretKey": "sec_key_abc123xyz"
}</code></pre>
                </div>
              </div>
            </div>
            
            <div v-else class="space-y-4">
              <div class="space-y-2">
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Klinika ID</label>
                <input 
                  type="text" 
                  v-model="playground.getOne.params.id" 
                  class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 font-mono text-xs text-slate-200 focus:outline-none focus:border-brand-primary"
                  placeholder="Klinika ID raqami"
                />
              </div>
              
              <button 
                @click="runPlaygroundRequest('getOne')"
                :disabled="playground.getOne.loading"
                class="w-full py-2.5 px-4 bg-brand-primary hover:bg-brand-primary/95 text-white font-bold rounded-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span v-if="playground.getOne.loading" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                <span>{{ playground.getOne.loading ? 'So\'rov yuborilmoqda...' : 'So\'rov yuborish (Send Request)' }}</span>
              </button>
              
              <div v-if="playground.getOne.response" class="space-y-3">
                <div class="flex items-center justify-between border-t border-slate-800 pt-3">
                  <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Natija (Response)</span>
                  <div class="flex space-x-3 text-[10px] font-mono">
                    <span :class="playground.getOne.response.status >= 200 && playground.getOne.response.status < 300 ? 'text-emerald-500' : 'text-red-500'">
                      Status: {{ playground.getOne.response.status }} {{ playground.getOne.response.statusText }}
                    </span>
                    <span class="text-slate-400">
                      Vaqt: {{ playground.getOne.response.time }} ms
                    </span>
                  </div>
                </div>
                <div class="bg-slate-900 rounded-xl p-4 border border-slate-800 overflow-x-auto max-h-72">
                  <pre class="leading-relaxed"><code class="text-slate-200">{{ JSON.stringify(playground.getOne.response.data, null, 2) }}</code></pre>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 4. GET /api/v1/clinics/status/{status} -->
        <div id="get-clinics-status" class="border-b border-slate-200 dark:border-slate-800 grid grid-cols-1 lg:grid-cols-2">
          <div class="p-6 sm:p-8 space-y-6">
            <div class="space-y-2">
              <span class="text-[10px] font-bold text-brand-primary bg-brand-primary/10 px-2.5 py-0.5 rounded uppercase font-mono">GET</span>
              <h2 class="text-2xl font-bold text-slate-900 dark:text-white">4. Status bo'yicha klinikalarni olish</h2>
              <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Klinikalarni statusi (ACTIVE yoki INACTIVE) bo'yicha filtrlab yuklash.
              </p>
            </div>
            <div class="space-y-4 font-mono text-xs">
              <code class="font-bold text-xs bg-slate-100 dark:bg-slate-800 p-2 rounded block">GET /api/v1/clinics/status/{status}</code>
            </div>
          </div>
          <div class="bg-slate-950 p-6 sm:p-8 space-y-6 text-slate-300 font-mono text-xs border-t lg:border-t-0 border-slate-800">
            <div class="flex items-center justify-between border-b border-slate-800 pb-3">
              <div class="flex space-x-4">
                <button 
                  @click="playground.getByStatus.tab = 'example'" 
                  :class="playground.getByStatus.tab === 'example' ? 'text-brand-primary border-b-2 border-brand-primary pb-3 -mb-3 font-bold' : 'text-slate-500 hover:text-slate-300 pb-3 -mb-3'"
                >
                  Namuna
                </button>
                <button 
                  @click="playground.getByStatus.tab = 'playground'" 
                  :class="playground.getByStatus.tab === 'playground' ? 'text-brand-primary border-b-2 border-brand-primary pb-3 -mb-3 font-bold' : 'text-slate-500 hover:text-slate-300 pb-3 -mb-3'"
                >
                  Playground 🧪
                </button>
              </div>
              <div v-if="playground.getByStatus.tab === 'example'" class="flex space-x-2 text-[10px] font-bold">
                <button @click="selectedLanguage = 'curl'" :class="selectedLanguage === 'curl' ? 'text-brand-primary font-black' : 'text-slate-500 hover:text-slate-300'">CURL</button>
                <button @click="selectedLanguage = 'js'" :class="selectedLanguage === 'js' ? 'text-brand-primary font-black' : 'text-slate-500 hover:text-slate-300'">JS</button>
                <button @click="selectedLanguage = 'python'" :class="selectedLanguage === 'python' ? 'text-brand-primary font-black' : 'text-slate-500 hover:text-slate-300'">Python</button>
              </div>
            </div>
            
            <div v-if="playground.getByStatus.tab === 'example'" class="space-y-6">
              <div class="relative bg-slate-900 rounded-xl p-4 border border-slate-800">
                <pre class="overflow-x-auto leading-relaxed"><code>{{ snippets.getByStatus[selectedLanguage] }}</code></pre>
              </div>
              <div class="space-y-3">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block border-b border-slate-800 pb-2">Response namunasi</span>
                <div class="bg-slate-900 rounded-xl p-4 border border-slate-800 overflow-x-auto">
                  <pre class="leading-relaxed"><code>[
  {
    "id": 12,
    "name": "Shifo Med",
    "address": "Toshkent sh., Chilonzor 5-daha",
    "phone": "+998901234567",
    "email": "contact@shifomed.uz",
    "status": "ACTIVE",
    "secretKey": "sec_key_abc123xyz"
  }
]</code></pre>
                </div>
              </div>
            </div>
            
            <div v-else class="space-y-4">
              <div class="space-y-2">
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Klinika Statusi</label>
                <select 
                  v-model="playground.getByStatus.params.status" 
                  class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 font-mono text-xs text-slate-200 focus:outline-none focus:border-brand-primary"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
              
              <button 
                @click="runPlaygroundRequest('getByStatus')"
                :disabled="playground.getByStatus.loading"
                class="w-full py-2.5 px-4 bg-brand-primary hover:bg-brand-primary/95 text-white font-bold rounded-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span v-if="playground.getByStatus.loading" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                <span>{{ playground.getByStatus.loading ? 'So\'rov yuborilmoqda...' : 'So\'rov yuborish (Send Request)' }}</span>
              </button>
              
              <div v-if="playground.getByStatus.response" class="space-y-3">
                <div class="flex items-center justify-between border-t border-slate-800 pt-3">
                  <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Natija (Response)</span>
                  <div class="flex space-x-3 text-[10px] font-mono">
                    <span :class="playground.getByStatus.response.status >= 200 && playground.getByStatus.response.status < 300 ? 'text-emerald-500' : 'text-red-500'">
                      Status: {{ playground.getByStatus.response.status }} {{ playground.getByStatus.response.statusText }}
                    </span>
                    <span class="text-slate-400">
                      Vaqt: {{ playground.getByStatus.response.time }} ms
                    </span>
                  </div>
                </div>
                <div class="bg-slate-900 rounded-xl p-4 border border-slate-800 overflow-x-auto max-h-72">
                  <pre class="leading-relaxed"><code class="text-slate-200">{{ JSON.stringify(playground.getByStatus.response.data, null, 2) }}</code></pre>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 5. PUT /api/v1/clinics/{id} -->
        <div id="put-clinic" class="border-b border-slate-200 dark:border-slate-800 grid grid-cols-1 lg:grid-cols-2">
          <div class="p-6 sm:p-8 space-y-6">
            <div class="space-y-2">
              <span class="text-[10px] font-bold text-brand-primary bg-brand-primary/10 px-2.5 py-0.5 rounded uppercase font-mono font-bold">PUT</span>
              <h2 class="text-2xl font-bold text-slate-900 dark:text-white">5. Klinika ma'lumotlarini yangilash</h2>
              <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Mavjud klinika ma'lumotlarini (Nomi, Manzili, Aloqa, Pochta) butunlay o'zgartirish.
              </p>
            </div>
            <div class="space-y-4 font-mono text-xs">
              <code class="font-bold text-xs bg-slate-100 dark:bg-slate-800 p-2 rounded block">PUT /api/v1/clinics/{id}</code>
            </div>
          </div>
          <div class="bg-slate-950 p-6 sm:p-8 space-y-6 text-slate-300 font-mono text-xs border-t lg:border-t-0 border-slate-800">
            <div class="flex items-center justify-between border-b border-slate-800 pb-3">
              <div class="flex space-x-4">
                <button 
                  @click="playground.update.tab = 'example'" 
                  :class="playground.update.tab === 'example' ? 'text-brand-primary border-b-2 border-brand-primary pb-3 -mb-3 font-bold' : 'text-slate-500 hover:text-slate-300 pb-3 -mb-3'"
                >
                  Namuna
                </button>
                <button 
                  @click="playground.update.tab = 'playground'" 
                  :class="playground.update.tab === 'playground' ? 'text-brand-primary border-b-2 border-brand-primary pb-3 -mb-3 font-bold' : 'text-slate-500 hover:text-slate-300 pb-3 -mb-3'"
                >
                  Playground 🧪
                </button>
              </div>
              <div v-if="playground.update.tab === 'example'" class="flex space-x-2 text-[10px] font-bold">
                <button @click="selectedLanguage = 'curl'" :class="selectedLanguage === 'curl' ? 'text-brand-primary font-black' : 'text-slate-500 hover:text-slate-300'">CURL</button>
                <button @click="selectedLanguage = 'js'" :class="selectedLanguage === 'js' ? 'text-brand-primary font-black' : 'text-slate-500 hover:text-slate-300'">JS</button>
                <button @click="selectedLanguage = 'python'" :class="selectedLanguage === 'python' ? 'text-brand-primary font-black' : 'text-slate-500 hover:text-slate-300'">Python</button>
              </div>
            </div>
            
            <div v-if="playground.update.tab === 'example'" class="space-y-6">
              <div class="relative bg-slate-900 rounded-xl p-4 border border-slate-800">
                <pre class="overflow-x-auto leading-relaxed"><code>{{ snippets.update[selectedLanguage] }}</code></pre>
              </div>
              <div class="space-y-3">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block border-b border-slate-800 pb-2">Response namunasi</span>
                <div class="bg-slate-900 rounded-xl p-4 border border-slate-800 overflow-x-auto">
                  <pre class="leading-relaxed"><code>{
  "id": 12,
  "name": "Shifo Med Yangilangan",
  "address": "Toshkent sh., Chilonzor 7-daha",
  "phone": "+998907654321",
  "email": "new@shifomed.uz",
  "status": "ACTIVE",
  "secretKey": "sec_key_abc123xyz"
}</code></pre>
                </div>
              </div>
            </div>
            
            <div v-else class="space-y-4">
              <div class="space-y-2">
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Klinika ID</label>
                <input 
                  type="text" 
                  v-model="playground.update.params.id" 
                  class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 font-mono text-xs text-slate-200 focus:outline-none focus:border-brand-primary"
                  placeholder="Klinika ID raqami"
                />
              </div>
              
              <div class="space-y-2">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Request Body (JSON)</span>
                <textarea 
                  v-model="playground.update.body" 
                  rows="6"
                  class="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-200 focus:outline-none focus:border-brand-primary"
                ></textarea>
              </div>
              
              <button 
                @click="runPlaygroundRequest('update')"
                :disabled="playground.update.loading"
                class="w-full py-2.5 px-4 bg-brand-primary hover:bg-brand-primary/95 text-white font-bold rounded-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span v-if="playground.update.loading" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                <span>{{ playground.update.loading ? 'So\'rov yuborilmoqda...' : 'So\'rov yuborish (Send Request)' }}</span>
              </button>
              
              <div v-if="playground.update.response" class="space-y-3">
                <div class="flex items-center justify-between border-t border-slate-800 pt-3">
                  <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Natija (Response)</span>
                  <div class="flex space-x-3 text-[10px] font-mono">
                    <span :class="playground.update.response.status >= 200 && playground.update.response.status < 300 ? 'text-emerald-500' : 'text-red-500'">
                      Status: {{ playground.update.response.status }} {{ playground.update.response.statusText }}
                    </span>
                    <span class="text-slate-400">
                      Vaqt: {{ playground.update.response.time }} ms
                    </span>
                  </div>
                </div>
                <div class="bg-slate-900 rounded-xl p-4 border border-slate-800 overflow-x-auto max-h-72">
                  <pre class="leading-relaxed"><code class="text-slate-200">{{ JSON.stringify(playground.update.response.data, null, 2) }}</code></pre>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 6. PATCH /api/v1/clinics/{id}/status -->
        <div id="patch-status" class="border-b border-slate-200 dark:border-slate-800 grid grid-cols-1 lg:grid-cols-2">
          <div class="p-6 sm:p-8 space-y-6">
            <div class="space-y-2">
              <span class="text-[10px] font-bold text-brand-primary bg-brand-primary/10 px-2.5 py-0.5 rounded uppercase font-mono">PATCH</span>
              <h2 class="text-2xl font-bold text-slate-900 dark:text-white">6. Klinika statusini o'zgartirish</h2>
              <p class="text-xs text-slate-500 dark:text-slate-400 font-medium font-sans">
                Klinika faolligini ACTIVE / INACTIVE holatiga o'tkazish. Klinika statusi birinchi marta <strong>ACTIVE</strong> holatiga o'tkazilganda, tizim unga integratsiya uchun maxsus <code>secretKey</code> kalitini generatsiya qiladi.
              </p>
            </div>
            <div class="space-y-4 font-mono text-xs">
              <code class="font-bold text-xs bg-slate-100 dark:bg-slate-800 p-2 rounded block">PATCH /api/v1/clinics/{id}/status</code>
            </div>
          </div>
          <div class="bg-slate-950 p-6 sm:p-8 space-y-6 text-slate-300 font-mono text-xs border-t lg:border-t-0 border-slate-800">
            <div class="flex items-center justify-between border-b border-slate-800 pb-3">
              <div class="flex space-x-4">
                <button 
                  @click="playground.patchStatus.tab = 'example'" 
                  :class="playground.patchStatus.tab === 'example' ? 'text-brand-primary border-b-2 border-brand-primary pb-3 -mb-3 font-bold' : 'text-slate-500 hover:text-slate-300 pb-3 -mb-3'"
                >
                  Namuna
                </button>
                <button 
                  @click="playground.patchStatus.tab = 'playground'" 
                  :class="playground.patchStatus.tab === 'playground' ? 'text-brand-primary border-b-2 border-brand-primary pb-3 -mb-3 font-bold' : 'text-slate-500 hover:text-slate-300 pb-3 -mb-3'"
                >
                  Playground 🧪
                </button>
              </div>
              <div v-if="playground.patchStatus.tab === 'example'" class="flex space-x-2 text-[10px] font-bold">
                <button @click="selectedLanguage = 'curl'" :class="selectedLanguage === 'curl' ? 'text-brand-primary font-black' : 'text-slate-500 hover:text-slate-300'">CURL</button>
                <button @click="selectedLanguage = 'js'" :class="selectedLanguage === 'js' ? 'text-brand-primary font-black' : 'text-slate-500 hover:text-slate-300'">JS</button>
                <button @click="selectedLanguage = 'python'" :class="selectedLanguage === 'python' ? 'text-brand-primary font-black' : 'text-slate-500 hover:text-slate-300'">Python</button>
              </div>
            </div>
            
            <div v-if="playground.patchStatus.tab === 'example'" class="space-y-6">
              <div class="relative bg-slate-900 rounded-xl p-4 border border-slate-800">
                <pre class="overflow-x-auto leading-relaxed"><code>{{ snippets.patchStatus[selectedLanguage] }}</code></pre>
              </div>
              <div class="space-y-3">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block border-b border-slate-800 pb-2">Response namunasi</span>
                <div class="bg-slate-900 rounded-xl p-4 border border-slate-800 overflow-x-auto">
                  <pre class="leading-relaxed"><code>{
  "id": 12,
  "name": "Shifo Med",
  "address": "Toshkent sh., Chilonzor 5-daha",
  "phone": "+998901234567",
  "email": "contact@shifomed.uz",
  "status": "ACTIVE",
  "secretKey": "sec_key_abc123xyz"
}</code></pre>
                </div>
              </div>
            </div>
            
            <div v-else class="space-y-4">
              <div class="space-y-2">
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Klinika ID</label>
                <input 
                  type="text" 
                  v-model="playground.patchStatus.params.id" 
                  class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 font-mono text-xs text-slate-200 focus:outline-none focus:border-brand-primary"
                  placeholder="Klinika ID raqami"
                />
              </div>
              
              <p class="text-xs text-slate-400">
                Ushbu so'rov klinika statusini faoliyat yo'nalishiga qarab almashtiradi (ACTIVE &lt;-&gt; INACTIVE).
              </p>
              
              <button 
                @click="runPlaygroundRequest('patchStatus')"
                :disabled="playground.patchStatus.loading"
                class="w-full py-2.5 px-4 bg-brand-primary hover:bg-brand-primary/95 text-white font-bold rounded-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span v-if="playground.patchStatus.loading" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                <span>{{ playground.patchStatus.loading ? 'So\'rov yuborilmoqda...' : 'Statusni almashtirish (Send Request)' }}</span>
              </button>
              
              <div v-if="playground.patchStatus.response" class="space-y-3">
                <div class="flex items-center justify-between border-t border-slate-800 pt-3">
                  <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Natija (Response)</span>
                  <div class="flex space-x-3 text-[10px] font-mono">
                    <span :class="playground.patchStatus.response.status >= 200 && playground.patchStatus.response.status < 300 ? 'text-emerald-500' : 'text-red-500'">
                      Status: {{ playground.patchStatus.response.status }} {{ playground.patchStatus.response.statusText }}
                    </span>
                    <span class="text-slate-400">
                      Vaqt: {{ playground.patchStatus.response.time }} ms
                    </span>
                  </div>
                </div>
                <div class="bg-slate-900 rounded-xl p-4 border border-slate-800 overflow-x-auto max-h-72">
                  <pre class="leading-relaxed"><code class="text-slate-200">{{ JSON.stringify(playground.patchStatus.response.data, null, 2) }}</code></pre>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 7. DELETE /api/v1/clinics/{id} -->
        <div id="delete-clinic" class="border-b border-slate-200 dark:border-slate-800 grid grid-cols-1 lg:grid-cols-2">
          <div class="p-6 sm:p-8 space-y-6">
            <div class="space-y-2">
              <span class="text-[10px] font-bold text-brand-primary bg-brand-primary/10 px-2.5 py-0.5 rounded uppercase font-mono">DELETE</span>
              <h2 class="text-2xl font-bold text-slate-900 dark:text-white">7. Klinikani o'chirish</h2>
              <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">
                ID bo'yicha klinikani tizimdan butunlay o'chirib yuborish.
              </p>
            </div>
            <div class="space-y-4 font-mono text-xs">
              <code class="font-bold text-xs bg-slate-100 dark:bg-slate-800 p-2 rounded block">DELETE /api/v1/clinics/{id}</code>
            </div>
          </div>
          <div class="bg-slate-950 p-6 sm:p-8 space-y-6 text-slate-300 font-mono text-xs border-t lg:border-t-0 border-slate-800">
            <div class="flex items-center justify-between border-b border-slate-800 pb-3">
              <div class="flex space-x-4">
                <button 
                  @click="playground.delete.tab = 'example'" 
                  :class="playground.delete.tab === 'example' ? 'text-brand-primary border-b-2 border-brand-primary pb-3 -mb-3 font-bold' : 'text-slate-500 hover:text-slate-300 pb-3 -mb-3'"
                >
                  Namuna
                </button>
                <button 
                  @click="playground.delete.tab = 'playground'" 
                  :class="playground.delete.tab === 'playground' ? 'text-brand-primary border-b-2 border-brand-primary pb-3 -mb-3 font-bold' : 'text-slate-500 hover:text-slate-300 pb-3 -mb-3'"
                >
                  Playground 🧪
                </button>
              </div>
              <div v-if="playground.delete.tab === 'example'" class="flex space-x-2 text-[10px] font-bold">
                <button @click="selectedLanguage = 'curl'" :class="selectedLanguage === 'curl' ? 'text-brand-primary font-black' : 'text-slate-500 hover:text-slate-300'">CURL</button>
                <button @click="selectedLanguage = 'js'" :class="selectedLanguage === 'js' ? 'text-brand-primary font-black' : 'text-slate-500 hover:text-slate-300'">JS</button>
                <button @click="selectedLanguage = 'python'" :class="selectedLanguage === 'python' ? 'text-brand-primary font-black' : 'text-slate-500 hover:text-slate-300'">Python</button>
              </div>
            </div>
            
            <div v-if="playground.delete.tab === 'example'" class="space-y-6">
              <div class="relative bg-slate-900 rounded-xl p-4 border border-slate-800">
                <pre class="overflow-x-auto leading-relaxed"><code>{{ snippets.delete[selectedLanguage] }}</code></pre>
              </div>
              <div class="space-y-3">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block border-b border-slate-800 pb-2">Response namunasi</span>
                <div class="bg-slate-900 rounded-xl p-4 border border-slate-800 overflow-x-auto">
                  <pre class="leading-relaxed"><code>{
  "message": "Klinika muvaffaqiyatli o'chirildi."
}</code></pre>
                </div>
              </div>
            </div>
            
            <div v-else class="space-y-4">
              <div class="space-y-2">
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Klinika ID</label>
                <input 
                  type="text" 
                  v-model="playground.delete.params.id" 
                  class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 font-mono text-xs text-slate-200 focus:outline-none focus:border-brand-primary"
                  placeholder="Klinika ID raqami"
                />
              </div>
              
              <button 
                @click="runPlaygroundRequest('delete')"
                :disabled="playground.delete.loading"
                class="w-full py-2.5 px-4 bg-brand-primary hover:bg-brand-primary/95 text-white font-bold rounded-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span v-if="playground.delete.loading" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                <span>{{ playground.delete.loading ? 'O\'chirilmoqda...' : 'Klinikani o\'chirish (Send Request)' }}</span>
              </button>
              
              <div v-if="playground.delete.response" class="space-y-3">
                <div class="flex items-center justify-between border-t border-slate-800 pt-3">
                  <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Natija (Response)</span>
                  <div class="flex space-x-3 text-[10px] font-mono">
                    <span :class="playground.delete.response.status >= 200 && playground.delete.response.status < 300 ? 'text-emerald-500' : 'text-red-500'">
                      Status: {{ playground.delete.response.status }} {{ playground.delete.response.statusText }}
                    </span>
                    <span class="text-slate-400">
                      Vaqt: {{ playground.delete.response.time }} ms
                    </span>
                  </div>
                </div>
                <div class="bg-slate-900 rounded-xl p-4 border border-slate-800 overflow-x-auto max-h-72">
                  <pre class="leading-relaxed"><code class="text-slate-200">{{ JSON.stringify(playground.delete.response.data, null, 2) }}</code></pre>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 8. GET /api/v1/clinics/validate-key -->
        <div id="validate-key" class="border-b border-slate-200 dark:border-slate-800 grid grid-cols-1 lg:grid-cols-2">
          <div class="p-6 sm:p-8 space-y-6">
            <div class="space-y-2">
              <span class="text-[10px] font-bold text-brand-primary bg-brand-primary/10 px-2.5 py-0.5 rounded uppercase font-mono">GET</span>
              <h2 class="text-2xl font-bold text-slate-900 dark:text-white">8. Secret Key kalitini tekshirish</h2>
              <p class="text-xs text-slate-500 dark:text-slate-400 font-medium font-sans">
                Berilgan secret key orqali klinikani tekshirish so'rovi. Ushbu so'rov avtorizatsiya talab qilmaydi.
              </p>
            </div>
            <div class="space-y-4">
              <code class="font-mono font-bold text-xs bg-slate-100 dark:bg-slate-800 p-2 rounded block">GET /api/v1/clinics/validate-key?secretKey={key}</code>
              
              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr class="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold">
                      <th class="py-2">Query Parametr</th>
                      <th class="py-2">Turi</th>
                      <th class="py-2">Majburiy</th>
                      <th class="py-2">Tavsif</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    <tr>
                      <td class="py-2 font-mono font-bold text-brand-primary">secretKey</td>
                      <td class="py-2">string</td>
                      <td class="py-2 text-red-500 font-semibold font-sans">Ha</td>
                      <td class="py-2">Klinikaning faol Secret Key integratsiya kaliti</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div class="bg-slate-950 p-6 sm:p-8 space-y-6 text-slate-300 font-mono text-xs border-t lg:border-t-0 border-slate-800">
            <div class="flex items-center justify-between border-b border-slate-800 pb-3">
              <div class="flex space-x-4">
                <button 
                  @click="playground.validate.tab = 'example'" 
                  :class="playground.validate.tab === 'example' ? 'text-brand-primary border-b-2 border-brand-primary pb-3 -mb-3 font-bold' : 'text-slate-500 hover:text-slate-300 pb-3 -mb-3'"
                >
                  Namuna
                </button>
                <button 
                  @click="playground.validate.tab = 'playground'" 
                  :class="playground.validate.tab === 'playground' ? 'text-brand-primary border-b-2 border-brand-primary pb-3 -mb-3 font-bold' : 'text-slate-500 hover:text-slate-300 pb-3 -mb-3'"
                >
                  Playground 🧪
                </button>
              </div>
              <div v-if="playground.validate.tab === 'example'" class="flex space-x-2 text-[10px] font-bold">
                <button @click="selectedLanguage = 'curl'" :class="selectedLanguage === 'curl' ? 'text-brand-primary font-black' : 'text-slate-500 hover:text-slate-300'">CURL</button>
                <button @click="selectedLanguage = 'js'" :class="selectedLanguage === 'js' ? 'text-brand-primary font-black' : 'text-slate-500 hover:text-slate-300'">JS</button>
                <button @click="selectedLanguage = 'python'" :class="selectedLanguage === 'python' ? 'text-brand-primary font-black' : 'text-slate-500 hover:text-slate-300'">Python</button>
              </div>
            </div>
            
            <div v-if="playground.validate.tab === 'example'" class="space-y-6">
              <div class="relative bg-slate-900 rounded-xl p-4 border border-slate-800">
                <pre class="overflow-x-auto leading-relaxed"><code>{{ snippets.validate[selectedLanguage] }}</code></pre>
              </div>
              <div class="space-y-3">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block border-b border-slate-800 pb-2">Response namunasi</span>
                <div class="bg-slate-900 rounded-xl p-4 border border-slate-800 overflow-x-auto">
                  <pre class="leading-relaxed"><code>{
  "id": 12,
  "name": "Shifo Med",
  "address": "Toshkent sh., Chilonzor 5-daha",
  "phone": "+998901234567",
  "email": "contact@shifomed.uz",
  "status": "ACTIVE",
  "secretKey": "sec_key_abc123xyz"
}</code></pre>
                </div>
              </div>
            </div>
            
            <div v-else class="space-y-4">
              <div class="space-y-2">
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Secret Key kaliti</label>
                <input 
                  type="text" 
                  v-model="playground.validate.params.secretKey" 
                  class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 font-mono text-xs text-slate-200 focus:outline-none focus:border-brand-primary"
                  placeholder="Klinika Secret Key kaliti"
                />
              </div>
              
              <button 
                @click="runPlaygroundRequest('validate')"
                :disabled="playground.validate.loading"
                class="w-full py-2.5 px-4 bg-brand-primary hover:bg-brand-primary/95 text-white font-bold rounded-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span v-if="playground.validate.loading" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                <span>{{ playground.validate.loading ? 'Tekshirilmoqda...' : 'Secret Keyni tekshirish (Send Request)' }}</span>
              </button>
              
              <div v-if="playground.validate.response" class="space-y-3">
                <div class="flex items-center justify-between border-t border-slate-800 pt-3">
                  <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Natija (Response)</span>
                  <div class="flex space-x-3 text-[10px] font-mono">
                    <span :class="playground.validate.response.status >= 200 && playground.validate.response.status < 300 ? 'text-emerald-500' : 'text-red-500'">
                      Status: {{ playground.validate.response.status }} {{ playground.validate.response.statusText }}
                    </span>
                    <span class="text-slate-400">
                      Vaqt: {{ playground.validate.response.time }} ms
                    </span>
                  </div>
                </div>
                <div class="bg-slate-900 rounded-xl p-4 border border-slate-800 overflow-x-auto max-h-72">
                  <pre class="leading-relaxed"><code class="text-slate-200">{{ JSON.stringify(playground.validate.response.data, null, 2) }}</code></pre>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Klinikalar API Turkumi Yopilishi -->
        </div>

        <!-- Foydalanuvchilar API Turkumi -->
        <div v-if="activeCategory === 'users'" class="flex-1 flex flex-col">

          <!-- 1. GET /sdg/uz -->
          <div id="get-users" class="border-b border-slate-200 dark:border-slate-800 grid grid-cols-1 lg:grid-cols-2">
            <div class="p-6 sm:p-8 space-y-6">
              <div class="space-y-2">
                <span class="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2.5 py-0.5 rounded uppercase font-mono">GET</span>
                <h2 class="text-2xl font-bold text-slate-900 dark:text-white">1. Barcha foydalanuvchilarni olish</h2>
                <p class="text-xs text-slate-500 dark:text-slate-400 font-medium font-sans">
                  Tizimdagi barcha foydalanuvchilar ro'yxatini olish. accountType, email, ism-familiya bo'yicha qidirish va sahifalash imkoniyati mavjud.
                </p>
              </div>
              <div class="space-y-4">
                <code class="font-mono font-bold text-xs bg-slate-100 dark:bg-slate-800 p-2 rounded block">GET /sdg/uz</code>
                
                <div class="overflow-x-auto">
                  <table class="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr class="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold">
                        <th class="py-2">Parametr</th>
                        <th class="py-2">Turi</th>
                        <th class="py-2">Majburiy</th>
                        <th class="py-2">Tavsif</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                      <tr>
                        <td class="py-2 font-mono font-bold text-brand-primary">accountType</td>
                        <td class="py-2">string</td>
                        <td class="py-2 text-red-500 font-semibold font-sans">Ha</td>
                        <td class="py-2 font-sans">Foydalanuvchi hisob turi (masalan, `ADMIN`, `USER`)</td>
                      </tr>
                      <tr>
                        <td class="py-2 font-mono font-bold text-brand-primary">email</td>
                        <td class="py-2">string</td>
                        <td class="py-2 text-slate-450 font-sans">Yo'q</td>
                        <td class="py-2 font-sans">Elektron pochta manzili</td>
                      </tr>
                      <tr>
                        <td class="py-2 font-mono font-bold text-brand-primary">firstName</td>
                        <td class="py-2">string</td>
                        <td class="py-2 text-slate-450 font-sans">Yo'q</td>
                        <td class="py-2 font-sans">Ismi</td>
                      </tr>
                      <tr>
                        <td class="py-2 font-mono font-bold text-brand-primary">lastName</td>
                        <td class="py-2">string</td>
                        <td class="py-2 text-slate-450 font-sans">Yo'q</td>
                        <td class="py-2 font-sans">Familiyasi</td>
                      </tr>
                      <tr>
                        <td class="py-2 font-mono font-bold text-brand-primary">genderType</td>
                        <td class="py-2">string</td>
                        <td class="py-2 text-slate-450 font-sans">Yo'q</td>
                        <td class="py-2 font-sans">Jinsi (`MALE`, `FEMALE`)</td>
                      </tr>
                      <tr>
                        <td class="py-2 font-mono font-bold text-brand-primary">group</td>
                        <td class="py-2">string</td>
                        <td class="py-2 text-slate-450 font-sans">Yo'q</td>
                        <td class="py-2 font-sans">Guruh nomi</td>
                      </tr>
                      <tr>
                        <td class="py-2 font-mono font-bold text-brand-primary">phoneNumber</td>
                        <td class="py-2">string</td>
                        <td class="py-2 text-slate-450 font-sans">Yo'q</td>
                        <td class="py-2 font-sans">Telefon raqami</td>
                      </tr>
                      <tr>
                        <td class="py-2 font-mono font-bold text-brand-primary">school</td>
                        <td class="py-2">string</td>
                        <td class="py-2 text-slate-450 font-sans">Yo'q</td>
                        <td class="py-2 font-sans">Muassasa/maktab</td>
                      </tr>
                      <tr>
                        <td class="py-2 font-mono font-bold text-brand-primary">page</td>
                        <td class="py-2">integer</td>
                        <td class="py-2 text-slate-450 font-sans">Yo'q</td>
                        <td class="py-2 font-sans">Sahifa raqami (sukut bo'yicha `0`)</td>
                      </tr>
                      <tr>
                        <td class="py-2 font-mono font-bold text-brand-primary">size</td>
                        <td class="py-2">integer</td>
                        <td class="py-2 text-slate-450 font-sans">Yo'q</td>
                        <td class="py-2 font-sans">Sahifa hajmi (sukut bo'yicha `30`)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <div class="bg-slate-950 p-6 sm:p-8 space-y-6 text-slate-300 font-mono text-xs border-t lg:border-t-0 border-slate-800">
              <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                <div class="flex space-x-4">
                  <button 
                    @click="playground.userGetAll.tab = 'example'" 
                    :class="playground.userGetAll.tab === 'example' ? 'text-brand-primary border-b-2 border-brand-primary pb-3 -mb-3 font-bold' : 'text-slate-500 hover:text-slate-300 pb-3 -mb-3'"
                  >
                    Namuna
                  </button>
                  <button 
                    @click="playground.userGetAll.tab = 'playground'" 
                    :class="playground.userGetAll.tab === 'playground' ? 'text-brand-primary border-b-2 border-brand-primary pb-3 -mb-3 font-bold' : 'text-slate-500 hover:text-slate-300 pb-3 -mb-3'"
                  >
                    Playground 🧪
                  </button>
                </div>
                <div v-if="playground.userGetAll.tab === 'example'" class="flex space-x-2 text-[10px] font-bold">
                  <button @click="selectedLanguage = 'curl'" :class="selectedLanguage === 'curl' ? 'text-brand-primary font-black' : 'text-slate-500 hover:text-slate-300'">CURL</button>
                  <button @click="selectedLanguage = 'js'" :class="selectedLanguage === 'js' ? 'text-brand-primary font-black' : 'text-slate-500 hover:text-slate-300'">JS</button>
                  <button @click="selectedLanguage = 'python'" :class="selectedLanguage === 'python' ? 'text-brand-primary font-black' : 'text-slate-500 hover:text-slate-300'">Python</button>
                </div>
              </div>
              
              <div v-if="playground.userGetAll.tab === 'example'" class="space-y-6">
                <div class="relative bg-slate-900 rounded-xl p-4 border border-slate-800 group">
                  <button @click="copyToClipboard(snippets.userGetAll[selectedLanguage], 'userGetAll')" class="absolute right-3 top-3 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Check v-if="copiedEndpoint === 'userGetAll'" class="w-4 h-4 text-emerald-500" />
                    <Copy v-else class="w-4 h-4" />
                  </button>
                  <pre class="overflow-x-auto leading-relaxed"><code>{{ snippets.userGetAll[selectedLanguage] }}</code></pre>
                </div>
                <div class="space-y-3">
                  <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block border-b border-slate-800 pb-2">Response namunasi</span>
                  <div class="bg-slate-900 rounded-xl p-4 border border-slate-800 overflow-x-auto">
                    <pre class="leading-relaxed"><code>{
  "content": [
    {
      "id": 1,
      "firstName": "Ali",
      "lastName": "Valiyev",
      "email": "ali@mail.com",
      "accountType": "ADMIN",
      "genderType": "MALE",
      "group": "A1",
      "phoneNumber": "+998901234567",
      "school": "School 15"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 30
  },
  "totalElements": 1,
  "totalPages": 1
}</code></pre>
                  </div>
                </div>
              </div>
              
              <div v-else class="space-y-4 font-sans text-xs">
                <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-1">
                    <label class="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">accountType *</label>
                    <select 
                      v-model="playground.userGetAll.params.accountType" 
                      class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 font-mono text-xs text-slate-200 focus:outline-none focus:border-brand-primary"
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="USER">USER</option>
                    </select>
                  </div>
                  <div class="space-y-1">
                    <label class="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">email</label>
                    <input 
                      type="text" 
                      v-model="playground.userGetAll.params.email" 
                      class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 font-mono text-xs text-slate-200 focus:outline-none focus:border-brand-primary"
                      placeholder="ali@mail.com"
                    />
                  </div>
                  <div class="space-y-1">
                    <label class="text-[10px] font-bold text-slate-455 uppercase tracking-widest block">firstName</label>
                    <input 
                      type="text" 
                      v-model="playground.userGetAll.params.firstName" 
                      class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 font-mono text-xs text-slate-200 focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                  <div class="space-y-1">
                    <label class="text-[10px] font-bold text-slate-455 uppercase tracking-widest block">lastName</label>
                    <input 
                      type="text" 
                      v-model="playground.userGetAll.params.lastName" 
                      class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 font-mono text-xs text-slate-200 focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                  <div class="space-y-1">
                    <label class="text-[10px] font-bold text-slate-455 uppercase tracking-widest block">genderType</label>
                    <select 
                      v-model="playground.userGetAll.params.genderType" 
                      class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 font-mono text-xs text-slate-200 focus:outline-none focus:border-brand-primary"
                    >
                      <option value="">Hammasi</option>
                      <option value="MALE">MALE</option>
                      <option value="FEMALE">FEMALE</option>
                    </select>
                  </div>
                  <div class="space-y-1">
                    <label class="text-[10px] font-bold text-slate-455 uppercase tracking-widest block">group</label>
                    <input 
                      type="text" 
                      v-model="playground.userGetAll.params.group" 
                      class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 font-mono text-xs text-slate-200 focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                  <div class="space-y-1">
                    <label class="text-[10px] font-bold text-slate-455 uppercase tracking-widest block">page</label>
                    <input 
                      type="number" 
                      v-model="playground.userGetAll.params.page" 
                      class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 font-mono text-xs text-slate-200 focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                  <div class="space-y-1">
                    <label class="text-[10px] font-bold text-slate-455 uppercase tracking-widest block">size</label>
                    <input 
                      type="number" 
                      v-model="playground.userGetAll.params.size" 
                      class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 font-mono text-xs text-slate-200 focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                </div>

                <button 
                  @click="runPlaygroundRequest('userGetAll')"
                  :disabled="playground.userGetAll.loading"
                  class="w-full py-2.5 px-4 bg-brand-primary hover:bg-brand-primary/95 text-white font-bold rounded-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50 font-sans"
                >
                  <span v-if="playground.userGetAll.loading" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                  <span>{{ playground.userGetAll.loading ? 'So\'rov yuborilmoqda...' : 'So\'rov yuborish (Send Request)' }}</span>
                </button>
                
                <div v-if="playground.userGetAll.response" class="space-y-3 font-mono">
                  <div class="flex items-center justify-between border-t border-slate-800 pt-3">
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Natija (Response)</span>
                    <div class="flex space-x-3 text-[10px]">
                      <span :class="playground.userGetAll.response.status >= 200 && playground.userGetAll.response.status < 300 ? 'text-emerald-500' : 'text-red-500'">
                        Status: {{ playground.userGetAll.response.status }} {{ playground.userGetAll.response.statusText }}
                      </span>
                      <span class="text-slate-400">
                        Vaqt: {{ playground.userGetAll.response.time }} ms
                      </span>
                    </div>
                  </div>
                  <div class="bg-slate-900 rounded-xl p-4 border border-slate-800 overflow-x-auto max-h-72">
                    <pre class="leading-relaxed"><code class="text-slate-200">{{ JSON.stringify(playground.userGetAll.response.data, null, 2) }}</code></pre>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 2. GET /sdg/uz/{id} -->
          <div id="get-user-id" class="border-b border-slate-200 dark:border-slate-800 grid grid-cols-1 lg:grid-cols-2">
            <div class="p-6 sm:p-8 space-y-6">
              <div class="space-y-2">
                <span class="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2.5 py-0.5 rounded uppercase font-mono">GET</span>
                <h2 class="text-2xl font-bold text-slate-900 dark:text-white">2. ID bo'yicha foydalanuvchini olish</h2>
                <p class="text-xs text-slate-500 dark:text-slate-400 font-medium font-sans">
                  Foydalanuvchining unikal ID raqami orqali uning batafsil ma'lumotlarini yuklash.
                </p>
              </div>
              <div class="space-y-4">
                <code class="font-mono font-bold text-xs bg-slate-100 dark:bg-slate-800 p-2 rounded block">GET /sdg/uz/{id}</code>
                
                <div class="overflow-x-auto">
                  <table class="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr class="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold">
                        <th class="py-2">Path Parametr</th>
                        <th class="py-2">Turi</th>
                        <th class="py-2">Majburiy</th>
                        <th class="py-2">Tavsif</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                      <tr>
                        <td class="py-2 font-mono font-bold text-brand-primary">id</td>
                        <td class="py-2">integer</td>
                        <td class="py-2 text-red-500 font-semibold font-sans">Ha</td>
                        <td class="py-2 font-sans">Foydalanuvchi unikal ID raqami</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <div class="bg-slate-950 p-6 sm:p-8 space-y-6 text-slate-300 font-mono text-xs border-t lg:border-t-0 border-slate-800">
              <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                <div class="flex space-x-4">
                  <button 
                    @click="playground.userGetOne.tab = 'example'" 
                    :class="playground.userGetOne.tab === 'example' ? 'text-brand-primary border-b-2 border-brand-primary pb-3 -mb-3 font-bold' : 'text-slate-500 hover:text-slate-300 pb-3 -mb-3'"
                  >
                    Namuna
                  </button>
                  <button 
                    @click="playground.userGetOne.tab = 'playground'" 
                    :class="playground.userGetOne.tab === 'playground' ? 'text-brand-primary border-b-2 border-brand-primary pb-3 -mb-3 font-bold' : 'text-slate-500 hover:text-slate-300 pb-3 -mb-3'"
                  >
                    Playground 🧪
                  </button>
                </div>
                <div v-if="playground.userGetOne.tab === 'example'" class="flex space-x-2 text-[10px] font-bold">
                  <button @click="selectedLanguage = 'curl'" :class="selectedLanguage === 'curl' ? 'text-brand-primary font-black' : 'text-slate-500 hover:text-slate-300'">CURL</button>
                  <button @click="selectedLanguage = 'js'" :class="selectedLanguage === 'js' ? 'text-brand-primary font-black' : 'text-slate-500 hover:text-slate-300'">JS</button>
                  <button @click="selectedLanguage = 'python'" :class="selectedLanguage === 'python' ? 'text-brand-primary font-black' : 'text-slate-500 hover:text-slate-300'">Python</button>
                </div>
              </div>
              
              <div v-if="playground.userGetOne.tab === 'example'" class="space-y-6">
                <div class="relative bg-slate-900 rounded-xl p-4 border border-slate-800 group">
                  <button @click="copyToClipboard(snippets.userGetOne[selectedLanguage], 'userGetOne')" class="absolute right-3 top-3 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Check v-if="copiedEndpoint === 'userGetOne'" class="w-4 h-4 text-emerald-500" />
                    <Copy v-else class="w-4 h-4" />
                  </button>
                  <pre class="overflow-x-auto leading-relaxed"><code>{{ snippets.userGetOne[selectedLanguage] }}</code></pre>
                </div>
                <div class="space-y-3">
                  <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block border-b border-slate-800 pb-2">Response namunasi</span>
                  <div class="bg-slate-900 rounded-xl p-4 border border-slate-800 overflow-x-auto">
                    <pre class="leading-relaxed"><code>{
  "id": 1,
  "firstName": "Ali",
  "lastName": "Valiyev",
  "email": "ali@mail.com",
  "accountType": "ADMIN",
  "genderType": "MALE",
  "group": "A1",
  "phoneNumber": "+998901234567",
  "school": "School 15"
}</code></pre>
                  </div>
                </div>
              </div>
              
              <div v-else class="space-y-4 font-sans text-xs">
                <div class="space-y-2">
                  <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Foydalanuvchi ID</label>
                  <input 
                    type="text" 
                    v-model="playground.userGetOne.params.id" 
                    class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 font-mono text-xs text-slate-200 focus:outline-none focus:border-brand-primary"
                    placeholder="Masalan, 1"
                  />
                </div>
                
                <button 
                  @click="runPlaygroundRequest('userGetOne')"
                  :disabled="playground.userGetOne.loading"
                  class="w-full py-2.5 px-4 bg-brand-primary hover:bg-brand-primary/95 text-white font-bold rounded-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50 font-sans"
                >
                  <span v-if="playground.userGetOne.loading" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                  <span>{{ playground.userGetOne.loading ? 'So\'rov yuborilmoqda...' : 'So\'rov yuborish (Send Request)' }}</span>
                </button>
                
                <div v-if="playground.userGetOne.response" class="space-y-3 font-mono">
                  <div class="flex items-center justify-between border-t border-slate-800 pt-3">
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Natija (Response)</span>
                    <div class="flex space-x-3 text-[10px]">
                      <span :class="playground.userGetOne.response.status >= 200 && playground.userGetOne.response.status < 300 ? 'text-emerald-500' : 'text-red-500'">
                        Status: {{ playground.userGetOne.response.status }} {{ playground.userGetOne.response.statusText }}
                      </span>
                      <span class="text-slate-400">
                        Vaqt: {{ playground.userGetOne.response.time }} ms
                      </span>
                    </div>
                  </div>
                  <div class="bg-slate-900 rounded-xl p-4 border border-slate-800 overflow-x-auto max-h-72">
                    <pre class="leading-relaxed"><code class="text-slate-200">{{ JSON.stringify(playground.userGetOne.response.data, null, 2) }}</code></pre>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 3. DELETE /sdg/uz/{id} -->
          <div id="delete-user" class="border-b border-slate-200 dark:border-slate-800 grid grid-cols-1 lg:grid-cols-2">
            <div class="p-6 sm:p-8 space-y-6">
              <div class="space-y-2">
                <span class="text-[10px] font-bold text-red-500 bg-red-500/10 px-2.5 py-0.5 rounded uppercase font-mono">DELETE</span>
                <h2 class="text-2xl font-bold text-slate-900 dark:text-white">3. Foydalanuvchini o'chirish</h2>
                <p class="text-xs text-slate-500 dark:text-slate-400 font-medium font-sans">
                  Foydalanuvchini tizimdan unikal ID raqami orqali o'chirib yuborish.
                </p>
              </div>
              <div class="space-y-4">
                <code class="font-mono font-bold text-xs bg-slate-100 dark:bg-slate-800 p-2 rounded block">DELETE /sdg/uz/{id}</code>
                
                <div class="overflow-x-auto">
                  <table class="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr class="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold">
                        <th class="py-2">Path Parametr</th>
                        <th class="py-2">Turi</th>
                        <th class="py-2">Majburiy</th>
                        <th class="py-2">Tavsif</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                      <tr>
                        <td class="py-2 font-mono font-bold text-brand-primary">id</td>
                        <td class="py-2">integer</td>
                        <td class="py-2 text-red-500 font-semibold font-sans">Ha</td>
                        <td class="py-2 font-sans">O'chirilishi kerak bo'lgan foydalanuvchi ID raqami</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <div class="bg-slate-950 p-6 sm:p-8 space-y-6 text-slate-300 font-mono text-xs border-t lg:border-t-0 border-slate-800">
              <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                <div class="flex space-x-4">
                  <button 
                    @click="playground.userDelete.tab = 'example'" 
                    :class="playground.userDelete.tab === 'example' ? 'text-brand-primary border-b-2 border-brand-primary pb-3 -mb-3 font-bold' : 'text-slate-500 hover:text-slate-300 pb-3 -mb-3'"
                  >
                    Namuna
                  </button>
                  <button 
                    @click="playground.userDelete.tab = 'playground'" 
                    :class="playground.userDelete.tab === 'playground' ? 'text-brand-primary border-b-2 border-brand-primary pb-3 -mb-3 font-bold' : 'text-slate-500 hover:text-slate-300 pb-3 -mb-3'"
                  >
                    Playground 🧪
                  </button>
                </div>
                <div v-if="playground.userDelete.tab === 'example'" class="flex space-x-2 text-[10px] font-bold">
                  <button @click="selectedLanguage = 'curl'" :class="selectedLanguage === 'curl' ? 'text-brand-primary font-black' : 'text-slate-500 hover:text-slate-300'">CURL</button>
                  <button @click="selectedLanguage = 'js'" :class="selectedLanguage === 'js' ? 'text-brand-primary font-black' : 'text-slate-500 hover:text-slate-300'">JS</button>
                  <button @click="selectedLanguage = 'python'" :class="selectedLanguage === 'python' ? 'text-brand-primary font-black' : 'text-slate-500 hover:text-slate-300'">Python</button>
                </div>
              </div>
              
              <div v-if="playground.userDelete.tab === 'example'" class="space-y-6">
                <div class="relative bg-slate-900 rounded-xl p-4 border border-slate-800 group">
                  <button @click="copyToClipboard(snippets.userDelete[selectedLanguage], 'userDelete')" class="absolute right-3 top-3 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Check v-if="copiedEndpoint === 'userDelete'" class="w-4 h-4 text-emerald-500" />
                    <Copy v-else class="w-4 h-4" />
                  </button>
                  <pre class="overflow-x-auto leading-relaxed"><code>{{ snippets.userDelete[selectedLanguage] }}</code></pre>
                </div>
                <div class="space-y-3">
                  <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block border-b border-slate-800 pb-2">Response namunasi</span>
                  <div class="bg-slate-900 rounded-xl p-4 border border-slate-800 overflow-x-auto">
                    <pre class="leading-relaxed"><code>{
  "success": true,
  "message": "Foydalanuvchi muvaffaqiyatli o'chirildi."
}</code></pre>
                  </div>
                </div>
              </div>
              
              <div v-else class="space-y-4 font-sans text-xs">
                <div class="space-y-2">
                  <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Foydalanuvchi ID</label>
                  <input 
                    type="text" 
                    v-model="playground.userDelete.params.id" 
                    class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 font-mono text-xs text-slate-200 focus:outline-none focus:border-brand-primary"
                    placeholder="Masalan, 1"
                  />
                </div>
                
                <button 
                  @click="runPlaygroundRequest('userDelete')"
                  :disabled="playground.userDelete.loading"
                  class="w-full py-2.5 px-4 bg-brand-primary hover:bg-brand-primary/95 text-white font-bold rounded-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50 font-sans"
                >
                  <span v-if="playground.userDelete.loading" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                  <span>{{ playground.userDelete.loading ? 'O\'chirilmoqda...' : 'Foydalanuvchini o\'chirish (Send Request)' }}</span>
                </button>
                
                <div v-if="playground.userDelete.response" class="space-y-3 font-mono">
                  <div class="flex items-center justify-between border-t border-slate-800 pt-3">
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Natija (Response)</span>
                    <div class="flex space-x-3 text-[10px]">
                      <span :class="playground.userDelete.response.status >= 200 && playground.userDelete.response.status < 300 ? 'text-emerald-500' : 'text-red-500'">
                        Status: {{ playground.userDelete.response.status }} {{ playground.userDelete.response.statusText }}
                      </span>
                      <span class="text-slate-400">
                        Vaqt: {{ playground.userDelete.response.time }} ms
                      </span>
                    </div>
                  </div>
                  <div class="bg-slate-900 rounded-xl p-4 border border-slate-800 overflow-x-auto max-h-72">
                    <pre class="leading-relaxed"><code class="text-slate-200">{{ JSON.stringify(playground.userDelete.response.data, null, 2) }}</code></pre>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 4. POST /sdg/uz/admin -->
          <div id="create-user" class="border-b border-slate-200 dark:border-slate-800 grid grid-cols-1 lg:grid-cols-2">
            <div class="p-6 sm:p-8 space-y-6">
              <div class="space-y-2">
                <span class="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded uppercase font-mono">POST</span>
                <h2 class="text-2xl font-bold text-slate-900 dark:text-white">4. Yangi foydalanuvchi yaratish</h2>
                <p class="text-xs text-slate-500 dark:text-slate-400 font-medium font-sans">
                  Tizimda yangi administrator yoki oddiy foydalanuvchi yaratish so'rovi.
                </p>
              </div>
              <div class="space-y-4">
                <code class="font-mono font-bold text-xs bg-slate-100 dark:bg-slate-800 p-2 rounded block">POST /sdg/uz/admin</code>
                
                <div class="overflow-x-auto">
                  <table class="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr class="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold">
                        <th class="py-2">Request Body Maydoni</th>
                        <th class="py-2">Turi</th>
                        <th class="py-2">Majburiy</th>
                        <th class="py-2">Tavsif</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                      <tr>
                        <td class="py-2 font-mono font-bold text-brand-primary">accountType</td>
                        <td class="py-2">string</td>
                        <td class="py-2 text-red-500 font-semibold font-sans">Ha</td>
                        <td class="py-2 font-sans">Hisob turi (`ADMIN`, `USER`)</td>
                      </tr>
                      <tr>
                        <td class="py-2 font-mono font-bold text-brand-primary">address</td>
                        <td class="py-2">string</td>
                        <td class="py-2 text-slate-450 font-sans">Yo'q</td>
                        <td class="py-2 font-sans">Yashash viloyati/manzili</td>
                      </tr>
                      <tr>
                        <td class="py-2 font-mono font-bold text-brand-primary">addressDistrict</td>
                        <td class="py-2">string</td>
                        <td class="py-2 text-slate-450 font-sans">Yo'q</td>
                        <td class="py-2 font-sans">Tuman/shahar</td>
                      </tr>
                      <tr>
                        <td class="py-2 font-mono font-bold text-brand-primary">addressMFY</td>
                        <td class="py-2">string</td>
                        <td class="py-2 text-slate-450 font-sans">Yo'q</td>
                        <td class="py-2 font-sans">MFY (Mahalla) nomi</td>
                      </tr>
                      <tr>
                        <td class="py-2 font-mono font-bold text-brand-primary">addressRegion</td>
                        <td class="py-2">string</td>
                        <td class="py-2 text-slate-450 font-sans">Yo'q</td>
                        <td class="py-2 font-sans">Viloyat/hudud</td>
                      </tr>
                      <tr>
                        <td class="py-2 font-mono font-bold text-brand-primary">courseId</td>
                        <td class="py-2">integer</td>
                        <td class="py-2 text-slate-450 font-sans">Yo'q</td>
                        <td class="py-2 font-sans">Kurs ID raqami</td>
                      </tr>
                      <tr>
                        <td class="py-2 font-mono font-bold text-brand-primary">creatorId</td>
                        <td class="py-2">integer</td>
                        <td class="py-2 text-slate-450 font-sans">Yo'q</td>
                        <td class="py-2 font-sans">Yaratuvchi ID raqami</td>
                      </tr>
                      <tr>
                        <td class="py-2 font-mono font-bold text-brand-primary">dateBirth</td>
                        <td class="py-2">string</td>
                        <td class="py-2 text-slate-450 font-sans">Yo'q</td>
                        <td class="py-2 font-sans">Tug'ilgan sana (YYYY-MM-DD)</td>
                      </tr>
                      <tr>
                        <td class="py-2 font-mono font-bold text-brand-primary">email</td>
                        <td class="py-2">string</td>
                        <td class="py-2 text-red-500 font-semibold font-sans">Ha</td>
                        <td class="py-2 font-sans">Elektron pochta manzili</td>
                      </tr>
                      <tr>
                        <td class="py-2 font-mono font-bold text-brand-primary">firstName</td>
                        <td class="py-2">string</td>
                        <td class="py-2 text-red-500 font-semibold font-sans">Ha</td>
                        <td class="py-2 font-sans">Ism</td>
                      </tr>
                      <tr>
                        <td class="py-2 font-mono font-bold text-brand-primary">genderType</td>
                        <td class="py-2">string</td>
                        <td class="py-2 text-red-500 font-semibold font-sans">Ha</td>
                        <td class="py-2 font-sans">Jinsi (`AYOL`, `ERKAK`)</td>
                      </tr>
                      <tr>
                        <td class="py-2 font-mono font-bold text-brand-primary">group</td>
                        <td class="py-2">string</td>
                        <td class="py-2 text-slate-450 font-sans">Yo'q</td>
                        <td class="py-2 font-sans">Guruh nomi</td>
                      </tr>
                      <tr>
                        <td class="py-2 font-mono font-bold text-brand-primary">id</td>
                        <td class="py-2">integer</td>
                        <td class="py-2 text-slate-450 font-sans">Yo'q</td>
                        <td class="py-2 font-sans">Foydalanuvchi unikal ID raqami</td>
                      </tr>
                      <tr>
                        <td class="py-2 font-mono font-bold text-brand-primary">lastName</td>
                        <td class="py-2">string</td>
                        <td class="py-2 text-red-500 font-semibold font-sans">Ha</td>
                        <td class="py-2 font-sans">Familiya</td>
                      </tr>
                      <tr>
                        <td class="py-2 font-mono font-bold text-brand-primary">password</td>
                        <td class="py-2">string</td>
                        <td class="py-2 text-red-500 font-semibold font-sans">Ha</td>
                        <td class="py-2 font-sans">Parol</td>
                      </tr>
                      <tr>
                        <td class="py-2 font-mono font-bold text-slate-450">phoneNumber</td>
                        <td class="py-2">string</td>
                        <td class="py-2 text-slate-450 font-sans">Yo'q</td>
                        <td class="py-2 font-sans">Telefon raqami</td>
                      </tr>
                      <tr>
                        <td class="py-2 font-mono font-bold text-brand-primary">school</td>
                        <td class="py-2">string</td>
                        <td class="py-2 text-slate-450 font-sans">Yo'q</td>
                        <td class="py-2 font-sans">Muassasa/maktab nomi</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <div class="bg-slate-950 p-6 sm:p-8 space-y-6 text-slate-300 font-mono text-xs border-t lg:border-t-0 border-slate-800">
              <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                <div class="flex space-x-4">
                  <button 
                    @click="playground.userCreate.tab = 'example'" 
                    :class="playground.userCreate.tab === 'example' ? 'text-brand-primary border-b-2 border-brand-primary pb-3 -mb-3 font-bold' : 'text-slate-500 hover:text-slate-300 pb-3 -mb-3'"
                  >
                    Namuna
                  </button>
                  <button 
                    @click="playground.userCreate.tab = 'playground'" 
                    :class="playground.userCreate.tab === 'playground' ? 'text-brand-primary border-b-2 border-brand-primary pb-3 -mb-3 font-bold' : 'text-slate-500 hover:text-slate-300 pb-3 -mb-3'"
                  >
                    Playground 🧪
                  </button>
                </div>
                <div v-if="playground.userCreate.tab === 'example'" class="flex space-x-2 text-[10px] font-bold">
                  <button @click="selectedLanguage = 'curl'" :class="selectedLanguage === 'curl' ? 'text-brand-primary font-black' : 'text-slate-500 hover:text-slate-300'">CURL</button>
                  <button @click="selectedLanguage = 'js'" :class="selectedLanguage === 'js' ? 'text-brand-primary font-black' : 'text-slate-500 hover:text-slate-300'">JS</button>
                  <button @click="selectedLanguage = 'python'" :class="selectedLanguage === 'python' ? 'text-brand-primary font-black' : 'text-slate-500 hover:text-slate-300'">Python</button>
                </div>
              </div>
              
              <div v-if="playground.userCreate.tab === 'example'" class="space-y-6">
                <div class="relative bg-slate-900 rounded-xl p-4 border border-slate-800 group">
                  <button @click="copyToClipboard(snippets.userCreate[selectedLanguage], 'userCreate')" class="absolute right-3 top-3 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Check v-if="copiedEndpoint === 'userCreate'" class="w-4 h-4 text-emerald-500" />
                    <Copy v-else class="w-4 h-4" />
                  </button>
                  <pre class="overflow-x-auto leading-relaxed"><code>{{ snippets.userCreate[selectedLanguage] }}</code></pre>
                </div>
                <div class="space-y-3">
                  <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block border-b border-slate-800 pb-2">Response namunasi</span>
                  <div class="bg-slate-900 rounded-xl p-4 border border-slate-800 overflow-x-auto">
                    <pre class="leading-relaxed"><code>{
  "id": 2,
  "firstName": "Ali",
  "lastName": "Valiyev",
  "email": "ali@mail.com",
  "accountType": "ADMIN",
  "genderType": "MALE",
  "group": "A1",
  "phoneNumber": "+998901234567",
  "school": "School 15"
}</code></pre>
                  </div>
                </div>
              </div>
              
              <div v-else class="space-y-4 font-sans text-xs">
                <div class="space-y-2">
                  <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Request Body (JSON)</span>
                  <textarea 
                    v-model="playground.userCreate.body" 
                    rows="8"
                    class="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-200 focus:outline-none focus:border-brand-primary"
                  ></textarea>
                </div>
                
                <button 
                  @click="runPlaygroundRequest('userCreate')"
                  :disabled="playground.userCreate.loading"
                  class="w-full py-2.5 px-4 bg-brand-primary hover:bg-brand-primary/95 text-white font-bold rounded-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <span v-if="playground.userCreate.loading" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                  <span>{{ playground.userCreate.loading ? 'So\'rov yuborilmoqda...' : 'Foydalanuvchi yaratish (Send Request)' }}</span>
                </button>
                
                <div v-if="playground.userCreate.response" class="space-y-3 font-mono">
                  <div class="flex items-center justify-between border-t border-slate-800 pt-3">
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Natija (Response)</span>
                    <div class="flex space-x-3 text-[10px]">
                      <span :class="playground.userCreate.response.status >= 200 && playground.userCreate.response.status < 300 ? 'text-emerald-500' : 'text-red-500'">
                        Status: {{ playground.userCreate.response.status }} {{ playground.userCreate.response.statusText }}
                      </span>
                      <span class="text-slate-400">
                        Vaqt: {{ playground.userCreate.response.time }} ms
                      </span>
                    </div>
                  </div>
                  <div class="bg-slate-900 rounded-xl p-4 border border-slate-800 overflow-x-auto max-h-72">
                    <pre class="leading-relaxed"><code class="text-slate-200">{{ JSON.stringify(playground.userCreate.response.data, null, 2) }}</code></pre>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 5. PUT /sdg/uz/edit -->
          <div id="edit-user" class="border-b border-slate-200 dark:border-slate-800 grid grid-cols-1 lg:grid-cols-2">
            <div class="p-6 sm:p-8 space-y-6">
              <div class="space-y-2">
                <span class="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded uppercase font-mono">PUT</span>
                <h2 class="text-2xl font-bold text-slate-900 dark:text-white">5. Foydalanuvchini tahrirlash</h2>
                <p class="text-xs text-slate-500 dark:text-slate-400 font-medium font-sans">
                  Mavjud foydalanuvchi ma'lumotlarini tahrirlash (ism, familiya, email, guruh, va h.k.). Request body ichida o'zgartiriladigan foydalanuvchining <code>id</code> raqami yuborilishi shart.
                </p>
              </div>
              <div class="space-y-4">
                <code class="font-mono font-bold text-xs bg-slate-100 dark:bg-slate-800 p-2 rounded block">PUT /sdg/uz/edit</code>
                
                <div class="overflow-x-auto">
                  <table class="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr class="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold">
                        <th class="py-2">Request Body Maydoni</th>
                        <th class="py-2">Turi</th>
                        <th class="py-2">Majburiy</th>
                        <th class="py-2">Tavsif</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                      <tr>
                        <td class="py-2 font-mono font-bold text-brand-primary">id</td>
                        <td class="py-2">integer</td>
                        <td class="py-2 text-red-500 font-semibold font-sans">Ha</td>
                        <td class="py-2 font-sans">Tahrirlanadigan foydalanuvchi unikal ID raqami</td>
                      </tr>
                      <tr>
                        <td class="py-2 font-mono font-bold text-brand-primary">accountType</td>
                        <td class="py-2">string</td>
                        <td class="py-2 text-red-500 font-semibold font-sans">Ha</td>
                        <td class="py-2 font-sans">Hisob turi (`ADMIN`, `USER`)</td>
                      </tr>
                      <tr>
                        <td class="py-2 font-mono font-bold text-brand-primary">address</td>
                        <td class="py-2">string</td>
                        <td class="py-2 text-slate-450 font-sans">Yo'q</td>
                        <td class="py-2 font-sans">Yashash viloyati/manzili</td>
                      </tr>
                      <tr>
                        <td class="py-2 font-mono font-bold text-brand-primary">addressDistrict</td>
                        <td class="py-2">string</td>
                        <td class="py-2 text-slate-450 font-sans">Yo'q</td>
                        <td class="py-2 font-sans">Tuman/shahar</td>
                      </tr>
                      <tr>
                        <td class="py-2 font-mono font-bold text-brand-primary">addressMFY</td>
                        <td class="py-2">string</td>
                        <td class="py-2 text-slate-450 font-sans">Yo'q</td>
                        <td class="py-2 font-sans">MFY (Mahalla) nomi</td>
                      </tr>
                      <tr>
                        <td class="py-2 font-mono font-bold text-brand-primary">addressRegion</td>
                        <td class="py-2">string</td>
                        <td class="py-2 text-slate-450 font-sans">Yo'q</td>
                        <td class="py-2 font-sans">Viloyat/hudud</td>
                      </tr>
                      <tr>
                        <td class="py-2 font-mono font-bold text-brand-primary">courseId</td>
                        <td class="py-2">integer</td>
                        <td class="py-2 text-slate-450 font-sans">Yo'q</td>
                        <td class="py-2 font-sans">Kurs ID raqami</td>
                      </tr>
                      <tr>
                        <td class="py-2 font-mono font-bold text-brand-primary">creatorId</td>
                        <td class="py-2">integer</td>
                        <td class="py-2 text-slate-450 font-sans">Yo'q</td>
                        <td class="py-2 font-sans">Yaratuvchi ID raqami</td>
                      </tr>
                      <tr>
                        <td class="py-2 font-mono font-bold text-brand-primary">dateBirth</td>
                        <td class="py-2">string</td>
                        <td class="py-2 text-slate-450 font-sans">Yo'q</td>
                        <td class="py-2 font-sans">Tug'ilgan sana (YYYY-MM-DD)</td>
                      </tr>
                      <tr>
                        <td class="py-2 font-mono font-bold text-brand-primary">email</td>
                        <td class="py-2">string</td>
                        <td class="py-2 text-red-500 font-semibold font-sans">Ha</td>
                        <td class="py-2 font-sans">Elektron pochta manzili</td>
                      </tr>
                      <tr>
                        <td class="py-2 font-mono font-bold text-brand-primary">firstName</td>
                        <td class="py-2">string</td>
                        <td class="py-2 text-red-500 font-semibold font-sans">Ha</td>
                        <td class="py-2 font-sans">Ism</td>
                      </tr>
                      <tr>
                        <td class="py-2 font-mono font-bold text-brand-primary">genderType</td>
                        <td class="py-2">string</td>
                        <td class="py-2 text-red-500 font-semibold font-sans">Ha</td>
                        <td class="py-2 font-sans">Jinsi (`AYOL`, `ERKAK`)</td>
                      </tr>
                      <tr>
                        <td class="py-2 font-mono font-bold text-brand-primary">group</td>
                        <td class="py-2">string</td>
                        <td class="py-2 text-slate-450 font-sans">Yo'q</td>
                        <td class="py-2 font-sans">Guruh nomi</td>
                      </tr>
                      <tr>
                        <td class="py-2 font-mono font-bold text-brand-primary">lastName</td>
                        <td class="py-2">string</td>
                        <td class="py-2 text-red-500 font-semibold font-sans">Ha</td>
                        <td class="py-2 font-sans">Familiya</td>
                      </tr>
                      <tr>
                        <td class="py-2 font-mono font-bold text-brand-primary">password</td>
                        <td class="py-2">string</td>
                        <td class="py-2 text-red-500 font-semibold font-sans">Ha</td>
                        <td class="py-2 font-sans">Parol</td>
                      </tr>
                      <tr>
                        <td class="py-2 font-mono font-bold text-slate-450">phoneNumber</td>
                        <td class="py-2">string</td>
                        <td class="py-2 text-slate-450 font-sans">Yo'q</td>
                        <td class="py-2 font-sans">Telefon raqami</td>
                      </tr>
                      <tr>
                        <td class="py-2 font-mono font-bold text-brand-primary">school</td>
                        <td class="py-2">string</td>
                        <td class="py-2 text-slate-450 font-sans">Yo'q</td>
                        <td class="py-2 font-sans">Muassasa/maktab nomi</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <div class="bg-slate-950 p-6 sm:p-8 space-y-6 text-slate-300 font-mono text-xs border-t lg:border-t-0 border-slate-800">
              <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                <div class="flex space-x-4">
                  <button 
                    @click="playground.userEdit.tab = 'example'" 
                    :class="playground.userEdit.tab === 'example' ? 'text-brand-primary border-b-2 border-brand-primary pb-3 -mb-3 font-bold' : 'text-slate-500 hover:text-slate-300 pb-3 -mb-3'"
                  >
                    Namuna
                  </button>
                  <button 
                    @click="playground.userEdit.tab = 'playground'" 
                    :class="playground.userEdit.tab === 'playground' ? 'text-brand-primary border-b-2 border-brand-primary pb-3 -mb-3 font-bold' : 'text-slate-500 hover:text-slate-300 pb-3 -mb-3'"
                  >
                    Playground 🧪
                  </button>
                </div>
                <div v-if="playground.userEdit.tab === 'example'" class="flex space-x-2 text-[10px] font-bold">
                  <button @click="selectedLanguage = 'curl'" :class="selectedLanguage === 'curl' ? 'text-brand-primary font-black' : 'text-slate-500 hover:text-slate-300'">CURL</button>
                  <button @click="selectedLanguage = 'js'" :class="selectedLanguage === 'js' ? 'text-brand-primary font-black' : 'text-slate-500 hover:text-slate-300'">JS</button>
                  <button @click="selectedLanguage = 'python'" :class="selectedLanguage === 'python' ? 'text-brand-primary font-black' : 'text-slate-500 hover:text-slate-300'">Python</button>
                </div>
              </div>
              
              <div v-if="playground.userEdit.tab === 'example'" class="space-y-6">
                <div class="relative bg-slate-900 rounded-xl p-4 border border-slate-800 group">
                  <button @click="copyToClipboard(snippets.userEdit[selectedLanguage], 'userEdit')" class="absolute right-3 top-3 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Check v-if="copiedEndpoint === 'userEdit'" class="w-4 h-4 text-emerald-500" />
                    <Copy v-else class="w-4 h-4" />
                  </button>
                  <pre class="overflow-x-auto leading-relaxed"><code>{{ snippets.userEdit[selectedLanguage] }}</code></pre>
                </div>
                <div class="space-y-3">
                  <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block border-b border-slate-800 pb-2">Response namunasi</span>
                  <div class="bg-slate-900 rounded-xl p-4 border border-slate-800 overflow-x-auto">
                    <pre class="leading-relaxed"><code>{
  "id": 1,
  "firstName": "Ali Yangilangan",
  "lastName": "Valiyev",
  "email": "ali.new@mail.com",
  "accountType": "ADMIN",
  "genderType": "MALE",
  "group": "A1-New",
  "phoneNumber": "+998901234567",
  "school": "School 15"
}</code></pre>
                  </div>
                </div>
              </div>
              
              <div v-else class="space-y-4 font-sans text-xs">
                <div class="space-y-2">
                  <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Request Body (JSON)</span>
                  <textarea 
                    v-model="playground.userEdit.body" 
                    rows="8"
                    class="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-200 focus:outline-none focus:border-brand-primary"
                  ></textarea>
                </div>
                
                <button 
                  @click="runPlaygroundRequest('userEdit')"
                  :disabled="playground.userEdit.loading"
                  class="w-full py-2.5 px-4 bg-brand-primary hover:bg-brand-primary/95 text-white font-bold rounded-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <span v-if="playground.userEdit.loading" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                  <span>{{ playground.userEdit.loading ? 'O\'zgartirilmoqda...' : 'Foydalanuvchini tahrirlash (Send Request)' }}</span>
                </button>
                
                <div v-if="playground.userEdit.response" class="space-y-3 font-mono">
                  <div class="flex items-center justify-between border-t border-slate-800 pt-3">
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Natija (Response)</span>
                    <div class="flex space-x-3 text-[10px]">
                      <span :class="playground.userEdit.response.status >= 200 && playground.userEdit.response.status < 300 ? 'text-emerald-500' : 'text-red-500'">
                        Status: {{ playground.userEdit.response.status }} {{ playground.userEdit.response.statusText }}
                      </span>
                      <span class="text-slate-400">
                        Vaqt: {{ playground.userEdit.response.time }} ms
                      </span>
                    </div>
                  </div>
                  <div class="bg-slate-900 rounded-xl p-4 border border-slate-800 overflow-x-auto max-h-72">
                    <pre class="leading-relaxed"><code class="text-slate-200">{{ JSON.stringify(playground.userEdit.response.data, null, 2) }}</code></pre>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- Shifokorlar API (Mock) -->
        <div v-if="activeCategory === 'doctors'" class="flex-grow">
          <!-- 1. GET /api/v1/doctors -->
          <div class="border-b border-slate-200 dark:border-slate-800 grid grid-cols-1 lg:grid-cols-2">
            <div class="p-6 sm:p-8 space-y-6">
              <div class="space-y-2">
                <span class="text-[10px] font-bold text-brand-primary bg-brand-primary/10 px-2.5 py-0.5 rounded uppercase font-mono">GET</span>
                <h2 class="text-2xl font-bold text-slate-900 dark:text-white">1. Shifokorlar ro'yxatini olish</h2>
                <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Tizimdagi barcha faol shifokorlar va ularning mutaxassisligi ro'yxatini yuklash.
                </p>
              </div>
              <div class="space-y-4">
                <code class="font-mono font-bold text-xs bg-slate-100 dark:bg-slate-800 p-2 rounded block">GET /api/v1/doctors</code>
              </div>
            </div>
            <div class="bg-slate-950 p-6 sm:p-8 space-y-6 text-slate-300 font-mono text-xs border-t lg:border-t-0 border-slate-800">
              <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Request Misoli</span>
              </div>
              <div class="bg-slate-900 rounded-xl p-4 border border-slate-800 overflow-x-auto">
                <pre class="leading-relaxed"><code>curl --location '{{ apiUrl }}/api/v1/doctors' \
--header 'ngrok-skip-browser-warning: true'</code></pre>
              </div>
              <div class="space-y-3">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block border-b border-slate-800 pb-2">Response namunasi</span>
                <div class="bg-slate-900 rounded-xl p-4 border border-slate-800 overflow-x-auto">
                  <pre class="leading-relaxed"><code>[
  {
    "id": 1,
    "name": "Dr. Alisher Valiyev",
    "specialty": "Kardiolog",
    "clinicId": 12,
    "status": "ACTIVE"
  }
]</code></pre>
                </div>
              </div>
            </div>
          </div>

          <!-- 2. POST /api/v1/doctors -->
          <div class="border-b border-slate-200 dark:border-slate-800 grid grid-cols-1 lg:grid-cols-2">
            <div class="p-6 sm:p-8 space-y-6">
              <div class="space-y-2">
                <span class="text-[10px] font-bold text-brand-primary bg-brand-primary/10 px-2.5 py-0.5 rounded uppercase font-mono">POST</span>
                <h2 class="text-2xl font-bold text-slate-900 dark:text-white">2. Shifokor qo'shish</h2>
                <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Yangi kardiolog, terapevt yoki boshqa mutaxassis shifokorni tizimga qo'shish so'rovi.
                </p>
              </div>
              <div class="space-y-4">
                <code class="font-mono font-bold text-xs bg-slate-100 dark:bg-slate-800 p-2 rounded block">POST /api/v1/doctors</code>
              </div>
            </div>
            <div class="bg-slate-950 p-6 sm:p-8 space-y-6 text-slate-300 font-mono text-xs border-t lg:border-t-0 border-slate-800">
              <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Request Payload</span>
              </div>
              <div class="bg-slate-900 rounded-xl p-4 border border-slate-800 overflow-x-auto">
                <pre class="leading-relaxed"><code>{
  "name": "Dr. Umida Karimoeva",
  "specialty": "Pediatr",
  "clinicId": 12
}</code></pre>
              </div>
              <div class="space-y-3">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block border-b border-slate-800 pb-2">Response namunasi</span>
                <div class="bg-slate-900 rounded-xl p-4 border border-slate-800 overflow-x-auto">
                  <pre class="leading-relaxed"><code>{
  "id": 2,
  "name": "Dr. Umida Karimoeva",
  "specialty": "Pediatr",
  "clinicId": 12,
  "status": "ACTIVE"
}</code></pre>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bemorlar API (Mock) -->
        <div v-if="activeCategory === 'patients'" class="flex-grow">
          <!-- 1. GET /api/v1/patients -->
          <div class="border-b border-slate-200 dark:border-slate-800 grid grid-cols-1 lg:grid-cols-2">
            <div class="p-6 sm:p-8 space-y-6">
              <div class="space-y-2">
                <span class="text-[10px] font-bold text-brand-primary bg-brand-primary/10 px-2.5 py-0.5 rounded uppercase font-mono">GET</span>
                <h2 class="text-2xl font-bold text-slate-900 dark:text-white">1. Bemorlar ro'yxatini olish</h2>
                <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Klinika tomonidan ro'yxatga olingan bemorlar ro'yxatini yuklash.
                </p>
              </div>
              <div class="space-y-4">
                <code class="font-mono font-bold text-xs bg-slate-100 dark:bg-slate-800 p-2 rounded block">GET /api/v1/patients</code>
              </div>
            </div>
            <div class="bg-slate-950 p-6 sm:p-8 space-y-6 text-slate-300 font-mono text-xs border-t lg:border-t-0 border-slate-800">
              <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Request Misoli</span>
              </div>
              <div class="bg-slate-900 rounded-xl p-4 border border-slate-800 overflow-x-auto">
                <pre class="leading-relaxed"><code>curl --location '{{ apiUrl }}/api/v1/patients' \
--header 'ngrok-skip-browser-warning: true'</code></pre>
              </div>
              <div class="space-y-3">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block border-b border-slate-800 pb-2">Response namunasi</span>
                <div class="bg-slate-900 rounded-xl p-4 border border-slate-800 overflow-x-auto">
                  <pre class="leading-relaxed"><code>[
  {
    "id": 101,
    "name": "Eldor Toshmatov",
    "birthDate": "1994-05-12",
    "phone": "+998931112233",
    "clinicId": 12
  }
]</code></pre>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Retseptlar API (Mock) -->
        <div v-if="activeCategory === 'prescriptions'" class="flex-grow">
          <!-- 1. GET /api/v1/prescriptions -->
          <div class="border-b border-slate-200 dark:border-slate-800 grid grid-cols-1 lg:grid-cols-2">
            <div class="p-6 sm:p-8 space-y-6">
              <div class="space-y-2">
                <span class="text-[10px] font-bold text-brand-primary bg-brand-primary/10 px-2.5 py-0.5 rounded uppercase font-mono">GET</span>
                <h2 class="text-2xl font-bold text-slate-900 dark:text-white">1. Retseptlar tarixini olish</h2>
                <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Shifokorlar tomonidan bemorlarga berilgan elektron retseptlar ro'yxatini olish.
                </p>
              </div>
              <div class="space-y-4">
                <code class="font-mono font-bold text-xs bg-slate-100 dark:bg-slate-800 p-2 rounded block">GET /api/v1/prescriptions</code>
              </div>
            </div>
            <div class="bg-slate-950 p-6 sm:p-8 space-y-6 text-slate-300 font-mono text-xs border-t lg:border-t-0 border-slate-800">
              <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Request Misoli</span>
              </div>
              <div class="bg-slate-900 rounded-xl p-4 border border-slate-800 overflow-x-auto">
                <pre class="leading-relaxed"><code>curl --location '{{ apiUrl }}/api/v1/prescriptions' \
--header 'ngrok-skip-browser-warning: true'</code></pre>
              </div>
              <div class="space-y-3">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block border-b border-slate-800 pb-2">Response namunasi</span>
                <div class="bg-slate-900 rounded-xl p-4 border border-slate-800 overflow-x-auto">
                  <pre class="leading-relaxed"><code>[
  {
    "id": 501,
    "patientId": 101,
    "doctorId": 1,
    "medications": [
      {
        "name": "Paratsetamol",
        "dosage": "500mg",
        "frequency": "Kuniga 2 mahal"
      }
    ],
    "createdAt": "2026-06-25T12:00:00Z"
  }
]</code></pre>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>
