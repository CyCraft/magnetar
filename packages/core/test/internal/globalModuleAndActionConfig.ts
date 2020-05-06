import test from 'ava'
import { VueSync } from '../../src/index'
import { CreatePlugin } from '../helpers/pluginMockLocal'
import { generateRandomId } from '../helpers/generateRandomId'
import { createVueSyncInstance } from '../helpers/createVueSyncInstance'
import { pokedex } from '../helpers/pokedex'

test('emits global, module and action events', async t => {
  const local = CreatePlugin({ storeName: 'local', generateRandomId })
  const ranAllEvents: any[] = []
  const vueSync = VueSync({
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
  const usersModule = vueSync.collection('users', {
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

test('can modify payload in global, module and action settings', async t => {
  const local = CreatePlugin({ storeName: 'local', generateRandomId })
  const vueSync = VueSync({
    dataStoreName: 'local',
    stores: { local },
    executionOrder: {
      read: ['local'],
      write: ['local'],
    },
    modifyPayloadOn: {
      insert: payload => {
        return { ...payload, addedInGlobal: true }
      },
    },
  })
  const usersModule = vueSync.collection('users', {
    modifyPayloadOn: {
      insert: payload => {
        return { ...payload, addedInModule: true }
      },
    },
  })
  const insertPayload = { name: 'luca' }

  const result = await usersModule.insert(insertPayload, {
    modifyPayloadOn: {
      insert: payload => {
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

test('can overwrite execution order', async t => {
  const { pokedexModule } = createVueSyncInstance()
  const insertPayload = pokedex(7)
  await pokedexModule.insert(insertPayload)
  let ranAllEvents = []
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
