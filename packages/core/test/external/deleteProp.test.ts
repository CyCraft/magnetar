import { pokedex } from '@magnetarjs/test-utils'
import { assert, test } from 'vitest'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance.js'

test('deleteProp', async () => {
  const { trainerModule } = createMagnetarInstance()
  const deletePayload = 'age'
  assert.deepEqual(trainerModule.data, { name: 'Luca', age: 10 })

  try {
    await trainerModule.deleteProp(deletePayload)
  } catch (error) {
    assert.fail(JSON.stringify(error))
  }

  assert.deepEqual(trainerModule.data, { name: 'Luca' })
})

test('deleteProp nested', async () => {
  const { pokedexModule } = createMagnetarInstance()
  const deletePayload = 'base.HP'
  assert.deepEqual(pokedexModule.doc('1').data, pokedex(1))

  try {
    await pokedexModule.doc('1').deleteProp(deletePayload)
  } catch (error) {
    assert.fail(JSON.stringify(error))
  }
  const expected = {
    id: 1,
    name: 'Bulbasaur',
    type: ['Grass', 'Poison'],
    base: {
      Attack: 49,
      Defense: 49,
      SpAttack: 65,
      SpDefense: 65,
      Speed: 45,
    },
  }
  assert.deepEqual(pokedexModule.doc('1').data, expected as any)
})

test('deleteProp multiple', async () => {
  const { pokedexModule } = createMagnetarInstance()
  const deletePayload = ['base.HP', 'name']
  assert.deepEqual(pokedexModule.doc('1').data, pokedex(1))

  try {
    await pokedexModule.doc('1').deleteProp(deletePayload)
  } catch (error) {
    assert.fail(JSON.stringify(error))
  }

  const expected = {
    id: 1,
    type: ['Grass', 'Poison'],
    base: {
      Attack: 49,
      Defense: 49,
      SpAttack: 65,
      SpDefense: 65,
      Speed: 45,
    },
  }
  assert.deepEqual(pokedexModule.doc('1').data, expected as any)
})

test('revert: deleteProp', async () => {
  const { trainerModule } = createMagnetarInstance()
  const deletePayload = ['age', 'remote'] // this triggers an error on the remote store mock
  assert.deepEqual(trainerModule.data, { name: 'Luca', age: 10 })

  try {
    await trainerModule.deleteProp(deletePayload, { onError: 'revert' })
  } catch (error) {
    assert.isTrue(!!error)
  }

  assert.deepEqual(trainerModule.data, { name: 'Luca', age: 10 })
})

test('revert: deleteProp nested', async () => {
  const { pokedexModule } = createMagnetarInstance()
  const deletePayload = ['base.HP', 'remote'] // this triggers an error on the remote store mock
  assert.deepEqual(pokedexModule.doc('1').data, pokedex(1))

  try {
    await pokedexModule.doc('1').deleteProp(deletePayload, { onError: 'revert' })
  } catch (error) {
    assert.isTrue(!!error)
  }

  assert.deepEqual(pokedexModule.doc('1').data, pokedex(1))
})
