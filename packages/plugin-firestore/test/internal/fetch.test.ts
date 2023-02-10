import test from 'ava'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance'
import { DocMetadata } from '@magnetarjs/types'
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
              t.deepEqual(docMetadata.exists, false)
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
  const testName = 'fetchCount() then right after do fetch()'
  test(testName, async (t) => {
    /// 'fetchCount' resolves once all stores have given a response with data
    const { pokedexModule } = await createMagnetarInstance('read')
    t.deepEqual(pokedexModule.data.size, 0)
    t.deepEqual(pokedexModule.count, 0)

    try {
      await pokedexModule.fetchCount()
      await pokedexModule.fetch({ force: true })
    } catch (error) {
      t.fail(JSON.stringify(error))
    }
    t.deepEqual(pokedexModule.data.size, 151)
    t.deepEqual(pokedexModule.count, 151)
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
{
  const testName = 'fetch (collection) default behaviour'
  test(testName, async (t) => {
    /// 'fetch' resolves once all stores have given a response with data
    const { pokedexModule } = await createMagnetarInstance('read')
    t.deepEqual(pokedexModule.doc('1').data, undefined)
    t.deepEqual(pokedexModule.doc('136').data, undefined)
    t.deepEqual(pokedexModule.data.size, 0)

    let result: any
    try {
      result = await pokedexModule.where('name', '==', 'Eevee').fetch()
    } catch (error) {
      t.fail(JSON.stringify(error))
    }
    t.deepEqual(pokedexModule.doc('1').data, undefined)
    t.deepEqual(pokedexModule.data.size, 1)
    t.deepEqual(result.size, 1)
    try {
      result = await pokedexModule.where('type', 'array-contains', 'Fire').fetch()
    } catch (error) {
      t.fail(JSON.stringify(error))
    }
    t.deepEqual(result.size, 12)
    t.deepEqual(pokedexModule.data.size, 13)
  })
}
{
  const testName = 'fetch (collectionGroup) default behaviour'
  test(testName, async (t) => {
    /// 'fetch' resolves once all stores have given a response with data
    const { movesModuleOf, movesModuleGroupCollection } = await createMagnetarInstance('read')
    t.deepEqual(movesModuleOf(1).data.size, 0)

    let result: any
    try {
      result = await movesModuleOf(1).fetch()
    } catch (error) {
      t.fail(JSON.stringify(error))
    }
    t.deepEqual(result.size, 4)
    t.deepEqual(movesModuleOf(1).data.size, 4)

    t.deepEqual(movesModuleGroupCollection.data.size, 0)
    try {
      result = await movesModuleGroupCollection.fetch()
    } catch (error) {
      t.fail(JSON.stringify(error))
    }
    t.deepEqual(result.size, 604)
    t.deepEqual(movesModuleGroupCollection.data.size, 604)
  })
}
