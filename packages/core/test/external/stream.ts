import test from 'ava'
import { createVueSyncInstance } from '../helpers/createVueSyncInstance'
import { pokedex } from '../helpers/pokemon'
import { waitMs } from '../helpers/wait'

test('read: stream (collection)', async t => {
  const { pokedexModule } = createVueSyncInstance()
  t.deepEqual(pokedexModule.data.get('1'), pokedex(1))
  t.deepEqual(pokedexModule.data.size, 1)
  const payload = {}
  // do not await, because it only resolves when the stream is closed
  pokedexModule.stream(payload).catch(e => t.fail(e.message)) // prettier-ignore
  await waitMs(600)
  // close the stream:
  const unsubscribe = pokedexModule.openStreams[JSON.stringify(payload)]
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
  const unsubscribe = trainerModule.openStreams[JSON.stringify(streamPayload)]
  unsubscribe()

  t.deepEqual(trainerModule.data, { name: 'Luca', age: 10, dream: 'job' })
  await waitMs(1000)
  t.deepEqual(trainerModule.data, { name: 'Luca', age: 10, dream: 'job' })
  // {colour: 'blue'} should come in 3rd, but doesn't because we closed the stream
})
