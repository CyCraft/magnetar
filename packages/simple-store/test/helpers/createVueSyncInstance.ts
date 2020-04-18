import { VueSync, VueSyncInstance, CollectionInstance, DocInstance } from '@vue-sync/core'
import { CreatePlugin } from '../../src/index'
import { CreatePlugin as CreatePluginRemote } from './pluginMockRemote'
import { bulbasaur } from './pokemon'

const getInitialDataCollection = () => [
  // doc entries
  ['001', bulbasaur()],
]
const getInitialDataDocument = () => ({ name: 'Luca', age: 10 })

export interface PokedexModuleData {
  id?: string
  name: string
  type?: {
    [type: string]: string | undefined | null
  }
  seen?: boolean
  shouldFail?: string
}

export interface TrainerModuleData {
  name: string
  age?: number
  nickName?: string
  dream?: string
  shouldFail?: string
}

export function createVueSyncInstance (): {
  pokedexModule: CollectionInstance<PokedexModuleData>
  trainerModule: DocInstance<TrainerModuleData>
  vueSync: VueSyncInstance
} {
  const local = CreatePlugin({ storeName: 'local' })
  const remote = CreatePluginRemote({ storeName: 'remote' })
  const vueSync = VueSync({
    dataStoreName: 'local',
    stores: { local, remote },
    executionOrder: {
      read: ['local', 'remote'],
      write: ['local', 'remote'],
      delete: ['local', 'remote'],
    },
  })
  const pokedexModule = vueSync.collection<PokedexModuleData>('pokedex', {
    configPerStore: {
      local: { initialData: getInitialDataCollection() }, // path for the plugin
      remote: {}, // path for the plugin
    },
  })
  const trainerModule = vueSync.doc<TrainerModuleData>('data/trainer', {
    configPerStore: {
      local: { initialData: getInitialDataDocument() }, // path for the plugin
      remote: {}, // path for the plugin
    },
  })
  return { pokedexModule, trainerModule, vueSync }
}
