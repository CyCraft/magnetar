import test from 'ava'
import { VueSync } from '../src/index'
import { VueSyncGenericPlugin } from './helpers/pluginMock'

test('emits global, module and action events', async t => {
  const local = VueSyncGenericPlugin({ storeName: 'local' })
  const remote = VueSyncGenericPlugin({ storeName: 'remote' })
  const vueSync = VueSync({
    stores: { local, remote },
    executionOrder: {
      read: ['remote', 'local'],
      write: ['local', 'remote'],
    },
    on: { local: { before: ({ payload }) => ({ ...payload, addedInGlobal: true }) } },
  })
  const usersModule = vueSync.createModule({
    configPerStore: {
      local: { path: 'users' }, // path for vuex
      remote: { path: 'users' }, // path for vuex
    },
    on: { local: { before: ({ payload }) => ({ ...payload, addedInModule: true }) } },
  })
  const insertPayload = { name: 'luca' }

  const result = await usersModule.insert(insertPayload, {
    on: {
      local: {
        before: ({ payload }) => ({ ...payload, addedInAction: true }),
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
