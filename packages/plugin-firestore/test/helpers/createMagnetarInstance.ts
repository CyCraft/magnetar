import { doc, setDoc, deleteDoc } from 'firebase/firestore'
import { O } from 'ts-toolbelt'
import { PokedexEntry, generateRandomId, PluginMockLocal } from '@magnetarjs/test-utils'
import { Magnetar, MagnetarInstance, CollectionInstance, DocInstance } from '../../../core/src'
import { CreatePlugin as CreatePluginRemote } from '../../src'
import { db } from './initFirebase'

const CreatePluginLocal = PluginMockLocal.CreatePlugin

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
    remoteConfig = {},
  }: {
    insertDocs?: { [path: string]: Record<string, any> }
    deletePaths?: string[]
    remoteConfig?: Record<string, any>
  } = {}
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
    return deleteDoc(doc(db, docPath))
  })
  const initialEntriesPokedex: [string, Record<string, any>][] = []
  const insertPromises = Object.entries(insertDocs).map(([path, data]) => {
    const docPath = `magnetarTests/${testName}${path ? '/' + path : ''}`
    if (path.startsWith('pokedex/')) {
      initialEntriesPokedex.push([path.split('/').pop() || '', data])
    }
    return setDoc(doc(db, docPath), data)
  })
  await Promise.all(deletePromises.concat(insertPromises))

  // create & prepare the modules
  const local = CreatePluginLocal({ storeName: 'local', generateRandomId })
  const remote = CreatePluginRemote({ db })
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
      local: { initialData: initialEntriesPokedex },
      remote: { firestorePath: `magnetarTests/${testName}/pokedex`, ...remoteConfig },
    },
  })

  const trainerModule = magnetar.doc<TrainerModuleData>('app-data/trainer', {
    configPerStore: {
      local: { initialData: getInitialDataDocument() },
      remote: { firestorePath: `magnetarTests/${testName}`, ...remoteConfig },
    },
  })
  return { pokedexModule, trainerModule, magnetar }
}
