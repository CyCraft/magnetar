import test from 'ava'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance'
import { pokedex, pokedexEntryDefaults } from '@magnetarjs/test-utils'
import { FetchResponse } from '../../src'

test('write + onError: stop -- emits fail events & aborts execution by default', async (t) => {
  const { pokedexModule } = createMagnetarInstance()
  const insertPayload = pokedexEntryDefaults({ name: 'this should fail', shouldFail: 'local' })
  try {
    await pokedexModule.doc('testid').insert(insertPayload, {
      onError: 'stop',
      on: {
        error: ({ payload, storeName }) => {
          if (storeName === 'local') {
            t.deepEqual(payload, insertPayload)
          }
        },
        before: ({ storeName }) => {
          if (storeName === 'remote') t.fail()
        },
      },
    })
  } catch (error) {
    t.deepEqual(error, { message: 'failed', payload: insertPayload })
  }
  t.is(pokedexModule.data.get('testid'), undefined)
})

test('write + onError: stop -- fail in second store plugin does not prevent execution first store plugin', async (t) => {
  const { pokedexModule } = createMagnetarInstance()
  const insertPayload = pokedexEntryDefaults({ name: 'this should fail', shouldFail: 'remote' })
  try {
    await pokedexModule.doc('testid').insert(insertPayload, {
      onError: 'stop',
      on: {
        error: ({ payload, storeName }) => {
          if (storeName === 'local') t.fail()
          if (storeName === 'remote') {
            t.deepEqual(payload, insertPayload)
          }
        },
      },
    })
  } catch (error) {
    t.deepEqual(error, { message: 'failed', payload: insertPayload })
  }
  t.deepEqual(pokedexModule.data.get('testid'), insertPayload)
})

test('write + onError: continue', async (t) => {
  const { pokedexModule } = createMagnetarInstance()
  const insertPayload = pokedexEntryDefaults({ name: 'this should fail', shouldFail: 'local' })
  try {
    await pokedexModule.doc('testid').insert(insertPayload, {
      onError: 'continue',
      on: {
        error: ({ payload, storeName }) => {
          if (storeName === 'local') {
            t.deepEqual(payload, insertPayload)
          }
          if (storeName === 'remote') t.fail()
        },
        success: ({ payload, storeName }) => {
          if (storeName === 'remote') {
            t.deepEqual(payload, insertPayload)
          }
        },
      },
    })
  } catch (error) {
    t.fail(error)
  }
  t.is(pokedexModule.data.get('testid'), undefined)
})

test('write + onError: revert', async (t) => {
  const { pokedexModule } = createMagnetarInstance()
  const insertPayload = pokedexEntryDefaults({ name: 'this should fail', shouldFail: 'remote' })
  try {
    await pokedexModule.doc('testid').insert(insertPayload, {
      onError: 'revert',
      on: {
        revert: ({ payload, result, actionName, storeName }) => {
          if (storeName === 'local') {
            t.is(actionName, 'insert')
          }
        },
        before: ({ storeName }) => {
          if (storeName === 'remote') t.deepEqual(pokedexModule.data.get('testid'), insertPayload)
        },
        error: ({ payload, storeName }) => {
          if (storeName === 'local') t.fail()
          if (storeName === 'remote') {
            t.deepEqual(payload, insertPayload)
          }
        },
      },
    })
  } catch (error) {
    t.truthy(error)
  }
  t.is(pokedexModule.data.get('testid'), undefined)
})

test('write + onError: revert - will not go to next store', async (t) => {
  const { pokedexModule } = createMagnetarInstance()
  const insertPayload = pokedexEntryDefaults({ name: 'this should fail', shouldFail: 'local' })
  try {
    await pokedexModule.doc('testid').insert(insertPayload, {
      onError: 'revert',
      on: {
        error: ({ payload, storeName }) => {
          if (storeName === 'local') {
            t.deepEqual(payload, insertPayload)
          }
        },
        revert: ({ storeName }) => {
          if (storeName === 'local') t.fail()
        },
        before: ({ payload, storeName }) => {
          if (storeName === 'remote') {
            t.fail()
          }
        },
      },
    })
  } catch (error) {
    t.truthy(error)
  }
  t.is(pokedexModule.data.get('testid'), undefined)
})

test('fetch + onError: stop -- emits fail events & aborts execution by default', async (t) => {
  const { pokedexModule } = createMagnetarInstance()
  const fetchPayload = { shouldFail: 'local', force: true }
  t.deepEqual(pokedexModule.data.get('1'), pokedex(1))
  try {
    await pokedexModule.fetch(fetchPayload, {
      onError: 'stop',
      on: {
        error: ({ payload, storeName }) => {
          if (storeName === 'local') {
            t.deepEqual(payload, fetchPayload)
          }
        },
        before: ({ storeName }) => {
          if (storeName === 'remote') t.fail()
        },
      },
    })
  } catch (error) {
    t.deepEqual(error, { message: 'failed', payload: fetchPayload })
  }
  t.deepEqual(pokedexModule.data.get('1'), pokedex(1))
})

test('fetch + onError: stop -- fail in second store plugin does not prevent execution first store plugin', async (t) => {
  const { pokedexModule } = createMagnetarInstance()
  const fetchPayload = { shouldFail: 'remote', force: true }
  t.deepEqual(pokedexModule.data.get('1'), pokedex(1))
  let result: any
  try {
    result = await pokedexModule.fetch(fetchPayload, {
      onError: 'stop',
      on: {
        error: ({ payload, storeName }) => {
          if (storeName === 'local') t.fail()
          if (storeName === 'remote') {
            t.deepEqual(payload, fetchPayload)
          }
        },
      },
    })
  } catch (error) {
    t.deepEqual(error, { message: 'failed', payload: fetchPayload })
  }
  t.deepEqual(result, undefined)
  t.deepEqual(pokedexModule.data.get('1'), pokedex(1))
})

test('fetch + onError: continue', async (t) => {
  const { pokedexModule } = createMagnetarInstance()
  const fetchPayload = { shouldFail: 'local', force: true }
  t.deepEqual(pokedexModule.data.get('1'), pokedex(1))
  try {
    const result = await pokedexModule.fetch(fetchPayload, {
      onError: 'continue',
      on: {
        error: ({ payload, storeName }) => {
          if (storeName === 'local') {
            t.deepEqual(payload, fetchPayload)
          }
          if (storeName === 'remote') t.fail()
        },
        success: ({ payload, result, storeName }) => {
          if (storeName === 'remote') {
            t.deepEqual(payload, fetchPayload)
            // even though the local store failed, we got the result of the remote store
            t.deepEqual((result as FetchResponse).docs.length, 151)
          }
        },
      },
    })
    t.deepEqual(result.get('1'), pokedex(1))
    t.deepEqual(result.get('136'), undefined)
  } catch (error) {
    t.fail(error)
  }
  // the local store didn't succeed in applying its 'inserted' event, so its local data will be empty:
  t.deepEqual(pokedexModule.data.get('1'), pokedex(1))
  t.deepEqual(pokedexModule.data.get('136'), undefined)
})
