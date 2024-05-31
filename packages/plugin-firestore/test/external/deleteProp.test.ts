import { pokedex } from '@magnetarjs/test-utils'
import { assert, test } from 'vitest'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance.js'
import { firestoreDeepEqual } from '../helpers/firestoreDeepEqual.js'

{
  const testName = 'deleteProp'
  test(testName, async () => {
    const { trainerModule } = await createMagnetarInstance(testName, {
      insertDocs: { '': { age: 10, name: 'Luca' } },
    })
    const deletePayload = 'age'
    assert.deepEqual(trainerModule.data, { name: 'Luca', age: 10 })

    try {
      await trainerModule.deleteProp(deletePayload)
    } catch (error) {
      assert.fail(JSON.stringify(error))
    }

    const expected = { name: 'Luca' }
    assert.deepEqual(trainerModule.data, expected as any)
    await firestoreDeepEqual(testName, '', expected as any)
  })
}
{
  const testName = 'deleteProp nested'
  test(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
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
    await firestoreDeepEqual(testName, 'pokedex/1', expected as any)
  })
}
{
  const testName = 'deleteProp multiple'
  test(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
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
    await firestoreDeepEqual(testName, 'pokedex/1', expected as any)
  })
}
