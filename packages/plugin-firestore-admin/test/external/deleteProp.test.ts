import test from 'ava'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance'
import { pokedex } from '@magnetarjs/test-utils'
import { firestoreDeepEqual } from '../helpers/firestoreDeepEqual'

{
  const testName = 'deleteProp'
  test(testName, async (t) => {
    const { trainerModule } = await createMagnetarInstance(testName, {
      insertDocs: { '': { age: 10, name: 'Luca' } },
    })
    const deletePayload = 'age'
    t.deepEqual(trainerModule.data, { name: 'Luca', age: 10 })

    try {
      await trainerModule.deleteProp(deletePayload)
    } catch (error) {
      t.fail(JSON.stringify(error))
    }

    const expected = { name: 'Luca' }
    t.deepEqual(trainerModule.data, expected as any)
    await firestoreDeepEqual(t, testName, '', expected as any)
  })
}
{
  const testName = 'deleteProp nested'
  test(testName, async (t) => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
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
    await firestoreDeepEqual(t, testName, 'pokedex/1', expected as any)
  })
}
{
  const testName = 'deleteProp multiple'
  test(testName, async (t) => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
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
    await firestoreDeepEqual(t, testName, 'pokedex/1', expected as any)
  })
}
