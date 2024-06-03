// ---------------------------------------
// plugin vue3 for cache data store
// ---------------------------------------
import { Magnetar } from '@magnetarjs/core'
import { CreatePlugin as PluginFirestore } from '@magnetarjs/plugin-firestore'
import { CreatePlugin as PluginVue3 } from '@magnetarjs/plugin-vue3'
import { collection, doc } from 'firebase/firestore'
import { db } from './initFirebase.js'

export const generateRandomId = (): string => doc(collection(db, 'random')).id

// create the cache store plugin instance:
const cache = PluginVue3({ generateRandomId })

const remote = PluginFirestore({ db, debug: true })

// -----------------------------------------------------
// instantiate the Magnetar instance with the store plugins
// -----------------------------------------------------
export const magnetar = Magnetar({
  stores: { cache, remote },
  executionOrder: {
    read: ['cache', 'remote'],
    write: ['cache', 'remote'],
    delete: ['cache', 'remote'],
  },
})
