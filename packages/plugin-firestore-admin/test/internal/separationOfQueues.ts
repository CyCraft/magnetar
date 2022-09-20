import test from 'ava'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance'
import { pokedex, allMovesArray } from '@magnetarjs/test-utils'
import { firestoreDeepEqual } from '../helpers/firestoreDeepEqual'

{
  const testName = 'records from different modules should not share the same queue'
  test(testName, async (t) => {
    const { pokedexModule, movesModuleOf } = await createMagnetarInstance(testName)

    try {
      await Promise.all([
        pokedexModule.doc('137').merge({ ...pokedex(137), name: undefined }),
        movesModuleOf(137).doc('x').insert(allMovesArray[0]),
      ])
    } catch (error) {
      t.truthy(error)
    }

    t.deepEqual(pokedexModule.doc('137').data, undefined)
    t.deepEqual(movesModuleOf(137).doc('x').data, allMovesArray[0])
    await firestoreDeepEqual(t, testName, 'pokedex/137/moves/x', allMovesArray[0])
    await firestoreDeepEqual(t, testName, 'pokedex/137', undefined)
  })
}
