import type { PokedexEntry } from '@magnetarjs/test-utils'
import {
  generateRandomId,
  PluginMockLocal,
  PluginMockRemote,
  pokedex,
} from '@magnetarjs/test-utils'
import type {
  CollectionInstance,
  DocInstance,
  GlobalConfig,
  MagnetarInstance,
} from '@magnetarjs/types'
import { Magnetar } from '../../src/index.js'

const CreatePluginLocal = PluginMockLocal.CreatePlugin
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

export function createMagnetarInstance(
  magnetarGlobalConfig: Partial<GlobalConfig> = {},
  startEmpty = false,
): {
  pokedexModule: CollectionInstance<PokedexModuleData>
  trainerModule: DocInstance<TrainerModuleData>
  magnetar: MagnetarInstance
} {
  const cache = CreatePluginLocal({ storeName: 'cache', generateRandomId })
  const remote = CreatePluginRemote({ storeName: 'remote' })
  const magnetar = Magnetar({
    stores: { cache, remote },
    executionOrder: {
      read: ['cache', 'remote'],
      write: ['cache', 'remote'],
      delete: ['cache', 'remote'],
    },
    ...magnetarGlobalConfig,
  })
  const pokedexModule = startEmpty
    ? magnetar.collection<PokedexModuleData>('pokedex')
    : magnetar.collection<PokedexModuleData>('pokedex', {
        configPerStore: {
          cache: { initialData: getInitialDataCollection() }, // path for the plugin
          remote: {}, // path for the plugin
        },
      })
  const trainerModule = startEmpty
    ? magnetar.doc<TrainerModuleData>('app-data/trainer')
    : magnetar.doc<TrainerModuleData>('app-data/trainer', {
        configPerStore: {
          cache: { initialData: getInitialDataDocument() }, // path for the plugin
          remote: {}, // path for the plugin
        },
      })
  return { pokedexModule, trainerModule, magnetar }
}
