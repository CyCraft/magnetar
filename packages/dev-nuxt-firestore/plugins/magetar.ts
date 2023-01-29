import { initializeApp } from 'firebase/app'
import { getFirestore, collection, doc } from 'firebase/firestore'
import { Magnetar } from '@magnetarjs/core'
import { CreatePlugin as PluginFirestore } from '@magnetarjs/plugin-firestore'
import { CreatePlugin as PluginVue3 } from '@magnetarjs/plugin-vue3'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const firebaseApp = initializeApp(config.public)
  const db = getFirestore(firebaseApp)

  const generateRandomId = (): string => doc(collection(db, 'random')).id

  // create the local store plugin instance
  const local = PluginVue3({ generateRandomId })
  // create the remote store plugin instance
  const remote = PluginFirestore({ db })

  // instantiate the Magnetar instance with the store plugins
  const magnetar = Magnetar({
    stores: { local, remote },
    localStoreName: 'local',
    executionOrder: {
      read: ['local', 'remote'],
      write: ['local', 'remote'],
      delete: ['local', 'remote'],
    },
  })

  /**
   * TODO: hydration for SSR
   */
  if (process.server) {
    // collect the initial state
    nuxtApp.payload.magnetar = {}
  } else if (nuxtApp.payload?.magnetar) {
    // ... hydrate the state
  }

  return {
    provide: {
      magnetar,
    },
  }
})
