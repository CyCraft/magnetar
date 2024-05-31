import { allMovesArray, pokedex } from '@magnetarjs/test-utils'
import { assert, test } from 'vitest'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance.js'
import { firestoreDeepEqual } from '../helpers/firestoreDeepEqual.js'

{
  const testName = 'records from different modules should not share the same queue'
  // TODO: somehow this doesn't work with the admin sdk emulators, but it does with the client sdk emulators!
  //      I think it's not an issue in production though...
  test.skip(testName, async () => {
    const { pokedexModule, movesModuleOf } = await createMagnetarInstance(testName)

    try {
      await Promise.all([
        pokedexModule.doc('137').merge({ ...pokedex(137), name: undefined }),
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        movesModuleOf(137).doc('x').insert(allMovesArray[0]!),
      ])
    } catch (error) {
      assert.isTrue(!!error)
    }

    assert.deepEqual(pokedexModule.doc('137').data, undefined)
    assert.deepEqual(movesModuleOf(137).doc('x').data, allMovesArray[0])
    await firestoreDeepEqual(testName, 'pokedex/137/moves/x', allMovesArray[0])
    await firestoreDeepEqual(testName, 'pokedex/137', undefined)
  })
}
