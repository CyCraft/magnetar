import test from 'ava'
import { createVueSyncInstance } from './helpers/createVueSyncInstance'
import { pokedex } from './helpers/pokedex'
import { waitMs } from './helpers/wait'

test('stream (collection)', async t => {
  const { pokedexModule } = createVueSyncInstance()
  t.deepEqual(pokedexModule.data.get('1'), pokedex(1))
  t.deepEqual(pokedexModule.data.size, 1)
  const payload = {}
  // do not await, because it only resolves when the stream is closed
  pokedexModule.stream(payload).catch(e => t.fail(e.message)) // prettier-ignore
  await waitMs(600)
  // close the stream:
  const unsubscribe = pokedexModule.openStreams.get(payload)
  unsubscribe()
  t.deepEqual(pokedexModule.data.get('1'), pokedex(1))
  t.deepEqual(pokedexModule.data.get('2'), pokedex(2))
  t.deepEqual(pokedexModule.data.get('3'), pokedex(3))
  t.deepEqual(pokedexModule.data.size, 3)
  await waitMs(1000)
  t.deepEqual(pokedexModule.data.size, 3)
  // '4': charmander should come in next, but doesn't because we closed the stream
})

test('stream (doc)', async t => {
  const { trainerModule } = createVueSyncInstance()
  t.deepEqual(trainerModule.data, { name: 'Luca', age: 10 })
  const streamPayload = {}

  // do not await, because it only resolves when the stream is closed
  trainerModule.stream(streamPayload).catch(e => t.fail(e.message)) // prettier-ignore

  await waitMs(600)
  // close the stream:
  const unsubscribe = trainerModule.openStreams.get(streamPayload)
  unsubscribe()

  t.deepEqual(trainerModule.data, { name: 'Luca', age: 10, dream: 'job' })
  await waitMs(1000)
  t.deepEqual(trainerModule.data, { name: 'Luca', age: 10, dream: 'job' })
  // {colour: 'blue'} should come in 3rd, but doesn't because we closed the stream
})

test('stream (collection) where-filter', async t => {
  const { pokedexModule } = createVueSyncInstance()
  // the original state has 1 pokemon already
  t.deepEqual(pokedexModule.data.size, 1)
  // let's get some more
  const payload = {}
  const pokedexModuleWithQuery = pokedexModule
    .where('type', 'array-contains', 'Fire')
    .where('base.Speed', '>=', 100)
  // → Charizard 6, Ninetales 38, Rapidash 78

  // do not await, because it only resolves when the stream is closed
  pokedexModuleWithQuery.stream(payload).catch(e => t.fail(e.message))

  await waitMs(600)
  // the unsubscribe function to close the stream can be retrieved from the openStreams map with the "payload" as key
  const unsubscribe = pokedexModule
    .where('type', 'array-contains', 'Fire')
    .where('base.Speed', '>=', 100)
    .openStreams.get(payload)
  // unsubscribe from the stream:
  unsubscribe()
  // the queried instance only has these 3 pokemon
  t.deepEqual([...pokedexModuleWithQuery.data.values()], [pokedex(6), pokedex(38), pokedex(78)])
  // the main instance has one pokemon from the beginning
  t.deepEqual(pokedexModule.data.size, 4)
})
