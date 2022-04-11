// ---------------------------------------
// plugin vue2 for local data store
// ---------------------------------------
import { Magnetar, PluginVue3 } from 'magnetar'

export const generateRandomId = () => Math.random().toString()

// create the local store plugin instance:
const local = PluginVue3.CreatePlugin({ generateRandomId })

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
