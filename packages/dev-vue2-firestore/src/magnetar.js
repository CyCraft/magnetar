// ---------------------------------------
// plugin vue2 for local data store
// ---------------------------------------
import { Magnetar, PluginFirestore, PluginVue2 } from 'magnetar'
import Vue from 'vue'
import { db } from './initFirebase'

const vueInstance = Vue
const generateRandomId = () => Math.random().toString()

// create the local store plugin instance:
const local = PluginVue2.CreatePlugin({ vueInstance, generateRandomId })

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
