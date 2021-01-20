import { CollectionInstance, MagnetarInstance, OpenStreams } from '@magnetarjs/core'
import { copy } from 'copy-anything'
import { isArray, isFullArray, isFullString, isNumber } from 'is-what'
import { ActionTree } from 'vuex'

export const presetActionsDoc: ActionTree<Record<string, any>, Record<string, any>> = {}
export const presetActionsCollection: ActionTree<Record<string, any>, Record<string, any>> = {}

function applyClauses<T extends CollectionInstance>(ref: T, payload?: Record<string, any>): T
function applyClauses(ref: CollectionInstance, payload?: Record<string, any>): CollectionInstance {
  if (!payload) return ref
  const where: any[][] = payload?.where || payload?.clauses?.where
  if (isFullArray(where)) {
    for (const whereClause in where) {
      if (isFullArray(whereClause)) ref.where(whereClause[0], whereClause[1], whereClause[2])
    }
  }
  const orderBy: any[] = payload?.orderBy || payload?.clauses?.orderBy
  if (isFullArray(orderBy)) {
    ref.orderBy(orderBy[0], ...orderBy.slice(1))
  }
  const limit: number = payload?.limit || payload?.clauses?.limit
  if (isNumber(limit) && limit > 0) {
    ref.limit(limit)
  }
  return ref
}

export const vuexEasyFirestoreActionsDoc = (
  magnetar: MagnetarInstance
): ActionTree<Record<string, any>, Record<string, any>> => ({
  set(ctx, payload: Record<string, any>) {
    const modulePath = ctx.getters.magnetarPath
    magnetar.doc(modulePath).merge(payload)
  },
  patch(ctx, payload: Record<string, any>) {
    const modulePath = ctx.getters.magnetarPath
    magnetar.doc(modulePath).merge(payload)
  },
  /**
   * @param payload `tags` or `tags.water`
   */
  delete(ctx, payload: string | string[]) {
    const modulePath = ctx.getters.magnetarPath
    magnetar.doc(modulePath).deleteProp(payload)
  },
  openDBChannel(ctx) {
    const modulePath = ctx.getters.magnetarPath
    magnetar.doc(modulePath).stream()
  },
  closeDBChannel(ctx, payload?: { clearModule?: boolean }) {
    const modulePath = ctx.getters.magnetarPath

    const ref = magnetar.collection(modulePath)
    const openStreams: OpenStreams = ref.openStreams
    openStreams.forEach((unsubscribe) => unsubscribe())

    if (payload?.clearModule) {
      // todo: not yet implemented
      // ref.data.clear()
      console.log(`clearModule not yet implemented`)
    }
  },
  fetchAndAdd(ctx) {
    const modulePath = ctx.getters.magnetarPath
    magnetar.doc(modulePath).fetch()
  },
})

/**
 * preset actions: `set`, `patch`, `insert`, `delete`, `openDBChannel`, `fetchAndAdd`, `closeDBChannel`, `fetchById`, `duplicate`
 */
export const vuexEasyFirestoreActionsCollection = (
  magnetar: MagnetarInstance
): ActionTree<Record<string, any>, Record<string, any>> => ({
  set(ctx, payload: Record<string, any>) {
    const modulePath = ctx.getters.magnetarPath
    const docId = payload.id
    if (isFullString(docId)) {
      magnetar.doc(`${modulePath}/${docId}`).merge(payload)
    } else {
      magnetar.collection(modulePath).insert(payload)
    }
  },
  insert(ctx, payload: Record<string, any>) {
    const modulePath = ctx.getters.magnetarPath
    magnetar.collection(modulePath).insert(payload)
  },
  patch(ctx, payload: Record<string, any>) {
    const modulePath = ctx.getters.magnetarPath
    const docId = payload.id
    if (!isFullString(docId)) throw new Error('needs ID')

    magnetar.doc(`${modulePath}/${docId}`).merge(payload)
  },
  /**
   * @param payload `id` or `${id}.tags.water`
   */
  delete(ctx, payload: string | string[]) {
    const modulePath = ctx.getters.magnetarPath
    const [docId, propPathArr] = isArray(payload) ? payload : payload.split('.')
    if (propPathArr.length === 0) {
      magnetar.collection(modulePath).delete(payload)
    } else {
      magnetar.doc(`${modulePath}/${docId}`).deleteProp(propPathArr)
    }
  },
  duplicate(ctx, docId: string) {
    const modulePath = ctx.getters.magnetarPath
    if (!docId) {
      throw new Error(`docId wasn't passed during: \`dispatch('${modulePath}/duplicate', docId)\``)
    }
    const docData = copy(magnetar.doc(`${modulePath}/${docId}`).data)
    delete docData.id
    magnetar.collection(modulePath).insert(docData)
  },
  openDBChannel(ctx, payload?: Record<string, any>) {
    const modulePath = ctx.getters.magnetarPath

    const ref = magnetar.collection(modulePath)
    const refWithClauses = applyClauses(ref, payload)
    refWithClauses.stream()
  },
  closeDBChannel(ctx, payload?: { clearModule?: boolean }) {
    const modulePath = ctx.getters.magnetarPath

    const ref = magnetar.collection(modulePath)
    const openStreams: OpenStreams = ref.openStreams
    openStreams.forEach((unsubscribe) => unsubscribe())

    if (payload?.clearModule) {
      // todo: not yet implemented
      // ref.data.clear()
      console.log(`clearModule not yet implemented`)
    }
  },
  fetchAndAdd(ctx, payload?: Record<string, any>) {
    const modulePath = ctx.getters.magnetarPath

    const ref = magnetar.collection(modulePath)
    const refWithClauses = applyClauses(ref, payload)
    refWithClauses.fetch()
  },
  fetchById(ctx, docId: string) {
    const modulePath = ctx.getters.magnetarPath
    if (!docId) {
      throw new Error(`docId wasn't passed during: \`dispatch('${modulePath}/fetch', docId)\``)
    }
    magnetar.doc(`${modulePath}/${docId}`).fetch()
  },
})
