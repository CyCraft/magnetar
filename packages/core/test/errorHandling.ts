import test from 'ava'
import { createVueSyncInstance } from './helpers/createVueSyncInstance'
import { bulbasaur, charmander, flareon } from './helpers/pokemon'

test('write + onError: abort (default) -- emits fail events & aborts execution by default', async t => {
  const { pokedexModule } = createVueSyncInstance()
  const insertPayload = { id: 'testid', name: 'this should fail', shouldFail: 'local' }
  try {
    await pokedexModule.insert(insertPayload, {
      on: {
        local: {
          error: ({ payload }) => {
            // @ts-ignore
            t.deepEqual(payload, insertPayload)
          },
        },
        remote: {
          before: () => { t.fail() } // prettier-ignore
        },
      },
    })
  } catch (e) {
    t.deepEqual(e, { message: 'fail', payload: insertPayload })
  }
  t.is(pokedexModule.data.local['testid'], undefined)
})

test('write + onError: abort (default) -- fail in second store plugin does not prevent execution first store plugin', async t => {
  const { pokedexModule } = createVueSyncInstance()
  const insertPayload = { id: 'testid', name: 'this should fail', shouldFail: 'remote' }
  try {
    await pokedexModule.insert(insertPayload, {
      on: {
        local: {
          error: () => { t.fail() } // prettier-ignore
        },
        remote: {
          error: ({ payload }) => {
            // @ts-ignore
            t.deepEqual(payload, insertPayload)
          },
        },
      },
    })
  } catch (e) {
    t.deepEqual(e, { message: 'fail', payload: insertPayload })
  }
  t.deepEqual(pokedexModule.data.local['testid'], insertPayload)
})

test('write + onError: continue', async t => {
  const { pokedexModule } = createVueSyncInstance()
  const insertPayload = { id: 'testid', name: 'this should fail', shouldFail: 'local' }
  try {
    await pokedexModule.insert(insertPayload, {
      onError: 'continue',
      on: {
        local: {
          error: ({ payload }) => {
            // @ts-ignore
            t.deepEqual(payload, insertPayload)
          },
        },
        remote: {
          error: () => { t.fail() }, // prettier-ignore
          success: ({ payload }) => {
            // @ts-ignore
            t.deepEqual(payload, insertPayload)
          },
        },
      },
    })
  } catch (e) {
    t.fail()
  }
  t.is(pokedexModule.data.local['testid'], undefined)
})

test('write + onError: revert', async t => {
  const { pokedexModule } = createVueSyncInstance()
  const insertPayload = { id: 'testid', name: 'this should fail', shouldFail: 'remote' }
  try {
    const result = await pokedexModule.insert(insertPayload, {
      onError: 'revert',
      on: {
        local: {
          error: () => { t.fail() }, // prettier-ignore
          success: () => {},
          revert: ({ payload, result, actionName }) => {
            t.is(actionName, 'insert')
          },
        },
        remote: {
          before: () => {
            t.deepEqual(pokedexModule.data.local['testid'], insertPayload)
          },
          error: ({ payload }) => {
            // @ts-ignore
            t.deepEqual(payload, insertPayload)
          },
        },
      },
    })
    // @ts-ignore
    t.deepEqual(result, insertPayload)
  } catch (e) {
    t.fail()
  }
  t.is(pokedexModule.data.local['testid'], undefined)
})

test('write + onError: revert - will not go to next store', async t => {
  const { pokedexModule } = createVueSyncInstance()
  const insertPayload = { id: 'testid', name: 'this should fail', shouldFail: 'local' }
  try {
    const result = await pokedexModule.insert(insertPayload, {
      onError: 'revert',
      on: {
        local: {
          error: ({ payload }) => {
            // @ts-ignore
            t.deepEqual(payload, insertPayload)
          },
          revert: () => { t.fail() } // prettier-ignore
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
  } catch (e) {
    t.fail()
  }
  t.is(pokedexModule.data.local['testid'], undefined)
})

test('get + onError: abort (default) -- emits fail events & aborts execution by default', async t => {
  const { pokedexModule } = createVueSyncInstance()
  const getPayload = { shouldFail: 'local' }
  t.deepEqual(pokedexModule.data.local, { '001': bulbasaur })
  try {
    await pokedexModule.get(getPayload, {
      on: {
        local: {
          error: ({ payload }) => {
            // @ts-ignore
            t.deepEqual(payload, getPayload)
          },
        },
        remote: {
          before: () => { t.fail() } // prettier-ignore
        },
      },
    })
  } catch (e) {
    t.deepEqual(e, { message: 'fail', payload: getPayload })
  }
  t.deepEqual(pokedexModule.data.local, { '001': bulbasaur })
})

test('get + onError: abort (default) -- fail in second store plugin does not prevent execution first store plugin', async t => {
  const { pokedexModule } = createVueSyncInstance()
  const getPayload = { shouldFail: 'remote' }
  t.deepEqual(pokedexModule.data.local, { '001': bulbasaur })
  let result: any
  try {
    result = await pokedexModule.get(getPayload, {
      on: {
        local: {
          error: () => { t.fail() } // prettier-ignore
        },
        remote: {
          error: ({ payload }) => {
            // @ts-ignore
            t.deepEqual(payload, getPayload)
          },
        },
      },
    })
  } catch (e) {
    t.deepEqual(e, { message: 'fail', payload: getPayload })
  }
  t.deepEqual(result, undefined)
  t.deepEqual(pokedexModule.data.local, { '001': bulbasaur })
})

test('get + onError: continue', async t => {
  const { pokedexModule } = createVueSyncInstance()
  const getPayload = { shouldFail: 'local' }
  t.deepEqual(pokedexModule.data.local, { '001': bulbasaur })
  try {
    const result = await pokedexModule.get(getPayload, {
      onError: 'continue',
      on: {
        local: {
          error: ({ payload }) => {
            // @ts-ignore
            t.deepEqual(payload, getPayload)
          },
        },
        remote: {
          error: () => { t.fail() }, // prettier-ignore
          success: ({ payload, result }) => {
            // @ts-ignore
            t.deepEqual(payload, getPayload)
            // even though the local store failed, we got the result of the remote store
            t.deepEqual(result, [bulbasaur, flareon])
          },
        },
      },
    })
    // even though the local store failed, we got the result of the remote store
    t.deepEqual(result, [bulbasaur, flareon])
  } catch (e) {
    t.fail()
  }
  // the local store didn't succeed in applying its 'inserted' event, so its local data will be empty:
  t.deepEqual(pokedexModule.data.local, { '001': bulbasaur })
})

test('get + onError: revert', async t => {
  const { pokedexModule } = createVueSyncInstance()
  const getPayload = { shouldFail: 'remote' }
  t.deepEqual(pokedexModule.data.local, { '001': bulbasaur })
  try {
    const result = await pokedexModule.get(getPayload, {
      onError: 'revert',
      on: {
        local: {
          error: () => { t.fail() }, // prettier-ignore
          success: () => {},
          revert: ({ payload, result, actionName }) => {
            t.is(actionName, 'get')
          },
        },
        remote: {
          before: () => {
            t.deepEqual(pokedexModule.data.local, { '001': bulbasaur })
          },
          error: ({ payload }) => {
            // @ts-ignore
            t.deepEqual(payload, getPayload)
          },
        },
      },
    })
    // @ts-ignore
    t.deepEqual(result, undefined)
  } catch (e) {
    t.fail()
  }
  t.deepEqual(pokedexModule.data.local, { '001': bulbasaur })
})

test('get + onError: revert - will not go to next store', async t => {
  const { pokedexModule } = createVueSyncInstance()
  const getPayload = { shouldFail: 'local' }
  t.deepEqual(pokedexModule.data.local, { '001': bulbasaur })
  try {
    const result = await pokedexModule.get(getPayload, {
      onError: 'revert',
      on: {
        local: {
          error: ({ payload }) => {
            // @ts-ignore
            t.deepEqual(payload, getPayload)
          },
          revert: () => { t.fail() } // prettier-ignore
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
    t.deepEqual(result, undefined)
  } catch (e) {
    t.fail()
  }
  t.deepEqual(pokedexModule.data.local, { '001': bulbasaur })
})
