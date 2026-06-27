export const SECRET_KEY_VISIBLE_CHARS = 4

/** Long asterisk run clipped by overflow to fill the remaining input width. */
export const SECRET_KEY_MASK_FILL = '*'.repeat(256)

export function secretKeyPrefix(key: string, visibleChars = SECRET_KEY_VISIBLE_CHARS): string {
  if (!key) return ''
  return key.slice(0, Math.min(visibleChars, key.length))
}

/** @deprecated Use `secretKeyPrefix` + `SECRET_KEY_MASK_FILL` in flex layout for full-width mask. */
export function maskSecretKey(key: string, visibleChars = SECRET_KEY_VISIBLE_CHARS): string {
  if (!key) return ''
  if (key.length <= visibleChars) return key
  return `${key.slice(0, visibleChars)}${'*'.repeat(key.length - visibleChars)}`
}

export async function copySecretKey(key: string): Promise<void> {
  await navigator.clipboard.writeText(key)
}
