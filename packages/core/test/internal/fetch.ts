import test from 'ava'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance'
import { pokedex } from '@magnetarjs/test-utils'

test('read: fetch (collection)', async (t) => {
  // 'fetch' resolves once all stores have given a response with data
  const { pokedexModule } = createMagnetarInstance()
  t.deepEqual(pokedexModule.data.get('1'), pokedex(1))
  t.is(pokedexModule.data.size, 1)
  try {
    const result = await pokedexModule.fetch({ force: true })
    t.deepEqual(result.get('1'), pokedex(1))
    t.deepEqual(result.get('136'), pokedex(136))
  } catch (error) {
    t.fail(JSON.stringify(error))
  }
  t.deepEqual(pokedexModule.data.get('1'), pokedex(1))
  t.deepEqual(pokedexModule.data.get('136'), pokedex(136))
  t.is(pokedexModule.data.size, 151)
})

test('read: fetch (collection) — should fetch other docs when one throws errors', async (t) => {
  const { pokedexModule } = createMagnetarInstance()
  t.deepEqual(pokedexModule.data.get('135'), undefined)
  t.deepEqual(pokedexModule.data.get('136'), undefined)
  t.deepEqual(pokedexModule.data.get('137'), undefined)
  try {
    await Promise.allSettled([
      pokedexModule.doc('135').fetch(),
      pokedexModule.doc('136').fetch({ shouldFail: 'remote' }),
      pokedexModule.doc('137').fetch(),
    ])
  } catch (error) {
    t.is(!!error, true)
  }
  t.deepEqual(pokedexModule.data.get('135'), pokedex(135))
  t.deepEqual(pokedexModule.data.get('136'), undefined)
  t.deepEqual(pokedexModule.data.get('137'), pokedex(137))
})

test('read: fetch (document) - prevent multiple fetch requests at the same time', async (t) => {
  // fetch resolves once all stores have given a response with data
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
    t.fail(JSON.stringify(error))
  }

  // make sure the remote store was only triggered once
  t.is(storeNames.filter((n) => n === 'remote').length, 1)

  try {
    // fetch twice again the same time
    await Promise.all([trainerModule.fetch({ force: true }), trainerModule.fetch({ force: true })])
  } catch (error) {
    t.fail(JSON.stringify(error))
  }

  // make sure the remote store was only triggered once more
  t.is(storeNames.filter((n) => n === 'remote').length, 2)

  t.deepEqual(trainerModule.data, { name: 'Luca', age: 10, dream: 'job' })
})

test('read: fetch (document) - optimistic fetch by default', async (t) => {
  // fetch resolves once all stores have given a response with data
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
    t.fail(JSON.stringify(error))
  }

  // make sure the remote store was only triggered once
  t.is(storeNames.filter((n) => n === 'remote').length, 1)

  try {
    // fetch twice again the same time
    await Promise.all([trainerModule.fetch(), trainerModule.fetch()])
  } catch (error) {
    t.fail(JSON.stringify(error))
  }

  // make sure the remote store was not triggered again
  t.is(storeNames.filter((n) => n === 'remote').length, 1)

  t.deepEqual(trainerModule.data, { name: 'Luca', age: 10, dream: 'job' })
})
