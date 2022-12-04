// ---------------------------------------
// plugin vue3 for local data store
// ---------------------------------------
import { db } from './initFirebase'
import { collection, doc } from 'firebase/firestore'
import { Magnetar, PluginVue3, PluginFirestore } from 'magnetar'

export const generateRandomId = (): string => doc(collection(db, 'random')).id

// create the local store plugin instance:
const local = PluginVue3.CreatePlugin({ generateRandomId })

const remote = PluginFirestore.CreatePlugin({ db })

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
