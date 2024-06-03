import { pokedex, pokedexEntryDefaults } from '@magnetarjs/test-utils'
import type { FetchResponse } from '@magnetarjs/types'
import { assert, test } from 'vitest'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance.js'

test('write + onError: stop -- emits fail events & aborts execution by default', async () => {
  const { pokedexModule } = createMagnetarInstance()
  const insertPayload = {
    ...pokedexEntryDefaults({ name: 'this should fail' }),
    shouldFail: 'cache',
  }
  try {
    await pokedexModule.doc('testid').insert(insertPayload, {
      onError: 'stop',
      on: {
        error: ({ payload, storeName }) => {
          if (storeName === 'cache') {
            assert.deepEqual(payload, insertPayload)
          }
        },
        before: ({ storeName }) => {
          if (storeName === 'remote') assert.fail()
        },
      },
    })
  } catch (error) {
    assert.deepEqual(error, { message: 'failed', payload: insertPayload })
  }
  assert.deepEqual(pokedexModule.data.get('testid'), undefined)
})

test('write + onError: stop -- fail in second store plugin does not prevent execution first store plugin', async () => {
  const { pokedexModule } = createMagnetarInstance()
  const insertPayload = {
    ...pokedexEntryDefaults({ name: 'this should fail' }),
    shouldFail: 'remote',
  }
  try {
    await pokedexModule.doc('testid').insert(insertPayload, {
      onError: 'stop',
      on: {
        error: ({ payload, storeName }) => {
          if (storeName === 'cache') assert.fail()
          if (storeName === 'remote') {
            assert.deepEqual(payload, insertPayload)
          }
        },
      },
    })
  } catch (error) {
    assert.deepEqual(error, { message: 'failed', payload: insertPayload })
  }
  assert.deepEqual(pokedexModule.data.get('testid'), insertPayload)
})

test('write + onError: continue', async () => {
  const { pokedexModule } = createMagnetarInstance()
  const insertPayload = {
    ...pokedexEntryDefaults({ name: 'this should fail' }),
    shouldFail: 'cache',
  }
  try {
    await pokedexModule.doc('testid').insert(insertPayload, {
      onError: 'continue',
      on: {
        error: ({ payload, storeName }) => {
          if (storeName === 'cache') {
            assert.deepEqual(payload, insertPayload)
          }
          if (storeName === 'remote') assert.fail()
        },
        success: ({ payload, storeName }) => {
          if (storeName === 'remote') {
            assert.deepEqual(payload, insertPayload)
          }
        },
      },
    })
  } catch (error) {
    assert.fail(JSON.stringify(error))
  }
  assert.deepEqual(pokedexModule.data.get('testid'), undefined)
})

test('write + onError: revert', async () => {
  const { pokedexModule } = createMagnetarInstance()
  const insertPayload = {
    ...pokedexEntryDefaults({ name: 'this should fail' }),
    shouldFail: 'remote',
  }
  try {
    await pokedexModule.doc('testid').insert(insertPayload, {
      onError: 'revert',
      on: {
        revert: ({ payload, result, actionName, storeName }) => {
          if (storeName === 'cache') {
            assert.deepEqual(actionName, 'insert')
          }
        },
        before: ({ storeName }) => {
          if (storeName === 'remote')
            assert.deepEqual(pokedexModule.data.get('testid'), insertPayload)
        },
        error: ({ payload, storeName }) => {
          if (storeName === 'cache') assert.fail()
          if (storeName === 'remote') {
            assert.deepEqual(payload, insertPayload)
          }
        },
      },
    })
  } catch (error) {
    assert.isTrue(!!error)
  }
  assert.deepEqual(pokedexModule.data.get('testid'), undefined)
})

test('write + onError: revert - will not go to next store', async () => {
  const { pokedexModule } = createMagnetarInstance()
  const insertPayload = {
    ...pokedexEntryDefaults({ name: 'this should fail' }),
    shouldFail: 'cache',
  }
  try {
    await pokedexModule.doc('testid').insert(insertPayload, {
      onError: 'revert',
      on: {
        error: ({ payload, storeName }) => {
          if (storeName === 'cache') {
            assert.deepEqual(payload, insertPayload)
          }
        },
        revert: ({ storeName }) => {
          if (storeName === 'cache') assert.fail()
        },
        before: ({ payload, storeName }) => {
          if (storeName === 'remote') {
            assert.fail()
          }
        },
      },
    })
  } catch (error) {
    assert.isTrue(!!error)
  }
  assert.deepEqual(pokedexModule.data.get('testid'), undefined)
})

test('fetch + onError: stop -- emits fail events & aborts execution by default', async () => {
  const { pokedexModule } = createMagnetarInstance()
  const fetchPayload = { shouldFail: 'cache', force: true }
  assert.deepEqual(pokedexModule.data.get('1'), pokedex(1))
  try {
    await pokedexModule.fetch(fetchPayload, {
      onError: 'stop',
      on: {
        error: ({ payload, storeName }) => {
          if (storeName === 'cache') {
            assert.deepEqual(payload, fetchPayload)
          }
        },
        before: ({ storeName }) => {
          if (storeName === 'remote') assert.fail()
        },
      },
    })
  } catch (error) {
    assert.deepEqual(error, { message: 'failed', payload: fetchPayload })
  }
  assert.deepEqual(pokedexModule.data.get('1'), pokedex(1))
})

test('fetch + onError: stop -- fail in second store plugin does not prevent execution first store plugin', async () => {
  const { pokedexModule } = createMagnetarInstance()
  const fetchPayload = { shouldFail: 'remote', force: true }
  assert.deepEqual(pokedexModule.data.get('1'), pokedex(1))
  let result: any
  try {
    result = await pokedexModule.fetch(fetchPayload, {
      onError: 'stop',
      on: {
        error: ({ payload, storeName }) => {
          if (storeName === 'cache') assert.fail()
          if (storeName === 'remote') {
            assert.deepEqual(payload, fetchPayload)
          }
        },
      },
    })
  } catch (error) {
    assert.deepEqual(error, { message: 'failed', payload: fetchPayload })
  }
  assert.deepEqual(result, undefined)
  assert.deepEqual(pokedexModule.data.get('1'), pokedex(1))
})

test('fetch + onError: continue', async () => {
  const { pokedexModule } = createMagnetarInstance()
  const fetchPayload = { shouldFail: 'cache', force: true }
  assert.deepEqual(pokedexModule.data.get('1'), pokedex(1))
  try {
    const result = await pokedexModule.fetch(fetchPayload, {
      onError: 'continue',
      on: {
        error: ({ payload, storeName }) => {
          if (storeName === 'cache') {
            assert.deepEqual(payload, fetchPayload)
          }
          if (storeName === 'remote') assert.fail()
        },
        success: ({ payload, result, storeName }) => {
          if (storeName === 'remote') {
            assert.deepEqual(payload, fetchPayload)
            // even though the cache store failed, we got the result of the remote store
            assert.deepEqual((result as FetchResponse).docs.length, 151)
          }
        },
      },
    })
    assert.deepEqual(result.get('1'), pokedex(1))
    assert.deepEqual(result.get('136'), pokedex(136)) // the remote store result is returned no matter what
  } catch (error) {
    assert.fail(JSON.stringify(error))
  }
  // the cache store didn't succeed in applying its 'inserted' event, so its cached data will be empty:
  assert.deepEqual(pokedexModule.data.get('1'), pokedex(1))
  assert.deepEqual(pokedexModule.data.get('136'), undefined)
})
