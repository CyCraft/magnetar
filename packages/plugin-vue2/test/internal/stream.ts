import test from 'ava'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance'
import { pokedex, waitMs } from '@magnetarjs/test-utils'

test('stream (collection)', async (t) => {
  const { pokedexModule } = createMagnetarInstance()
  t.deepEqual(pokedexModule.data.get('1'), pokedex(1))
  t.deepEqual(pokedexModule.data.size, 1)

  // do not await, because it only resolves when the stream is closed
  pokedexModule.stream().catch((e: any) => t.fail(e.message)) // prettier-ignore
  await waitMs(600)
  // close the stream:
  pokedexModule.closeStream()

  t.deepEqual(pokedexModule.data.get('1'), pokedex(1))
  t.deepEqual(pokedexModule.data.get('2'), pokedex(2))
  t.deepEqual(pokedexModule.data.get('3'), pokedex(3))
  t.deepEqual(pokedexModule.data.size, 3)
  await waitMs(1000)
  t.deepEqual(pokedexModule.data.size, 3)
  // '4': charmander should come in next, but doesn't because we closed the stream
})

test('stream (doc)', async (t) => {
  const { trainerModule } = createMagnetarInstance()
  t.deepEqual(trainerModule.data, { name: 'Luca', age: 10 })

  // do not await, because it only resolves when the stream is closed
  trainerModule.stream().catch((e: any) => t.fail(e.message)) // prettier-ignore

  await waitMs(600)
  // close the stream:
  trainerModule.closeStream()

  t.deepEqual(trainerModule.data, { name: 'Luca', age: 10, dream: 'job' })
  await waitMs(1000)
  t.deepEqual(trainerModule.data, { name: 'Luca', age: 10, dream: 'job' })
  // {colour: 'blue'} should come in 3rd, but doesn't because we closed the stream
})

test('stream (collection) where-filter', async (t) => {
  const { pokedexModule } = createMagnetarInstance()
  // the original state has 1 Pokemon already
  t.deepEqual(pokedexModule.data.size, 1)
  // let's get some more

  const pokedexModuleWithQuery = pokedexModule
    .where('type', 'array-contains', 'Fire')
    .where('base.Speed', '>=', 100)
  // → Charizard 6, Ninetales 38, Rapidash 78

  // do not await, because it only resolves when the stream is closed
  pokedexModuleWithQuery.stream().catch((e: any) => t.fail(e.message))

  await waitMs(600)

  pokedexModule.where('type', 'array-contains', 'Fire').where('base.Speed', '>=', 100).closeStream()

  // the queried instance only has these 3 Pokemon
  t.deepEqual([...pokedexModuleWithQuery.data.values()], [pokedex(6), pokedex(38), pokedex(78)])
  // the main instance has one Pokemon from the beginning
  t.deepEqual(pokedexModule.data.size, 4)
})
