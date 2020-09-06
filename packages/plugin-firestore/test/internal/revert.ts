import test from 'ava'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance'
import { pokedex } from 'test-utils'
import { firestoreDeepEqual } from '../helpers/firestoreDeepEqual'

{
  const testName = 'revert: (remote → local) insert (document)'
  test(testName, async (t) => {
    const { pokedexModule } = await createMagnetarInstance(testName)
    const payload = { ...pokedex(7), shouldFail: 'local' }
    t.deepEqual(pokedexModule.doc('7').data, undefined)

    // in this case `useModulePathsForFirestore` is `false` in the plugin settings
    // so when creating a new doc reference we need to pass the `firestorePath`
    const squirtle = pokedexModule.doc('7', {
      configPerStore: {
        remote: { firestorePath: `magnetarTests/${testName}/pokedex/7` },
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
    t.deepEqual(pokedexModule.doc('7').data, expected as any)
    await firestoreDeepEqual(t, testName, 'pokedex/7', expected, 'should be deleted')
  })
}
{
  const testName = 'revert: (remote → local) insert (collection) → random ID'
  test(testName, async (t) => {
    const { pokedexModule } = await createMagnetarInstance(testName)
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
    t.deepEqual(pokedexModule.doc('7').data, expected as any)
    await firestoreDeepEqual(t, testName, 'pokedex/7', expected, 'should be deleted')
  })
}
// Todo: currently not possible
// see: https://github.com/cycraft/core/issues/2
// {
//   const testName = 'revert: (remote → local) delete (document)'
//   test(testName, async t => {
//     const payload = { ...pokedex(7), shouldFailDelete: 'local' }
//     const { pokedexModule } = await createMagnetarInstance(testName)
//     t.deepEqual(pokedexModule.doc('7').data, undefined)
//     await pokedexModule.insert(payload)
//     t.deepEqual(pokedexModule.doc('7').data, payload)

//     try {
//       await pokedexModule
//         .doc('7', {
//           configPerStore: { remote: { firestorePath: `magnetarTests/${testName}/pokedex/7` } },
//         })
//         .delete(undefined, {
//           onError: 'revert',
//           executionOrder: ['remote', 'local'],
//           on: {
//             success: async ({ storeName }) => {
//               if (storeName !== 'remote') return
//               await firestoreDeepEqual(t, testName, 'pokedex/7', undefined, 'should not exist')
//             },
//           },
//         })
//     } catch (error) {
//       t.truthy(error)
//     }
//     const expected = payload
//     t.deepEqual(pokedexModule.doc('7').data, expected as any)
//     await firestoreDeepEqual(
//       t,
//       testName,
//       'pokedex/7',
//       expected,
//       'should exist again because of revertion'
//     )
//   })
// }

const conf = (testName: string): any => ({
  configPerStore: { remote: { firestorePath: `magnetarTests/${testName}/pokedex/1` } },
})
{
  // this tests is _not really_ testing reverting the remote store, they test if the local store is reverted and if the remote store stays untouched on an error
  const testName = 'revert: merge (with extra checks)'
  test(testName, async (t) => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    await firestoreDeepEqual(t, testName, 'pokedex/1', pokedex(1))
    const payload = { base: { HP: undefined } }
    t.deepEqual(pokedexModule.doc('1', conf(testName)).data, pokedex(1))

    try {
      await pokedexModule.doc('1', conf(testName)).merge(payload, {
        onError: 'revert',
        on: {
          success: ({ storeName }) => {
            if (storeName !== 'local') return
            const expectedMidway = {
              id: 1,
              name: 'Bulbasaur',
              type: ['Grass', 'Poison'],
              base: {
                'HP': undefined,
                'Attack': 49,
                'Defense': 49,
                'Sp. Attack': 65,
                'Sp. Defense': 65,
                'Speed': 45,
              },
            }
            t.deepEqual(pokedexModule.doc('1', conf(testName)).data, expectedMidway as any)
          },
        },
      })
    } catch (error) {
      t.truthy(error)
    }

    const expected = pokedex(1)
    t.deepEqual(pokedexModule.doc('1', conf(testName)).data, expected as any)
    await firestoreDeepEqual(t, testName, 'pokedex/1', expected as any)
  })
}
{
  // this tests is _not really_ testing reverting the remote store, they test if the local store is reverted and if the remote store stays untouched on an error
  const testName = 'revert: assign (with extra checks)'
  test(testName, async (t) => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    await firestoreDeepEqual(t, testName, 'pokedex/1', pokedex(1))
    const payload = { base: { HP: undefined } }
    t.deepEqual(pokedexModule.doc('1', conf(testName)).data, pokedex(1))

    try {
      await pokedexModule.doc('1', conf(testName)).assign(payload, {
        onError: 'revert',
        on: {
          success: ({ storeName }) => {
            if (storeName !== 'local') return
            const expectedMidway = {
              id: 1,
              name: 'Bulbasaur',
              type: ['Grass', 'Poison'],
              base: {
                HP: undefined,
              },
            }
            t.deepEqual(pokedexModule.doc('1', conf(testName)).data, expectedMidway as any)
          },
        },
      })
    } catch (error) {
      t.truthy(error)
    }

    const expected = pokedex(1)
    t.deepEqual(pokedexModule.doc('1', conf(testName)).data, expected as any)
    await firestoreDeepEqual(t, testName, 'pokedex/1', expected as any)
  })
}
{
  // this tests is _not really_ testing reverting the remote store, they test if the local store is reverted and if the remote store stays untouched on an error
  const testName = 'revert: replace (with extra checks)'
  test(testName, async (t) => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    await firestoreDeepEqual(t, testName, 'pokedex/1', pokedex(1))
    const payload = { base: { HP: undefined } }
    t.deepEqual(pokedexModule.doc('1', conf(testName)).data, pokedex(1))

    try {
      await pokedexModule.doc('1', conf(testName)).replace(payload, {
        onError: 'revert',
        on: {
          success: ({ storeName }) => {
            if (storeName !== 'local') return
            const expectedMidway = { base: { HP: undefined } }
            t.deepEqual(pokedexModule.doc('1', conf(testName)).data, expectedMidway as any)
          },
        },
      })
    } catch (error) {
      t.truthy(error)
    }

    const expected = pokedex(1)
    t.deepEqual(pokedexModule.doc('1', conf(testName)).data, expected as any)
    await firestoreDeepEqual(t, testName, 'pokedex/1', expected as any)
  })
}
