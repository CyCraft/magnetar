import { Store } from 'vuex'
import { ActionName, VueSyncAction } from '../../src/types/actions'
import { PlainObject } from '../../src/types/base'

interface PluginConfig {
  vuexInstance: null | Store<PlainObject> | PlainObject
}
type VueSyncActions = {
  [action in ActionName]?: VueSyncAction
}
interface PluginState {
  actions: VueSyncActions
  config: PluginConfig
}

export const VueSyncVuex = (config: PluginConfig): PluginState => {
  const insert: VueSyncAction = async payload => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(payload)
      }, 1000)
    })
  }
  return {
    config,
    actions: { insert },
  }
}
