import { CreatePlugin as CreatePluginLocal } from './pluginMockLocal/index'
import { CreatePlugin } from '../../src'
import { VueSync, VueSyncInstance, CollectionInstance, DocInstance } from '@vue-sync/core'
import { pokedex, PokedexEntry } from './pokedex'
import { generateRandomId } from './generateRandomId'
import { firestore } from './firestore'
import { O } from 'ts-toolbelt'
import { waitMs } from './wait'
import { deleteAtPath } from './deleteCollection'

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
    shouldFailDelete?: string
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

export async function createVueSyncInstance (
  testName: string,
  {
    insertDocs = {},
    deletePaths = [],
  }: { insertDocs?: { [path: string]: object }; deletePaths?: string[] } = {}
): Promise<{
  pokedexModule: CollectionInstance<PokedexModuleData>
  trainerModule: DocInstance<TrainerModuleData>
  vueSync: VueSyncInstance
}> {
  if (testName.includes('/')) throw new Error('no / in test names allowed!')
  if (testName !== 'read' && testNamesUsedSoFar.includes(testName)) {
    throw new Error(`testName: "${testName}" is already used!`)
  } else {
    testNamesUsedSoFar.push(testName)
  }

  // prepare the firestore side
  const deletePromises = deletePaths.map(path => {
    const docPath = `vueSyncTests/${testName}${path ? '/' + path : ''}`
    return firestore.doc(docPath).delete()
  })
  const insertPromises = Object.entries(insertDocs).map(([path, data]) => {
    const docPath = `vueSyncTests/${testName}${path ? '/' + path : ''}`
    return firestore.doc(docPath).set(data)
  })
  await Promise.all(deletePromises.concat(insertPromises))

  // create & prepare the modules
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
