export const UZ_PHONE_PREFIX = '+998'
export const UZ_PHONE_REGEX = /^\+998\d{9}$/

/** Extracts the 9 subscriber digits after the +998 country code. */
export function extractUzPhoneDigits(value: string): string {
  let digits = value.replace(/\D/g, '')

  if (digits.startsWith('998')) {
    digits = digits.slice(3)
  }

  return digits.slice(0, 9)
}

/** Normalizes user input to `+998XXXXXXXXX`. */
export function formatUzPhoneInput(value: string): string {
  const digits = extractUzPhoneDigits(value)
  return `${UZ_PHONE_PREFIX}${digits}`
}

export function isValidUzPhone(value: string): boolean {
  return UZ_PHONE_REGEX.test(value.trim())
}

/** Returns the local part shown beside the fixed +998 prefix in forms. */
export function uzPhoneSuffix(value: string): string {
  if (!value.startsWith(UZ_PHONE_PREFIX)) {
    return extractUzPhoneDigits(value)
  }
  return value.slice(UZ_PHONE_PREFIX.length).replace(/\D/g, '').slice(0, 9)
}
