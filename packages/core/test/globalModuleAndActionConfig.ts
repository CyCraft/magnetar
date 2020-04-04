import test from 'ava'
import { VueSync } from '../src/index'
import { VueSyncGenericPlugin } from './helpers/pluginMock'

test('emits global, module and action events', async t => {
  const local = VueSyncGenericPlugin({ storeName: 'local' })
  const ranAllEvents: any[] = []
  const vueSync = VueSync({
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
  const usersModule = vueSync.createModule({
    configPerStore: {
      local: { path: 'users' }, // path for vuex
    },
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
  t.deepEqual(result, insertPayload)
  t.deepEqual(ranAllEvents, [insertPayload, insertPayload, insertPayload])
})

test('can modify payload in global, module and action settings', async t => {
  const local = VueSyncGenericPlugin({ storeName: 'local' })
  const vueSync = VueSync({
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
  const usersModule = vueSync.createModule({
    configPerStore: {
      local: { path: 'users' }, // path for vuex
    },
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
  t.deepEqual(result, {
    ...insertPayload,
    addedInModule: true,
    addedInGlobal: true,
    addedInAction: true,
  })
})
