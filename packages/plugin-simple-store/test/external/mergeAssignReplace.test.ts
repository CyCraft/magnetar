import { pokedex } from '@magnetarjs/test-utils'
import { assert, test } from 'vitest'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance.js'

test('merge', async () => {
  const { pokedexModule } = createMagnetarInstance()
  const payload = { base: { HP: 9000 } }
  assert.deepEqual(pokedexModule.doc('1').data, pokedex(1))

  try {
    await pokedexModule.doc('1').merge(payload)
  } catch (error) {
    assert.fail(JSON.stringify(error))
  }

  const expected = {
    id: 1,
    name: 'Bulbasaur',
    type: ['Grass', 'Poison'],
    base: {
      HP: 9000,
      Attack: 49,
      Defense: 49,
      SpAttack: 65,
      SpDefense: 65,
      Speed: 45,
    },
  }
  assert.deepEqual(pokedexModule.doc('1').data, expected as any)
})

test('assign', async () => {
  const { pokedexModule } = createMagnetarInstance()
  const payload = { base: { HP: 9000 } }
  assert.deepEqual(pokedexModule.doc('1').data, pokedex(1))

  try {
    await pokedexModule.doc('1').assign(payload)
  } catch (error) {
    assert.fail(JSON.stringify(error))
  }

  const expected = {
    id: 1,
    name: 'Bulbasaur',
    type: ['Grass', 'Poison'],
    base: {
      HP: 9000,
    },
  }
  assert.deepEqual(pokedexModule.doc('1').data, expected as any)
})

test('replace', async () => {
  const { pokedexModule } = createMagnetarInstance()
  const payload = { base: { HP: 9000 } }
  assert.deepEqual(pokedexModule.doc('1').data, pokedex(1))

  try {
    await pokedexModule.doc('1').replace(payload)
  } catch (error) {
    assert.fail(JSON.stringify(error))
  }

  const expected = { base: { HP: 9000 } }
  assert.deepEqual(pokedexModule.doc('1').data, expected as any)
})

test('revert: merge', async () => {
  const { pokedexModule } = createMagnetarInstance()
  const payload = { base: { HP: 9000 }, shouldFail: 'remote' }
  assert.deepEqual(pokedexModule.doc('1').data, pokedex(1))

  try {
    await pokedexModule.doc('1').merge(payload, { onError: 'revert' })
  } catch (error) {
    assert.isTrue(!!error)
  }

  const expected = pokedex(1)
  assert.deepEqual(pokedexModule.doc('1').data, expected as any)
})

test('revert: assign', async () => {
  const { pokedexModule } = createMagnetarInstance()
  const payload = { base: { HP: 9000 }, shouldFail: 'remote' }
  assert.deepEqual(pokedexModule.doc('1').data, pokedex(1))

  try {
    await pokedexModule.doc('1').assign(payload, { onError: 'revert' })
  } catch (error) {
    assert.isTrue(!!error)
  }

  const expected = pokedex(1)
  assert.deepEqual(pokedexModule.doc('1').data, expected as any)
})

test('revert: replace', async () => {
  const { pokedexModule } = createMagnetarInstance()
  const payload = { base: { HP: 9000 }, shouldFail: 'remote' }
  assert.deepEqual(pokedexModule.doc('1').data, pokedex(1))

  try {
    await pokedexModule.doc('1').replace(payload, { onError: 'revert' })
  } catch (error) {
    assert.isTrue(!!error)
  }

  const expected = pokedex(1)
  assert.deepEqual(pokedexModule.doc('1').data, expected as any)
})
