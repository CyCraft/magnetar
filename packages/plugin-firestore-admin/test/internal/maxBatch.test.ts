import { pokedex } from '@magnetarjs/test-utils'
import { assert, test } from 'vitest'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance.js'
import { firestoreDeepEqual } from '../helpers/firestoreDeepEqual.js'

{
  const testName = 'Max Batch — 550'
  test(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance(testName)
    await firestoreDeepEqual(testName, 'pokedex/1', undefined)
    assert.deepEqual(pokedexModule.doc('1').data, undefined)

    try {
      pokedexModule.doc('1').insert(pokedex(1))
      for (const _ of new Array(550)) {
        pokedexModule.doc(Math.random().toString()).insert(pokedex(2))
      }
      await pokedexModule.doc('3').insert(pokedex(3))
    } catch (error) {
      assert.fail(JSON.stringify(error))
    }

    const expected = pokedex(1)
    assert.deepEqual(pokedexModule.doc('1').data, expected as any)
    await firestoreDeepEqual(testName, 'pokedex/1', expected as any)
  })
}

{
  const testName = 'Max Batch — 1550'
  test(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance(testName)
    await firestoreDeepEqual(testName, 'pokedex/1', undefined)
    assert.deepEqual(pokedexModule.doc('1').data, undefined)

    try {
      pokedexModule.doc('1').insert(pokedex(1))
      for (const _ of new Array(1550)) {
        pokedexModule.doc(Math.random().toString()).insert(pokedex(2))
      }
      await pokedexModule.doc('3').insert(pokedex(3))
    } catch (error) {
      assert.fail(JSON.stringify(error))
    }

    const expected = pokedex(1)
    assert.deepEqual(pokedexModule.doc('1').data, expected as any)
    await firestoreDeepEqual(testName, 'pokedex/1', expected as any)
  })
}
