import test from 'ava'
import { createVueSyncInstance } from './helpers/createVueSyncInstance'
import { pokedex } from './helpers/pokedex'

test('deleteProp', async t => {
  const { trainerModule } = createVueSyncInstance()
  const deletePayload = 'age'
  t.deepEqual(trainerModule.data, { name: 'Luca', age: 10 })

  try {
    await trainerModule.deleteProp(deletePayload)
  } catch (error) {
    t.fail(error)
  }

  t.deepEqual(trainerModule.data, { name: 'Luca' })
})

test('deleteProp nested', async t => {
  const { pokedexModule } = createVueSyncInstance()
  const deletePayload = 'base.HP'
  t.deepEqual(pokedexModule.doc('1').data, pokedex(1))

  try {
    await pokedexModule.doc('1').deleteProp(deletePayload)
  } catch (error) {
    t.fail(error)
  }
  const expected = {
    id: 1,
    name: 'Bulbasaur',
    type: ['Grass', 'Poison'],
    base: {
      'Attack': 49,
      'Defense': 49,
      'Sp. Attack': 65,
      'Sp. Defense': 65,
      'Speed': 45,
    },
  }
  t.deepEqual(pokedexModule.doc('1').data, expected)
})

test('deleteProp multiple', async t => {
  const { pokedexModule } = createVueSyncInstance()
  const deletePayload = ['base.HP', 'name']
  t.deepEqual(pokedexModule.doc('1').data, pokedex(1))

  try {
    await pokedexModule.doc('1').deleteProp(deletePayload)
  } catch (error) {
    t.fail(error)
  }

  const expected = {
    id: 1,
    type: ['Grass', 'Poison'],
    base: {
      'Attack': 49,
      'Defense': 49,
      'Sp. Attack': 65,
      'Sp. Defense': 65,
      'Speed': 45,
    },
  }
  t.deepEqual(pokedexModule.doc('1').data, expected)
})

test('revert: deleteProp', async t => {
  const { trainerModule } = createVueSyncInstance()
  const deletePayload = ['age', 'remote'] // this triggers an error on the remote store mock
  t.deepEqual(trainerModule.data, { name: 'Luca', age: 10 })

  try {
    await trainerModule.deleteProp(deletePayload, { onError: 'revert' })
  } catch (error) {
    t.fail(error)
  }

  t.deepEqual(trainerModule.data, { name: 'Luca', age: 10 })
})

test('revert: deleteProp nested', async t => {
  const { pokedexModule } = createVueSyncInstance()
  const deletePayload = ['base.HP', 'remote'] // this triggers an error on the remote store mock
  t.deepEqual(pokedexModule.doc('1').data, pokedex(1))

  try {
    await pokedexModule.doc('1').deleteProp(deletePayload, { onError: 'revert' })
  } catch (error) {
    t.fail(error)
  }

  t.deepEqual(pokedexModule.doc('1').data, pokedex(1))
})
