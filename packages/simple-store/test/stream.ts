import test from 'ava'
import { createVueSyncInstance } from './helpers/createVueSyncInstance'
import { bulbasaur, flareon } from './helpers/pokemon'
import { waitMs } from './helpers/wait'
import { isModuleDataEqual } from './helpers/compareModuleData'

test('stream (collection)', async t => {
  const { pokedexModule, vueSync } = createVueSyncInstance()
  isModuleDataEqual(t, vueSync, 'pokedex/001', bulbasaur)
  t.deepEqual(pokedexModule.data.size, 1)
  const streamPayload = {}

  // do not await, because it only resolves when the stream is closed
  pokedexModule.stream(streamPayload).catch(e => t.fail(e.message)) // prettier-ignore

  await waitMs(600)
  // close the stream:
  const unsubscribe = pokedexModule.openStreams[JSON.stringify(streamPayload)]
  unsubscribe()

  isModuleDataEqual(t, vueSync, 'pokedex/001', bulbasaur)
  isModuleDataEqual(t, vueSync, 'pokedex/136', flareon)
  t.deepEqual(pokedexModule.data.size, 2)
  await waitMs(1000)
  t.deepEqual(pokedexModule.data.size, 2)
  // '004': charmander should come in 3rd, but doesn't because we closed the stream
})

test('stream (doc)', async t => {
  const { trainerModule, vueSync } = createVueSyncInstance()
  isModuleDataEqual(t, vueSync, 'data/trainer', { name: 'Luca', age: 10 })
  const streamPayload = {}

  // do not await, because it only resolves when the stream is closed
  trainerModule.stream(streamPayload).catch(e => t.fail(e.message)) // prettier-ignore

  await waitMs(600)
  // close the stream:
  const unsubscribe = trainerModule.openStreams[JSON.stringify(streamPayload)]
  unsubscribe()

  isModuleDataEqual(t, vueSync, 'data/trainer', { name: 'Luca', age: 10, dream: 'job' })
  await waitMs(1000)
  isModuleDataEqual(t, vueSync, 'data/trainer', { name: 'Luca', age: 10, dream: 'job' })
  // {colour: 'blue'} should come in 3rd, but doesn't because we closed the stream
})
