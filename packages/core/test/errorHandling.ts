import test from 'ava'
import { createVueSyncInstance } from './helpers/createVueSyncInstance'

test('emits fail events & aborts execution by default', async t => {
  const { pokedexModule } = createVueSyncInstance()
  const insertPayload = { name: 'this should fail', shouldFail: 'local' }
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
          before: ({ payload }) => {
            t.fail()
            return payload
          },
        },
      },
    })
  } catch (e) {
    t.deepEqual(e, { message: 'fail', payload: insertPayload })
  }
})

test('onError: continue', async t => {
  const { pokedexModule } = createVueSyncInstance()
  const insertPayload = { name: 'this should fail', shouldFail: 'local' }
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
          error: ({ payload }) => {
            t.fail()
            return payload
          },
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
})

test('onError: revert', async t => {
  const { pokedexModule } = createVueSyncInstance()
  const insertPayload = { name: 'this should fail', shouldFail: 'remote' }
  const revertedPayload = {
    ...insertPayload,
    reverted: { actionName: 'insert', storeName: 'local' },
  }
  try {
    const result = await pokedexModule.insert(insertPayload, {
      onError: 'revert',
      on: {
        local: {
          error: ({ payload }) => {
            t.fail()
            return payload
          },
          revert: ({ payload, actionName }) => {
            t.is(actionName, 'insert')
            // @ts-ignore
            t.deepEqual(payload, revertedPayload)
            return payload
          },
        },
        remote: {
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
})

test('onError: revert - will not go to next store', async t => {
  const { pokedexModule } = createVueSyncInstance()
  const insertPayload = { name: 'this should fail', shouldFail: 'local' }
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
          revert: ({ payload }) => {
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
  } catch (e) {
    t.fail()
  }
})
