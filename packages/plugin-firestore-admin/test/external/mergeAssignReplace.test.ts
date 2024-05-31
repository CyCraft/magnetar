import { pokedex } from '@magnetarjs/test-utils'
import { assert, test } from 'vitest'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance.js'
import { firestoreDeepEqual } from '../helpers/firestoreDeepEqual.js'

{
  const testName = 'merge'
  test(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    await firestoreDeepEqual(testName, 'pokedex/1', pokedex(1))
    const payload = { base: { HP: 9000 } }
    assert.deepEqual(pokedexModule.doc('1').data, pokedex(1))

    try {
      await pokedexModule.doc('1').merge(payload)
    } catch (error) {
      assert.fail(JSON.stringify(error))
    }

    const expected = {
      id: 1,
      name: 'Bulbasaur',
      type: ['Grass', 'Poison'],
      base: {
        HP: 9000,
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
  const testName = 'assign'
  test(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    await firestoreDeepEqual(testName, 'pokedex/1', pokedex(1))
    const payload = { base: { HP: 9000 } }
    assert.deepEqual(pokedexModule.doc('1').data, pokedex(1))

    try {
      await pokedexModule.doc('1').assign(payload)
    } catch (error) {
      assert.fail(JSON.stringify(error))
    }

    const expected = {
      id: 1,
      name: 'Bulbasaur',
      type: ['Grass', 'Poison'],
      base: {
        HP: 9000,
      },
    }
    assert.deepEqual(pokedexModule.doc('1').data, expected as any)
    await firestoreDeepEqual(testName, 'pokedex/1', expected as any)
  })
}
{
  const testName = 'replace'
  test(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    await firestoreDeepEqual(testName, 'pokedex/1', pokedex(1))
    const payload = { base: { HP: 9000 } }
    assert.deepEqual(pokedexModule.doc('1').data, pokedex(1))

    try {
      await pokedexModule.doc('1').replace(payload)
    } catch (error) {
      assert.fail(JSON.stringify(error))
    }

    const expected = { base: { HP: 9000 } }
    assert.deepEqual(pokedexModule.doc('1').data, expected as any)
    await firestoreDeepEqual(testName, 'pokedex/1', expected as any)
  })
}
{
  // these tests are not really testing reverting the remote store, only the local store:
  const testName = 'revert: merge'
  test(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    await firestoreDeepEqual(testName, 'pokedex/1', pokedex(1))
    const payload = { base: { HP: undefined } }
    assert.deepEqual(pokedexModule.doc('1').data, pokedex(1))

    try {
      await pokedexModule.doc('1').merge(payload, { onError: 'revert' })
    } catch (error) {
      assert.isTrue(!!error)
    }

    const expected = pokedex(1)
    assert.deepEqual(pokedexModule.doc('1').data, expected as any)
    await firestoreDeepEqual(testName, 'pokedex/1', expected as any)
  })
}
{
  // these tests are not really testing reverting the remote store, only the local store:
  const testName = 'revert: assign'
  test(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    await firestoreDeepEqual(testName, 'pokedex/1', pokedex(1))
    const payload = { base: { HP: undefined } }
    assert.deepEqual(pokedexModule.doc('1').data, pokedex(1))

    try {
      await pokedexModule.doc('1').assign(payload, { onError: 'revert' })
    } catch (error) {
      assert.isTrue(!!error)
    }

    const expected = pokedex(1)
    assert.deepEqual(pokedexModule.doc('1').data, expected as any)
    await firestoreDeepEqual(testName, 'pokedex/1', expected as any)
  })
}
{
  // these tests are not really testing reverting the remote store, only the local store:
  const testName = 'revert: replace'
  test(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    await firestoreDeepEqual(testName, 'pokedex/1', pokedex(1))
    const payload = { base: { HP: undefined } }
    assert.deepEqual(pokedexModule.doc('1').data, pokedex(1))

    try {
      await pokedexModule.doc('1').replace(payload, { onError: 'revert' })
    } catch (error) {
      assert.isTrue(!!error)
    }

    const expected = pokedex(1)
    assert.deepEqual(pokedexModule.doc('1').data, expected as any)
    await firestoreDeepEqual(testName, 'pokedex/1', expected as any)
  })
}
