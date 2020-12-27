import { pokedex } from '@magnetarjs/test-utils'
import test from 'ava'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance'
import { firestoreDeepEqual } from '../helpers/firestoreDeepEqual'

{
  const testName = 'delete (document)'
  test(testName, async (t) => {
    const { trainerModule } = await createMagnetarInstance(testName, {
      insertDocs: { '': { age: 10, name: 'Luca' } },
    })
    t.deepEqual(trainerModule.data, { age: 10, name: 'Luca' })

    try {
      await trainerModule.delete()
    } catch (error) {
      t.fail(error)
    }

    const expected = undefined
    t.deepEqual(trainerModule.data, expected as any)
    await firestoreDeepEqual(t, testName, '', expected as any)
  })
}
{
  const testName = 'delete (collection)'
  test(testName, async (t) => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    t.deepEqual(pokedexModule.doc('1').data, pokedex(1))

    try {
      await pokedexModule.delete('1')
    } catch (error) {
      t.fail(error)
    }

    const expected = undefined
    t.deepEqual(pokedexModule.data.get('1'), expected as any)
    await firestoreDeepEqual(t, testName, 'pokedex/1', expected as any)
  })
}
