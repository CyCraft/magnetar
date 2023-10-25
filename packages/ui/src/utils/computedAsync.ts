import { computedAsync as vueUseComputedAsync } from '@vueuse/core'
import { computed, ComputedRef, Ref } from 'vue'

function unwrapRef<T>(doubleRef: Ref<ComputedRef<T>>): Readonly<Ref<T>> {
  return computed(() => doubleRef.value.value)
}

/**
 * A version of `computedAsync` from `@vueuse/core` that enforces to
 * return a `ComputedRef` from the async function in order to prevent
 * a bug where magnetar's local state mutations doesn't trigger a refresh.
 *
 * It also enforces `initialState` to be provided at all times and as a function.
 */
export function computedAsync<T>(
  fn: () => Promise<ComputedRef<T>>,
  initialState: () => T,
  isEvaluating?: Ref<boolean>
): Readonly<Ref<T>> {
  return unwrapRef(vueUseComputedAsync(fn, computed(initialState), isEvaluating))
}
