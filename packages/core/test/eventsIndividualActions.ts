import test from 'ava'
import { VueSync } from '../src/index'
import { VueSyncGenericPlugin } from './helpers/pluginMock'

const local = VueSyncGenericPlugin({ storeName: 'local' })
const remote = VueSyncGenericPlugin({ storeName: 'remote' })
const vueSync = VueSync({
  stores: { local, remote },
  executionOrder: {
    read: ['remote', 'local'],
    write: ['local', 'remote'],
  },
})
const usersModule = vueSync.createModule({
  type: 'collection',
  configPerStore: {
    local: { path: 'users' }, // path for vuex
    remote: { path: 'users' }, // path for vuex
  },
})

test('emits before & success events', async t => {
  const insertPayload = { name: 'luca' }
  let ranAllEvents = []
  const result = await usersModule.insert(insertPayload, {
    on: {
      local: {
        before: ({ payload }) => {
          // @ts-ignore
          t.deepEqual(payload, insertPayload)
          ranAllEvents.push(1)
          return payload
        },
        success: ({ payload }) => {
          // @ts-ignore
          t.deepEqual(payload, insertPayload)
          ranAllEvents.push(1)
          return payload
        },
      },
      remote: {
        before: ({ payload }) => {
          // @ts-ignore
          t.deepEqual(payload, insertPayload)
          ranAllEvents.push(1)
          return payload
        },
        success: ({ payload }) => {
          // @ts-ignore
          t.deepEqual(payload, insertPayload)
          ranAllEvents.push(1)
          return payload
        },
      },
    },
  })
  // @ts-ignore
  t.deepEqual(result, insertPayload)
  t.is(ranAllEvents.length, 4)
})

test('can abort in before events', async t => {
  const insertPayload = { name: 'luca' }
  const result = await usersModule.insert(insertPayload, {
    on: {
      local: {
        before: ({ payload, abort }) => {
          abort()
          return payload
        },
        success: ({ payload }) => {
          t.fail()
          return payload
        },
        error: ({ payload }) => {
          t.fail()
          return payload
        },
      },
      remote: {
        before: ({ payload }) => {
          t.fail()
          return payload
        },
      },
    },
  })
  // @ts-ignore
  t.deepEqual(result, insertPayload)
})

test('can abort in success events', async t => {
  const insertPayload = { name: 'luca' }
  let ranAllEvents = []
  const result = await usersModule.insert(insertPayload, {
    on: {
      local: {
        before: ({ payload }) => {
          ranAllEvents.push(1)
          return payload
        },
        success: ({ payload, abort }) => {
          ranAllEvents.push(1)
          abort()
          return payload
        },
      },
      remote: {
        before: ({ payload }) => {
          t.fail()
          return payload
        },
      },
    },
  })
  // @ts-ignore
  t.deepEqual(result, insertPayload)
  t.is(ranAllEvents.length, 2)
})

test('can mutate payload via events', async t => {
  const insertPayload = { name: 'luca' }
  const result = await usersModule.insert(insertPayload, {
    on: {
      local: {
        before: ({ payload }) => {
          // @ts-ignore
          t.deepEqual(payload, { name: 'luca' })
          return { ...payload, age: 0 }
        },
        success: ({ payload }) => {
          // @ts-ignore
          t.deepEqual(payload, { name: 'luca', age: 0 })
          return { ...payload, lastName: 'ban' }
        },
      },
      remote: {
        before: ({ payload }) => {
          // @ts-ignore
          t.deepEqual(payload, { name: 'luca', age: 0, lastName: 'ban' })
          return { ...payload, power: 'flight' }
        },
        success: ({ payload }) => {
          // @ts-ignore
          t.deepEqual(payload, { name: 'luca', age: 0, lastName: 'ban', power: 'flight' })
          return { ...payload, strength: 9000 }
        },
      },
    },
  })
  // @ts-ignore
  t.deepEqual(result, { name: 'luca', age: 0, lastName: 'ban', power: 'flight', strength: 9000 })
})
