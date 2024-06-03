import { computedAsync as vueUseComputedAsync } from '@vueuse/core'
import { computed, ComputedRef, Ref } from 'vue'

/**
 * A version of `computedAsync` from `@vueuse/core` that enforces to
 * return a `ComputedRef` from the async function in order to prevent
 * a bug where magnetar's local cache state mutations doesn't trigger a refresh.
 */
export function computedAsync<T>(
  fn: () => Promise<ComputedRef<T>>,
  initialState: T,
  isEvaluating?: Ref<boolean>,
): ComputedRef<T> {
  const initialVal = Symbol('initial')
  const vueUseComputed = vueUseComputedAsync(fn, initialVal as any, isEvaluating)
  return computed(() =>
    vueUseComputed.value === initialVal ? initialState : vueUseComputed.value.value,
  )
}
