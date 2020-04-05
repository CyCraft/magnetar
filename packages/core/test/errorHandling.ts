import test from 'ava'
import { createVueSyncInstance } from './helpers/createVueSyncInstance'
import { bulbasaur, charmander, flareon } from './helpers/pokemon'

test('write + onError: abort (default) -- emits fail events & aborts execution by default', async t => {
  const { pokedexModule } = createVueSyncInstance()
  const insertPayload = { id: 'testid', name: 'this should fail', shouldFail: 'local' }
  try {
    await pokedexModule.insert(insertPayload, {
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
    t.deepEqual(e, { message: 'fail', payload: insertPayload })
  }
  t.is(pokedexModule.data['testid'], undefined)
})

test('write + onError: abort (default) -- fail in second store plugin does not prevent execution first store plugin', async t => {
  const { pokedexModule } = createVueSyncInstance()
  const insertPayload = { id: 'testid', name: 'this should fail', shouldFail: 'remote' }
  try {
    await pokedexModule.insert(insertPayload, {
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
    t.deepEqual(e, { message: 'fail', payload: insertPayload })
  }
  t.deepEqual(pokedexModule.data['testid'], insertPayload)
})

test('write + onError: continue', async t => {
  const { pokedexModule } = createVueSyncInstance()
  const insertPayload = { id: 'testid', name: 'this should fail', shouldFail: 'local' }
  try {
    await pokedexModule.insert(insertPayload, {
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
  t.is(pokedexModule.data['testid'], undefined)
})

test('write + onError: revert', async t => {
  const { pokedexModule } = createVueSyncInstance()
  const insertPayload = { id: 'testid', name: 'this should fail', shouldFail: 'remote' }
  try {
    const result = await pokedexModule.insert(insertPayload, {
      onError: 'revert',
      on: {
        revert: ({ payload, result, actionName, storeName }) => {
          if (storeName === 'local') {
            t.is(actionName, 'insert')
          }
        },
        before: ({ storeName }) => {
          if (storeName === 'remote') t.deepEqual(pokedexModule.data['testid'], insertPayload)
        },
        error: ({ payload, storeName }) => {
          if (storeName === 'local') t.fail()
          if (storeName === 'remote') {
            t.deepEqual(payload, insertPayload)
          }
        },
      },
    })
    t.deepEqual(result, insertPayload)
  } catch (e) {
    t.fail()
  }
  t.is(pokedexModule.data['testid'], undefined)
})

test('write + onError: revert - will not go to next store', async t => {
  const { pokedexModule } = createVueSyncInstance()
  const insertPayload = { id: 'testid', name: 'this should fail', shouldFail: 'local' }
  try {
    const result = await pokedexModule.insert(insertPayload, {
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
    t.deepEqual(result, insertPayload)
  } catch (e) {
    t.fail()
  }
  t.is(pokedexModule.data['testid'], undefined)
})

test('get + onError: abort (default) -- emits fail events & aborts execution by default', async t => {
  const { pokedexModule } = createVueSyncInstance()
  const getPayload = { shouldFail: 'local' }
  t.deepEqual(pokedexModule.data, { '001': bulbasaur })
  try {
    await pokedexModule.get(getPayload, {
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
    t.deepEqual(e, { message: 'fail', payload: getPayload })
  }
  t.deepEqual(pokedexModule.data, { '001': bulbasaur })
})

test('get + onError: abort (default) -- fail in second store plugin does not prevent execution first store plugin', async t => {
  const { pokedexModule } = createVueSyncInstance()
  const getPayload = { shouldFail: 'remote' }
  t.deepEqual(pokedexModule.data, { '001': bulbasaur })
  let result: any
  try {
    result = await pokedexModule.get(getPayload, {
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
    t.deepEqual(e, { message: 'fail', payload: getPayload })
  }
  t.deepEqual(result, undefined)
  t.deepEqual(pokedexModule.data, { '001': bulbasaur })
})

test('get + onError: continue', async t => {
  const { pokedexModule } = createVueSyncInstance()
  const getPayload = { shouldFail: 'local' }
  t.deepEqual(pokedexModule.data, { '001': bulbasaur })
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
            t.deepEqual(result, [bulbasaur, flareon])
          }
        },
      },
    })
    // even though the local store failed, we got the result of the remote store
    t.deepEqual(result, [bulbasaur, flareon])
  } catch (e) {
    t.fail()
  }
  // the local store didn't succeed in applying its 'inserted' event, so its local data will be empty:
  t.deepEqual(pokedexModule.data, { '001': bulbasaur })
})

test('get + onError: revert', async t => {
  const { pokedexModule } = createVueSyncInstance()
  const getPayload = { shouldFail: 'remote' }
  t.deepEqual(pokedexModule.data, { '001': bulbasaur })
  try {
    const result = await pokedexModule.get(getPayload, {
      onError: 'revert',
      on: {
        revert: ({ payload, result, actionName, storeName }) => {
          if (storeName === 'local') {
            t.is(actionName, 'get')
          }
        },
        before: ({ storeName }) => {
          if (storeName === 'remote') t.deepEqual(pokedexModule.data, { '001': bulbasaur })
        },
        error: ({ payload, storeName }) => {
          if (storeName === 'local') t.fail()
          if (storeName === 'remote') {
            t.deepEqual(payload, getPayload)
          }
        },
      },
    })
    t.deepEqual(result, undefined)
  } catch (e) {
    t.fail()
  }
  t.deepEqual(pokedexModule.data, { '001': bulbasaur })
})

test('get + onError: revert - will not go to next store', async t => {
  const { pokedexModule } = createVueSyncInstance()
  const getPayload = { shouldFail: 'local' }
  t.deepEqual(pokedexModule.data, { '001': bulbasaur })
  try {
    const result = await pokedexModule.get(getPayload, {
      onError: 'revert',
      on: {
        error: ({ payload, storeName }) => {
          if (storeName === 'local') {
            t.deepEqual(payload, getPayload)
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
    t.deepEqual(result, undefined)
  } catch (e) {
    t.fail()
  }
  t.deepEqual(pokedexModule.data, { '001': bulbasaur })
})
