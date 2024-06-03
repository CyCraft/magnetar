import { PluginMockLocal, generateRandomId, pokedex } from '@magnetarjs/test-utils'
import { assert, test } from 'vitest'
import { Magnetar } from '../../src/index.js'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance.js'

const CreatePluginLocal = PluginMockLocal.CreatePlugin

test('emits global, module and action events', async () => {
  const cache = CreatePluginLocal({ storeName: 'cache', generateRandomId })
  const ranAllEvents: any[] = []
  const magnetar = Magnetar({
    stores: { cache },
    executionOrder: {
      read: ['cache'],
      write: ['cache'],
    },
    on: {
      before: ({ payload, storeName }) => {
        if (storeName === 'cache') ranAllEvents.push(payload)
      },
    },
  })
  const usersModule = magnetar.collection('users', {
    on: {
      before: ({ payload, storeName }) => {
        if (storeName === 'cache') ranAllEvents.push(payload)
      },
    },
  })
  const insertPayload = { name: 'luca' }

  const result = await usersModule.insert(insertPayload, {
    on: {
      before: ({ payload, storeName }) => {
        if (storeName === 'cache') ranAllEvents.push(payload)
      },
    },
  })
  assert.deepEqual(result.data, insertPayload)
  assert.deepEqual(ranAllEvents, [insertPayload, insertPayload, insertPayload])
})

test('can modify payload in global, module and action settings', async () => {
  const cache = CreatePluginLocal({ storeName: 'cache', generateRandomId })
  const magnetar = Magnetar({
    stores: { cache },
    executionOrder: {
      read: ['cache'],
      write: ['cache'],
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
  assert.deepEqual(result.data, {
    ...insertPayload,
    addedInModule: true,
    addedInGlobal: true,
    addedInAction: true,
  })
})

test('can overwrite execution order', async () => {
  const { pokedexModule } = createMagnetarInstance()
  const insertPayload = pokedex(7)
  await pokedexModule.insert(insertPayload)
  let ranAllEvents: string[] = []
  await pokedexModule.doc('7').delete(undefined, {
    executionOrder: ['cache', 'remote'],
    on: {
      before: ({ payload, storeName }) => {
        ranAllEvents.push(storeName)
      },
      success: ({ payload, storeName }) => {
        ranAllEvents.push(storeName)
      },
    },
  })
  assert.deepEqual(ranAllEvents, ['cache', 'cache', 'remote', 'remote'])
  await pokedexModule.insert(insertPayload)
  ranAllEvents = []
  await pokedexModule.doc('7').delete(undefined, {
    executionOrder: ['remote', 'cache'],
    on: {
      before: ({ payload, storeName }) => {
        ranAllEvents.push(storeName)
      },
      success: ({ payload, storeName }) => {
        ranAllEvents.push(storeName)
      },
    },
  })
  assert.deepEqual(ranAllEvents, ['remote', 'remote', 'cache', 'cache'])
})
