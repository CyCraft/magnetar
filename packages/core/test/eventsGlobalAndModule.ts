import test from 'ava'
import { VueSync } from '../src/index'
import { VueSyncGenericPlugin } from './helpers/pluginMock'

test('emits global, module and action events', async t => {
  const local = VueSyncGenericPlugin({ storeName: 'local' })
  const vueSync = VueSync({
    stores: { local },
    executionOrder: {
      read: ['local'],
      write: ['local'],
    },
    on: {
      before: ({ payload, storeName }) => {
        if (storeName === 'local') return { ...payload, addedInGlobal: true }
      },
    },
  })
  const usersModule = vueSync.createModule({
    configPerStore: {
      local: { path: 'users' }, // path for vuex
    },
    on: {
      before: ({ payload, storeName }) => {
        if (storeName === 'local') return { ...payload, addedInModule: true }
      },
    },
  })
  const insertPayload = { name: 'luca' }

  const result = await usersModule.insert(insertPayload, {
    on: {
      before: ({ payload, storeName }) => {
        if (storeName === 'local') return { ...payload, addedInAction: true }
      },
    },
  })
  t.deepEqual(result, {
    ...insertPayload,
    // @ts-ignore
    addedInModule: true,
    addedInGlobal: true,
    addedInAction: true,
  })
})
