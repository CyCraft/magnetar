import { VueSync, VueSyncInstance, CollectionInstance, DocInstance } from '@magnetarjs/core'
import { CreatePlugin } from '@magnetarjs/reactive-store'
import { CreatePlugin as CreatePluginRemote } from './pluginMockRemote'
import { pokedex, PokedexEntry } from './pokedex'
import { generateRandomId } from './generateRandomId'
import { O } from 'ts-toolbelt'
import Vue from 'vue/dist/vue.common.js'

const getInitialDataCollection = () => [
  // doc entries
  ['1', pokedex(1)],
]
const getInitialDataDocument = () => ({ name: 'Luca', age: 10, dream: undefined })

export type PokedexModuleData = O.Merge<
  PokedexEntry,
  {
    seen?: boolean
    shouldFail?: string
  }
>

export interface TrainerModuleData {
  name: string
  age?: number
  nickName?: string
  dream?: string
  shouldFail?: string
}

export function createVueSyncInstance (vueInstance: any = Vue): {
  pokedexModule: CollectionInstance<PokedexModuleData>
  trainerModule: DocInstance<TrainerModuleData>
  vueSync: VueSyncInstance
} {
  const local = CreatePlugin({ storeName: 'local', generateRandomId, vueInstance })
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
