import test from 'ava'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance'
import { pokedex } from '@magnetarjs/test-utils'

{
  const testName = 'fetch (collection)'
  test(testName, async (t) => {
    /// 'fetch' resolves once all stores have given a response with data
    const { pokedexModule } = await createMagnetarInstance('read')
    t.deepEqual(pokedexModule.doc('1').data, pokedex(1))
    t.deepEqual(pokedexModule.doc('136').data, undefined)
    t.is(pokedexModule.data.size, 1)

    try {
      await pokedexModule.fetch()
    } catch (error) {
      t.fail(error)
    }
    t.deepEqual(pokedexModule.doc('1').data, pokedex(1))
    t.deepEqual(pokedexModule.doc('136').data, pokedex(136))
    t.is(pokedexModule.data.size, 151)
  })
}
{
  const testName = 'fetch (document)'
  test(testName, async (t) => {
    /// get resolves once all stores have given a response with data
    const { trainerModule } = await createMagnetarInstance('read')
    t.deepEqual(trainerModule.data, { name: 'Luca', age: 10 })
    try {
      await trainerModule.fetch()
    } catch (error) {
      t.fail(error)
    }
    t.deepEqual(trainerModule.data, { name: 'Luca', age: 10, dream: 'job' })
  })
}
{
  const testName = 'fetch (collection) where-filter: =='
  test(testName, async (t) => {
    const { pokedexModule } = await createMagnetarInstance('read')
    try {
      const queryModuleRef = await pokedexModule.where('name', '==', 'Flareon').fetch()
      const actual = [...queryModuleRef.data.values()]
      const expected = [pokedex(136)]
      t.deepEqual(actual, expected as any)
      // also check the collection without query
      const actualDocCountWithoutQuery = pokedexModule.data.size
      const expectedDocCountWithoutQuery = expected.length + 1
      t.is(actualDocCountWithoutQuery, expectedDocCountWithoutQuery)
    } catch (error) {
      t.fail(error)
    }
  })
}
{
  const testName = 'fetch (collection) where-filter: !='
  test(testName, async (t) => {
    const { pokedexModule } = await createMagnetarInstance('read')
    try {
      const queryModuleRef = await pokedexModule
        .orderBy('name')
        .where('name', '!=', 'Abra')
        .limit(1)
        .fetch()
      const actual = [...queryModuleRef.data.values()]
      const expected = [pokedex(142)]
      t.deepEqual(actual, expected as any)
      // also check the collection without query
      const actualDocCountWithoutQuery = pokedexModule.data.size
      const expectedDocCountWithoutQuery = expected.length + 1
      t.is(actualDocCountWithoutQuery, expectedDocCountWithoutQuery)
    } catch (error) {
      t.fail(error)
    }
  })
}
{
  const testName = 'fetch (collection) where-filter: == nested'
  test(testName, async (t) => {
    const { pokedexModule } = await createMagnetarInstance('read')
    try {
      const queryModuleRef = await pokedexModule.where('base.HP', '==', 10).fetch()
      const actual = [...queryModuleRef.data.values()]
      const expected = [pokedex(50)]
      t.deepEqual(actual, expected as any)
      // also check the collection without query
      const actualDocCountWithoutQuery = pokedexModule.data.size
      const expectedDocCountWithoutQuery = expected.length + 1
      t.is(actualDocCountWithoutQuery, expectedDocCountWithoutQuery)
    } catch (error) {
      t.fail(error)
    }
  })
}
{
  const testName = 'fetch (collection) where-filter: <'
  test(testName, async (t) => {
    const { pokedexModule } = await createMagnetarInstance('read')
    try {
      const queryModuleRef = await pokedexModule.where('base.HP', '<', 11).fetch()
      const actual = [...queryModuleRef.data.values()]
      const expected = [pokedex(50)]
      t.deepEqual(actual, expected as any)
      // also check the collection without query
      const actualDocCountWithoutQuery = pokedexModule.data.size
      const expectedDocCountWithoutQuery = expected.length + 1
      t.is(actualDocCountWithoutQuery, expectedDocCountWithoutQuery)
    } catch (error) {
      t.fail(error)
    }
  })
}
{
  const testName = 'fetch (collection) where-filter: <='
  test(testName, async (t) => {
    const { pokedexModule } = await createMagnetarInstance('read')
    try {
      const queryModuleRef = await pokedexModule.where('base.HP', '<=', 10).fetch()
      const actual = [...queryModuleRef.data.values()]
      const expected = [pokedex(50)]
      t.deepEqual(actual, expected as any)
      // also check the collection without query
      const actualDocCountWithoutQuery = pokedexModule.data.size
      const expectedDocCountWithoutQuery = expected.length + 1
      t.is(actualDocCountWithoutQuery, expectedDocCountWithoutQuery)
    } catch (error) {
      t.fail(error)
    }
  })
}
{
  const testName = 'fetch (collection) where-filter: >'
  test(testName, async (t) => {
    const { pokedexModule } = await createMagnetarInstance('read')
    try {
      const queryModuleRef = await pokedexModule.where('base.HP', '>', 249).fetch()
      const actual = [...queryModuleRef.data.values()]
      const expected = [pokedex(113)]
      t.deepEqual(actual, expected as any)
      // also check the collection without query
      const actualDocCountWithoutQuery = pokedexModule.data.size
      const expectedDocCountWithoutQuery = expected.length + 1
      t.is(actualDocCountWithoutQuery, expectedDocCountWithoutQuery)
    } catch (error) {
      t.fail(error)
    }
  })
}
{
  const testName = 'fetch (collection) where-filter: >='
  test(testName, async (t) => {
    const { pokedexModule } = await createMagnetarInstance('read')
    try {
      const queryModuleRef = await pokedexModule.where('base.HP', '>=', 250).fetch()
      const actual = [...queryModuleRef.data.values()]
      const expected = [pokedex(113)]
      t.deepEqual(actual, expected as any)
      // also check the collection without query
      const actualDocCountWithoutQuery = pokedexModule.data.size
      const expectedDocCountWithoutQuery = expected.length + 1
      t.is(actualDocCountWithoutQuery, expectedDocCountWithoutQuery)
    } catch (error) {
      t.fail(error)
    }
  })
}
{
  const testName = 'fetch (collection) where-filter: array-contains'
  test(testName, async (t) => {
    const { pokedexModule } = await createMagnetarInstance('read')
    try {
      const queryModuleRef = await pokedexModule.where('type', 'array-contains', 'Steel').fetch()
      const actual = [...queryModuleRef.data.values()]
      const expected = [pokedex(81), pokedex(82)]
      t.deepEqual(actual, expected as any)
      // also check the collection without query
      const actualDocCountWithoutQuery = pokedexModule.data.size
      const expectedDocCountWithoutQuery = expected.length + 1
      t.is(actualDocCountWithoutQuery, expectedDocCountWithoutQuery)
    } catch (error) {
      t.fail(error)
    }
  })
}
{
  const testName = 'fetch (collection) where-filter: in'
  test(testName, async (t) => {
    const { pokedexModule } = await createMagnetarInstance('read')
    try {
      const queryModuleRef = await pokedexModule
        .where('name', 'in', ['Vaporeon', 'Jolteon', 'Flareon'])
        .fetch()
      const actual = [...queryModuleRef.data.values()]
      const expected = [pokedex(134), pokedex(135), pokedex(136)]
      t.deepEqual(actual, expected as any)
      // also check the collection without query
      const actualDocCountWithoutQuery = pokedexModule.data.size
      const expectedDocCountWithoutQuery = expected.length + 1
      t.is(actualDocCountWithoutQuery, expectedDocCountWithoutQuery)
    } catch (error) {
      t.fail(error)
    }
  })
}
{
  const testName = 'fetch (collection) where-filter: not-in'
  test(testName, async (t) => {
    const { pokedexModule } = await createMagnetarInstance('read')
    try {
      const queryModuleRef = await pokedexModule
        .orderBy('name')
        .where('name', 'not-in', ['Abra', 'Alakazam', 'Arcanine'])
        .limit(3)
        .fetch()
      const actual = [...queryModuleRef.data.values()]
      const expected = [pokedex(142), pokedex(24), pokedex(144)]
      t.deepEqual(actual, expected as any)
      // also check the collection without query
      const actualDocCountWithoutQuery = pokedexModule.data.size
      const expectedDocCountWithoutQuery = expected.length + 1
      t.is(actualDocCountWithoutQuery, expectedDocCountWithoutQuery)
    } catch (error) {
      t.fail(error)
    }
  })
}
{
  const testName = 'fetch (collection) where-filter: array-contains-any'
  test(testName, async (t) => {
    const { pokedexModule } = await createMagnetarInstance('read')
    try {
      const queryModuleRef = await pokedexModule
        .where('type', 'array-contains-any', ['Steel', 'Ice'])
        .orderBy('id', 'asc')
        .fetch(undefined, { onError: 'stop' })
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
      t.deepEqual(actual, expected as any)
      // also check the collection without query
      const actualDocCountWithoutQuery = pokedexModule.data.size
      const expectedDocCountWithoutQuery = expected.length + 1
      t.is(actualDocCountWithoutQuery, expectedDocCountWithoutQuery)
    } catch (error) {
      t.fail(error)
    }
  })
}
{
  const testName = 'fetch (collection) compound queries'
  test(testName, async (t) => {
    const { pokedexModule } = await createMagnetarInstance('read')
    try {
      const queryModuleRef = await pokedexModule
        .where('type', 'array-contains', 'Fire')
        .where('base.Speed', '>=', 100)
        .orderBy('base.Speed', 'asc')
        .fetch(undefined, { onError: 'stop' })
      const actual = [...queryModuleRef.data.values()].map((p) => p.base.Speed)
      const expected = [pokedex(6), pokedex(38), pokedex(78)].map((p) => p.base.Speed)
      t.deepEqual(actual, expected as any)
      // also check the collection without query
      const actualDocCountWithoutQuery = pokedexModule.data.size
      const expectedDocCountWithoutQuery = expected.length + 1
      t.is(actualDocCountWithoutQuery, expectedDocCountWithoutQuery)
    } catch (error) {
      t.fail(error)
    }
  })
}
{
  const testName = 'fetch (collection) orderBy + limit'
  test(testName, async (t) => {
    const { pokedexModule } = await createMagnetarInstance('read')
    try {
      const queryModuleRef = await pokedexModule
        .where('id', '<', 10)
        .orderBy('id', 'desc')
        .limit(10)
        .fetch(undefined, { onError: 'stop' })
      const actual = [...queryModuleRef.data.values()].map((p) => p.id)
      const expected = [
        pokedex(9),
        pokedex(8),
        pokedex(7),
        pokedex(6),
        pokedex(5),
        pokedex(4),
        pokedex(3),
        pokedex(2),
        pokedex(1),
      ].map((p) => p.id)
      t.deepEqual(actual, expected as any)
      // also check the collection without query
      const actualDocCountWithoutQuery = pokedexModule.data.size
      const expectedDocCountWithoutQuery = expected.length
      t.is(actualDocCountWithoutQuery, expectedDocCountWithoutQuery)
    } catch (error) {
      t.fail(error)
    }
  })
}
{
  const testName = 'fetch: errors are thrown'
  test(testName, async (t) => {
    const { pokedexModule } = await createMagnetarInstance('read-no-access')
    let error
    try {
      const a = await pokedexModule.fetch()
    } catch (_error) {
      error = _error
    }
    t.truthy(error)
  })
}
