import test from 'ava'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance'
import { pokedex } from '@magnetarjs/test-utils'

// test('read: fetch (collection)', async (t) => {
//   // 'fetch' resolves once all stores have given a response with data
//   const { pokedexModule } = createMagnetarInstance()
//   t.deepEqual(pokedexModule.data.get('1'), pokedex(1))
//   t.is(pokedexModule.data.size, 1)
//   try {
//     const result = await pokedexModule.fetch()
//     t.deepEqual(result.data.get('1'), pokedex(1))
//     t.deepEqual(result.data.get('136'), pokedex(136))
//   } catch (error) {
//     t.fail(error)
//   }
//   t.deepEqual(pokedexModule.data.get('1'), pokedex(1))
//   t.deepEqual(pokedexModule.data.get('136'), pokedex(136))
//   t.is(pokedexModule.data.size, 151)
// })

test('read: fetch (document)', async (t) => {
  // get resolves once all stores have given a response with data
  const storeNames: string[] = []
  const { magnetar } = createMagnetarInstance()
  const trainerModule = magnetar.doc('app-data/trainer', {
    on: {
      success: ({ storeName }: any) => {
        storeNames.push(storeName)
      },
    },
  })
  try {
    // fetch twice at the same time
    await Promise.all([trainerModule.fetch(), trainerModule.fetch()])
  } catch (error) {
    t.fail(error)
  }

  // make sure the remote store was only triggered once
  t.is(storeNames.filter((n) => n === 'remote').length, 1)

  try {
    // fetch twice again the same time
    await Promise.all([trainerModule.fetch(), trainerModule.fetch()])
  } catch (error) {
    t.fail(error)
  }

  // make sure the remote store was only triggered once more
  t.is(storeNames.filter((n) => n === 'remote').length, 2)

  t.deepEqual(trainerModule.data, { name: 'Luca', age: 10, dream: 'job' })
})

// test('fetch (collection) where-filter: ==', async (t) => {
//   const { pokedexModule, magnetar } = createMagnetarInstance()

//   const pokedexModuleWithQuery = pokedexModule.where('name', '==', 'Flareon')
//   try {
//     const queryModuleRef = await pokedexModuleWithQuery.fetch()
//     t.deepEqual([...queryModuleRef.data.values()], [pokedex(136)])
//   } catch (error) {
//     t.fail(error)
//   }
//   // try take the query again and see if it's the same result
//   const queryModuleRef = pokedexModule.where('name', '==', 'Flareon')
//   t.deepEqual([...queryModuleRef.data.values()], [pokedex(136)])
//   // try take the pokedexModuleWithQuery and see if it's the same result
//   t.deepEqual([...pokedexModuleWithQuery.data.values()], [pokedex(136)])
//   // check the invididual doc refs from the pokedexModuleWithQuery
//   t.deepEqual(pokedexModuleWithQuery.doc('136').data, pokedex(136))
//   // check the invididual doc refs from pokedexModule
//   t.deepEqual(pokedexModule.doc('136').data, pokedex(136))
//   // check the invididual doc refs from base
//   t.deepEqual(magnetar.doc('pokedex/136').data, pokedex(136))
//   // see if the main module has also received this data
//   t.deepEqual([...pokedexModule.data.values()], [pokedex(1), pokedex(136)])
// })
