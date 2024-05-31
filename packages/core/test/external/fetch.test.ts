import { pokedex, waitMs } from '@magnetarjs/test-utils'
import { assert, test } from 'vitest'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance.js'

test('fetch (collection)', async () => {
  /// 'fetch' resolves once all stores have given a response with data
  const { pokedexModule } = createMagnetarInstance()
  assert.deepEqual(pokedexModule.doc('1').data, pokedex(1))
  assert.deepEqual(pokedexModule.doc('136').data, undefined)
  assert.deepEqual(pokedexModule.data.size, 1)

  try {
    await pokedexModule.fetch({ force: true })
  } catch (error) {
    assert.fail(JSON.stringify(error))
  }
  assert.deepEqual(pokedexModule.doc('1').data, pokedex(1))
  assert.deepEqual(pokedexModule.doc('136').data, pokedex(136))
  assert.deepEqual(pokedexModule.data.size, 151)
})

test('fetch (collection count)', async () => {
  /// 'fetch' resolves once all stores have given a response with data
  const { pokedexModule } = createMagnetarInstance()
  assert.deepEqual(pokedexModule.doc('1').data, pokedex(1))
  assert.deepEqual(pokedexModule.doc('136').data, undefined)
  assert.deepEqual(pokedexModule.data.size, 1)
  assert.deepEqual(pokedexModule.count, 1)

  try {
    await pokedexModule.fetchCount()
  } catch (error) {
    console.error(error)
    assert.fail(JSON.stringify(error))
  }
  assert.deepEqual(pokedexModule.doc('1').data, pokedex(1))
  assert.deepEqual(pokedexModule.doc('136').data, undefined)
  assert.deepEqual(pokedexModule.data.size, 1)
  assert.deepEqual(pokedexModule.count, 151)
})

test('fetch (document)', async () => {
  /// get resolves once all stores have given a response with data
  const { trainerModule } = createMagnetarInstance()
  assert.deepEqual(trainerModule.data, { name: 'Luca', age: 10 })
  try {
    await trainerModule.fetch({ force: true })
  } catch (error) {
    assert.fail(JSON.stringify(error))
  }
  assert.deepEqual(trainerModule.data, { name: 'Luca', age: 10, dream: 'job' })
})

test('fetch (collection) where-filter: ==', async () => {
  const { pokedexModule } = createMagnetarInstance()
  try {
    const queryModuleRef = pokedexModule.where('name', '==', 'Flareon')
    await queryModuleRef.fetch({ force: true })
    const actual = [...queryModuleRef.data.values()]
    const expected = [pokedex(136)]
    assert.deepEqual(actual, expected as any)
  } catch (error) {
    assert.fail(JSON.stringify(error))
  }
})

test('fetch with different where-filters after opening a stream', async () => {
  const { pokedexModule } = createMagnetarInstance()
  try {
    pokedexModule.where('name', '==', 'Flareon').stream()
    await waitMs(1000)
    const queryModuleRef = pokedexModule.where('name', '==', 'Flareon').where('id', '==', 136)
    await queryModuleRef.fetch({ force: true })
    const actual = [...queryModuleRef.data.values()]
    const expected = [pokedex(136)]
    assert.deepEqual(actual, expected as any)
  } catch (error) {
    assert.fail(JSON.stringify(error))
  }
})

test('fetch (collection) where-filter: !=', async () => {
  const { pokedexModule } = createMagnetarInstance()
  try {
    const queryModuleRef = pokedexModule.where('name', '!=', 'Bulbasaur').limit(1)
    await queryModuleRef.fetch({ force: true })
    const actual = [...queryModuleRef.data.values()]
    const expected = [pokedex(2)]
    assert.deepEqual(actual, expected as any)
  } catch (error) {
    assert.fail(JSON.stringify(error))
  }
})

test('fetch (collection) where-filter: == nested', async () => {
  const { pokedexModule } = createMagnetarInstance()
  try {
    const queryModuleRef = pokedexModule.where('base.HP', '==', 10)
    await queryModuleRef.fetch({ force: true })
    const actual = [...queryModuleRef.data.values()]
    const expected = [pokedex(50)]
    assert.deepEqual(actual, expected as any)
  } catch (error) {
    assert.fail(JSON.stringify(error))
  }
})

test('fetch (collection) where-filter: <', async () => {
  const { pokedexModule } = createMagnetarInstance()
  try {
    const queryModuleRef = pokedexModule.where('base.HP', '<', 11)
    await queryModuleRef.fetch({ force: true })
    const actual = [...queryModuleRef.data.values()]
    const expected = [pokedex(50)]
    assert.deepEqual(actual, expected as any)
  } catch (error) {
    assert.fail(JSON.stringify(error))
  }
})

test('fetch (collection) where-filter: <=', async () => {
  const { pokedexModule } = createMagnetarInstance()
  try {
    const queryModuleRef = pokedexModule.where('base.HP', '<=', 10)
    await queryModuleRef.fetch({ force: true })
    const actual = [...queryModuleRef.data.values()]
    const expected = [pokedex(50)]
    assert.deepEqual(actual, expected as any)
  } catch (error) {
    assert.fail(JSON.stringify(error))
  }
})

test('fetch (collection) where-filter: >', async () => {
  const { pokedexModule } = createMagnetarInstance()
  try {
    const queryModuleRef = pokedexModule.where('base.HP', '>', 249)
    await queryModuleRef.fetch({ force: true })
    const actual = [...queryModuleRef.data.values()]
    const expected = [pokedex(113)]
    assert.deepEqual(actual, expected as any)
  } catch (error) {
    assert.fail(JSON.stringify(error))
  }
})

test('fetch (collection) where-filter: >=', async () => {
  const { pokedexModule } = createMagnetarInstance()
  try {
    const queryModuleRef = pokedexModule.where('base.HP', '>=', 250)
    await queryModuleRef.fetch({ force: true })
    const actual = [...queryModuleRef.data.values()]
    const expected = [pokedex(113)]
    assert.deepEqual(actual, expected as any)
  } catch (error) {
    assert.fail(JSON.stringify(error))
  }
})

test('fetch (collection) where-filter: array-contains', async () => {
  const { pokedexModule } = createMagnetarInstance()
  try {
    const queryModuleRef = pokedexModule.where('type', 'array-contains', 'Steel')
    await queryModuleRef.fetch({ force: true })
    const actual = [...queryModuleRef.data.values()]
    const expected = [pokedex(81), pokedex(82)]
    assert.deepEqual(actual, expected as any)
  } catch (error) {
    assert.fail(JSON.stringify(error))
  }
})

test('fetch (collection) where-filter: in', async () => {
  const { pokedexModule } = createMagnetarInstance()
  try {
    const queryModuleRef = pokedexModule.where('name', 'in', ['Vaporeon', 'Jolteon', 'Flareon'])
    await queryModuleRef.fetch({ force: true })
    const actual = [...queryModuleRef.data.values()]
    const expected = [pokedex(134), pokedex(135), pokedex(136)]
    assert.deepEqual(actual, expected as any)
  } catch (error) {
    assert.fail(JSON.stringify(error))
  }
})

test('fetch (collection) where-filter: not-in', async () => {
  const { pokedexModule } = createMagnetarInstance()
  try {
    const queryModuleRef = pokedexModule
      .where('type', 'array-contains-any', ['Steel', 'Ice'])
      .where('name', 'not-in', [pokedex(81).name, pokedex(82).name, pokedex(91).name])
    await queryModuleRef.fetch({ force: true })
    const actual = [...queryModuleRef.data.values()]
    const expected = [pokedex(87), pokedex(124), pokedex(131), pokedex(144)]
    assert.deepEqual(actual, expected as any)
  } catch (error) {
    assert.fail(JSON.stringify(error))
  }
})

test('fetch (collection) where-filter: array-contains-any', async () => {
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
    assert.deepEqual(actual, expected as any)
  } catch (error) {
    assert.fail(JSON.stringify(error))
  }
})

test('fetch (collection) compound queries', async () => {
  const { pokedexModule } = createMagnetarInstance()
  try {
    const queryModuleRef = pokedexModule
      .where('type', 'array-contains', 'Fire')
      .where('base.Speed', '>=', 100)
    await queryModuleRef.fetch({ force: true })
    const actual = [...queryModuleRef.data.values()]
    const expected = [pokedex(6), pokedex(38), pokedex(78)]
    assert.deepEqual(actual, expected as any)
  } catch (error) {
    assert.fail(JSON.stringify(error))
  }
})

test('fetch (collection) orderBy', async () => {
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
    assert.deepEqual(actual, expected as any)
  } catch (error) {
    assert.fail(JSON.stringify(error))
  }
})

test('fetch (collection) limit', async () => {
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
    assert.deepEqual(actual, expected as any)
  } catch (error) {
    assert.fail(JSON.stringify(error))
  }
})
