import { ActionName, VueSyncAction } from '../../src/types/actions'

interface PluginConfig {
  firebaseInstance: null | object
}
type VueSyncActions = {
  [action in ActionName]?: VueSyncAction
}
interface PluginState {
  actions: VueSyncActions
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
