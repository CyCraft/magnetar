import { pokedex } from '@magnetarjs/test-utils'
import { assert, test } from 'vitest'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance.js'

test('delete: emits before & success events', async () => {
  const { pokedexModule } = createMagnetarInstance()
  const insertPayload = pokedex(7)
  await pokedexModule.insert(insertPayload)
  const ranAllEvents: any[] = []
  await pokedexModule.doc('7').delete(undefined, {
    on: {
      before: ({ payload, storeName }) => {
        ranAllEvents.push(1)
      },
      success: ({ payload, storeName }) => {
        ranAllEvents.push(1)
      },
    },
  })
  assert.deepEqual(ranAllEvents.length, 4)
})

test('insert: emits before & success events', async () => {
  const { pokedexModule } = createMagnetarInstance()
  const insertPayload = pokedex(7)
  const ranAllEvents: any[] = []
  await pokedexModule.insert(insertPayload, {
    on: {
      before: ({ payload, storeName }) => {
        if (storeName === 'local') {
          assert.deepEqual(payload, insertPayload)
          ranAllEvents.push(1)
        }
        if (storeName === 'remote') {
          assert.deepEqual(payload, insertPayload)
          ranAllEvents.push(1)
        }
      },
      success: ({ payload, storeName }) => {
        if (storeName === 'local') {
          assert.deepEqual(payload, insertPayload)
          ranAllEvents.push(1)
        }
        if (storeName === 'remote') {
          assert.deepEqual(payload, insertPayload)
          ranAllEvents.push(1)
        }
      },
    },
  })
  assert.deepEqual(ranAllEvents.length, 4)
})

test('insert: can abort in before events', async () => {
  const { pokedexModule } = createMagnetarInstance()
  const insertPayload = pokedex(7)
  try {
    const result = await pokedexModule.insert(insertPayload, {
      on: {
        before: ({ payload, abort, storeName }) => {
          if (storeName === 'local') {
            abort()
          }
          if (storeName === 'remote') assert.fail()
        },
        success: ({ storeName, result }) => {
          assert.fail()
        },
        error: ({ storeName }) => {
          if (storeName === 'local') assert.fail()
        },
      },
    })
    assert.deepEqual(result.data, pokedexModule.data.get('7'))
  } catch (error) {
    assert.fail(JSON.stringify(error))
  }
})

test('insert: can abort in success events', async () => {
  const { pokedexModule } = createMagnetarInstance()
  const insertPayload = pokedex(7)
  const ranAllEvents: any[] = []
  try {
    const result = await pokedexModule.insert(insertPayload, {
      on: {
        before: ({ payload, storeName }) => {
          if (storeName === 'local') {
            ranAllEvents.push(1)
          }
          if (storeName === 'remote') assert.fail()
        },
        success: ({ payload, abort, storeName }) => {
          if (storeName === 'local') {
            ranAllEvents.push(1)
            abort()
          }
        },
      },
    })
    assert.deepEqual(result.data, insertPayload)
  } catch (error) {
    assert.fail(JSON.stringify(error))
  }
  assert.deepEqual(ranAllEvents.length, 2)
})
