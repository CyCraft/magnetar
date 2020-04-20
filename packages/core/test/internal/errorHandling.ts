import test from 'ava'
import { createVueSyncInstance } from '../helpers/createVueSyncInstance'
import { pokedex, pokedexEntryDefaults } from '../helpers/pokemon'

test('write + onError: stop -- emits fail events & aborts execution by default', async t => {
  const { pokedexModule } = createVueSyncInstance()
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
  } catch (e) {
    t.deepEqual(e, { message: 'failed', payload: insertPayload })
  }
  t.is(pokedexModule.data.get('testid'), undefined)
})

test('write + onError: stop -- fail in second store plugin does not prevent execution first store plugin', async t => {
  const { pokedexModule } = createVueSyncInstance()
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
  } catch (e) {
    t.deepEqual(e, { message: 'failed', payload: insertPayload })
  }
  t.deepEqual(pokedexModule.data.get('testid'), insertPayload)
})

test('write + onError: continue', async t => {
  const { pokedexModule } = createVueSyncInstance()
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
  } catch (e) {
    t.fail()
  }
  t.is(pokedexModule.data.get('testid'), undefined)
})

test('write + onError: revert', async t => {
  const { pokedexModule } = createVueSyncInstance()
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
  } catch (e) {
    console.error(e)
    t.fail(e)
  }
  t.is(pokedexModule.data.get('testid'), undefined)
})

test('write + onError: revert - will not go to next store', async t => {
  const { pokedexModule } = createVueSyncInstance()
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
  } catch (e) {
    t.fail()
  }
  t.is(pokedexModule.data.get('testid'), undefined)
})

test('get + onError: stop -- emits fail events & aborts execution by default', async t => {
  const { pokedexModule } = createVueSyncInstance()
  const getPayload = { shouldFail: 'local' }
  t.deepEqual(pokedexModule.data.get('1'), pokedex(1))
  try {
    await pokedexModule.get(getPayload, {
      onError: 'stop',
      on: {
        error: ({ payload, storeName }) => {
          if (storeName === 'local') {
            t.deepEqual(payload, getPayload)
          }
        },
        before: ({ storeName }) => {
          if (storeName === 'remote') t.fail()
        },
      },
    })
  } catch (e) {
    t.deepEqual(e, { message: 'failed', payload: getPayload })
  }
  t.deepEqual(pokedexModule.data.get('1'), pokedex(1))
})

test('get + onError: stop -- fail in second store plugin does not prevent execution first store plugin', async t => {
  const { pokedexModule } = createVueSyncInstance()
  const getPayload = { shouldFail: 'remote' }
  t.deepEqual(pokedexModule.data.get('1'), pokedex(1))
  let result: any
  try {
    result = await pokedexModule.get(getPayload, {
      onError: 'stop',
      on: {
        error: ({ payload, storeName }) => {
          if (storeName === 'local') t.fail()
          if (storeName === 'remote') {
            t.deepEqual(payload, getPayload)
          }
        },
      },
    })
  } catch (e) {
    t.deepEqual(e, { message: 'failed', payload: getPayload })
  }
  t.deepEqual(result, undefined)
  t.deepEqual(pokedexModule.data.get('1'), pokedex(1))
})

test('get + onError: continue', async t => {
  const { pokedexModule } = createVueSyncInstance()
  const getPayload = { shouldFail: 'local' }
  t.deepEqual(pokedexModule.data.get('1'), pokedex(1))
  try {
    const result = await pokedexModule.get(getPayload, {
      onError: 'continue',
      on: {
        error: ({ payload, storeName }) => {
          if (storeName === 'local') {
            t.deepEqual(payload, getPayload)
          }
          if (storeName === 'remote') t.fail()
        },
        success: ({ payload, result, storeName }) => {
          if (storeName === 'remote') {
            t.deepEqual(payload, getPayload)
            // even though the local store failed, we got the result of the remote store
            t.deepEqual(
              (result as any).docs.map(d => d.id),
              [1, 136]
            )
          }
        },
      },
    })
    t.deepEqual(result.data.get('1'), pokedex(1))
    t.deepEqual(result.data.get('136'), undefined)
  } catch (e) {
    t.fail()
  }
  // the local store didn't succeed in applying its 'inserted' event, so its local data will be empty:
  t.deepEqual(pokedexModule.data.get('1'), pokedex(1))
  t.deepEqual(pokedexModule.data.get('136'), undefined)
})
