import { MagnetarInstance, CollectionInstance, DocInstance } from '@magnetarjs/types'
import { Magnetar } from '@magnetarjs/core'
import { CreatePlugin as CreatePluginLocal } from '../../src'
import { pokedex, PokedexEntry, generateRandomId, PluginMockRemote } from '@magnetarjs/test-utils'

// @ts-ignore
import Vue from 'vue/dist/vue.common.js'

const CreatePluginRemote = PluginMockRemote.CreatePlugin

const getInitialDataCollection = () => [
  // doc entries
  ['1', pokedex(1)],
]
const getInitialDataDocument = () => ({ name: 'Luca', age: 10 })

export type PokedexModuleData = PokedexEntry & { seen?: boolean; shouldFail?: string }

export type TrainerModuleData = {
  name: string
  age?: number
  nickName?: string
  dream?: string
  shouldFail?: string
  colour?: string
}

export function createMagnetarInstance(vueInstance: any = Vue): {
  pokedexModule: CollectionInstance<PokedexModuleData>
  trainerModule: DocInstance<TrainerModuleData>
  magnetar: MagnetarInstance
} {
  const local = CreatePluginLocal({ generateRandomId, vueInstance })
  const remote = CreatePluginRemote({ storeName: 'remote' })
  const magnetar = Magnetar({
    localStoreName: 'local',
    stores: { local, remote },
    executionOrder: {
      read: ['local', 'remote'],
      write: ['local', 'remote'],
      delete: ['local', 'remote'],
    },
  })
  const pokedexModule = magnetar.collection<PokedexModuleData>('pokedex', {
    configPerStore: {
      local: { initialData: getInitialDataCollection() }, // path for the plugin
      remote: {}, // path for the plugin
    },
  })
  const trainerModule = magnetar.doc<TrainerModuleData>('app-data/trainer', {
    configPerStore: {
      local: { initialData: getInitialDataDocument() }, // path for the plugin
      remote: {}, // path for the plugin
    },
  })
  return { pokedexModule, trainerModule, magnetar }
}
