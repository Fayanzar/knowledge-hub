<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useConfirmDialogResolvers, type ConfirmPayload } from '@/util/useConfirm'

const { isRevealed, resolveConfirm, resolveCancel, onReveal } = useConfirmDialogResolvers()

// Local reactive copy of whatever was passed into reveal(),
// so the template has something to render.
const payload = ref<ConfirmPayload>({})

onReveal((data: unknown) => {
  payload.value = data ?? {}
})

function handleConfirm() {
  resolveConfirm({ confirmed: true, data: payload.value.data })
}

function handleCancel() {
  resolveCancel({ confirmed: false, data: payload.value.data })
}

function onKeydown(e: KeyboardEvent) {
  if (!isRevealed.value) return
  if (e.key === 'Escape') handleCancel()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

// Reset scroll lock cleanly if the dialog is torn down while open
watch(isRevealed, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isRevealed"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @mousedown.self="handleCancel"
      >
        <Transition
          appear
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="isRevealed"
            role="alertdialog"
            aria-modal="true"
            :aria-label="payload.title ?? 'Confirm'"
            class="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl dark:bg-neutral-900"
          >
            <h2 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              {{ payload.title ?? 'Are you sure?' }}
            </h2>

            <p v-if="payload.message" class="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              {{ payload.message }}
            </p>

            <!-- Slot lets a caller render custom content built from payload.data -->
            <slot :data="payload.data" />

            <div class="mt-6 flex justify-end gap-3">
              <button
                type="button"
                class="rounded-lg px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                @click="handleCancel"
              >
                {{ payload.cancelText ?? 'Cancel' }}
              </button>
              <button
                type="button"
                class="rounded-lg px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2"
                :class="payload.danger
                  ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                  : 'bg-neutral-900 hover:bg-neutral-800 focus:ring-neutral-500 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200'"
                @click="handleConfirm"
              >
                {{ payload.confirmText ?? 'Confirm' }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
