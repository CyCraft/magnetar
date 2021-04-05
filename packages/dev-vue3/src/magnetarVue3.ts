// ---------------------------------------
// plugin vue2 for local data store
// ---------------------------------------
import { Magnetar } from '@magnetarjs/core'
import { CreatePlugin } from '@magnetarjs/plugin-vue3'
import { logger } from '@magnetarjs/utils'

const generateRandomId = () => Math.random().toString()

// create the local store plugin instance:
const local = CreatePlugin({ generateRandomId })

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
