import test from 'ava'
import { createVueSyncInstance } from './helpers/createVueSyncInstance'
import { bulbasaur, flareon } from './helpers/pokemon'

test('read: get (collection)', async t => {
  // 'get' resolves once all stores have given a response with data
  const { pokedexModule } = createVueSyncInstance()
  t.deepEqual(pokedexModule.data.get('001'), bulbasaur)
  t.deepEqual(pokedexModule.data.size, 1)
  try {
    const result = await pokedexModule.get(
      {},
      {
        on: {
          success: ({ result, storeName }) => {
            if (storeName === 'local') {
              // here we check if the data returned at this point is actually what that store plugin should return
              t.deepEqual(pokedexModule.data.get('001'), bulbasaur)
            }
          },
        },
      }
    )
    t.deepEqual(result.data.get('001'), bulbasaur)
    t.deepEqual(result.data.get('136'), flareon)
  } catch (error) {
    t.fail(error)
  }
  // the local store should have updated its data to the remote store (via the plugin's onNextStoresSuccess handler)
  t.deepEqual(pokedexModule.data.get('001'), bulbasaur)
  t.deepEqual(pokedexModule.data.get('136'), flareon)
  t.deepEqual(pokedexModule.data.size, 2)
})

test('read: get (document)', async t => {
  // get resolves once all stores have given a response with data
  const { trainerModule } = createVueSyncInstance()
  t.deepEqual(trainerModule.data, { name: 'Luca', age: 10 })
  try {
    const result = await trainerModule.get(
      {},
      {
        on: {
          success: ({ result, storeName }) => {
            if (storeName === 'local') {
              // here we check if the data returned at this point is actually what that store plugin should return
              t.deepEqual(trainerModule.data, { name: 'Luca', age: 10 })
            }
          },
        },
      }
    )
    t.deepEqual(result.data, { name: 'Luca', age: 10, dream: 'job' })
  } catch (error) {
    t.fail(error)
  }
  // the local store should have updated its data to the remote store (via the plugin's onNextStoresSuccess handler)
  t.deepEqual(trainerModule.data, { name: 'Luca', age: 10, dream: 'job' })
})
