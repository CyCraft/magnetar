import test from 'ava'
import { createVueSyncInstance } from './helpers/createVueSyncInstance'
import { bulbasaur, flareon, squirtle } from './helpers/pokemon'
import { waitMs } from './helpers/wait'

test('get: can mutate payload & read response', async t => {
  function addSeen (payload) {
    return { ...payload, seen: true }
  }
  function addToken (payload) {
    return { ...payload, auth: 'Bearer 123123' }
  }
  // get resolves once all stores have given a response with data
  const { pokedexModule } = createVueSyncInstance()
  t.deepEqual(pokedexModule.data.get('001'), bulbasaur())
  try {
    const result = await pokedexModule.get(
      {},
      {
        modifyPayloadOn: {
          read: addToken,
        },
        modifyReadResponseOn: {
          added: addSeen,
        },
        on: {
          success: ({ payload }) => {
            t.deepEqual(payload, { auth: 'Bearer 123123' })
          },
        },
      }
    )
    // the remote result SHOULD HAVE the applied defaults
    t.deepEqual(result.data.get('001'), { ...bulbasaur(), seen: true })
    t.deepEqual(result.data.get('136'), { ...flareon(), seen: true })
  } catch (error) {
    t.fail(error)
  }
  // the local store should have updated its data to the whatever was returned in the remote success event (via the plugin's onNextStoresSuccess handler)
  // therefore: the local store SHOULD HAVE the applied defaults
  t.deepEqual(pokedexModule.data.get('001'), { ...bulbasaur(), seen: true })
  t.deepEqual(pokedexModule.data.get('136'), { ...flareon(), seen: true })
})

test('stream: can mutate payload & read response', async t => {
  function addSeen (payload) {
    return { ...payload, seen: true }
  }
  function addToken (payload) {
    return { ...payload, auth: 'Bearer 123123' }
  }
  const { pokedexModule } = createVueSyncInstance()
  t.deepEqual(pokedexModule.data.get('001'), bulbasaur())
  pokedexModule.stream(
    {},
    {
      modifyPayloadOn: {
        read: addToken,
      },
      modifyReadResponseOn: {
        added: addSeen,
      },
      on: {
        before: ({ payload }) => {
          t.deepEqual(payload, { auth: 'Bearer 123123' })
        },
      },
    }
  )
  await waitMs(600)
  // the local store SHOULD HAVE the applied defaults
  t.deepEqual(pokedexModule.data.get('001'), { ...bulbasaur(), seen: true })
  t.deepEqual(pokedexModule.data.get('136'), { ...flareon(), seen: true })
})

test('insert: can mutate payload', async t => {
  function addSeen (payload) {
    if (!('seen' in payload)) return { ...payload, seen: true }
  }
  // get resolves once all stores have given a response with data
  const { pokedexModule } = createVueSyncInstance()
  t.deepEqual(pokedexModule.data.get('001'), bulbasaur())
  try {
    const payload = squirtle()
    const result = await pokedexModule.insert(payload, {
      modifyPayloadOn: {
        write: addSeen,
      },
    })
    // the remote result SHOULD HAVE the applied defaults
    t.deepEqual(result.data, { ...squirtle(), seen: true })
  } catch (error) {
    t.fail(error)
  }
  // the local store should have updated its data to the whatever was returned in the remote success event (via the plugin's onNextStoresSuccess handler)
  // therefore: the local store SHOULD HAVE the applied defaults
  t.deepEqual(pokedexModule.data.get('001'), { ...bulbasaur() })
  t.deepEqual(pokedexModule.data.get('007'), { ...squirtle(), seen: true })
})
