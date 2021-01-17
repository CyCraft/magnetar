// ---------------------------------------
// plugin vue2 for local data store
// ---------------------------------------
import { Magnetar } from '@magnetarjs/core'
import { CreatePlugin } from '@magnetarjs/plugin-vue3'
import { CreatePlugin as CreatePluginFirestore } from '@magnetarjs/plugin-firestore'
import { firestore } from './firestore'

export const generateRandomId = () => firestore.collection('random').doc().id

// create the local store plugin instance:
const local = CreatePlugin({ generateRandomId })

const remote = CreatePluginFirestore({
  firestoreInstance: firestore,
  useModulePathsForFirestore: true,
  debug: true,
})

// -----------------------------------------------------
// instantiate the Magnetar instance with the store plugins
// -----------------------------------------------------
export const magnetar = Magnetar({
  stores: { local, remote },
  localStoreName: 'local',
  executionOrder: {
    read: ['local', 'remote'],
    write: ['local', 'remote'],
    delete: ['local', 'remote'],
  },
})
