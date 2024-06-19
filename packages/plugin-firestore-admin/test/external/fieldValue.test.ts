import { pokedex } from '@magnetarjs/test-utils'
import { FieldValue } from 'firebase-admin/firestore'
import { assert, expect, test } from 'vitest'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance.js'
import { firestoreDeepEqual } from '../helpers/firestoreDeepEqual.js'

{
  const testName = 'fieldValue increment'
  test(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    await firestoreDeepEqual(testName, 'pokedex/1', pokedex(1))
    assert.deepEqual(pokedexModule.doc('1').data, pokedex(1))

    const payload = { base: { HP: FieldValue.increment(1) as any } }
    try {
      await pokedexModule.doc('1').merge(payload)
    } catch (error) {
      assert.fail(JSON.stringify(error))
    }

    const _pokedex = pokedexModule.doc('1').data
    const pokedexHp = _pokedex?.base.HP as any

    expect(pokedexHp.constructor.name).toBe('NumericIncrementTransform')
    expect(pokedexHp.operand).toBe(1)
  })
}
