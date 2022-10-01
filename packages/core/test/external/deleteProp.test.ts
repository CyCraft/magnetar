import test from 'ava'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance'
import { pokedex } from '@magnetarjs/test-utils'

test('deleteProp', async (t) => {
  const { trainerModule } = createMagnetarInstance()
  const deletePayload = 'age'
  t.deepEqual(trainerModule.data, { name: 'Luca', age: 10 })

  try {
    await trainerModule.deleteProp(deletePayload)
  } catch (error) {
    t.fail(JSON.stringify(error))
  }

  t.deepEqual(trainerModule.data, { name: 'Luca' })
})

test('deleteProp nested', async (t) => {
  const { pokedexModule } = createMagnetarInstance()
  const deletePayload = 'base.HP'
  t.deepEqual(pokedexModule.doc('1').data, pokedex(1))

  try {
    await pokedexModule.doc('1').deleteProp(deletePayload)
  } catch (error) {
    t.fail(JSON.stringify(error))
  }
  const expected = {
    id: 1,
    name: 'Bulbasaur',
    type: ['Grass', 'Poison'],
    base: {
      'Attack': 49,
      'Defense': 49,
      'SpAttack': 65,
      'SpDefense': 65,
      'Speed': 45,
    },
  }
  t.deepEqual(pokedexModule.doc('1').data, expected as any)
})

test('deleteProp multiple', async (t) => {
  const { pokedexModule } = createMagnetarInstance()
  const deletePayload = ['base.HP', 'name']
  t.deepEqual(pokedexModule.doc('1').data, pokedex(1))

  try {
    await pokedexModule.doc('1').deleteProp(deletePayload)
  } catch (error) {
    t.fail(JSON.stringify(error))
  }

  const expected = {
    id: 1,
    type: ['Grass', 'Poison'],
    base: {
      'Attack': 49,
      'Defense': 49,
      'SpAttack': 65,
      'SpDefense': 65,
      'Speed': 45,
    },
  }
  t.deepEqual(pokedexModule.doc('1').data, expected as any)
})

test('revert: deleteProp', async (t) => {
  const { trainerModule } = createMagnetarInstance()
  const deletePayload = ['age', 'remote'] // this triggers an error on the remote store mock
  t.deepEqual(trainerModule.data, { name: 'Luca', age: 10 })

  try {
    await trainerModule.deleteProp(deletePayload, { onError: 'revert' })
  } catch (error) {
    t.truthy(error)
  }

  t.deepEqual(trainerModule.data, { name: 'Luca', age: 10 })
})

test('revert: deleteProp nested', async (t) => {
  const { pokedexModule } = createMagnetarInstance()
  const deletePayload = ['base.HP', 'remote'] // this triggers an error on the remote store mock
  t.deepEqual(pokedexModule.doc('1').data, pokedex(1))

  try {
    await pokedexModule.doc('1').deleteProp(deletePayload, { onError: 'revert' })
  } catch (error) {
    t.truthy(error)
  }

  t.deepEqual(pokedexModule.doc('1').data, pokedex(1))
})
