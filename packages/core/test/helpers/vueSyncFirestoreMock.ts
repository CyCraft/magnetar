import { reactive } from 'vue'
import { plainObject } from '../../src/types'

interface Config {
  firebaseInstance: null | plainObject
}
interface VueSyncFirestoreState {
  firebaseInstance: null | plainObject
}

export const vueSyncFirestoreState: VueSyncFirestoreState = {
  firebaseInstance: null,
}
// export const vueSyncFirestoreState: vueSyncFirestoreState = reactive({
//   firebaseInstance: null,
// })

export const VueSyncFirestore = (config: Config) => {
  vueSyncFirestoreState.firebaseInstance = config.firebaseInstance
  return vueSyncFirestoreState
}
