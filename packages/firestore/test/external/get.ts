import test from 'ava'
import { createVueSyncInstance } from '../helpers/createVueSyncInstance'
import { pokedex } from '../helpers/pokedex'

{
  const testName = 'get (collection)'
  test(testName, async t => {
    /// 'get' resolves once all stores have given a response with data
    const { pokedexModule } = await createVueSyncInstance('read')
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
}
{
  const testName = 'get (document)'
  test(testName, async t => {
    /// get resolves once all stores have given a response with data
    const { trainerModule } = await createVueSyncInstance('read')
    t.deepEqual(trainerModule.data, { name: 'Luca', age: 10 })
    try {
      await trainerModule.get()
    } catch (error) {
      t.fail(error)
    }
    t.deepEqual(trainerModule.data, { name: 'Luca', age: 10, dream: 'job' })
  })
}
{
  const testName = 'get (collection) where-filter: =='
  test(testName, async t => {
    const { pokedexModule } = await createVueSyncInstance('read')
    try {
      const queryModuleRef = await pokedexModule.where('name', '==', 'Flareon').get()
      const actual = [...queryModuleRef.data.values()]
      const expected = [pokedex(136)]
      t.deepEqual(actual, expected)
    } catch (error) {
      t.fail(error)
    }
  })
}
{
  const testName = 'get (collection) where-filter: == nested'
  test(testName, async t => {
    const { pokedexModule } = await createVueSyncInstance('read')
    try {
      const queryModuleRef = await pokedexModule.where('base.HP', '==', 10).get()
      const actual = [...queryModuleRef.data.values()]
      const expected = [pokedex(50)]
      t.deepEqual(actual, expected)
    } catch (error) {
      t.fail(error)
    }
  })
}
{
  const testName = 'get (collection) where-filter: <'
  test(testName, async t => {
    const { pokedexModule } = await createVueSyncInstance('read')
    try {
      const queryModuleRef = await pokedexModule.where('base.HP', '<', 11).get()
      const actual = [...queryModuleRef.data.values()]
      const expected = [pokedex(50)]
      t.deepEqual(actual, expected)
    } catch (error) {
      t.fail(error)
    }
  })
}
{
  const testName = 'get (collection) where-filter: <='
  test(testName, async t => {
    const { pokedexModule } = await createVueSyncInstance('read')
    try {
      const queryModuleRef = await pokedexModule.where('base.HP', '<=', 10).get()
      const actual = [...queryModuleRef.data.values()]
      const expected = [pokedex(50)]
      t.deepEqual(actual, expected)
    } catch (error) {
      t.fail(error)
    }
  })
}
{
  const testName = 'get (collection) where-filter: >'
  test(testName, async t => {
    const { pokedexModule } = await createVueSyncInstance('read')
    try {
      const queryModuleRef = await pokedexModule.where('base.HP', '>', 249).get()
      const actual = [...queryModuleRef.data.values()]
      const expected = [pokedex(113)]
      t.deepEqual(actual, expected)
    } catch (error) {
      t.fail(error)
    }
  })
}
{
  const testName = 'get (collection) where-filter: >='
  test(testName, async t => {
    const { pokedexModule } = await createVueSyncInstance('read')
    try {
      const queryModuleRef = await pokedexModule.where('base.HP', '>=', 250).get()
      const actual = [...queryModuleRef.data.values()]
      const expected = [pokedex(113)]
      t.deepEqual(actual, expected)
    } catch (error) {
      t.fail(error)
    }
  })
}
{
  const testName = 'get (collection) where-filter: array-contains'
  test(testName, async t => {
    const { pokedexModule } = await createVueSyncInstance('read')
    try {
      const queryModuleRef = await pokedexModule.where('type', 'array-contains', 'Steel').get()
      const actual = [...queryModuleRef.data.values()]
      const expected = [pokedex(81), pokedex(82)]
      t.deepEqual(actual, expected)
    } catch (error) {
      t.fail(error)
    }
  })
}
{
  const testName = 'get (collection) where-filter: in'
  test(testName, async t => {
    const { pokedexModule } = await createVueSyncInstance('read')
    try {
      const queryModuleRef = await pokedexModule
        .where('name', 'in', ['Vaporeon', 'Jolteon', 'Flareon'])
        .get()
      const actual = [...queryModuleRef.data.values()]
      const expected = [pokedex(134), pokedex(135), pokedex(136)]
      t.deepEqual(actual, expected)
    } catch (error) {
      t.fail(error)
    }
  })
}
{
  const testName = 'get (collection) where-filter: array-contains-any'
  test(testName, async t => {
    const { pokedexModule } = await createVueSyncInstance('read')
    try {
      const queryModuleRef = await pokedexModule
        .where('type', 'array-contains-any', ['Steel', 'Ice'])
        .get()
      const actual = [...queryModuleRef.data.values()]
      const expected = [
        pokedex(81),
        pokedex(82),
        pokedex(87),
        pokedex(91),
        pokedex(124),
        pokedex(131),
        pokedex(144),
      ]
      t.deepEqual(actual, expected)
    } catch (error) {
      t.fail(error)
    }
  })
}
{
  const testName = 'get (collection) compound queries'
  test(testName, async t => {
    const { pokedexModule } = await createVueSyncInstance('read')
    try {
      const queryModuleRef = await pokedexModule
        .where('type', 'array-contains', 'Fire')
        .where('base.Speed', '>=', 100)
        .get()
      const actual = [...queryModuleRef.data.values()]
      const expected = [pokedex(6), pokedex(38), pokedex(78)]
      t.deepEqual(actual, expected)
    } catch (error) {
      t.fail(error)
    }
  })
}
{
  const testName = 'get (collection) orderBy'
  test(testName, async t => {
    const { pokedexModule } = await createVueSyncInstance('read')
    try {
      const queryModuleRef = await pokedexModule
        .where('type', 'array-contains', 'Fire')
        .where('base.Speed', '>=', 100)
        .orderBy('name', 'desc')
        .get()
      // Rapidash 78
      // Ninetales 38
      // Charizard 6
      const actual = [...queryModuleRef.data.values()]
      const expected = [pokedex(78), pokedex(38), pokedex(6)]
      t.deepEqual(actual, expected)
    } catch (error) {
      t.fail(error)
    }
  })
}
{
  const testName = 'get (collection) limit'
  test(testName, async t => {
    const { pokedexModule } = await createVueSyncInstance('read')
    try {
      const queryModuleRef = await pokedexModule.limit(10).get()
      const actual = [...queryModuleRef.data.values()]
      const expected = [
        pokedex(1),
        pokedex(2),
        pokedex(3),
        pokedex(4),
        pokedex(5),
        pokedex(6),
        pokedex(7),
        pokedex(8),
        pokedex(9),
        pokedex(10),
      ]
      t.deepEqual(actual, expected)
    } catch (error) {
      t.fail(error)
    }
  })
}
