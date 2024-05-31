// ---------------------------------------
// plugin vue3 for local data store
// ---------------------------------------
import { Magnetar } from '@magnetarjs/core'
import { CreatePlugin as PluginFirestore } from '@magnetarjs/plugin-firestore'
import { CreatePlugin as PluginVue3 } from '@magnetarjs/plugin-vue3'
import { collection, doc } from 'firebase/firestore'
import { db } from './initFirebase.js'

export const generateRandomId = (): string => doc(collection(db, 'random')).id

// create the local store plugin instance:
const local = PluginVue3({ generateRandomId })

const remote = PluginFirestore({ db })

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
