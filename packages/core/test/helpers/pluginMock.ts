import { reactive } from 'vue'
import { Store } from 'vuex'
import { plainObject, ActionName, PluginAction } from '../../src/types/actions'

interface PluginConfig {}
type PluginActions = {
  [action in ActionName]?: PluginAction
}
interface PluginState {
  actions: PluginActions
  config: PluginConfig
}

export const VueSyncGenericPlugin = (config: PluginConfig): PluginState => {
  const insert: PluginAction = async payload => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (payload.shouldFail === true) reject(payload)
        resolve(payload)
      }, 1000)
    })
  }
  return {
    config,
    actions: { insert },
  }
}
