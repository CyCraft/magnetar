import test from 'ava'
import { createVueSyncInstance } from './helpers/createVueSyncInstance'
import { squirtle } from './helpers/pokemon'

test('emits before & success events', async t => {
  const { pokedexModule } = createVueSyncInstance()
  const insertPayload = squirtle
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
  const insertPayload = squirtle
  const result = await pokedexModule.insert(insertPayload, {
    on: {
      local: {
        before: ({ payload, abort }) => {
          abort()
          return payload
        },
        success: () => { t.fail() }, // prettier-ignore
        error: () => { t.fail() } // prettier-ignore
      },
      remote: {
        before: () => { t.fail() } // prettier-ignore
      },
    },
  })
  // @ts-ignore
  t.deepEqual(result, insertPayload)
})

test('can abort in success events', async t => {
  const { pokedexModule } = createVueSyncInstance()
  const insertPayload = squirtle
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
        before: () => { t.fail() } // prettier-ignore
      },
    },
  })
  // @ts-ignore
  t.deepEqual(result, insertPayload)
  t.is(ranAllEvents.length, 2)
})

test('can mutate payload via events -- should not carry over modification to payload over multiple stores', async t => {
  const { pokedexModule } = createVueSyncInstance()
  const insertPayload = squirtle
  t.is(pokedexModule.data.local['007'], undefined)
  t.is(pokedexModule.data.remote['007'], undefined)
  const result = await pokedexModule.insert(insertPayload, {
    on: {
      local: {
        before: ({ payload }) => {
          // @ts-ignore
          t.deepEqual(payload, squirtle)
          return { ...payload, level: 1 }
        },
        success: ({ payload }) => {
          // @ts-ignore
          t.deepEqual(payload, { ...squirtle, level: 1 })
          return { ...payload, sunglasses: true }
        },
      },
      remote: {
        before: ({ payload }) => {
          // @ts-ignore
          t.deepEqual(payload, squirtle)
          return { ...payload, trait: 'water resistance' }
        },
        success: ({ payload }) => {
          // @ts-ignore
          t.deepEqual(payload, { ...squirtle, trait: 'water resistance' })
          return { ...payload, strength: 9000 }
        },
      },
    },
  })
  // @ts-ignore
  // should be the same payload as AFTER the "before event":
  t.deepEqual(pokedexModule.data.local['007'], { ...squirtle, level: 1 })
  // should be the same payload as AFTER the "before event":
  t.deepEqual(pokedexModule.data.remote['007'], { ...squirtle, trait: 'water resistance' })
  // should be the same payload as AFTER the "succes event" of the last store:
  t.deepEqual(result, { ...squirtle, trait: 'water resistance', strength: 9000 })
})
