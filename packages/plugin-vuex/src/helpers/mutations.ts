import { MutationTree } from 'vuex'
import { isAnyObject, isArray } from 'is-what'
import { getProp } from 'path-to-prop'
import { merge } from 'merge-anything'

export const docMutations: MutationTree<Record<string, any>> = {
  MAGNETAR__REPLACE(state, payload: Record<string, any>) {
    const _vm = this._vm as any
    // todo: delete all existent props first but without deleting sub collections...
    Object.entries(payload).forEach(([k, v]) => {
      _vm.$set(state, k, v)
    })
  },
  MAGNETAR__MERGE(state, payload: Record<string, any>) {
    const _vm = this._vm as any
    Object.entries(payload).forEach(([k, newValue]) => {
      const originalValue = state[k]
      const isMergable = isAnyObject(originalValue) && isAnyObject(newValue)
      if (isMergable) {
        _vm.$set(state, k, merge(originalValue, newValue))
      } else {
        _vm.$set(state, k, newValue)
      }
    })
  },
  MAGNETAR__ASSIGN(state, payload: Record<string, any>) {
    const _vm = this._vm as any
    Object.entries(payload).forEach(([k, v]) => {
      _vm.$set(state, k, v)
    })
  },
  MAGNETAR__DELETE_PROP(state, payload: string | string[]) {
    const _vm = this._vm as any
    const payloadArray = isArray(payload) ? payload : [payload]
    for (const propToDelete of payloadArray) {
      const isNestedPropPath = /[./]/.test(propToDelete)
      if (isNestedPropPath) {
        const parts = propToDelete.split(/[./]/)
        const lastPart = parts.pop()
        const parentRef = getProp(state, parts.join('.')) as Record<string, any>
        _vm.$delete(parentRef, lastPart || '')
      } else {
        _vm.$delete(state, propToDelete)
      }
    }
  },
}
