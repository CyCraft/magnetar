import test from 'ava'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance'
import { pokedex } from '@magnetarjs/test-utils'

// test('read: fetch (collection)', async (t) => {
//   // 'fetch' resolves once all stores have given a response with data
//   const { pokedexModule } = createMagnetarInstance()
//   t.deepEqual(pokedexModule.data.get('1'), pokedex(1))
//   t.is(pokedexModule.data.size, 1)
//   try {
//     const result = await pokedexModule.fetch({ force: true })
//     t.deepEqual(result.get('1'), pokedex(1))
//     t.deepEqual(result.get('136'), pokedex(136))
//   } catch (error) {
//     t.fail(error)
//   }
//   t.deepEqual(pokedexModule.data.get('1'), pokedex(1))
//   t.deepEqual(pokedexModule.data.get('136'), pokedex(136))
//   t.is(pokedexModule.data.size, 151)
// })

test('read: fetch (document) - prevent multiple fetch requests at the same time', async (t) => {
  // get resolves once all stores have given a response with data
  const storeNames: string[] = []
  const { trainerModule } = createMagnetarInstance({
    on: {
      success: ({ storeName }: any) => {
        storeNames.push(storeName)
      },
    },
  })
  try {
    // fetch twice at the same time
    await Promise.all([trainerModule.fetch({ force: true }), trainerModule.fetch({ force: true })])
  } catch (error) {
    t.fail(error)
  }

  // make sure the remote store was only triggered once
  t.is(storeNames.filter((n) => n === 'remote').length, 1)

  try {
    // fetch twice again the same time
    await Promise.all([trainerModule.fetch({ force: true }), trainerModule.fetch({ force: true })])
  } catch (error) {
    t.fail(error)
  }

  // make sure the remote store was only triggered once more
  t.is(storeNames.filter((n) => n === 'remote').length, 2)

  t.deepEqual(trainerModule.data, { name: 'Luca', age: 10, dream: 'job' })
})

test('read: fetch (document) - optimistic fetch by default', async (t) => {
  // get resolves once all stores have given a response with data
  const storeNames: string[] = []
  const startEmpty = true
  const { trainerModule } = createMagnetarInstance(
    {
      on: {
        success: ({ storeName }: any) => {
          storeNames.push(storeName)
        },
      },
    },
    startEmpty
  )
  try {
    // fetch twice at the same time
    await Promise.all([trainerModule.fetch({ force: true }), trainerModule.fetch({ force: true })])
  } catch (error) {
    t.fail(error)
  }

  // make sure the remote store was only triggered once
  t.is(storeNames.filter((n) => n === 'remote').length, 1)

  try {
    // fetch twice again the same time
    await Promise.all([trainerModule.fetch(), trainerModule.fetch()])
  } catch (error) {
    t.fail(error)
  }

  // make sure the remote store was not triggered again
  t.is(storeNames.filter((n) => n === 'remote').length, 1)

  t.deepEqual(trainerModule.data, { name: 'Luca', age: 10, dream: 'job' })
})
