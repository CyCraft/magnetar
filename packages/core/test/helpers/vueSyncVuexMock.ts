import { reactive } from 'vue'
import { Store } from 'vuex'
import { plainObject } from '../../src/types'

interface VueSyncVuexConfig {
  vuexInstance: null | Store<plainObject> | plainObject
}

interface VueSyncVuexState {
  vuexInstance: null | Store<plainObject> | plainObject
  insert: (payload: plainObject) => Promise<void>
}

export const VueSyncVuex = (config: VueSyncVuexConfig): VueSyncVuexState => {
  return {
    vuexInstance: config.vuexInstance,
    insert: async (payload: plainObject): Promise<void> => {
      console.log('vuex mock insert → ', payload)
      return
    },
  }
}
