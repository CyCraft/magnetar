import test from 'ava'
import { createVueSyncInstance } from '../helpers/createVueSyncInstance'
import { pokedex } from '../helpers/pokedex'
import { firestoreDeepEqual } from '../helpers/firestoreDeepEqual'

{
  const testName = 'deleteProp'
  test(testName, async t => {
    const { trainerModule } = await createVueSyncInstance(testName)
    const deletePayload = 'age'
    t.deepEqual(trainerModule.data, { name: 'Luca', age: 10 })

    try {
      await trainerModule.deleteProp(deletePayload)
    } catch (error) {
      t.fail(error)
    }

    const expected = { name: 'Luca' }
    t.deepEqual(trainerModule.data, expected)
    await firestoreDeepEqual(t, testName, '', expected)
  })
}
{
  const testName = 'deleteProp nested'
  test(testName, async t => {
    const { pokedexModule } = await createVueSyncInstance(testName)
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
    await firestoreDeepEqual(t, testName, 'pokedex/1', expected)
  })
}
{
  const testName = 'deleteProp multiple'
  test(testName, async t => {
    const { pokedexModule } = await createVueSyncInstance(testName)
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
    await firestoreDeepEqual(t, testName, 'pokedex/1', expected)
  })
}
{
  const testName = 'revert: deleteProp'
  test(testName, async t => {
    const { trainerModule } = await createVueSyncInstance(testName)
    const deletePayload = ['age', 'remote'] // this triggers an error on the remote store mock
    t.deepEqual(trainerModule.data, { name: 'Luca', age: 10 })

    try {
      await trainerModule.deleteProp(deletePayload, { onError: 'revert' })
    } catch (error) {
      t.truthy(error)
    }

    const expected = { name: 'Luca', age: 10 }
    t.deepEqual(trainerModule.data, expected)
    await firestoreDeepEqual(t, testName, '', expected)
  })
}
{
  const testName = 'revert: deleteProp nested'
  test(testName, async t => {
    const { pokedexModule } = await createVueSyncInstance(testName)
    const deletePayload = ['base.HP', 'remote'] // this triggers an error on the remote store mock
    t.deepEqual(pokedexModule.doc('1').data, pokedex(1))

    try {
      await pokedexModule.doc('1').deleteProp(deletePayload, { onError: 'revert' })
    } catch (error) {
      t.truthy(error)
    }

    const expected = pokedex(1)
    t.deepEqual(pokedexModule.doc('1').data, expected)
    await firestoreDeepEqual(t, testName, 'pokedex/1', expected)
  })
}
