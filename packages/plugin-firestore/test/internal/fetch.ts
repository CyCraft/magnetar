import test from 'ava'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance'
import { DocMetadata } from '../../../core/src'
import { pokedex, waitMs } from '@magnetarjs/test-utils'

{
  const testName = 'fetch inexistent (document)'
  test(testName, async (t) => {
    /// get resolves once all stores have given a response with data
    const { trainerModule } = await createMagnetarInstance(testName)
    const inexistentDoc = trainerModule
      .collection('inexistent', {
        configPerStore: {
          // must pass the `firestorePath` here again if we want to stay within the `magnetarTests` scope.
          // Otherwise magnetar will computed the path like so: 'app-data/trainer/inexistent/inexistent-doc'
          remote: { firestorePath: 'magnetarTests/inexistent/inexistent-collection' },
        },
      })
      .doc('inexistent-doc')
    try {
      t.deepEqual(inexistentDoc.data, undefined)
      const result = await inexistentDoc.fetch(
        { force: true },
        {
          modifyReadResponseOn: {
            added: (docData: any, docMetadata: DocMetadata) => {
              t.deepEqual(docData, undefined)
              t.is(docMetadata.exists, false)
            },
          },
        }
      )
      t.deepEqual(result, undefined)
      t.deepEqual(inexistentDoc.data, undefined)
    } catch (error) {
      t.fail(JSON.stringify(error))
    }
  })
}
{
  const testName = 'fetch (doc) edit right before opening'
  test(testName, async (t) => {
    const { trainerModule } = await createMagnetarInstance(testName, {
      insertDocs: { '': { age: 10, name: 'Luca' } },
    })

    trainerModule.merge({ name: 'L' })
    await trainerModule.fetch().catch((e: any) => t.fail(e.message))

    t.deepEqual(trainerModule.data, { name: 'L', age: 10 })
  })
}
{
  const testName = 'fetch (collection) edit right before opening'
  test(testName, async (t) => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })

    pokedexModule.doc('1').merge({ name: 'B' })
    await pokedexModule.fetch().catch((e: any) => t.fail(e.message))

    t.deepEqual(pokedexModule.data.get('1'), { ...pokedex(1), name: 'B' })
  })
}
