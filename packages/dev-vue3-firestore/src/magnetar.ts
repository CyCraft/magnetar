// ---------------------------------------
// plugin vue2 for local data store
// ---------------------------------------
import { db } from './initFirebase'
import { collection, doc } from 'firebase/firestore'
import { Magnetar } from '@magnetarjs/core'
import { CreatePlugin } from '@magnetarjs/plugin-vue3'
import { CreatePlugin as CreatePluginFirestore } from '@magnetarjs/plugin-firestore'

export const generateRandomId = (): string => doc(collection(db, 'random')).id

// create the local store plugin instance:
const local = CreatePlugin({ generateRandomId })

const remote = CreatePluginFirestore({ db, useModulePathsForFirestore: true, debug: true })

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
