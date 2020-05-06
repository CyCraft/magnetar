import test from 'ava'
import { createVueSyncInstance } from '../helpers/createVueSyncInstance'
import { allPokemonArray } from '../helpers/pokemon'
import { pokedex } from '../helpers/pokedex'
import { DocInstance } from '@vue-sync/core'
import { firestoreDeepEqual } from '../helpers/firestoreDeepEqual'

{
  const testName = 'insert (document)'
  test(testName, async t => {
    const { pokedexModule } = await createVueSyncInstance(testName, { deletePaths: ['pokedex/7'] })
    const payload = pokedex(7)
    t.deepEqual(pokedexModule.doc('7').data, undefined)

    // in this case `useModulePathsForFirestore` is `false` in the plugin settings
    // so when creating a new doc reference we need to pass the `firestorePath`
    const squirtle = pokedexModule.doc('7', {
      configPerStore: { remote: { firestorePath: 'vueSyncTests/insert (document)/pokedex/7' } },
    })

    try {
      await squirtle.insert(payload)
    } catch (error) {
      t.fail(error)
    }

    const expected = payload
    t.deepEqual(pokedexModule.doc('7').data, expected)
    await firestoreDeepEqual(t, testName, 'pokedex/7', expected)
  })
}
{
  const testName = 'insert (collection) → id from payload'
  test(testName, async t => {
    const { pokedexModule } = await createVueSyncInstance(testName, { deletePaths: ['pokedex/7'] })
    const payload = pokedex(7)

    let moduleFromResult: DocInstance
    try {
      moduleFromResult = await pokedexModule.insert(payload)
    } catch (error) {
      t.fail(error)
    }

    const newId = moduleFromResult.id
    const expected = payload
    t.deepEqual(pokedexModule.doc(newId).data, expected)
    await firestoreDeepEqual(t, testName, `pokedex/${newId}`, expected)
  })
}
{
  const testName = 'insert (collection) → random id'
  test(testName, async t => {
    const { pokedexModule } = await createVueSyncInstance(testName)
    const payload = pokedex(7)
    delete payload.id

    let moduleFromResult: DocInstance
    try {
      moduleFromResult = await pokedexModule.insert(payload)
    } catch (error) {
      t.fail(error)
    }

    const newId = moduleFromResult.id
    const expected = payload
    t.deepEqual(pokedexModule.doc(newId).data, expected)
    await firestoreDeepEqual(t, testName, `pokedex/${newId}`, expected)
  })
}
{
  const testName = 'revert: insert (document)'
  test(testName, async t => {
    const { pokedexModule } = await createVueSyncInstance(testName)
    const payload = { ...pokedex(7), shouldFail: undefined }
    t.deepEqual(pokedexModule.doc('7').data, undefined)

    // in this case `useModulePathsForFirestore` is `false` in the plugin settings
    // so when creating a new doc reference we need to pass the `firestorePath`
    const squirtle = pokedexModule.doc('7', {
      configPerStore: {
        remote: { firestorePath: `vueSyncTests/${testName}/pokedex/7` },
      },
    })

    try {
      await squirtle.insert(payload, { onError: 'revert' })
    } catch (error) {
      t.truthy(error)
    }

    const expected = undefined
    t.deepEqual(pokedexModule.doc('7').data, expected)
    await firestoreDeepEqual(t, testName, 'pokedex/7', expected)
  })
}
{
  const testName = 'revert: insert (collection) → random ID'
  test(testName, async t => {
    const { pokedexModule } = await createVueSyncInstance(testName)
    const payload = { ...pokedex(7), shouldFail: undefined }

    try {
      await pokedexModule.insert(payload, { onError: 'revert' })
      t.fail()
    } catch (error) {
      t.truthy(error)
    }

    const expected = undefined
    t.deepEqual(pokedexModule.doc('7').data, expected)
    await firestoreDeepEqual(t, testName, 'pokedex/7', expected)
  })
}
