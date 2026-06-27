/**
 * Promise-based confirm/alert dialog driven by module-level state.
 *
 * A single global resolver avoids mounting multiple modal instances per view.
 * Only one dialog can be open at a time; concurrent calls resolve to `false`.
 */
import { reactive, readonly } from 'vue'

export type ConfirmVariant = 'default' | 'success' | 'danger' | 'warning'

export interface ConfirmDialogOptions {
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: ConfirmVariant
  alert?: boolean
}

interface ConfirmDialogState extends ConfirmDialogOptions {
  open: boolean
}

const state = reactive<ConfirmDialogState>({
  open: false,
  message: '',
  variant: 'default',
  alert: false,
})

let resolver: ((value: boolean) => void) | null = null

function resetState(): void {
  state.open = false
  state.title = undefined
  state.message = ''
  state.confirmLabel = undefined
  state.cancelLabel = undefined
  state.variant = 'default'
  state.alert = false
  resolver = null
}

export function resolveConfirmDialog(confirmed: boolean): void {
  resolver?.(confirmed)
  resetState()
}

export const confirmDialogState = readonly(state)

export function useConfirmDialog() {
  function open(options: ConfirmDialogOptions | string): Promise<boolean> {
    const opts: ConfirmDialogOptions =
      typeof options === 'string' ? { message: options } : options

    return new Promise((resolve) => {
      if (state.open) {
        resolve(false)
        return
      }

      resolver = resolve
      state.title = opts.title
      state.message = opts.message
      state.confirmLabel = opts.confirmLabel
      state.cancelLabel = opts.cancelLabel
      state.variant = opts.variant ?? 'default'
      state.alert = opts.alert ?? false
      state.open = true
    })
  }

  function confirm(options: ConfirmDialogOptions | string): Promise<boolean> {
    return open(typeof options === 'string' ? options : { ...options, alert: false })
  }

  function alert(message: string, title?: string): Promise<void> {
    return open({ message, title, alert: true, variant: 'warning' }).then(() => {})
  }

  return { confirm, alert, state: confirmDialogState }
}
