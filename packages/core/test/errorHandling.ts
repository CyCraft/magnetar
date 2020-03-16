import test from 'ava'
import { createVueSyncInstance } from './helpers/createVueSyncInstance'
import { bulbasaur, charmander } from './helpers/pokemon'

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
            return payload
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
  t.is(pokedexModule.data.remote['testid'], undefined)
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
  t.is(pokedexModule.data.remote['testid'], undefined)
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
            return payload
          },
        },
        remote: {
          error: () => { t.fail() }, // prettier-ignore
          success: ({ payload }) => {
            // @ts-ignore
            t.deepEqual(payload, insertPayload)
            return payload
          },
        },
      },
    })
  } catch (e) {
    t.fail()
  }
  t.is(pokedexModule.data.local['testid'], undefined)
  t.deepEqual(pokedexModule.data.remote['testid'], insertPayload)
})

test('write + onError: revert', async t => {
  const { pokedexModule } = createVueSyncInstance()
  const insertPayload = { id: 'testid', name: 'this should fail', shouldFail: 'remote' }
  const revertedPayload = {
    ...insertPayload,
    reverted: { actionName: 'insert', storeName: 'local' },
  }
  try {
    const result = await pokedexModule.insert(insertPayload, {
      onError: 'revert',
      on: {
        local: {
          error: () => { t.fail() }, // prettier-ignore
          success: () => {},
          revert: ({ payload, result, actionName }) => {
            t.is(actionName, 'insert')
            // @ts-ignore
            t.deepEqual(result, revertedPayload)
          },
        },
        remote: {
          before: () => {
            t.deepEqual(pokedexModule.data.local['testid'], insertPayload)
          },
          error: ({ payload }) => {
            // @ts-ignore
            t.deepEqual(payload, insertPayload)
            return payload
          },
        },
      },
    })
    // @ts-ignore
    t.deepEqual(result, revertedPayload)
  } catch (e) {
    t.fail()
  }
  t.is(pokedexModule.data.local['testid'], undefined)
  t.is(pokedexModule.data.remote['testid'], undefined)
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
            return payload
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
  t.is(pokedexModule.data.remote['testid'], undefined)
})

test('get + onError: abort (default) -- emits fail events & aborts execution by default', async t => {
  const { pokedexModule } = createVueSyncInstance()
  const getPayload = { shouldFail: 'local' }
  t.deepEqual(pokedexModule.data.local, { '001': bulbasaur })
  t.deepEqual(pokedexModule.data.remote, { '001': bulbasaur })
  try {
    await pokedexModule.get(getPayload, {
      on: {
        local: {
          error: ({ payload }) => {
            // @ts-ignore
            t.deepEqual(payload, getPayload)
            return payload
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
  t.deepEqual(pokedexModule.data.remote, { '001': bulbasaur })
})

test('get + onError: abort (default) -- fail in second store plugin does not prevent execution first store plugin', async t => {
  const { pokedexModule } = createVueSyncInstance()
  const getPayload = { shouldFail: 'remote' }
  t.deepEqual(pokedexModule.data.local, { '001': bulbasaur })
  t.deepEqual(pokedexModule.data.remote, { '001': bulbasaur })
  try {
    await pokedexModule.get(getPayload, {
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
  t.deepEqual(pokedexModule.data.local, { '001': bulbasaur, '004': charmander })
  t.deepEqual(pokedexModule.data.remote, { '001': bulbasaur })
})

test('get + onError: continue', async t => {
  const { pokedexModule } = createVueSyncInstance()
  const getPayload = { shouldFail: 'local' }
  t.deepEqual(pokedexModule.data.local, { '001': bulbasaur })
  t.deepEqual(pokedexModule.data.remote, { '001': bulbasaur })
  try {
    await pokedexModule.get(getPayload, {
      onError: 'continue',
      on: {
        local: {
          error: ({ payload }) => {
            // @ts-ignore
            t.deepEqual(payload, getPayload)
            return payload
          },
        },
        remote: {
          error: () => { t.fail() }, // prettier-ignore
          success: ({ payload }) => {
            // @ts-ignore
            t.deepEqual(payload, getPayload)
            return payload
          },
        },
      },
    })
  } catch (e) {
    t.fail()
  }
  t.deepEqual(pokedexModule.data.local, { '001': bulbasaur })
  t.deepEqual(pokedexModule.data.remote, { '001': bulbasaur, '004': charmander })
})

test('get + onError: revert', async t => {
  const { pokedexModule } = createVueSyncInstance()
  const getPayload = { shouldFail: 'remote' }
  const revertedPayload = {
    ...getPayload,
    reverted: { actionName: 'get', storeName: 'local' },
  }
  t.deepEqual(pokedexModule.data.local, { '001': bulbasaur })
  t.deepEqual(pokedexModule.data.remote, { '001': bulbasaur })
  try {
    const result = await pokedexModule.get(getPayload, {
      onError: 'revert',
      on: {
        local: {
          error: () => { t.fail() }, // prettier-ignore
          success: () => {},
          revert: ({ payload, result, actionName }) => {
            t.is(actionName, 'get')
            // @ts-ignore
            t.deepEqual(result, revertedPayload)
          },
        },
        remote: {
          before: () => {
            t.deepEqual(pokedexModule.data.local, { '001': bulbasaur, '004': charmander })
          },
          error: ({ payload }) => {
            // @ts-ignore
            t.deepEqual(payload, getPayload)
            return payload
          },
        },
      },
    })
    // @ts-ignore
    t.deepEqual(result, revertedPayload)
  } catch (e) {
    t.fail()
  }
  t.deepEqual(pokedexModule.data.local, { '001': bulbasaur })
  t.deepEqual(pokedexModule.data.remote, { '001': bulbasaur })
})

test('get + onError: revert - will not go to next store', async t => {
  const { pokedexModule } = createVueSyncInstance()
  const getPayload = { shouldFail: 'local' }
  t.deepEqual(pokedexModule.data.local, { '001': bulbasaur })
  t.deepEqual(pokedexModule.data.remote, { '001': bulbasaur })
  try {
    const result = await pokedexModule.get(getPayload, {
      onError: 'revert',
      on: {
        local: {
          error: ({ payload }) => {
            // @ts-ignore
            t.deepEqual(payload, getPayload)
            return payload
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
    t.deepEqual(result, getPayload)
  } catch (e) {
    t.fail()
  }
  t.deepEqual(pokedexModule.data.local, { '001': bulbasaur })
  t.deepEqual(pokedexModule.data.remote, { '001': bulbasaur })
})
