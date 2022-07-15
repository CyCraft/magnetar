import test from 'ava'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance'
import { pokedex } from '@magnetarjs/test-utils'

test('fetch (collection)', async (t) => {
  /// 'fetch' resolves once all stores have given a response with data
  const { pokedexModule } = createMagnetarInstance()
  t.deepEqual(pokedexModule.doc('1').data, pokedex(1))
  t.deepEqual(pokedexModule.doc('136').data, undefined)
  t.deepEqual(pokedexModule.data.size, 1)

  try {
    await pokedexModule.fetch({ force: true })
  } catch (error) {
    t.fail(JSON.stringify(error))
  }
  t.deepEqual(pokedexModule.doc('1').data, pokedex(1))
  t.deepEqual(pokedexModule.doc('136').data, pokedex(136))
  t.deepEqual(pokedexModule.data.size, 151)
})

test('fetch (document)', async (t) => {
  /// get resolves once all stores have given a response with data
  const { trainerModule } = createMagnetarInstance()
  t.deepEqual(trainerModule.data, { name: 'Luca', age: 10 })
  try {
    await trainerModule.fetch({ force: true })
  } catch (error) {
    t.fail(JSON.stringify(error))
  }
  t.deepEqual(trainerModule.data, { name: 'Luca', age: 10, dream: 'job' })
})

test('fetch (document) if unfetched', async (t) => {
  /// get resolves once all stores have given a response with data
  const { trainerModule } = createMagnetarInstance()
  t.deepEqual(trainerModule.data, { name: 'Luca', age: 10 })
  try {
    await trainerModule.fetch()
  } catch (error) {
    t.fail(JSON.stringify(error))
  }
  t.deepEqual(trainerModule.data, { name: 'Luca', age: 10 })
})

test('fetch (collection) where-filter: ==', async (t) => {
  const { pokedexModule } = createMagnetarInstance()
  try {
    const queryModuleRef = pokedexModule.where('name', '==', 'Flareon')
    await queryModuleRef.fetch({ force: true })
    const actual = [...queryModuleRef.data.values()]
    const expected = [pokedex(136)]
    t.deepEqual(actual, expected as any)
  } catch (error) {
    t.fail(JSON.stringify(error))
  }
})

test('fetch (collection) where-filter: !=', async (t) => {
  const { pokedexModule } = createMagnetarInstance()
  try {
    const queryModuleRef = pokedexModule.where('name', '!=', 'Bulbasaur').limit(1)
    await queryModuleRef.fetch({ force: true })
    const actual = [...queryModuleRef.data.values()]
    const expected = [pokedex(2)]
    t.deepEqual(actual, expected as any)
  } catch (error) {
    t.fail(JSON.stringify(error))
  }
})

test('fetch (collection) where-filter: == nested', async (t) => {
  const { pokedexModule } = createMagnetarInstance()
  try {
    const queryModuleRef = pokedexModule.where('base.HP', '==', 10)
    await queryModuleRef.fetch({ force: true })
    const actual = [...queryModuleRef.data.values()]
    const expected = [pokedex(50)]
    t.deepEqual(actual, expected as any)
  } catch (error) {
    t.fail(JSON.stringify(error))
  }
})

test('fetch (collection) where-filter: <', async (t) => {
  const { pokedexModule } = createMagnetarInstance()
  try {
    const queryModuleRef = pokedexModule.where('base.HP', '<', 11)
    await queryModuleRef.fetch({ force: true })
    const actual = [...queryModuleRef.data.values()]
    const expected = [pokedex(50)]
    t.deepEqual(actual, expected as any)
  } catch (error) {
    t.fail(JSON.stringify(error))
  }
})

test('fetch (collection) where-filter: <=', async (t) => {
  const { pokedexModule } = createMagnetarInstance()
  try {
    const queryModuleRef = pokedexModule.where('base.HP', '<=', 10)
    await queryModuleRef.fetch({ force: true })
    const actual = [...queryModuleRef.data.values()]
    const expected = [pokedex(50)]
    t.deepEqual(actual, expected as any)
  } catch (error) {
    t.fail(JSON.stringify(error))
  }
})

test('fetch (collection) where-filter: >', async (t) => {
  const { pokedexModule } = createMagnetarInstance()
  try {
    const queryModuleRef = pokedexModule.where('base.HP', '>', 249)
    await queryModuleRef.fetch({ force: true })
    const actual = [...queryModuleRef.data.values()]
    const expected = [pokedex(113)]
    t.deepEqual(actual, expected as any)
  } catch (error) {
    t.fail(JSON.stringify(error))
  }
})

test('fetch (collection) where-filter: >=', async (t) => {
  const { pokedexModule } = createMagnetarInstance()
  try {
    const queryModuleRef = pokedexModule.where('base.HP', '>=', 250)
    await queryModuleRef.fetch({ force: true })
    const actual = [...queryModuleRef.data.values()]
    const expected = [pokedex(113)]
    t.deepEqual(actual, expected as any)
  } catch (error) {
    t.fail(JSON.stringify(error))
  }
})

test('fetch (collection) where-filter: array-contains', async (t) => {
  const { pokedexModule } = createMagnetarInstance()
  try {
    const queryModuleRef = pokedexModule.where('type', 'array-contains', 'Steel')
    await queryModuleRef.fetch({ force: true })
    const actual = [...queryModuleRef.data.values()]
    const expected = [pokedex(81), pokedex(82)]
    t.deepEqual(actual, expected as any)
  } catch (error) {
    t.fail(JSON.stringify(error))
  }
})

test('fetch (collection) where-filter: in', async (t) => {
  const { pokedexModule } = createMagnetarInstance()
  try {
    const queryModuleRef = pokedexModule.where('name', 'in', ['Vaporeon', 'Jolteon', 'Flareon'])
    await queryModuleRef.fetch({ force: true })
    const actual = [...queryModuleRef.data.values()]
    const expected = [pokedex(134), pokedex(135), pokedex(136)]
    t.deepEqual(actual, expected as any)
  } catch (error) {
    t.fail(JSON.stringify(error))
  }
})

test('fetch (collection) where-filter: not-in', async (t) => {
  const { pokedexModule } = createMagnetarInstance()
  try {
    const queryModuleRef = pokedexModule
      .where('type', 'array-contains', 'Ice')
      .where('name', 'not-in', [pokedex(91).name, pokedex(131).name])
    await queryModuleRef.fetch({ force: true })
    const actual = [...queryModuleRef.data.values()]
    const expected = [pokedex(87), pokedex(124), pokedex(144)]
    t.deepEqual(actual, expected as any)
  } catch (error) {
    t.fail(JSON.stringify(error))
  }
})

test('fetch (collection) where-filter: array-contains-any', async (t) => {
  const { pokedexModule } = createMagnetarInstance()
  try {
    const queryModuleRef = pokedexModule.where('type', 'array-contains-any', ['Steel', 'Ice'])
    await queryModuleRef.fetch({ force: true })
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
  } catch (error) {
    t.fail(JSON.stringify(error))
  }
})

test('fetch (collection) compound queries', async (t) => {
  const { pokedexModule } = createMagnetarInstance()
  try {
    const queryModuleRef = pokedexModule
      .where('type', 'array-contains', 'Fire')
      .where('base.Speed', '>=', 100)
    await queryModuleRef.fetch({ force: true })
    const actual = [...queryModuleRef.data.values()]
    const expected = [pokedex(6), pokedex(38), pokedex(78)]
    t.deepEqual(actual, expected as any)
  } catch (error) {
    t.fail(JSON.stringify(error))
  }
})

test('fetch (collection) orderBy', async (t) => {
  const { pokedexModule } = createMagnetarInstance()
  try {
    const queryModuleRef = pokedexModule
      .where('type', 'array-contains', 'Fire')
      .where('base.Speed', '>=', 100)
      .orderBy('name', 'desc')
    await queryModuleRef.fetch({ force: true })
    // Rapidash 78
    // Ninetales 38
    // Charizard 6
    const actual = [...queryModuleRef.data.values()]
    const expected = [pokedex(78), pokedex(38), pokedex(6)]
    t.deepEqual(actual, expected as any)
  } catch (error) {
    t.fail(JSON.stringify(error))
  }
})

test('fetch (collection) limit', async (t) => {
  const { pokedexModule } = createMagnetarInstance()
  try {
    const queryModuleRef = pokedexModule.limit(10)
    await queryModuleRef.fetch({ force: true })
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
    t.deepEqual(actual, expected as any)
  } catch (error) {
    t.fail(JSON.stringify(error))
  }
})

test('fetch (collection) startAfter', async (t) => {
  const { pokedexModule } = createMagnetarInstance()
  try {
    const queryModuleRef = pokedexModule.orderBy('id').startAfter(4).limit(5)
    await queryModuleRef.fetch({ force: true })

    const actual = [...queryModuleRef.data.values()]
    const expected = [
      // 1 is the initial data
      pokedex(1),
      pokedex(5),
      pokedex(6),
      pokedex(7),
      pokedex(8),
    ]
    t.deepEqual(actual, expected as any)
  } catch (error) {
    t.fail(JSON.stringify(error))
  }
})

test('fetch (collection) fetchMore', async (t) => {
  const { pokedexModule } = createMagnetarInstance()
  try {
    const queryModuleRef = pokedexModule.orderBy('id').limit(5)
    const result = await queryModuleRef.fetchMore()

    const actual = [...queryModuleRef.data.values()]
    const expected = [pokedex(1), pokedex(2), pokedex(3), pokedex(4), pokedex(5)]
    t.deepEqual(actual, expected as any)
    t.deepEqual(result, expected as any)

    const result2 = await queryModuleRef.fetchMore()
    const actual2 = [...queryModuleRef.data.values()]
    const expected2 = [
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
    t.deepEqual(actual2, expected2 as any)
    t.deepEqual(result2, [pokedex(6), pokedex(7), pokedex(8), pokedex(9), pokedex(10)] as any)
  } catch (error) {
    t.fail(JSON.stringify(error))
  }
})
