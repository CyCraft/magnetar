import test from 'ava'
import { createVueSyncInstance } from './helpers/createVueSyncInstance'
import { pokedex } from './helpers/pokemon'

test('merge', async t => {
  const { pokedexModule } = createVueSyncInstance()
  const payload = { base: { HP: 9000 } }
  t.deepEqual(pokedexModule.doc('1').data, pokedex(1))

  try {
    await pokedexModule.doc('1').merge(payload)
  } catch (error) {
    t.fail(error)
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
  t.deepEqual(pokedexModule.doc('1').data, expected)
})

test('assign', async t => {
  const { pokedexModule } = createVueSyncInstance()
  const payload = { base: { HP: 9000 } }
  t.deepEqual(pokedexModule.doc('1').data, pokedex(1))

  try {
    await pokedexModule.doc('1').assign(payload)
  } catch (error) {
    t.fail(error)
  }

  const expected = {
    id: 1,
    name: 'Bulbasaur',
    type: ['Grass', 'Poison'],
    base: {
      HP: 9000,
    },
  }
  t.deepEqual(pokedexModule.doc('1').data, expected)
})

test('replace', async t => {
  const { pokedexModule } = createVueSyncInstance()
  const payload = { base: { HP: 9000 } }
  t.deepEqual(pokedexModule.doc('1').data, pokedex(1))

  try {
    await pokedexModule.doc('1').replace(payload)
  } catch (error) {
    t.fail(error)
  }

  const expected = { base: { HP: 9000 } }
  t.deepEqual(pokedexModule.doc('1').data, expected)
})

test('revert: merge', async t => {
  const { pokedexModule } = createVueSyncInstance()
  const payload = { base: { HP: 9000 }, shouldFail: 'remote' }
  t.deepEqual(pokedexModule.doc('1').data, pokedex(1))

  try {
    await pokedexModule.doc('1').merge(payload, { onError: 'revert' })
  } catch (error) {
    t.fail(error)
  }

  const expected = pokedex(1)
  t.deepEqual(pokedexModule.doc('1').data, expected)
})

test('revert: assign', async t => {
  const { pokedexModule } = createVueSyncInstance()
  const payload = { base: { HP: 9000 }, shouldFail: 'remote' }
  t.deepEqual(pokedexModule.doc('1').data, pokedex(1))

  try {
    await pokedexModule.doc('1').assign(payload, { onError: 'revert' })
  } catch (error) {
    t.fail(error)
  }

  const expected = pokedex(1)
  t.deepEqual(pokedexModule.doc('1').data, expected)
})

test('revert: replace', async t => {
  const { pokedexModule } = createVueSyncInstance()
  const payload = { base: { HP: 9000 }, shouldFail: 'remote' }
  t.deepEqual(pokedexModule.doc('1').data, pokedex(1))

  try {
    await pokedexModule.doc('1').replace(payload, { onError: 'revert' })
  } catch (error) {
    t.fail(error)
  }

  const expected = pokedex(1)
  t.deepEqual(pokedexModule.doc('1').data, expected)
})
