import test from 'ava'
import { createVueSyncInstance } from '../helpers/createVueSyncInstance'
import { pokedex } from '../helpers/pokedex'

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
  t.deepEqual(pokedexModule.doc('1').data, pokedex(1))
  t.deepEqual(pokedexModule.doc('136').data, pokedex(136))
  t.deepEqual(pokedexModule.data.size, 151)
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
  t.deepEqual(trainerModule.data, { name: 'Luca', age: 10, dream: 'job' })
})

test('get (collection) where-filter: ==', async t => {
  const { pokedexModule } = createVueSyncInstance()
  try {
    const queryModuleRef = await pokedexModule.where('name', '==', 'Flareon').get()
    const actual = [...queryModuleRef.data.values()]
    const expected = [pokedex(136)]
    t.deepEqual(actual, expected)
  } catch (error) {
    t.fail(error)
  }
})

test('get (collection) where-filter: == nested', async t => {
  const { pokedexModule } = createVueSyncInstance()
  try {
    const queryModuleRef = await pokedexModule.where('base.HP', '==', 65).get()
    const actual = [...queryModuleRef.data.values()]
    const expected = [
      pokedex(15),
      pokedex(22),
      pokedex(53),
      pokedex(57),
      pokedex(61),
      pokedex(70),
      pokedex(78),
      pokedex(86),
      pokedex(110),
      pokedex(114),
      pokedex(124),
      pokedex(125),
      pokedex(126),
      pokedex(127),
      pokedex(135),
      pokedex(136),
      pokedex(137),
    ]
    t.deepEqual(actual, expected)
  } catch (error) {
    t.fail(error)
  }
})

// test('get (collection) where-filter: <', async t => {
//   const { pokedexModule } = createVueSyncInstance()
//   try {
//     const queryModuleRef = await pokedexModule.where('', '<', '').get()
//     const actual = [...queryModuleRef.data.values()]
//     const expected = []
//     t.deepEqual(actual, expected)
//   } catch (error) {
//     t.fail(error)
//   }
// })

// test('get (collection) where-filter: =<', async t => {
//   const { pokedexModule} = createVueSyncInstance()
//   try {
//     const queryModuleRef = await pokedexModule.where('', '=<', '').get()
//     const actual = [...queryModuleRef.data.values()]
//     const expected = []
//     t.deepEqual(actual, expected)
//   } catch (error) {
//     t.fail(error)
//   }
// })

// test('get (collection) where-filter: >', async t => {
//   const { pokedexModule} = createVueSyncInstance()
//   try {
//     const queryModuleRef = await pokedexModule.where('', '>', '').get()
//     const actual = [...queryModuleRef.data.values()]
//     const expected = []
//     t.deepEqual(actual, expected)
//   } catch (error) {
//     t.fail(error)
//   }
// })

// test('get (collection) where-filter: >=', async t => {
//   const { pokedexModule} = createVueSyncInstance()
//   try {
//     const queryModuleRef = await pokedexModule.where('', '>=', '').get()
//     const actual = [...queryModuleRef.data.values()]
//     const expected = []
//     t.deepEqual(actual, expected)
//   } catch (error) {
//     t.fail(error)
//   }
// })

// test('get (collection) where-filter: array-contains', async t => {
//   const { pokedexModule} = createVueSyncInstance()
//   try {
//     const queryModuleRef = await pokedexModule.where('', 'array-contains', '').get()
//     const actual = [...queryModuleRef.data.values()]
//     const expected = []
//     t.deepEqual(actual, expected)
//   } catch (error) {
//     t.fail(error)
//   }
// })

// test('get (collection) where-filter: in', async t => {
//   const { pokedexModule} = createVueSyncInstance()
//   try {
//     const queryModuleRef = await pokedexModule.where('', 'in', '').get()
//     const actual = [...queryModuleRef.data.values()]
//     const expected = []
//     t.deepEqual(actual, expected)
//   } catch (error) {
//     t.fail(error)
//   }
// })

// test('get (collection) where-filter: array-contains-any', async t => {
//   const { pokedexModule} = createVueSyncInstance()
//   try {
//     const queryModuleRef = await pokedexModule.where('', 'array-contains-any', '').get()
//     const actual = [...queryModuleRef.data.values()]
//     const expected = []
//     t.deepEqual(actual, expected)
//   } catch (error) {
//     t.fail(error)
//   }
// })

// test('get (collection) orderBy', async t => {
//   const { pokedexModule} = createVueSyncInstance()
//   try {
//     const queryModuleRef = await pokedexModule.where('', '', a', '').get()
//     const actual = [...queryModuleRef.data.values()]
//     const expected = []
//     t.deepEqual(actual, expected)
//   } catch (error) {
//     t.fail(error)
//   }
// })

// test('get (collection) limit', async t => {
//   const { pokedexModule} = createVueSyncInstance()
//   try {
//     const queryModuleRef = await pokedexModule.where('', '', async t', '').get()
//     const actual = [...queryModuleRef.data.values()]
//     const expected = []
//     t.deepEqual(actual, expected)
//   } catch (error) {
//     t.fail(error)
//   }
// })
