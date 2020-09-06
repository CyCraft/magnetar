import test from 'ava'
import { Magnetar } from '../../src/index'
import { PluginMockLocal, generateRandomId, pokedex } from 'test-utils'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance'

const CreatePluginLocal = PluginMockLocal.CreatePlugin

test('emits global, module and action events', async (t) => {
  const local = CreatePluginLocal({ storeName: 'local', generateRandomId })
  const ranAllEvents: any[] = []
  const magnetar = Magnetar({
    dataStoreName: 'local',
    stores: { local },
    executionOrder: {
      read: ['local'],
      write: ['local'],
    },
    on: {
      before: ({ payload, storeName }) => {
        if (storeName === 'local') ranAllEvents.push(payload)
      },
    },
  })
  const usersModule = magnetar.collection('users', {
    on: {
      before: ({ payload, storeName }) => {
        if (storeName === 'local') ranAllEvents.push(payload)
      },
    },
  })
  const insertPayload = { name: 'luca' }

  const result = await usersModule.insert(insertPayload, {
    on: {
      before: ({ payload, storeName }) => {
        if (storeName === 'local') ranAllEvents.push(payload)
      },
    },
  })
  t.deepEqual(result.data, insertPayload)
  t.deepEqual(ranAllEvents, [insertPayload, insertPayload, insertPayload])
})

test('can modify payload in global, module and action settings', async (t) => {
  const local = CreatePluginLocal({ storeName: 'local', generateRandomId })
  const magnetar = Magnetar({
    dataStoreName: 'local',
    stores: { local },
    executionOrder: {
      read: ['local'],
      write: ['local'],
    },
    modifyPayloadOn: {
      insert: (payload) => {
        return { ...payload, addedInGlobal: true }
      },
    },
  })
  const usersModule = magnetar.collection('users', {
    modifyPayloadOn: {
      insert: (payload) => {
        return { ...payload, addedInModule: true }
      },
    },
  })
  const insertPayload = { name: 'luca' }

  const result = await usersModule.insert(insertPayload, {
    modifyPayloadOn: {
      insert: (payload) => {
        return { ...payload, addedInAction: true }
      },
    },
  })
  t.deepEqual(result.data, {
    ...insertPayload,
    addedInModule: true,
    addedInGlobal: true,
    addedInAction: true,
  })
})

test('can overwrite execution order', async (t) => {
  const { pokedexModule } = createMagnetarInstance()
  const insertPayload = pokedex(7)
  await pokedexModule.insert(insertPayload)
  let ranAllEvents: string[] = []
  await pokedexModule.doc('7').delete(undefined, {
    executionOrder: ['local', 'remote'],
    on: {
      before: ({ payload, storeName }) => {
        ranAllEvents.push(storeName)
      },
      success: ({ payload, storeName }) => {
        ranAllEvents.push(storeName)
      },
    },
  })
  t.deepEqual(ranAllEvents, ['local', 'local', 'remote', 'remote'])
  await pokedexModule.insert(insertPayload)
  ranAllEvents = []
  await pokedexModule.doc('7').delete(undefined, {
    executionOrder: ['remote', 'local'],
    on: {
      before: ({ payload, storeName }) => {
        ranAllEvents.push(storeName)
      },
      success: ({ payload, storeName }) => {
        ranAllEvents.push(storeName)
      },
    },
  })
  t.deepEqual(ranAllEvents, ['remote', 'remote', 'local', 'local'])
})
