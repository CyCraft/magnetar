import test from 'ava'
import { createVueSyncInstance } from './helpers/createVueSyncInstance'
import { bulbasaur, flareon, squirtle } from './helpers/pokemon'

test('get: can mutate payload', async t => {
  function addSeen (payload) {
    if (!('seen' in payload)) return { ...payload, seen: true }
  }
  // get resolves once all stores have given a response with data
  const { pokedexModule } = createVueSyncInstance()
  t.deepEqual(pokedexModule.data.local, { '001': bulbasaur })
  try {
    const result = await pokedexModule.get(
      {},
      {
        modifyPayloadOn: {
          write: addSeen,
        },
      }
    )
    // the remote result SHOULD HAVE the applied defaults
    t.deepEqual(result, [
      { ...bulbasaur, seen: true },
      { ...flareon, seen: true },
    ])
  } catch (error) {
    t.fail(error)
  }
  // the local store should have updated its data to the whatever was returned in the remote success event (via the plugin's onNextStoresSuccess handler)
  // therefore: the local store SHOULD HAVE the applied defaults
  t.deepEqual(pokedexModule.data.local, {
    '001': { ...bulbasaur, seen: true },
    '136': { ...flareon, seen: true },
  })
})

test('insert: can mutate payload', async t => {
  function addSeen (payload) {
    if (!('seen' in payload)) return { ...payload, seen: true }
  }
  // get resolves once all stores have given a response with data
  const { pokedexModule } = createVueSyncInstance()
  t.deepEqual(pokedexModule.data.local, { '001': bulbasaur })
  try {
    const result = await pokedexModule.insert(squirtle, {
      modifyPayloadOn: {
        write: addSeen,
      },
    })
    // the remote result SHOULD HAVE the applied defaults
    t.deepEqual(result, { ...squirtle, seen: true })
  } catch (error) {
    t.fail(error)
  }
  // the local store should have updated its data to the whatever was returned in the remote success event (via the plugin's onNextStoresSuccess handler)
  // therefore: the local store SHOULD HAVE the applied defaults
  t.deepEqual(pokedexModule.data.local, {
    '001': { ...bulbasaur },
    '007': { ...squirtle, seen: true },
  })
})
