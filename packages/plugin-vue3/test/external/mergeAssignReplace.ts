import test from 'ava'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance'
import { pokedex } from '@magnetarjs/test-utils'

test('merge', async (t) => {
  const { pokedexModule } = createMagnetarInstance()
  const payload = { base: { HP: 9000 } }
  t.deepEqual(pokedexModule.doc('1').data, pokedex(1))

  try {
    await pokedexModule.doc('1').merge(payload)
  } catch (error) {
    t.fail(JSON.stringify(error))
  }

  const expected = {
    id: 1,
    name: 'Bulbasaur',
    type: ['Grass', 'Poison'],
    base: {
      'HP': 9000,
      'Attack': 49,
      'Defense': 49,
      'Sp. Attack': 65,
      'Sp. Defense': 65,
      'Speed': 45,
    },
  }
  t.deepEqual(pokedexModule.doc('1').data, expected as any)
})

test('assign', async (t) => {
  const { pokedexModule } = createMagnetarInstance()
  const payload = { base: { HP: 9000 } }
  t.deepEqual(pokedexModule.doc('1').data, pokedex(1))

  try {
    await pokedexModule.doc('1').assign(payload)
  } catch (error) {
    t.fail(JSON.stringify(error))
  }

  const expected = {
    id: 1,
    name: 'Bulbasaur',
    type: ['Grass', 'Poison'],
    base: {
      HP: 9000,
    },
  }
  t.deepEqual(pokedexModule.doc('1').data, expected as any)
})

test('replace', async (t) => {
  const { pokedexModule } = createMagnetarInstance()
  const payload = { base: { HP: 9000 } }
  t.deepEqual(pokedexModule.doc('1').data, pokedex(1))

  try {
    await pokedexModule.doc('1').replace(payload)
  } catch (error) {
    t.fail(JSON.stringify(error))
  }

  const expected = { base: { HP: 9000 } }
  t.deepEqual(pokedexModule.doc('1').data, expected as any)
})

test('revert: merge', async (t) => {
  const { pokedexModule } = createMagnetarInstance()
  const payload = { base: { HP: 9000 }, shouldFail: 'remote' }
  t.deepEqual(pokedexModule.doc('1').data, pokedex(1))

  try {
    await pokedexModule.doc('1').merge(payload, { onError: 'revert' })
  } catch (error) {
    t.truthy(error)
  }

  const expected = pokedex(1)
  t.deepEqual(pokedexModule.doc('1').data, expected as any)
})

test('revert: assign', async (t) => {
  const { pokedexModule } = createMagnetarInstance()
  const payload = { base: { HP: 9000 }, shouldFail: 'remote' }
  t.deepEqual(pokedexModule.doc('1').data, pokedex(1))

  try {
    await pokedexModule.doc('1').assign(payload, { onError: 'revert' })
  } catch (error) {
    t.truthy(error)
  }

  const expected = pokedex(1)
  t.deepEqual(pokedexModule.doc('1').data, expected as any)
})

test('revert: replace', async (t) => {
  const { pokedexModule } = createMagnetarInstance()
  const payload = { base: { HP: 9000 }, shouldFail: 'remote' }
  t.deepEqual(pokedexModule.doc('1').data, pokedex(1))

  try {
    await pokedexModule.doc('1').replace(payload, { onError: 'revert' })
  } catch (error) {
    t.truthy(error)
  }

  const expected = pokedex(1)
  t.deepEqual(pokedexModule.doc('1').data, expected as any)
})
