export const JSHSHIR_LENGTH = 14

export function isValidJshshir(value: string): boolean {
  return /^\d{14}$/.test(value.trim())
}
