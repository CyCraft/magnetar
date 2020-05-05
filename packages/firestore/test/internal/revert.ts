import test, { after } from 'ava'
import { createVueSyncInstance } from '../helpers/createVueSyncInstance'
import { pokedex } from '../helpers/pokedex'
import { firestoreDeepEqual } from '../helpers/firestoreDeepEqual'

{
  const testName = 'revert: (remote → local) insert (document)'
  test(testName, async t => {
    const { pokedexModule } = await createVueSyncInstance(testName)
    const payload = { ...pokedex(7), shouldFail: 'local' }
    t.deepEqual(pokedexModule.doc('7').data, undefined)

    // in this case `useModulePathsForFirestore` is `false` in the plugin settings
    // so when creating a new doc reference we need to pass the `firestorePath`
    const squirtle = pokedexModule.doc('7', {
      configPerStore: {
        remote: { firestorePath: `vueSyncTests/${testName}/pokedex/7` },
      },
    })

    try {
      await squirtle.insert(payload, {
        onError: 'revert',
        executionOrder: ['remote', 'local'],
        on: {
          success: async ({ storeName }) => {
            if (storeName !== 'remote') return
            await firestoreDeepEqual(t, testName, 'pokedex/7', payload, 'should exist')
          },
        },
      })
    } catch (error) {
      t.truthy(error)
    }

    const expected = undefined
    t.deepEqual(pokedexModule.doc('7').data, expected)
    await firestoreDeepEqual(t, testName, 'pokedex/7', expected, 'should be deleted')
  })
}
{
  const testName = 'revert: (remote → local) insert (collection) → random ID'
  test(testName, async t => {
    const { pokedexModule } = await createVueSyncInstance(testName)
    const payload = { ...pokedex(7), shouldFail: 'local' }

    try {
      await pokedexModule.insert(payload, {
        onError: 'revert',
        executionOrder: ['remote', 'local'],
        on: {
          success: async ({ storeName }) => {
            if (storeName !== 'remote') return
            await firestoreDeepEqual(t, testName, 'pokedex/7', payload, 'should exist')
          },
        },
      })
      t.fail()
    } catch (error) {
      t.truthy(error)
    }

    const expected = undefined
    t.deepEqual(pokedexModule.doc('7').data, expected)
    await firestoreDeepEqual(t, testName, 'pokedex/7', expected, 'should be deleted')
  })
}
