import { pokedex } from '@magnetarjs/test-utils'
import { assert, test } from 'vitest'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance.js'
import { firestoreDeepEqual } from '../helpers/firestoreDeepEqual.js'

{
  const testName = 'delete (document)'
  test(testName, async () => {
    const { trainerModule } = await createMagnetarInstance(testName, {
      insertDocs: { '': { age: 10, name: 'Luca' } },
    })
    assert.deepEqual(trainerModule.data, { age: 10, name: 'Luca' })

    try {
      await trainerModule.delete()
    } catch (error) {
      assert.fail(JSON.stringify(error))
    }

    const expected = undefined
    assert.deepEqual(trainerModule.data, expected as any)
    await firestoreDeepEqual(testName, '', expected as any)
  })
}
{
  const testName = 'delete (collection)'
  test(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    assert.deepEqual(pokedexModule.doc('1').data, pokedex(1))

    try {
      await pokedexModule.delete('1')
    } catch (error) {
      assert.fail(JSON.stringify(error))
    }

    const expected = undefined
    assert.deepEqual(pokedexModule.data.get('1'), expected as any)
    await firestoreDeepEqual(testName, 'pokedex/1', expected as any)
  })
}
