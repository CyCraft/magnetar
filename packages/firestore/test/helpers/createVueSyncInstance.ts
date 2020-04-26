import { CreatePlugin as CreatePluginLocal } from './pluginMockLocal/index'
import { CreatePlugin } from '../../src'
import { VueSync, VueSyncInstance, CollectionInstance, DocInstance } from '@vue-sync/core'
import { pokedex, PokedexEntry } from './pokedex'
import { generateRandomId } from './generateRandomId'
import { firestore } from './firestore'
import { O } from 'ts-toolbelt'

const getInitialDataCollection = () => [
  // doc entries
  ['1', pokedex(1)],
]
const getInitialDataDocument = () => ({ name: 'Luca', age: 10 })

export type PokedexModuleData = O.Merge<
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

const testNamesUsedSoFar: string[] = []

export function createVueSyncInstance (
  testName: string
): {
  pokedexModule: CollectionInstance<PokedexModuleData>
  trainerModule: DocInstance<TrainerModuleData>
  vueSync: VueSyncInstance
} {
  if (testName.includes('/')) throw new Error('no / in test names allowed!')
  if (testNamesUsedSoFar.includes(testName)) {
    throw new Error(`testName: "${testName}" is already used!`)
  } else {
    testNamesUsedSoFar.push(testName)
  }

  const local = CreatePluginLocal({ storeName: 'local', generateRandomId })
  const remote = CreatePlugin({ firestoreInstance: firestore })
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
      local: { initialData: getInitialDataCollection() },
      remote: { firestorePath: `vueSyncTests/${testName}/pokedex` },
    },
  })
  const trainerModule = vueSync.doc<TrainerModuleData>('data/trainer', {
    configPerStore: {
      local: { initialData: getInitialDataDocument() },
      remote: { firestorePath: `vueSyncTests/${testName}` },
    },
  })
  return { pokedexModule, trainerModule, vueSync }
}
