// ---------------------------------------
// plugin vue2 for local data store
// ---------------------------------------
import { Magnetar } from '@magnetarjs/core'
import { CreatePlugin } from '@magnetarjs/plugin-vuex'
import { logger } from '@magnetarjs/utils'
// import Vue from 'vue'
import store from './store'
window.store = store

// const vueInstance = Vue
const generateRandomId = () => Math.random().toString()

// create the local store plugin instance:
const local = CreatePlugin({ generateRandomId, store })

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
  on: { success: logger },
})
