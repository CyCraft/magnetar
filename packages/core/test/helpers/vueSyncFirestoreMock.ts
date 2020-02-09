import { reactive } from 'vue'
import { plainObject, ActionName, PluginAction } from '../../src/types/actions'

interface PluginConfig {
  firebaseInstance: null | plainObject
}
type PluginActions = {
  [action in ActionName]?: PluginAction
}
interface PluginState {
  actions: PluginActions
  config: PluginConfig
}

export const vueSyncFirestoreState: PluginState = {
  config: {
    firebaseInstance: null,
  },
  actions: {},
}

export const VueSyncFirestore = (config: PluginConfig): PluginState => {
  vueSyncFirestoreState.config = config
  return vueSyncFirestoreState
}
