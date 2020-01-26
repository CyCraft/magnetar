import { reactive } from 'vue'
import { Store } from 'vuex'
import { plainObject } from '../../src/types'

interface Config {
  vuexInstance: null | Store<plainObject> | plainObject
}
interface VueSyncVuexState {
  vuexInstance: null | Store<plainObject> | plainObject
}

// export const vueSyncVuexState: VueSyncVuexState = {
//   vuexInstance: null,
// }
export const vueSyncVuexState: VueSyncVuexState = reactive({
  vuexInstance: null,
})

export const VueSyncVuex = (config: Config) => {
  vueSyncVuexState.vuexInstance = config.vuexInstance
  return vueSyncVuexState
}
