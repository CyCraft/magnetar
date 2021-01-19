import {
  PluginActionPayloadBase,
  PluginInsertAction,
  PluginInsertActionPayload,
} from '@magnetarjs/core'
import {
  VuexStorePluginModuleConfig,
  VuexStorePluginOptions,
  MakeRestoreBackup,
} from '../CreatePlugin'
import { isFullString, isNumber } from 'is-what'
import { Store } from 'vuex'

export function insertActionFactory(
  store: Store<Record<string, any>>,
  vuexStorePluginOptions: VuexStorePluginOptions,
  setupModule: (payload: PluginActionPayloadBase<VuexStorePluginModuleConfig>) => void | 'exists',
  makeBackup?: MakeRestoreBackup
): PluginInsertAction {
  return function ({
    payload,
    collectionPath,
    docId,
    pluginModuleConfig,
  }: PluginInsertActionPayload<VuexStorePluginModuleConfig>): string {
    const { generateRandomId } = vuexStorePluginOptions
    const _docId =
      docId ||
      (isFullString(payload.id) || isNumber(payload.id) ? String(payload.id) : generateRandomId())

    const setupModuleResult = setupModule({
      collectionPath,
      docId: _docId,
      pluginModuleConfig: { state: payload },
    })
    // if the module didn't exist yet it's enough to instantiate it with the payload as state
    if (setupModuleResult !== 'exists') return _docId

    // else the module existed, so let's replace the state
    store.commit(`${collectionPath}/${_docId}/MAGNETAR__REPLACE`, payload)

    // if (makeBackup) makeBackup(collectionPath, _docId)

    return _docId
  }
}
