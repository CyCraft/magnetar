import { pokedex, waitMs } from '@magnetarjs/test-utils'
import { isPromise } from 'is-what'
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

type P = { promise?: Promise<any>; resolve: (p?: any) => any }

test('stream (doc) but updating multiple times in between stream', async () => {
  const { trainerModule } = createMagnetarInstance()
  assert.deepEqual(trainerModule.data, { name: 'Luca', age: 10 })
  // do not await, because it only resolves when the stream is closed
  const p1: P = { resolve: () => undefined }
  p1.promise = new Promise((resolve) => {
    p1.resolve = resolve
  })
  const p2: P = { resolve: () => undefined }
  p2.promise = new Promise((resolve) => {
    p2.resolve = resolve
  })
  const p3: P = { resolve: () => undefined }
  p3.promise = new Promise((resolve) => {
    p3.resolve = resolve
  })
  const p4: P = { resolve: () => undefined }
  p4.promise = new Promise((resolve) => {
    p4.resolve = resolve
  })

  trainerModule.stream([p1.promise, p2.promise, p3.promise, p4.promise]).catch((e: any) => assert.fail(e.message)) // prettier-ignore

  await Promise.all([p1.resolve(), await p1.promise])
  await Promise.all([p2.resolve(), await p2.promise])
  assert.deepEqual(trainerModule.data, { name: 'Luca', age: 10 })

  // we will update and "wait" until this reached the server:
  await trainerModule.merge({ dream: 'job' })
  assert.deepEqual(trainerModule.data, { name: 'Luca', age: 10, dream: 'job' })

  // but shortly after make another call:
  await trainerModule.merge({ colour: 'blue' })
  assert.deepEqual(trainerModule.data, { name: 'Luca', age: 10, dream: 'job', colour: 'blue' })

  // now the first change comes back from the server:
  await Promise.all([p3.resolve(), await p3.promise])
  // WE MUST MAKE SURE THAT `colour: 'blue'` is not undone in our cached state!!!
  assert.deepEqual(trainerModule.data, { name: 'Luca', age: 10, dream: 'job', colour: 'blue' })

  // now the second change comes back from the server:
  await Promise.all([p4.resolve(), await p4.promise])
  assert.deepEqual(trainerModule.data, { name: 'Luca', age: 10, dream: 'job', colour: 'blue' })

  trainerModule.closeStream()
})

// test('stream (doc) edit right before opening', async () => {
//   const { trainerModule } = createMagnetarInstance()
//   assert.deepEqual(trainerModule.data, { name: 'Luca', age: 10 })
//   // do not await, because it only resolves when the stream is closed
//   const p1: P = { resolve: () => {} }
//   p1.promise = new Promise((resolve) => {
//     p1.resolve = resolve
//   })

//   trainerModule.merge({ name: 'L' })
//   trainerModule.stream([p1.promise]).catch((e: any) => assert.fail(e.message)) // prettier-ignore

//   await Promise.all([p1.resolve(), await p1.promise])
//   assert.deepEqual(trainerModule.data, { name: 'LUCA', age: 10 })
// })

// test('stream (collection) edit right before opening', async () => {
//   const { pokedexModule } = createMagnetarInstance()
//   assert.deepEqual(pokedexModule.data.get('1'), pokedex(1))
//   assert.deepEqual(pokedexModule.data.size, 1)
//   pokedexModule.doc('1').merge({ name: 'B' })
//   pokedexModule.stream().catch((e: any) => assert.fail(e.message)) // prettier-ignore
//   await waitMs(220)
//   // close the stream:
//   pokedexModule.closeStream()

//   assert.deepEqual(pokedexModule.data.get('1'), { ...pokedex(1), name: 'B' })
// })

test('stream (collection) where-filter stream doesnt affect base collection', async () => {
  const { pokedexModule } = createMagnetarInstance()
  assert.deepEqual(pokedexModule.streaming(), null)

  const collection = pokedexModule
    .where('type', 'array-contains', 'Fire')
    .where('base.Speed', '>=', 100)

  collection.stream()

  await waitMs(1)

  assert.deepEqual(isPromise(collection.streaming()), true)
  assert.deepEqual(pokedexModule.streaming(), null)

  collection.closeStream()
  assert.deepEqual(collection.streaming(), null)
})

test('stream should throw', async () => {
  const { pokedexModule } = createMagnetarInstance()
  assert.deepEqual(pokedexModule.data.get('1'), pokedex(1))
  assert.deepEqual(pokedexModule.data.size, 1)
  try {
    // we expect this to fail, so we can await the throw
    await pokedexModule.stream({ shouldFail: 'remote' })
  } catch (e: any) {
    assert.deepEqual(e.message, 'failed')
  }
})

test('stream should not throw again after throwing once', async () => {
  const { pokedexModule } = createMagnetarInstance()
  assert.deepEqual(pokedexModule.data.size, 1)
  try {
    // we expect this to fail, so we can await the throw
    await pokedexModule.stream({ shouldFail: 'remote' })
  } catch (e: any) {
    assert.deepEqual(e.message, 'failed')
  }
  // the second time around the stream should NOT fail and open correctly
  assert.deepEqual(pokedexModule.data.size, 1)
  // we expect this NOT to fail!!!
  const streaming = pokedexModule.stream()
  streaming.catch((e) => assert.fail(e.message))
  await waitMs(600)
  // close the stream:
  pokedexModule.closeStream()
  assert.deepEqual(pokedexModule.data.size, 3)
})
