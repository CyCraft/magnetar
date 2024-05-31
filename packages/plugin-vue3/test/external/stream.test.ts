import { pokedex, waitMs } from '@magnetarjs/test-utils'
import { assert, test } from 'vitest'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance.js'

test('stream (collection)', async () => {
  const { pokedexModule } = createMagnetarInstance()
  assert.deepEqual(pokedexModule.data.get('1'), pokedex(1))
  assert.deepEqual(pokedexModule.data.size, 1)

  // do not await, because it only resolves when the stream is closed
  pokedexModule.stream().catch((e: any) => assert.fail(e.message)) // prettier-ignore
  await waitMs(600)
  // close the stream:
  pokedexModule.closeStream()

  assert.deepEqual(pokedexModule.data.get('1'), pokedex(1))
  assert.deepEqual(pokedexModule.data.get('2'), pokedex(2))
  assert.deepEqual(pokedexModule.data.get('3'), pokedex(3))
  assert.deepEqual(pokedexModule.data.size, 3)
  await waitMs(1000)
  assert.deepEqual(pokedexModule.data.size, 3)
  // '4': charmander should come in next, but doesn't because we closed the stream
})

test('stream (doc)', async () => {
  const { trainerModule } = createMagnetarInstance()
  assert.deepEqual(trainerModule.data, { name: 'Luca', age: 10 })

  // do not await, because it only resolves when the stream is closed
  trainerModule.stream().catch((e: any) => assert.fail(e.message)) // prettier-ignore

  await waitMs(600)
  // close the stream:
  trainerModule.closeStream()

  assert.deepEqual(trainerModule.data, { name: 'Luca', age: 10, dream: 'job' })
  await waitMs(1000)
  assert.deepEqual(trainerModule.data, { name: 'Luca', age: 10, dream: 'job' })
  // {colour: 'blue'} should come in 3rd, but doesn't because we closed the stream
})

test('stream (collection) where-filter', async () => {
  const { pokedexModule } = createMagnetarInstance()
  // the original state has 1 Pokemon already
  assert.deepEqual(pokedexModule.data.size, 1)
  // let's get some more

  const pokedexModuleWithQuery = pokedexModule
    .where('type', 'array-contains', 'Fire')
    .where('base.Speed', '>=', 100)
  // → Charizard 6, Ninetales 38, Rapidash 78

  // do not await, because it only resolves when the stream is closed
  pokedexModuleWithQuery.stream().catch((e: any) => assert.fail(e.message))

  await waitMs(600)

  pokedexModule.where('type', 'array-contains', 'Fire').where('base.Speed', '>=', 100).closeStream()

  // the queried instance only has these 3 Pokemon
  assert.deepEqual(
    [...pokedexModuleWithQuery.data.values()],
    [pokedex(6), pokedex(38), pokedex(78)]
  )
  // the main instance has one Pokemon from the beginning
  assert.deepEqual(pokedexModule.data.size, 4)
})
