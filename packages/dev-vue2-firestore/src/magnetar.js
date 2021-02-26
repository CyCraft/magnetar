// ---------------------------------------
// plugin vue2 for local data store
// ---------------------------------------
import { Magnetar } from '@magnetarjs/core'
import { CreatePlugin } from '@magnetarjs/plugin-vue2'
import { CreatePlugin as CreatePluginFirestore } from '@magnetarjs/plugin-firestore'
import Vue from 'vue'
import { firestore } from './firestore'

const vueInstance = Vue
const generateRandomId = () => Math.random().toString()

// create the local store plugin instance:
const local = CreatePlugin({ vueInstance, generateRandomId })

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
