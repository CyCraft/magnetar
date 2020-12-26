import test from 'ava'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance'
import { pokedex, PokedexEntry, pokedexGetAll, waitMs } from '@magnetarjs/test-utils'
import { firestoreDeepEqual } from '../helpers/firestoreDeepEqual'
import { DocInstance } from '../../../core/src'

{
  const testName = 'insert (document)'
  test(testName, async (t) => {
    const { pokedexModule } = await createMagnetarInstance(testName, { deletePaths: ['pokedex/7'] })
    const payload = pokedex(7)
    t.deepEqual(pokedexModule.doc('7').data, undefined)

    const { pokedexModule: p } = await createMagnetarInstance('read')
    pokedexGetAll().forEach((_p) => p.insert(_p))
    await waitMs(3000)

    // in this case `useModulePathsForFirestore` is `false` in the plugin settings
    // so when creating a new doc reference we need to pass the `firestorePath`
    const squirtle = pokedexModule.doc('7', {
      configPerStore: { remote: { firestorePath: 'magnetarTests/insert (document)/pokedex/7' } },
    })

    try {
      await squirtle.insert(payload)
    } catch (error) {
      t.fail(error)
    }

    const expected = payload
    t.deepEqual(pokedexModule.doc('7').data, expected as any)
    await firestoreDeepEqual(t, testName, 'pokedex/7', expected as any)
  })
}
{
  const testName = 'insert (collection) → id from payload'
  test(testName, async (t) => {
    const { pokedexModule } = await createMagnetarInstance(testName, { deletePaths: ['pokedex/7'] })
    const payload = pokedex(7)

    let moduleFromResult: DocInstance<PokedexEntry>
    try {
      moduleFromResult = await pokedexModule.insert(payload)
    } catch (error) {
      t.fail(error)
      return
    }

    const newId = moduleFromResult.id
    const expected = payload
    t.deepEqual(pokedexModule.doc(newId).data, expected as any)
    await firestoreDeepEqual(t, testName, `pokedex/${newId}`, expected as any)
  })
}
{
  const testName = 'insert (collection) → random id'
  test(testName, async (t) => {
    const { pokedexModule } = await createMagnetarInstance(testName)
    const payload = pokedex(7)
    delete payload.id

    let moduleFromResult: DocInstance<PokedexEntry>
    try {
      moduleFromResult = await pokedexModule.insert(payload)
    } catch (error) {
      t.fail(error)
      return
    }

    const newId = moduleFromResult.id
    const expected = payload
    t.deepEqual(pokedexModule.doc(newId).data, expected as any)
    await firestoreDeepEqual(t, testName, `pokedex/${newId}`, expected as any)
  })
}
{
  const testName = 'revert: insert (document)'
  test(testName, async (t) => {
    const { pokedexModule } = await createMagnetarInstance(testName)
    const payload = { ...pokedex(7), shouldFail: undefined }
    t.deepEqual(pokedexModule.doc('7').data, undefined)

    // in this case `useModulePathsForFirestore` is `false` in the plugin settings
    // so when creating a new doc reference we need to pass the `firestorePath`
    const squirtle = pokedexModule.doc('7', {
      configPerStore: {
        remote: { firestorePath: `magnetarTests/${testName}/pokedex/7` },
      },
    })

    try {
      await squirtle.insert(payload, { onError: 'revert' })
    } catch (error) {
      t.truthy(error)
    }

    const expected = undefined
    t.deepEqual(pokedexModule.doc('7').data, expected as any)
    await firestoreDeepEqual(t, testName, 'pokedex/7', expected as any)
  })
}
{
  const testName = 'revert: insert (collection) → random ID'
  test(testName, async (t) => {
    const { pokedexModule } = await createMagnetarInstance(testName)
    const payload = { ...pokedex(7), shouldFail: undefined }

    try {
      await pokedexModule.insert(payload, { onError: 'revert' })
      t.fail()
    } catch (error) {
      t.truthy(error)
    }

    const expected = undefined
    t.deepEqual(pokedexModule.doc('7').data, expected as any)
    await firestoreDeepEqual(t, testName, 'pokedex/7', expected as any)
  })
}
