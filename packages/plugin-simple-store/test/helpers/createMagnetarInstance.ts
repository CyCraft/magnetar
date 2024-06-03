import { Magnetar } from '@magnetarjs/core'
import { generateRandomId, PluginMockRemote, pokedex, PokedexEntry } from '@magnetarjs/test-utils'
import type { CollectionInstance, DocInstance, MagnetarInstance } from '@magnetarjs/types'
import { CreatePlugin as CreatePluginLocal } from '../../src/index.js'

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

export function createMagnetarInstance(): {
  pokedexModule: CollectionInstance<PokedexModuleData>
  trainerModule: DocInstance<TrainerModuleData>
  magnetar: MagnetarInstance
} {
  const cache = CreatePluginLocal({ generateRandomId })
  const remote = CreatePluginRemote({ storeName: 'remote' })
  const magnetar = Magnetar({
    stores: { cache, remote },
    executionOrder: {
      read: ['cache', 'remote'],
      write: ['cache', 'remote'],
      delete: ['cache', 'remote'],
    },
  })
  const pokedexModule = magnetar.collection<PokedexModuleData>('pokedex', {
    configPerStore: {
      cache: { initialData: getInitialDataCollection() }, // path for the plugin
      remote: {}, // path for the plugin
    },
  })
  const trainerModule = magnetar.doc<TrainerModuleData>('app-data/trainer', {
    configPerStore: {
      cache: { initialData: getInitialDataDocument() }, // path for the plugin
      remote: {}, // path for the plugin
    },
  })
  return { pokedexModule, trainerModule, magnetar }
}
