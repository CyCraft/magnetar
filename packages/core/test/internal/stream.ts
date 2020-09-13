import test from 'ava'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance'
import { pokedex, waitMs } from 'test-utils'
import { isFunction } from 'is-what'

test('stream (collection)', async (t) => {
  const { pokedexModule } = createMagnetarInstance()
  t.deepEqual(pokedexModule.data.get('1'), pokedex(1))
  t.is(pokedexModule.data.size, 1)
  const streamId = {}
  // do not await, because it only resolves when the stream is closed
  pokedexModule.stream(streamId).catch((e: any) => t.fail(e.message)) // prettier-ignore
  await waitMs(600)
  // close the stream:
  const closeStream = pokedexModule.openStreams.get(streamId)
  if (closeStream) closeStream()
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
  const closeStream = trainerModule.openStreams.get(streamId)
  t.true(isFunction(closeStream))
  if (closeStream) closeStream()
  t.deepEqual(trainerModule.data, { name: 'Luca', age: 10, dream: 'job' })
  await waitMs(1000)
  t.deepEqual(trainerModule.data, { name: 'Luca', age: 10, dream: 'job' })
  // {colour: 'blue'} should come in 3rd, but doesn't because we closed the stream
})

test('stream does not leave closeStream function in memory', async (t) => {
  const { pokedexModule } = createMagnetarInstance()
  t.is(pokedexModule.openStreams.size, 0)
  // do not await, because it only resolves when the stream is closed
  pokedexModule.stream().catch((e: any) => t.fail(e.message)) // prettier-ignore
  await waitMs(1)
  // close the stream:
  t.is(pokedexModule.openStreams.size, 1)
  const closeStream = pokedexModule.findStream()
  if (closeStream) closeStream()
  t.is(pokedexModule.openStreams.size, 0)
})

test('opening the same stream twice will pass on the promise of the first stream without stream payload', async (t) => {
  const { pokedexModule } = createMagnetarInstance()
  t.is(pokedexModule.openStreams.size, 0)
  // do not await, because it only resolves when the stream is closed
  pokedexModule.stream().catch((e: any) => t.fail(e.message)) // prettier-ignore
  await waitMs(1)
  pokedexModule.stream().catch((e: any) => t.fail(e.message)) // prettier-ignore
  await waitMs(1)
  t.is(pokedexModule.openStreams.size, 1)
  // close the stream:
  const closeStream = pokedexModule.findStream()
  if (closeStream) closeStream()
  t.is(pokedexModule.openStreams.size, 0)
})

test('opening the same stream twice will pass on the promise of the first stream with complex stream payload', async (t) => {
  const { pokedexModule } = createMagnetarInstance()
  t.is(pokedexModule.openStreams.size, 0)
  // do not await, because it only resolves when the stream is closed
  pokedexModule.stream({ complex: { nested: { stream: 1 } }, open: true }).catch((e: any) => t.fail(e.message)) // prettier-ignore
  await waitMs(1)
  pokedexModule.stream({ complex: { nested: { stream: 1 } }, open: true }).catch((e: any) => t.fail(e.message)) // prettier-ignore
  await waitMs(1)
  t.is(pokedexModule.openStreams.size, 1)
  // close the stream:
  const closeStream = pokedexModule.findStream({ complex: { nested: { stream: 1 } }, open: true })
  if (closeStream) closeStream()
  t.is(pokedexModule.openStreams.size, 0)
})

test('can find an open stream - empty object', async (t) => {
  const { pokedexModule } = createMagnetarInstance()
  t.is(pokedexModule.openStreams.size, 0)
  // do not await, because it only resolves when the stream is closed
  pokedexModule.stream({}).catch((e: any) => t.fail(e.message)) // prettier-ignore
  await waitMs(1)
  t.is(pokedexModule.openStreams.size, 1)
  // close the stream:
  const closeStream = pokedexModule.findStream({})
  t.true(isFunction(closeStream))
  if (closeStream) closeStream()
  t.is(pokedexModule.openStreams.size, 0)
})

test('can find an open stream - undefined', async (t) => {
  const { pokedexModule } = createMagnetarInstance()
  t.is(pokedexModule.openStreams.size, 0)
  // do not await, because it only resolves when the stream is closed
  pokedexModule.stream(undefined).catch((e: any) => t.fail(e.message)) // prettier-ignore
  await waitMs(1)
  t.is(pokedexModule.openStreams.size, 1)
  // close the stream:
  const closeStream = pokedexModule.findStream(undefined)
  t.true(isFunction(closeStream))
  if (closeStream) closeStream()
  t.is(pokedexModule.openStreams.size, 0)
})

test('can find an open stream - void', async (t) => {
  const { pokedexModule } = createMagnetarInstance()
  t.is(pokedexModule.openStreams.size, 0)
  // do not await, because it only resolves when the stream is closed
  pokedexModule.stream().catch((e: any) => t.fail(e.message)) // prettier-ignore
  await waitMs(1)
  t.is(pokedexModule.openStreams.size, 1)
  // close the stream:
  const closeStream = pokedexModule.findStream()
  t.true(isFunction(closeStream))
  if (closeStream) closeStream()
  t.is(pokedexModule.openStreams.size, 0)
})

test('can find an open stream - string', async (t) => {
  const { pokedexModule } = createMagnetarInstance()
  t.is(pokedexModule.openStreams.size, 0)
  // do not await, because it only resolves when the stream is closed
  pokedexModule.stream('myStreamId').catch((e: any) => t.fail(e.message)) // prettier-ignore
  await waitMs(1)
  t.is(pokedexModule.openStreams.size, 1)
  // close the stream:
  const closeStream = pokedexModule.findStream('myStreamId')
  t.true(isFunction(closeStream))
  if (closeStream) closeStream()
  t.is(pokedexModule.openStreams.size, 0)
})

test('can find an open stream - complex object', async (t) => {
  const { pokedexModule } = createMagnetarInstance()
  t.is(pokedexModule.openStreams.size, 0)
  // do not await, because it only resolves when the stream is closed
  pokedexModule.stream({ complex: { nested: { stream: 1 } }, open: true }).catch((e: any) => t.fail(e.message)) // prettier-ignore
  await waitMs(1)
  t.is(pokedexModule.openStreams.size, 1)
  // close the stream:
  const closeStream = pokedexModule.findStream({ complex: { nested: { stream: 1 } }, open: true })
  t.true(isFunction(closeStream))
  if (closeStream) closeStream()
  t.is(pokedexModule.openStreams.size, 0)
})
