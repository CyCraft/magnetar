import { pokedex } from '@magnetarjs/test-utils'
import { assert, test } from 'vitest'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance.js'
import { firestoreDeepEqual } from '../helpers/firestoreDeepEqual.js'

{
  const testName = 'merge — empty objects are filtred out'
  test(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    await firestoreDeepEqual(testName, 'pokedex/1', pokedex(1))
    assert.deepEqual(pokedexModule.doc('1').data, pokedex(1))

    try {
      await pokedexModule.doc('1').merge({ base: {} })
    } catch (error) {
      assert.fail(JSON.stringify(error))
    }

    const expected = {
      id: 1,
      name: 'Bulbasaur',
      type: ['Grass', 'Poison'],
      base: {
        HP: 45,
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
  const testName = 'merge — empty objects are filtred out — multiple writes'
  test(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    await firestoreDeepEqual(testName, 'pokedex/1', pokedex(1))
    assert.deepEqual(pokedexModule.doc('1').data, pokedex(1))

    try {
      await pokedexModule.doc('1').merge({ name: 'baba' })
      await pokedexModule.doc('1').merge({ base: { HP: 50 } })
      await pokedexModule.doc('1').merge({ base: {} })
    } catch (error) {
      assert.fail(JSON.stringify(error))
    }

    const expected = {
      id: 1,
      name: 'baba',
      type: ['Grass', 'Poison'],
      base: {
        HP: 50,
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
