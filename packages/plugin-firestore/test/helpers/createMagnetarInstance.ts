import { Magnetar, MagnetarInstance, CollectionInstance, DocInstance } from '../../../core/src'
import { CreatePlugin as CreatePluginRemote } from '../../src'
import { pokedex, PokedexEntry, generateRandomId, PluginMockLocal } from '@magnetarjs/test-utils'
import { O } from 'ts-toolbelt'
import { firestore } from './firestore'

const CreatePluginLocal = PluginMockLocal.CreatePlugin

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

export async function createMagnetarInstance(
  testName: string,
  {
    insertDocs = {},
    deletePaths = [],
  }: { insertDocs?: { [path: string]: Record<string, any> }; deletePaths?: string[] } = {}
): Promise<{
  pokedexModule: CollectionInstance<PokedexModuleData>
  trainerModule: DocInstance<TrainerModuleData>
  magnetar: MagnetarInstance
}> {
  if (testName.includes('/')) throw new Error('no / in test names allowed!')
  if (!['read', 'read-no-access'].includes(testName) && testNamesUsedSoFar.includes(testName)) {
    throw new Error(`testName: "${testName}" is already used!`)
  } else {
    testNamesUsedSoFar.push(testName)
  }

  // prepare the firestore side
  const deletePromises = deletePaths.map((path) => {
    const docPath = `magnetarTests/${testName}${path ? '/' + path : ''}`
    return firestore.doc(docPath).delete()
  })
  const insertPromises = Object.entries(insertDocs).map(([path, data]) => {
    const docPath = `magnetarTests/${testName}${path ? '/' + path : ''}`
    return firestore.doc(docPath).set(data)
  })
  await Promise.all(deletePromises.concat(insertPromises))

  // create & prepare the modules
  const local = CreatePluginLocal({ storeName: 'local', generateRandomId })
  const remote = CreatePluginRemote({ firestoreInstance: firestore })
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
      local: { initialData: getInitialDataCollection() },
      remote: { firestorePath: `magnetarTests/${testName}/pokedex` },
    },
  })

  const trainerModule = magnetar.doc<TrainerModuleData>('data/trainer', {
    configPerStore: {
      local: { initialData: getInitialDataDocument() },
      remote: { firestorePath: `magnetarTests/${testName}` },
    },
  })
  return { pokedexModule, trainerModule, magnetar }
}
