import test from 'ava'
import { createVueSyncInstance } from './helpers/createVueSyncInstance'
import { squirtle } from './helpers/pokemon'

test('insert: emits before & success events', async t => {
  const { pokedexModule } = createVueSyncInstance()
  const insertPayload = squirtle
  let ranAllEvents = []
  const result = await pokedexModule.insert(insertPayload, {
    on: {
      before: ({ payload, storeName }) => {
        if (storeName === 'local') {
          t.deepEqual(payload, insertPayload)
          ranAllEvents.push(1)
        }
        if (storeName === 'remote') {
          t.deepEqual(payload, insertPayload)
          ranAllEvents.push(1)
        }
      },
      success: ({ payload, storeName }) => {
        if (storeName === 'local') {
          t.deepEqual(payload, insertPayload)
          ranAllEvents.push(1)
        }
        if (storeName === 'remote') {
          t.deepEqual(payload, insertPayload)
          ranAllEvents.push(1)
        }
      },
    },
  })
  t.is(ranAllEvents.length, 4)
})

test('insert: can abort in before events', async t => {
  const { pokedexModule } = createVueSyncInstance()
  const insertPayload = squirtle
  const result = await pokedexModule.insert(insertPayload, {
    on: {
      before: ({ payload, abort, storeName }) => {
        if (storeName === 'local') {
          abort()
        }
        if (storeName === 'remote') t.fail()
      },
      success: ({ storeName }) => {
        if (storeName === 'local') t.fail()
      },
      error: ({ storeName }) => {
        if (storeName === 'local') t.fail()
      },
    },
  })
})

test('insert: can abort in success events', async t => {
  const { pokedexModule } = createVueSyncInstance()
  const insertPayload = squirtle
  let ranAllEvents = []
  const result = await pokedexModule.insert(insertPayload, {
    on: {
      before: ({ payload, storeName }) => {
        if (storeName === 'local') {
          ranAllEvents.push(1)
        }
        if (storeName === 'remote') t.fail()
      },
      success: ({ payload, abort, storeName }) => {
        if (storeName === 'local') {
          ranAllEvents.push(1)
          abort()
        }
      },
    },
  })
  t.is(ranAllEvents.length, 2)
})
