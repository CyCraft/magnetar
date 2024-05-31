import { pokedex } from '@magnetarjs/test-utils'
import { assert, test } from 'vitest'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance.js'

test('read: fetch (collection)', async () => {
  // 'fetch' resolves once all stores have given a response with data
  const { pokedexModule } = createMagnetarInstance()
  assert.deepEqual(pokedexModule.data.get('1'), pokedex(1))
  assert.deepEqual(pokedexModule.data.size, 1)
  try {
    const result = await pokedexModule.fetch({ force: true })
    assert.deepEqual(result.get('1'), pokedex(1))
    assert.deepEqual(result.get('136'), pokedex(136))
  } catch (error) {
    assert.fail(JSON.stringify(error))
  }
  assert.deepEqual(pokedexModule.data.get('1'), pokedex(1))
  assert.deepEqual(pokedexModule.data.get('136'), pokedex(136))
  assert.deepEqual(pokedexModule.data.size, 151)
})

test('read: fetch (collection) — should throw error', async () => {
  const { pokedexModule } = createMagnetarInstance()
  try {
    await pokedexModule.doc('136').fetch({ shouldFail: 'remote' })
  } catch (error) {
    assert.deepEqual(!!error, true)
  }
})

test('read: fetch (collection) — should fetch again after one error', async () => {
  const { pokedexModule } = createMagnetarInstance()
  assert.deepEqual(pokedexModule.data.get('136'), undefined)
  try {
    await pokedexModule.doc('136').fetch({ shouldFail: 'remote' })
  } catch (error) {
    assert.deepEqual(!!error, true)
  }
  assert.deepEqual(pokedexModule.data.get('136'), undefined)
  try {
    await pokedexModule.doc('136').fetch()
  } catch (error) {
    assert.deepEqual(!!error, false)
  }
  assert.deepEqual(pokedexModule.data.get('136'), pokedex(136))
})

test('read: fetch (collection) — should fetch other docs when one throws errors', async () => {
  const { pokedexModule } = createMagnetarInstance()
  assert.deepEqual(pokedexModule.data.get('135'), undefined)
  assert.deepEqual(pokedexModule.data.get('136'), undefined)
  assert.deepEqual(pokedexModule.data.get('137'), undefined)
  try {
    await Promise.allSettled([
      pokedexModule.doc('135').fetch(),
      pokedexModule.doc('136').fetch({ shouldFail: 'remote' }),
      pokedexModule.doc('137').fetch(),
    ])
  } catch (error) {
    assert.deepEqual(!!error, true)
  }
  assert.deepEqual(pokedexModule.data.get('135'), pokedex(135))
  assert.deepEqual(pokedexModule.data.get('136'), undefined)
  assert.deepEqual(pokedexModule.data.get('137'), pokedex(137))
})

test('read: fetch (document) - prevent multiple fetch requests at the same time', async () => {
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
    assert.fail(JSON.stringify(error))
  }

  // make sure the remote store was only triggered once
  assert.deepEqual(storeNames.filter((n) => n === 'remote').length, 1)

  try {
    // fetch twice again the same time
    await Promise.all([trainerModule.fetch({ force: true }), trainerModule.fetch({ force: true })])
  } catch (error) {
    assert.fail(JSON.stringify(error))
  }

  // make sure the remote store was only triggered once more
  assert.deepEqual(storeNames.filter((n) => n === 'remote').length, 2)

  assert.deepEqual(trainerModule.data, { name: 'Luca', age: 10, dream: 'job' })
})

test('read: fetch (document) - optimistic fetch by default', async () => {
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
    assert.fail(JSON.stringify(error))
  }

  // make sure the remote store was only triggered once
  assert.deepEqual(storeNames.filter((n) => n === 'remote').length, 1)

  try {
    // fetch twice again the same time
    await Promise.all([trainerModule.fetch(), trainerModule.fetch()])
  } catch (error) {
    assert.fail(JSON.stringify(error))
  }

  // make sure the remote store was not triggered again
  assert.deepEqual(storeNames.filter((n) => n === 'remote').length, 1)

  assert.deepEqual(trainerModule.data, { name: 'Luca', age: 10, dream: 'job' })
})
