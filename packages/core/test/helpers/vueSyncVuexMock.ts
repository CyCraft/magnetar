import { Store } from 'vuex'
import { ActionName, VueSyncAction } from '../../src/types/actions'

interface PluginConfig {
  vuexInstance: null | Store<object> | object
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
