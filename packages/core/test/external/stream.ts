import test from 'ava'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance'
import { pokedex, waitMs } from '@magnetarjs/test-utils'
import { isPromise } from 'is-what'

test('stream (collection)', async (t) => {
  const { pokedexModule } = createMagnetarInstance()
  t.deepEqual(pokedexModule.data.get('1'), pokedex(1))
  t.deepEqual(pokedexModule.data.size, 1)
  t.deepEqual(pokedexModule.streaming(), null)

  // do not await, because it only resolves when the stream is closed
  pokedexModule.stream().catch((e: any) => t.fail(e.message)) // prettier-ignore

  // hold the stream open for 600ms
  await waitMs(600)

  // the stream promise is now also available here:
  t.deepEqual(isPromise(pokedexModule.streaming()), true)

  // close the stream:
  pokedexModule.closeStream()

  t.deepEqual(pokedexModule.streaming(), null)

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
  t.deepEqual(trainerModule.streaming(), null)

  // do not await, because it only resolves when the stream is closed
  trainerModule.stream().catch((e: any) => t.fail(e.message)) // prettier-ignore

  // hold the stream open for 600ms
  await waitMs(600)

  // the stream promise is now also available here:
  t.deepEqual(isPromise(trainerModule.streaming()), true)

  // close the stream:
  trainerModule.closeStream()

  t.deepEqual(trainerModule.streaming(), null)

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

  // be careful, the `streaming` promise and `closeStream` function
  // are only available on the module with the same query:
  t.deepEqual(isPromise(pokedexModuleWithQuery.streaming()), true)
  t.deepEqual(pokedexModule.streaming(), null)

  pokedexModuleWithQuery.closeStream()

  // the queried instance only has these 3 Pokemon
  t.deepEqual([...pokedexModuleWithQuery.data.values()], [pokedex(6), pokedex(38), pokedex(78)])

  // the main instance has one Pokemon from the beginning
  t.deepEqual(pokedexModule.data.size, 4)
})

test('stream (collection) - can open multiple streams at once', async (t) => {
  const { pokedexModule } = createMagnetarInstance()

  const pokedexModuleWithQuery = pokedexModule
    .where('type', 'array-contains', 'Fire')
    .where('base.Speed', '>=', 100)

  pokedexModule.stream().catch((e: any) => t.fail(e.message))
  pokedexModuleWithQuery.stream().catch((e: any) => t.fail(e.message))

  await waitMs(1)

  t.deepEqual(isPromise(pokedexModule.streaming()), true)
  t.deepEqual(isPromise(pokedexModuleWithQuery.streaming()), true)

  pokedexModule.closeAllStreams()

  t.deepEqual(pokedexModule.streaming(), null)
  t.deepEqual(pokedexModuleWithQuery.streaming(), null)
})
