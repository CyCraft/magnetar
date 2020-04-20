import test from 'ava'
import { createVueSyncInstance } from './helpers/createVueSyncInstance'
import { pokedex } from './helpers/pokemon'

test('get (collection)', async t => {
  /// 'get' resolves once all stores have given a response with data
  const { pokedexModule } = createVueSyncInstance()
  t.deepEqual(pokedexModule.doc('1').data, pokedex(1))
  t.deepEqual(pokedexModule.doc('136').data, undefined)
  t.deepEqual(pokedexModule.data.size, 1)

  try {
    await pokedexModule.get()
  } catch (error) {
    t.fail(error)
  }
  // the local store should have updated its data to the remote store (via the plugin's onNextStoresSuccess handler)
  t.deepEqual(pokedexModule.doc('1').data, pokedex(1))
  t.deepEqual(pokedexModule.doc('136').data, pokedex(136))
  t.deepEqual(pokedexModule.data.size, 2)
})

test('get (document)', async t => {
  /// get resolves once all stores have given a response with data
  const { trainerModule } = createVueSyncInstance()
  t.deepEqual(trainerModule.data, { name: 'Luca', age: 10 })

  try {
    await trainerModule.get()
  } catch (error) {
    t.fail(error)
  }
  // the local store should have updated its data to the remote store (via the plugin's onNextStoresSuccess handler)
  t.deepEqual(trainerModule.data, { name: 'Luca', age: 10, dream: 'job' })
})

// test('get (collection) where-filter: ==', async t => {
//   const { pokedexModule} = createVueSyncInstance()
//   // isModuleDataEqual(t, vueSync, 'pokedex/...', ...)

//   try {
//     await pokedexModule.where('', '==', '').get()
//   } catch (error) {
//     t.fail(error)
//   }
//   // the local store should have updated its data to the remote store (via the plugin's onNextStoresSuccess handler)
//   const result = pokedexModule.data.values().filter(p => {})
//   t.deepEqual(result, [])
// })

// test('get (collection) where-filter: == nested', async t => {
//   const { pokedexModule} = createVueSyncInstance()
//   // isModuleDataEqual(t, vueSync, 'pokedex/...', ...)

//   try {
//     await pokedexModule.where('', '== nested', '').get()
//   } catch (error) {
//     t.fail(error)
//   }
//   // the local store should have updated its data to the remote store (via the plugin's onNextStoresSuccess handler)
//   const result = pokedexModule.data.values().filter(p => {})
//   t.deepEqual(result, [])
// })

// test('get (collection) where-filter: <', async t => {
//   const { pokedexModule} = createVueSyncInstance()
//   // isModuleDataEqual(t, vueSync, 'pokedex/...', ...)

//   try {
//     await pokedexModule.where('', '<', '').get()
//   } catch (error) {
//     t.fail(error)
//   }
//   // the local store should have updated its data to the remote store (via the plugin's onNextStoresSuccess handler)
//   const result = pokedexModule.data.values().filter(p => {})
//   t.deepEqual(result, [])
// })

// test('get (collection) where-filter: =<', async t => {
//   const { pokedexModule} = createVueSyncInstance()
//   // isModuleDataEqual(t, vueSync, 'pokedex/...', ...)

//   try {
//     await pokedexModule.where('', '=<', '').get()
//   } catch (error) {
//     t.fail(error)
//   }
//   // the local store should have updated its data to the remote store (via the plugin's onNextStoresSuccess handler)
//   const result = pokedexModule.data.values().filter(p => {})
//   t.deepEqual(result, [])
// })

// test('get (collection) where-filter: >', async t => {
//   const { pokedexModule} = createVueSyncInstance()
//   // isModuleDataEqual(t, vueSync, 'pokedex/...', ...)

//   try {
//     await pokedexModule.where('', '>', '').get()
//   } catch (error) {
//     t.fail(error)
//   }
//   // the local store should have updated its data to the remote store (via the plugin's onNextStoresSuccess handler)
//   const result = pokedexModule.data.values().filter(p => {})
//   t.deepEqual(result, [])
// })

// test('get (collection) where-filter: >=', async t => {
//   const { pokedexModule} = createVueSyncInstance()
//   // isModuleDataEqual(t, vueSync, 'pokedex/...', ...)

//   try {
//     await pokedexModule.where('', '>=', '').get()
//   } catch (error) {
//     t.fail(error)
//   }
//   // the local store should have updated its data to the remote store (via the plugin's onNextStoresSuccess handler)
//   const result = pokedexModule.data.values().filter(p => {})
//   t.deepEqual(result, [])
// })

// test('get (collection) where-filter: array-contains', async t => {
//   const { pokedexModule} = createVueSyncInstance()
//   // isModuleDataEqual(t, vueSync, 'pokedex/...', ...)

//   try {
//     await pokedexModule.where('', 'array-contains', '').get()
//   } catch (error) {
//     t.fail(error)
//   }
//   // the local store should have updated its data to the remote store (via the plugin's onNextStoresSuccess handler)
//   const result = pokedexModule.data.values().filter(p => {})
//   t.deepEqual(result, [])
// })

// test('get (collection) where-filter: in', async t => {
//   const { pokedexModule} = createVueSyncInstance()
//   // isModuleDataEqual(t, vueSync, 'pokedex/...', ...)

//   try {
//     await pokedexModule.where('', 'in', '').get()
//   } catch (error) {
//     t.fail(error)
//   }
//   // the local store should have updated its data to the remote store (via the plugin's onNextStoresSuccess handler)
//   const result = pokedexModule.data.values().filter(p => {})
//   t.deepEqual(result, [])
// })

// test('get (collection) where-filter: array-contains-any', async t => {
//   const { pokedexModule} = createVueSyncInstance()
//   // isModuleDataEqual(t, vueSync, 'pokedex/...', ...)

//   try {
//     await pokedexModule.where('', 'array-contains-any', '').get()
//   } catch (error) {
//     t.fail(error)
//   }
//   // the local store should have updated its data to the remote store (via the plugin's onNextStoresSuccess handler)
//   const result = pokedexModule.data.values().filter(p => {})
//   t.deepEqual(result, [])
// })

// test('get (collection) orderBy', async t => {
//   const { pokedexModule} = createVueSyncInstance()
//   // isModuleDataEqual(t, vueSync, 'pokedex/...', ...)

//   try {
//     await pokedexModule.where('', '', a', '').get()
//   } catch (error) {
//     t.fail(error)
//   }
//   // the local store should have updated its data to the remote store (via the plugin's onNextStoresSuccess handler)
//   const result = pokedexModule.data.values().filter(p => {})
//   t.deepEqual(result, [])
// })

// test('get (collection) limit', async t => {
//   const { pokedexModule} = createVueSyncInstance()
//   // isModuleDataEqual(t, vueSync, 'pokedex/...', ...)

//   try {
//     await pokedexModule.where('', '', async t', '').get()
//   } catch (error) {
//     t.fail(error)
//   }
//   // the local store should have updated its data to the remote store (via the plugin's onNextStoresSuccess handler)
//   const result = pokedexModule.data.values().filter(p => {})
//   t.deepEqual(result, [])
// })
