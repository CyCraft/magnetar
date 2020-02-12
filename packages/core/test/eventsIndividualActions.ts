import test from 'ava'
import { VueSync } from '../src/index'
import { VueSyncGenericPlugin } from './helpers/pluginMock'

const local = VueSyncGenericPlugin({})
const remote = VueSyncGenericPlugin({})
const vueSync = VueSync({
  stores: { local, remote },
  executionOrder: {
    read: ['remote', 'local'],
    write: ['local', 'remote'],
  },
})
const usersModule = vueSync.createModule({
  type: 'collection',
  storeConfig: {
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
        before: ({ payload, abort }) => {
          // @ts-ignore
          t.deepEqual(payload, insertPayload)
          ranAllEvents.push(1)
          return payload
        },
        success: ({ payload, abort }) => {
          // @ts-ignore
          t.deepEqual(payload, insertPayload)
          ranAllEvents.push(1)
          return payload
        },
      },
      remote: {
        before: ({ payload, abort }) => {
          // @ts-ignore
          t.deepEqual(payload, insertPayload)
          ranAllEvents.push(1)
          return payload
        },
        success: ({ payload, abort }) => {
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

test('emits fail events', async t => {
  const insertPayload = { name: 'luca', shouldFail: true }
  let ranAllEvents = []
  const result = await usersModule.insert(insertPayload, {
    on: {
      local: {
        error: ({ payload, abort }) => {
          // @ts-ignore
          t.deepEqual(payload, insertPayload)
          ranAllEvents.push(1)
          return payload
        },
      },
      remote: {
        before: ({ payload, abort }) => {
          t.fail()
          return payload
        },
      },
    },
  })
  // @ts-ignore
  t.deepEqual(result, insertPayload)
  t.is(ranAllEvents.length, 1)
})

test('can abort in before events', async t => {
  const insertPayload = { name: 'luca', shouldFail: true }
  let ranAllEvents = []
  const result = await usersModule.insert(insertPayload, {
    on: {
      local: {
        before: ({ payload, abort }) => {
          abort()
          ranAllEvents.push(1)
          return payload
        },
        aborted: ({ payload, at }) => {
          t.is(at, 'before')
          return payload
        },
        success: ({ payload, abort }) => {
          t.fail()
          return payload
        },
        error: ({ payload, abort }) => {
          t.fail()
          return payload
        },
      },
      remote: {
        before: ({ payload, abort }) => {
          t.fail()
          return payload
        },
      },
    },
  })
  // @ts-ignore
  t.deepEqual(result, insertPayload)
  t.is(ranAllEvents.length, 1)
})

test('can abort in success events', async t => {
  const insertPayload = { name: 'luca' }
  let ranAllEvents = []
  const result = await usersModule.insert(insertPayload, {
    on: {
      local: {
        before: ({ payload, abort }) => {
          ranAllEvents.push(1)
          return payload
        },
        success: ({ payload, abort }) => {
          ranAllEvents.push(1)
          abort()
          return payload
        },
        aborted: ({ payload, at }) => {
          t.is(at, 'success')
          return payload
        },
      },
      remote: {
        before: ({ payload, abort }) => {
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
        before: ({ payload, abort }) => {
          // @ts-ignore
          t.deepEqual(payload, { name: 'luca' })
          return { ...payload, age: 0 }
        },
        success: ({ payload, abort }) => {
          // @ts-ignore
          t.deepEqual(payload, { name: 'luca', age: 0 })
          return { ...payload, lastName: 'ban' }
        },
      },
      remote: {
        before: ({ payload, abort }) => {
          // @ts-ignore
          t.deepEqual(payload, { name: 'luca', age: 0, lastName: 'ban' })
          return { ...payload, power: 'flight' }
        },
        success: ({ payload, abort }) => {
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
