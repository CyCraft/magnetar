// ---------------------------------------
// plugin vue2 for local data store
// ---------------------------------------
import { Magnetar, PluginVue2 } from 'magnetar'
import Vue from 'vue'

const vueInstance = Vue
const generateRandomId = () => Math.random().toString()

// create the local store plugin instance:
const local = PluginVue2.CreatePlugin({ vueInstance, generateRandomId })

// -----------------------------------------------------
// instantiate the Magnetar instance with the store plugins
// -----------------------------------------------------
export const magnetar = Magnetar({
  stores: { local },
  localStoreName: 'local',
  executionOrder: {
    read: ['local'],
    write: ['local'],
    delete: ['local'],
  },
})
