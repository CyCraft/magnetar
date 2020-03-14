import test from 'ava'
import { createVueSyncInstance } from './helpers/createVueSyncInstance'

test('emits before & success events', async t => {
  const { pokedexModule } = createVueSyncInstance()
  const insertPayload = { name: 'Squirtle', id: '007' }
  let ranAllEvents = []
  const result = await pokedexModule.insert(insertPayload, {
    on: {
      local: {
        before: ({ payload }) => {
          // @ts-ignore
          t.deepEqual(payload, insertPayload)
          ranAllEvents.push(1)
          return payload
        },
        success: ({ payload }) => {
          // @ts-ignore
          t.deepEqual(payload, insertPayload)
          ranAllEvents.push(1)
          return payload
        },
      },
      remote: {
        before: ({ payload }) => {
          // @ts-ignore
          t.deepEqual(payload, insertPayload)
          ranAllEvents.push(1)
          return payload
        },
        success: ({ payload }) => {
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

test('can abort in before events', async t => {
  const { pokedexModule } = createVueSyncInstance()
  const insertPayload = { name: 'Squirtle', id: '007' }
  const result = await pokedexModule.insert(insertPayload, {
    on: {
      local: {
        before: ({ payload, abort }) => {
          abort()
          return payload
        },
        success: ({ payload }) => {
          t.fail()
          return payload
        },
        error: ({ payload }) => {
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
})

test('can abort in success events', async t => {
  const { pokedexModule } = createVueSyncInstance()
  const insertPayload = { name: 'Squirtle', id: '007' }
  let ranAllEvents = []
  const result = await pokedexModule.insert(insertPayload, {
    on: {
      local: {
        before: ({ payload }) => {
          ranAllEvents.push(1)
          return payload
        },
        success: ({ payload, abort }) => {
          ranAllEvents.push(1)
          abort()
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
  t.is(ranAllEvents.length, 2)
})

test('can mutate payload via events', async t => {
  const { pokedexModule } = createVueSyncInstance()
  const insertPayload = { name: 'Squirtle', id: '007' }
  const result = await pokedexModule.insert(insertPayload, {
    on: {
      local: {
        before: ({ payload }) => {
          // @ts-ignore
          t.deepEqual(payload, { name: 'Squirtle', id: '007' })
          return { ...payload, level: 1 }
        },
        success: ({ payload }) => {
          // @ts-ignore
          t.deepEqual(payload, { name: 'Squirtle', id: '007', level: 1 })
          return { ...payload, sunglasses: true }
        },
      },
      remote: {
        before: ({ payload }) => {
          // @ts-ignore
          t.deepEqual(payload, { name: 'Squirtle', id: '007', level: 1, sunglasses: true })
          return { ...payload, trait: 'water resistance' }
        },
        success: ({ payload }) => {
          // @ts-ignore
          t.deepEqual(payload, {
            name: 'Squirtle',
            id: '007',
            level: 1,
            sunglasses: true,
            trait: 'water resistance',
          })
          return { ...payload, strength: 9000 }
        },
      },
    },
  })
  // @ts-ignore
  t.deepEqual(result, {
    name: 'Squirtle',
    id: '007',
    level: 1,
    sunglasses: true,
    trait: 'water resistance',
    strength: 9000,
  })
})
