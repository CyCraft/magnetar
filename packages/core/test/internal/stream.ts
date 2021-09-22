import test from 'ava'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance'
import { pokedex, waitMs } from '@magnetarjs/test-utils'
import { isPromise } from 'is-what'

test('stream (collection)', async (t) => {
  const { pokedexModule } = createMagnetarInstance()
  t.deepEqual(pokedexModule.data.get('1'), pokedex(1))
  t.is(pokedexModule.data.size, 1)
  const streamId = {}
  // do not await, because it only resolves when the stream is closed
  pokedexModule.stream(streamId).catch((e: any) => t.fail(e.message)) // prettier-ignore
  await waitMs(600)
  // close the stream:
  pokedexModule.closeStream()

  t.deepEqual(pokedexModule.data.get('1'), pokedex(1))
  t.deepEqual(pokedexModule.data.get('2'), pokedex(2))
  t.deepEqual(pokedexModule.data.get('3'), pokedex(3))
  t.is(pokedexModule.data.size, 3)
  await waitMs(1000)
  t.is(pokedexModule.data.size, 3)
  // '4': charmander should come in next, but doesn't because we closed the stream
})

test('stream (doc)', async (t) => {
  const { trainerModule } = createMagnetarInstance()
  t.deepEqual(trainerModule.data, { name: 'Luca', age: 10 })
  const streamId = {}
  // do not await, because it only resolves when the stream is closed
  trainerModule.stream(streamId).catch((e: any) => t.fail(e.message)) // prettier-ignore
  await waitMs(600)
  // close the stream:
  trainerModule.closeStream()

  t.deepEqual(trainerModule.data, { name: 'Luca', age: 10, dream: 'job' })
  await waitMs(1000)
  t.deepEqual(trainerModule.data, { name: 'Luca', age: 10, dream: 'job' })
  // {colour: 'blue'} should come in 3rd, but doesn't because we closed the stream
})

test('stream (collection) where-filter stream doesnt affect base collection', async (t) => {
  const { pokedexModule } = createMagnetarInstance()
  t.deepEqual(pokedexModule.streaming(), null)

  const collection = pokedexModule
    .where('type', 'array-contains', 'Fire')
    .where('base.Speed', '>=', 100)

  collection.stream()

  await waitMs(1)

  t.deepEqual(isPromise(collection.streaming()), true)
  t.deepEqual(pokedexModule.streaming(), null)

  collection.closeStream()
  t.deepEqual(collection.streaming(), null)
})
