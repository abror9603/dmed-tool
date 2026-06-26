<script setup lang="ts">
import { ref, onMounted, inject, computed, type Ref } from 'vue'
import { Hospital, Phone, MapPin, Mail, Key, Trash2, Edit2, CheckCircle2, XCircle, RefreshCw, Settings, ShieldAlert, ArrowLeft, Copy, Check } from 'lucide-vue-next'
import { useClinicsStore } from '../stores/clinics'
import { clinicsService } from '../services/clinics'

// O'zbek tilida izoh:
// ClinicsDashboardView - ngrok API orqali Klinikalar bazasini boshqaruvchi premium panel (CRUD).
// Ushbu panel orqali klinika qo'shish, ro'yxatni yangilash, statusni o'zgartirish va secretKey tekshirish amalga oshiriladi.

const theme = inject<Ref<'light' | 'dark'>>('theme')

// Pinia store-ni olamiz
const clinicsStore = useClinicsStore()

// API bazaviy manzili (Localstorage-da saqlab boriladi, ngrok o'zgarganda qulay almashtirish uchun)
const defaultApiUrl = 'https://3ed4-185-139-137-95.ngrok-free.app'
const apiUrl = ref(localStorage.getItem('dmed-api-url') || defaultApiUrl)

// Store holatlarini local o'zgaruvchilarga bog'laymiz (computed orqali)
const clinics = computed(() => clinicsStore.clinics)
const loading = computed(() => clinicsStore.loading)
const error = computed({
  get: () => clinicsStore.error || '',
  set: (val) => { clinicsStore.error = val }
})
const successMessage = computed({
  get: () => clinicsStore.successMessage || '',
  set: (val) => { clinicsStore.successMessage = val }
})

// Sozlamalar paneli ko'rinishi
const showSettings = ref(false)

// Form ma'lumotlari
const editId = ref<number | null>(null)
const formName = ref('')
const formAddress = ref('')
const formPhone = ref('')
const formEmail = ref('')

// Secret Key tekshirish vidjeti
const checkKey = ref('')
const validationLoading = ref(false)
const validationResult = ref<any>(null)
const validationError = ref('')

// Nusxa ko'chirish holati
const copiedKey = ref<string | null>(null)

const copyKeyToClipboard = (text: string, id: string) => {
  navigator.clipboard.writeText(text)
  copiedKey.value = id
  setTimeout(() => {
    copiedKey.value = null
  }, 2000)
}

// Barcha klinikalarni ngrok API orqali olish (GET)
const fetchClinics = async () => {
  try {
    clinicsStore.clearMessages()
    await clinicsStore.fetchAllClinics()
  } catch (err) {
    // Xatolik store ichida avtomatik boshqariladi
  }
}

// Yangi klinika qo'shish yoki tahrirlash (POST / PUT)
const saveClinic = async () => {
  if (!formName.value || !formAddress.value || !formPhone.value || !formEmail.value) {
    alert("Iltimos, barcha maydonlarni to'ldiring!")
    return
  }

  clinicsStore.clearMessages()

  const payload = {
    name: formName.value,
    address: formAddress.value,
    phone: formPhone.value,
    email: formEmail.value
  }

  try {
    if (editId.value !== null) {
      // Mavjud klinikani yangilash (PUT)
      await clinicsStore.updateClinic(editId.value, payload)
    } else {
      // Yangi klinika yaratish (POST)
      await clinicsStore.createClinic(payload)
    }
    resetForm()
  } catch (err) {
    // Xatolik store ichida avtomatik boshqariladi
  }
}

// Klinikani tahrirlash uchun formaga yuklash
const startEdit = (clinic: any) => {
  editId.value = clinic.id
  formName.value = clinic.name
  formAddress.value = clinic.address
  formPhone.value = clinic.phone || clinic.contactInfo || clinic.contact || ''
  formEmail.value = clinic.email
}

// Tahrirlashni bekor qilish
const resetForm = () => {
  editId.value = null
  formName.value = ''
  formAddress.value = ''
  formPhone.value = ''
  formEmail.value = ''
}

// Klinika statusini faollashtirish yoki o'chirish (PATCH)
const toggleStatus = async (clinic: any) => {
  try {
    clinicsStore.clearMessages()
    await clinicsStore.toggleClinicStatus(clinic.id)
  } catch (err) {
    // Xatolik store-da avtomatik boshqariladi
  }
}

// Klinikani o'chirish (DELETE)
const deleteClinic = async (id: number) => {
  if (!confirm("Haqiqatan ham ushbu klinikani o'chirib tashlamoqchimisiz?")) return
  
  try {
    clinicsStore.clearMessages()
    await clinicsStore.deleteClinic(id)
  } catch (err) {
    // Xatolik store-da avtomatik boshqariladi
  }
}

// Secret Keyni tekshirish (GET validate-key)
const validateSecretKey = async () => {
  if (!checkKey.value) {
    alert("Iltimos, secret key kalitini kiriting!")
    return
  }

  validationLoading.value = true
  validationError.value = ''
  validationResult.value = null

  try {
    const data = await clinicsService.validateKey(checkKey.value)
    validationResult.value = data
  } catch (err: any) {
    validationError.value = err.response?.data?.message || err.message || "Kalit tekshirishda xatolik yuz berdi."
  } finally {
    validationLoading.value = false
  }
}

// Backend URL manzilini localstorage-da saqlash
const updateApiUrl = () => {
  localStorage.setItem('dmed-api-url', apiUrl.value)
  showSettings.value = false
  clinicsStore.clearMessages()
  clinicsStore.successMessage = "Backend API URL manzili muvaffaqiyatli yangilandi!"
  fetchClinics()
}

// Sukut bo'yicha ngrok manzilini qayta tiklash
const resetApiUrl = () => {
  apiUrl.value = defaultApiUrl
  updateApiUrl()
}

onMounted(() => {
  fetchClinics()
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 dark:bg-brand-dark dark:text-slate-100 transition-colors duration-300">
    
    <!-- Yuqori qism (Header Bar) -->
    <div class="border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-brand-dark/90 backdrop-blur sticky top-0 z-40 px-4 py-3 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <a 
          href="#/" 
          class="flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-brand-primary dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft class="w-4 h-4" />
          <span>Bosh sahifaga qaytish</span>
        </a>
        <span class="h-4 w-px bg-slate-300 dark:bg-slate-700"></span>
        <h1 class="text-base font-extrabold text-slate-800 dark:text-white">Klinikalar Reyestri & API Boshqaruvi</h1>
      </div>

      <div class="flex items-center space-x-2">
        <button
          @click="showSettings = !showSettings"
          class="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Sozlamalar"
        >
          <Settings class="w-4 h-4" />
        </button>
        <button
          @click="fetchClinics"
          class="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Yangilash"
        >
          <RefreshCw class="w-4 h-4" :class="loading ? 'animate-spin' : ''" />
        </button>
      </div>
    </div>

    <!-- API Manzili sozlamalari (Garmoshka / Modal kabi) -->
    <div v-if="showSettings" class="bg-slate-100 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 p-4 transition-all duration-300">
      <div class="max-w-xl mx-auto space-y-3">
        <div class="flex items-center space-x-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <Settings class="w-4 h-4 text-brand-primary" />
          <span>Backend Ngrok Server Sozlamalari</span>
        </div>
        <div class="flex gap-2">
          <input 
            v-model="apiUrl"
            type="text"
            placeholder="Backend URL (masalan: https://xxx.ngrok-free.app)"
            class="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-850 focus:outline-none focus:border-brand-primary font-mono text-slate-800 dark:text-slate-100"
          />
          <button 
            @click="updateApiUrl"
            class="px-4 py-2 text-xs font-bold text-white bg-brand-primary hover:bg-brand-primary/95 rounded-lg transition-colors"
          >
            Saqlash
          </button>
          <button 
            @click="resetApiUrl"
            class="px-3 py-2 text-xs font-bold text-slate-600 bg-slate-200 hover:bg-slate-300 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            Qayta tiklash
          </button>
        </div>
        <p class="text-[10px] text-slate-500 leading-normal">
          * Ngrok tunneli har gal qayta yoqilganda uning manzili o'zgaradi. Kodni o'zgartirmasdan, yangi URL-ni bu yerga kiritib boshqarishda davom etishingiz mumkin.
        </p>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      
      <!-- Bildirishnomalar (Xatolik yoki muvaffaqiyat) -->
      <div v-if="error" class="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-600 dark:text-red-400 text-xs flex items-center space-x-2">
        <XCircle class="w-5 h-5 shrink-0" />
        <span>{{ error }}</span>
      </div>
      <div v-if="successMessage" class="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 text-xs flex items-center space-x-2">
        <CheckCircle2 class="w-5 h-5 shrink-0" />
        <span>{{ successMessage }}</span>
      </div>

      <!-- Asosiy ishchi hudud (Grid) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <!-- Chap tomonda: Forma va Secret Key tekshiruvchi (Lg: 4/12) -->
        <div class="lg:col-span-4 space-y-6">
          
          <!-- 1-blok: Klinika Formasi -->
          <div class="bg-white dark:bg-brand-dark-card border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 class="text-sm font-bold text-slate-800 dark:text-white flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-2 border-slate-200">
              <Hospital class="w-4 h-4 text-brand-primary" />
              <span>{{ editId !== null ? "Klinika ma'lumotlarini tahrirlash" : "Yangi klinika qo'shish" }}</span>
            </h2>
            
            <form @submit.prevent="saveClinic" class="space-y-3">
              <div>
                <label class="text-[10px] font-bold uppercase text-slate-400 block mb-1 font-sans">Klinika Nomi</label>
                <div class="relative">
                  <Hospital class="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input 
                    v-model="formName"
                    type="text"
                    required
                    placeholder="Masalan: Shifo Med"
                    class="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              <div>
                <label class="text-[10px] font-bold uppercase text-slate-400 block mb-1 font-sans">Klinika Manzili</label>
                <div class="relative">
                  <MapPin class="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input 
                    v-model="formAddress"
                    type="text"
                    required
                    placeholder="Masalan: Toshkent sh., Chilonzor 5-daha"
                    class="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              <div>
                <label class="text-[10px] font-bold uppercase text-slate-400 block mb-1 font-sans">Telefon Raqam</label>
                <div class="relative">
                  <Phone class="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input 
                    v-model="formPhone"
                    type="text"
                    required
                    placeholder="Masalan: +998901234567"
                    class="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              <div>
                <label class="text-[10px] font-bold uppercase text-slate-400 block mb-1 font-sans">Klinika Emaili</label>
                <div class="relative">
                  <Mail class="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input 
                    v-model="formEmail"
                    type="email"
                    required
                    placeholder="Masalan: contact@shifomed.uz"
                    class="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              <div class="flex gap-2 pt-2">
                <button 
                  type="submit"
                  class="flex-1 py-2 text-xs font-bold text-white bg-brand-primary hover:bg-brand-primary/95 rounded-lg transition-colors active:scale-95 duration-100"
                >
                  {{ editId !== null ? "Saqlash" : "Qo'shish" }}
                </button>
                <button 
                  v-if="editId !== null"
                  type="button"
                  @click="resetForm"
                  class="px-3 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Bekor qilish
                </button>
              </div>
            </form>
          </div>

          <!-- 2-blok: Secret Key Tekshirish -->
          <div class="bg-white dark:bg-brand-dark-card border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 class="text-sm font-bold text-slate-800 dark:text-white flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-2 border-slate-200">
              <Key class="w-4 h-4 text-brand-primary" />
              <span>Secret Key Validatsiyasi (validate-key)</span>
            </h2>
            
            <div class="space-y-3">
              <p class="text-[10px] text-slate-500 leading-normal">
                Klinikangiz kaliti faol (ACTIVE) ekanligini ngrok API orqali real vaqtda tekshirib ko'ring:
              </p>
              <div class="flex gap-2">
                <input 
                  v-model="checkKey"
                  type="text"
                  placeholder="Klinika Secret Key kaliti"
                  class="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 focus:outline-none focus:border-brand-primary font-mono"
                />
                <button 
                  @click="validateSecretKey"
                  :disabled="validationLoading"
                  class="px-3 py-2 text-xs font-bold text-white bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 rounded-lg transition-colors shrink-0"
                >
                  <RefreshCw v-if="validationLoading" class="w-3.5 h-3.5 animate-spin" />
                  <span v-else>Tekshirish</span>
                </button>
              </div>

              <!-- Tekshirish natijasi -->
              <div v-if="validationResult" class="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-slate-800 dark:text-slate-200 text-xs space-y-1.5 animate-fade-in">
                <div class="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                  <CheckCircle2 class="w-4 h-4" />
                  <span>Kalit to'g'ri (ACTIVE)</span>
                </div>
                <div class="text-[10px] space-y-0.5 text-slate-500 dark:text-slate-400 font-mono">
                  <div>ID: {{ validationResult.id }}</div>
                  <div>Nomi: {{ validationResult.name }}</div>
                  <div>Manzili: {{ validationResult.address }}</div>
                </div>
              </div>

              <div v-if="validationError" class="p-3.5 rounded-xl border border-red-500/20 bg-red-500/5 text-red-600 dark:text-red-400 text-xs flex items-center space-x-1.5 animate-fade-in">
                <XCircle class="w-4 h-4" />
                <span>{{ validationError }}</span>
              </div>
            </div>
          </div>

        </div>

        <!-- O'ng tomonda: Klinikalar ro'yxati jadvali (Lg: 8/12) -->
        <div class="lg:col-span-8 bg-white dark:bg-brand-dark-card border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-4 sm:p-6 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 border-slate-200">
            <h2 class="text-sm font-bold text-slate-800 dark:text-white flex items-center space-x-2">
              <Hospital class="w-4.5 h-4.5 text-brand-primary" />
              <span>Ro'yxatga olingan klinikalar</span>
            </h2>
            <span class="text-xxs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold font-mono">
              Jami: {{ clinics.length }} ta
            </span>
          </div>

          <!-- Yuklanmoqda holati -->
          <div v-if="loading && clinics.length === 0" class="py-12 flex flex-col items-center justify-center space-y-2 text-slate-400">
            <RefreshCw class="w-8 h-8 animate-spin text-brand-primary" />
            <p class="text-xs">Ma'lumotlar yuklanmoqda...</p>
          </div>

          <!-- Bo'sh ro'yxat holati -->
          <div v-else-if="clinics.length === 0" class="py-12 flex flex-col items-center justify-center space-y-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <ShieldAlert class="w-8 h-8 text-slate-300 dark:text-slate-700" />
            <p class="text-xs text-slate-400">Hozircha hech qanday klinika ro'yxatga olinmagan.</p>
          </div>

          <!-- Klinikalar jadvali -->
          <div v-else class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="border-b border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th class="py-3 px-2">ID</th>
                  <th class="py-3 px-2">Klinika Nomi / Manzili</th>
                  <th class="py-3 px-2">Aloqa</th>
                  <th class="py-3 px-2 text-center">Status</th>
                  <th class="py-3 px-2">Integratsiya kaliti (Secret Key)</th>
                  <th class="py-3 px-2 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                <tr 
                  v-for="clinic in clinics" 
                  :key="clinic.id" 
                  class="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors"
                >
                  <td class="py-3.5 px-2 font-mono text-[10px] text-slate-400">
                    #{{ clinic.id }}
                  </td>
                  <td class="py-3.5 px-2">
                    <div class="font-bold text-slate-800 dark:text-slate-100">{{ clinic.name }}</div>
                    <div class="text-[10px] text-slate-500 dark:text-slate-400 flex items-center space-x-1 mt-0.5">
                      <MapPin class="w-3 h-3 shrink-0" />
                      <span>{{ clinic.address }}</span>
                    </div>
                  </td>
                  <td class="py-3.5 px-2 space-y-0.5">
                    <div class="flex items-center space-x-1 text-slate-600 dark:text-slate-300">
                      <Phone class="w-3.5 h-3.5 shrink-0 text-slate-400" />
                      <span>{{ clinic.phone || clinic.contactInfo || clinic.contact || '-' }}</span>
                    </div>
                    <div class="flex items-center space-x-1 text-slate-500 dark:text-slate-400">
                      <Mail class="w-3.5 h-3.5 shrink-0 text-slate-400" />
                      <span>{{ clinic.email }}</span>
                    </div>
                  </td>
                  <td class="py-3.5 px-2 text-center">
                    <button
                      @click="toggleStatus(clinic)"
                      class="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border transition-all active:scale-95 animate-fade-in"
                      :class="clinic.status === 'ACTIVE' 
                        ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                        : 'border-slate-300 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'"
                    >
                      {{ clinic.status || 'INACTIVE' }}
                    </button>
                  </td>
                  <td class="py-3.5 px-2">
                    <div v-if="clinic.secretKey" class="flex items-center space-x-1.5">
                      <code class="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px] select-all text-brand-primary">
                        {{ clinic.secretKey }}
                      </code>
                      <button 
                        @click="copyKeyToClipboard(clinic.secretKey, clinic.id.toString())"
                        class="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                        title="Kalitni nusxalash"
                      >
                        <Check v-if="copiedKey === clinic.id.toString()" class="w-3.5 h-3.5 text-emerald-500" />
                        <Copy v-else class="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div v-else class="text-[10px] text-slate-400 italic">
                      Status faollashtirilganda yaratiladi
                    </div>
                  </td>
                  <td class="py-3.5 px-2 text-right">
                    <div class="flex items-center justify-end space-x-1.5">
                      <button 
                        @click="startEdit(clinic)"
                        class="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-colors"
                        title="Tahrirlash"
                      >
                        <Edit2 class="w-3.5 h-3.5" />
                      </button>
                      <button 
                        @click="deleteClinic(clinic.id)"
                        class="p-1.5 rounded bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-colors"
                        title="O'chirish"
                      >
                        <Trash2 class="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>
