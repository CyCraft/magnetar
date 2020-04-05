import { VueSyncGenericPlugin } from './pluginMock'
import { VueSync, VueSyncInstance } from '../../src'
import { VueSyncModuleInstance } from '../../src/CreateModule'
import { bulbasaur } from './pokemon'

interface PokedexModuleData {
  [id: string]: {
    id: string
    name: string
    type?: {
      [type: string]: string | undefined | null
    }
    seen?: boolean
    shouldFail?: string
  }
}

interface TrainerModuleData {
  name: string
  age?: number
  nickName?: string
  dream?: string
  shouldFail?: string
}

export function createVueSyncInstance (): {
  pokedexModule: VueSyncModuleInstance<PokedexModuleData>
  trainerModule: VueSyncModuleInstance<TrainerModuleData>
  vueSync: VueSyncInstance
} {
  const local = VueSyncGenericPlugin({ storeName: 'local' })
  const remote = VueSyncGenericPlugin({ storeName: 'remote' })
  const vueSync = VueSync({
    dataStoreName: 'local',
    stores: { local, remote },
    executionOrder: {
      read: ['local', 'remote'],
      write: ['local', 'remote'],
      delete: ['local', 'remote'],
    },
  })
  const getInitialDataCollection = () => ({
    // doc
    '001': bulbasaur,
  })
  const getInitialDataDocument = () => ({ name: 'Luca', age: 10 })
  const pokedexModule = vueSync.createModule<PokedexModuleData>({
    configPerStore: {
      local: { path: 'pokedex', initialData: getInitialDataCollection() }, // path for the plugin
      remote: { path: 'pokedex', initialData: getInitialDataCollection() }, // path for the plugin
    },
  })
  const trainerModule = vueSync.createModule<TrainerModuleData>({
    configPerStore: {
      local: { path: 'data/trainer', initialData: getInitialDataDocument() }, // path for the plugin
      remote: { path: 'data/trainer', initialData: getInitialDataDocument() }, // path for the plugin
    },
  })
  return { pokedexModule, trainerModule, vueSync }
}
