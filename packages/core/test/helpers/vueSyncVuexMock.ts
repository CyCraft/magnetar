import { reactive } from 'vue'
import { Store } from 'vuex'
import { plainObject, ActionName, PluginAction } from '../../src/types/actions'

interface PluginConfig {
  vuexInstance: null | Store<plainObject> | plainObject
}
type PluginActions = {
  [action in ActionName]?: PluginAction
}
interface PluginState {
  actions: PluginActions
  config: PluginConfig
}

export const VueSyncVuex = (config: PluginConfig): PluginState => {
  const insert: PluginAction = async payload => {
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