import test from 'ava'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance'
import { pokedex, waitMs } from '@magnetarjs/test-utils'
import { firestoreDeepEqual } from '../helpers/firestoreDeepEqual'

{
  const testName = 'Max Batch — 550'
  test(testName, async (t) => {
    const { pokedexModule } = await createMagnetarInstance(testName)
    await firestoreDeepEqual(t, testName, 'pokedex/1', undefined)
    t.deepEqual(pokedexModule.doc('1').data, undefined)

    try {
      pokedexModule.doc('1').insert(pokedex(1))
      for (const _ of new Array(550)) {
        pokedexModule.doc(Math.random().toString()).insert(pokedex(2))
      }
      await pokedexModule.doc('3').insert(pokedex(3))
    } catch (error) {
      t.fail(JSON.stringify(error))
    }

    const expected = pokedex(1)
    t.deepEqual(pokedexModule.doc('1').data, expected as any)
    await firestoreDeepEqual(t, testName, 'pokedex/1', expected as any)
  })
}

{
  const testName = 'Max Batch — 1550'
  test(testName, async (t) => {
    const { pokedexModule } = await createMagnetarInstance(testName)
    await firestoreDeepEqual(t, testName, 'pokedex/1', undefined)
    t.deepEqual(pokedexModule.doc('1').data, undefined)

    try {
      pokedexModule.doc('1').insert(pokedex(1))
      for (const _ of new Array(1550)) {
        pokedexModule.doc(Math.random().toString()).insert(pokedex(2))
      }
      await pokedexModule.doc('3').insert(pokedex(3))
    } catch (error) {
      t.fail(JSON.stringify(error))
    }

    const expected = pokedex(1)
    t.deepEqual(pokedexModule.doc('1').data, expected as any)
    await firestoreDeepEqual(t, testName, 'pokedex/1', expected as any)
  })
}
