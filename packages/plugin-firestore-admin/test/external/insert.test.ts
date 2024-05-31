import { pokedex, PokedexEntry, pokedexGetAll, waitMs } from '@magnetarjs/test-utils'
import type { DocInstance } from '@magnetarjs/types'
import { assert, test } from 'vitest'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance.js'
import { firestoreDeepEqual } from '../helpers/firestoreDeepEqual.js'

{
  const testName = 'insert (document)'
  test(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance(testName)
    const payload = pokedex(7)
    assert.deepEqual(pokedexModule.doc('7').data, undefined)

    const { pokedexModule: p } = await createMagnetarInstance('read')
    pokedexGetAll().forEach((_p) => p.insert(_p))
    await waitMs(3000)

    const squirtle = pokedexModule.doc('7')

    try {
      await squirtle.insert(payload)
    } catch (error) {
      assert.fail(JSON.stringify(error))
    }

    const expected = payload
    assert.deepEqual(pokedexModule.doc('7').data, expected as any)
    await firestoreDeepEqual(testName, 'pokedex/7', expected as any)
  })
}
{
  const testName = 'insert (collection) → id from payload'
  test(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance(testName)
    const payload = pokedex(7)

    let moduleFromResult: DocInstance<PokedexEntry>
    try {
      moduleFromResult = await pokedexModule.insert(payload)
    } catch (error) {
      assert.fail(JSON.stringify(error))
      return
    }

    const newId = moduleFromResult.id
    const expected = payload
    assert.deepEqual(pokedexModule.doc(newId).data, expected as any)
    await firestoreDeepEqual(testName, `pokedex/${newId}`, expected as any)
  })
}
{
  const testName = 'insert (collection) → random id'
  test(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance(testName)
    const payload = pokedex(7)
    delete payload.id

    let moduleFromResult: DocInstance<PokedexEntry>
    try {
      moduleFromResult = await pokedexModule.insert(payload)
    } catch (error) {
      assert.fail(JSON.stringify(error))
      return
    }

    const newId = moduleFromResult.id
    const expected = payload
    assert.deepEqual(pokedexModule.doc(newId).data, expected as any)
    await firestoreDeepEqual(testName, `pokedex/${newId}`, expected as any)
  })
}
{
  const testName = 'revert: insert (document)'
  test(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance(testName)
    const payload = { ...pokedex(7), shouldFail: undefined }
    assert.deepEqual(pokedexModule.doc('7').data, undefined)

    const squirtle = pokedexModule.doc('7')

    try {
      await squirtle.insert(payload, { onError: 'revert' })
    } catch (error) {
      assert.isTrue(!!error)
    }

    const expected = undefined
    assert.deepEqual(pokedexModule.doc('7').data, expected as any)
    await firestoreDeepEqual(testName, 'pokedex/7', expected as any)
  })
}
{
  const testName = 'revert: insert (collection) → random ID'
  test(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance(testName)
    const payload = { ...pokedex(7), shouldFail: undefined }

    try {
      await pokedexModule.insert(payload, { onError: 'revert' })
      assert.fail()
    } catch (error) {
      assert.isTrue(!!error)
    }

    const expected = undefined
    assert.deepEqual(pokedexModule.doc('7').data, expected as any)
    await firestoreDeepEqual(testName, 'pokedex/7', expected as any)
  })
}
