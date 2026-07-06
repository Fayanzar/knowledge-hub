import { useConfirmDialog } from '@vueuse/core'

/**
 * Everything you pass into `reveal()` when opening the dialog.
 * `data` is generic on purpose — put whatever you need in there
 * (the row being deleted, a form draft, an id, etc.) and it will
 * come back to you untouched in the confirm/cancel result.
 */
export interface ConfirmPayload<T = unknown> {
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  /** Set true to style the confirm button as a destructive action */
  danger?: boolean
  /** Arbitrary custom data you want threaded through the dialog */
  data?: T
}

export interface ConfirmResult<T = unknown> {
  confirmed: boolean
  data?: T
}

// Module-level instance -> shared across the whole app.
// Any component can call `useConfirm()` and get the same dialog,
// which is mounted once via <ConfirmDialog /> near the app root.
//
// Note: useConfirmDialog's own `confirm`/`cancel` are the *resolver*
// functions (they close an already-open dialog with a value). We keep
// those under `resolveConfirm`/`resolveCancel` for <ConfirmDialog /> to
// use internally, and expose a separate `confirm` helper below for
// consumers to *open* the dialog and await the result.
const dialog = useConfirmDialog<ConfirmPayload, ConfirmResult, ConfirmResult>()

const {
  reveal,
  confirm: resolveConfirm,
  cancel: resolveCancel,
  ...rest
} = dialog

/**
 * For <ConfirmDialog /> only: the raw resolvers that close the
 * currently open dialog. Don't call these from feature code.
 */
export function useConfirmDialogResolvers() {
  return { ...rest, reveal, resolveConfirm, resolveCancel }
}

export function useConfirm() {
  /**
   * Opens the dialog and resolves once the user responds.
   * Usage:
   *   const { data, confirmed } = await confirm({
   *     title: 'Delete item?',
   *     message: `Delete "${item.name}"? This can't be undone.`,
   *     danger: true,
   *     data: item,
   *   })
   */
  async function confirm<T>(payload: ConfirmPayload<T>) {
    const { data, isCanceled } = await reveal(payload as ConfirmPayload)
    return {
      isCanceled,
      confirmed: !isCanceled && Boolean((data as ConfirmResult<T> | undefined)?.confirmed),
      data: (data as ConfirmResult<T> | undefined)?.data,
    }
  }

  return { ...rest, confirm }
}
