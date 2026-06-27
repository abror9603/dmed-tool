export const UZ_PHONE_PREFIX = '+998'
export const UZ_PHONE_REGEX = /^\+998\d{9}$/

/** Faqat +998 dan keyingi 9 ta raqamni ajratib oladi */
export function extractUzPhoneDigits(value: string): string {
  let digits = value.replace(/\D/g, '')

  if (digits.startsWith('998')) {
    digits = digits.slice(3)
  }

  return digits.slice(0, 9)
}

/** Input qiymatini +998XXXXXXXXX formatiga keltiradi */
export function formatUzPhoneInput(value: string): string {
  const digits = extractUzPhoneDigits(value)
  return `${UZ_PHONE_PREFIX}${digits}`
}

export function isValidUzPhone(value: string): boolean {
  return UZ_PHONE_REGEX.test(value.trim())
}

/** Ko'rsatish uchun: +998 dan keyingi qism */
export function uzPhoneSuffix(value: string): string {
  if (!value.startsWith(UZ_PHONE_PREFIX)) {
    return extractUzPhoneDigits(value)
  }
  return value.slice(UZ_PHONE_PREFIX.length).replace(/\D/g, '').slice(0, 9)
}
