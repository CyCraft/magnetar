import test from 'ava'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance'
import { pokedex, waitMs } from '@magnetarjs/test-utils'
import { isPromise } from 'is-what'

test('stream (collection)', async (t) => {
  const { pokedexModule } = createMagnetarInstance()
  t.deepEqual(pokedexModule.data.get('1'), pokedex(1))
  t.is(pokedexModule.data.size, 1)
  // do not await, because it only resolves when the stream is closed
  pokedexModule.stream().catch((e: any) => t.fail(e.message)) // prettier-ignore
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

type P = { promise?: Promise<any>; resolve: (p?: any) => any }

test('stream (doc) but updating multiple times in between stream', async (t) => {
  const { trainerModule } = createMagnetarInstance()
  t.deepEqual(trainerModule.data, { name: 'Luca', age: 10 })
  // do not await, because it only resolves when the stream is closed
  const p1: P = { resolve: () => {} }
  p1.promise = new Promise((resolve) => {
    p1.resolve = resolve
  })
  const p2: P = { resolve: () => {} }
  p2.promise = new Promise((resolve) => {
    p2.resolve = resolve
  })
  const p3: P = { resolve: () => {} }
  p3.promise = new Promise((resolve) => {
    p3.resolve = resolve
  })
  const p4: P = { resolve: () => {} }
  p4.promise = new Promise((resolve) => {
    p4.resolve = resolve
  })

  trainerModule.stream([p1.promise, p2.promise, p3.promise, p4.promise]).catch((e: any) => t.fail(e.message)) // prettier-ignore

  await Promise.all([p1.resolve(), await p1.promise])
  await Promise.all([p2.resolve(), await p2.promise])
  t.deepEqual(trainerModule.data, { name: 'Luca', age: 10 })

  // we will update and "wait" until this reached the server:
  await trainerModule.merge({ dream: 'job' })
  t.deepEqual(trainerModule.data, { name: 'Luca', age: 10, dream: 'job' })

  // but shortly after make another call:
  await trainerModule.merge({ colour: 'blue' })
  t.deepEqual(trainerModule.data, { name: 'Luca', age: 10, dream: 'job', colour: 'blue' })

  // now the first change comes back from the server:
  await Promise.all([p3.resolve(), await p3.promise])
  // WE MUST MAKE SURE THAT `colour: 'blue'` is not undone in our local state!!!
  t.deepEqual(trainerModule.data, { name: 'Luca', age: 10, dream: 'job', colour: 'blue' })

  // now the second change comes back from the server:
  await Promise.all([p4.resolve(), await p4.promise])
  t.deepEqual(trainerModule.data, { name: 'Luca', age: 10, dream: 'job', colour: 'blue' })

  trainerModule.closeStream()
})

// test('stream (doc) edit right before opening', async (t) => {
//   const { trainerModule } = createMagnetarInstance()
//   t.deepEqual(trainerModule.data, { name: 'Luca', age: 10 })
//   // do not await, because it only resolves when the stream is closed
//   const p1: P = { resolve: () => {} }
//   p1.promise = new Promise((resolve) => {
//     p1.resolve = resolve
//   })

//   trainerModule.merge({ name: 'L' })
//   trainerModule.stream([p1.promise]).catch((e: any) => t.fail(e.message)) // prettier-ignore

//   await Promise.all([p1.resolve(), await p1.promise])
//   t.deepEqual(trainerModule.data, { name: 'LUCA', age: 10 })
// })

// test('stream (collection) edit right before opening', async (t) => {
//   const { pokedexModule } = createMagnetarInstance()
//   t.deepEqual(pokedexModule.data.get('1'), pokedex(1))
//   t.is(pokedexModule.data.size, 1)
//   pokedexModule.doc('1').merge({ name: 'B' })
//   pokedexModule.stream().catch((e: any) => t.fail(e.message)) // prettier-ignore
//   await waitMs(220)
//   // close the stream:
//   pokedexModule.closeStream()

//   t.deepEqual(pokedexModule.data.get('1'), { ...pokedex(1), name: 'B' })
// })

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
