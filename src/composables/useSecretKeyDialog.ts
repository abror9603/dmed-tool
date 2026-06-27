import { reactive, readonly } from 'vue'

export interface SecretKeyDialogOptions {
  title: string
  message: string
  secretKey: string
  expiresAt?: string
  copyLabel?: string
  copiedLabel?: string
  closeLabel?: string
}

interface SecretKeyDialogState extends SecretKeyDialogOptions {
  open: boolean
}

const state = reactive<SecretKeyDialogState>({
  open: false,
  title: '',
  message: '',
  secretKey: '',
})

let resolver: (() => void) | null = null

function resetState(): void {
  state.open = false
  state.title = ''
  state.message = ''
  state.secretKey = ''
  state.expiresAt = undefined
  state.copyLabel = undefined
  state.copiedLabel = undefined
  state.closeLabel = undefined
  resolver = null
}

export function closeSecretKeyDialog(): void {
  resolver?.()
  resetState()
}

export const secretKeyDialogState = readonly(state)

export function useSecretKeyDialog() {
  function showSecretKey(options: SecretKeyDialogOptions): Promise<void> {
    return new Promise((resolve) => {
      if (state.open) {
        resolve()
        return
      }

      resolver = resolve
      state.title = options.title
      state.message = options.message
      state.secretKey = options.secretKey
      state.expiresAt = options.expiresAt
      state.copyLabel = options.copyLabel
      state.copiedLabel = options.copiedLabel
      state.closeLabel = options.closeLabel
      state.open = true
    })
  }

  return { showSecretKey, state: secretKeyDialogState }
}
