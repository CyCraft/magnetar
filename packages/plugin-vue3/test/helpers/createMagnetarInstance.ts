import { Magnetar, MagnetarInstance, CollectionInstance, DocInstance } from '../../../core/src'
import { CreatePlugin as CreatePluginLocal } from '../../src'
import { pokedex, PokedexEntry, generateRandomId, PluginMockRemote } from '@magnetarjs/test-utils'
import { O } from 'ts-toolbelt'
// @ts-ignore
import Vue from 'vue/dist/vue.cjs.js'

const CreatePluginRemote = PluginMockRemote.CreatePlugin

const getInitialDataCollection = () => [
  // doc entries
  ['1', pokedex(1)],
]
const getInitialDataDocument = () => ({ name: 'Luca', age: 10 })

export type PokedexModuleData = O.Patch<
  PokedexEntry,
  {
    seen?: boolean
    shouldFail?: string
  }
>

export type TrainerModuleData = {
  name: string
  age?: number
  nickName?: string
  dream?: string
  shouldFail?: string
}

export function createMagnetarInstance(
  vueInstance: any = Vue
): {
  pokedexModule: CollectionInstance<PokedexModuleData>
  trainerModule: DocInstance<TrainerModuleData>
  magnetar: MagnetarInstance
} {
  const local = CreatePluginLocal({ generateRandomId })
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
