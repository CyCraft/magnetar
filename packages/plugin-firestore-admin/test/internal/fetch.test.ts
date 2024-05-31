import { pokedex } from '@magnetarjs/test-utils'
import type { DocMetadata } from '@magnetarjs/types'
import { assert, test } from 'vitest'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance.js'

{
  const testName = 'fetch inexistent (document)'
  test(testName, async () => {
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
      assert.deepEqual(inexistentDoc.data, undefined)
      const result = await inexistentDoc.fetch(
        { force: true },
        {
          modifyReadResponseOn: {
            added: (docData: any, docMetadata: DocMetadata) => {
              assert.deepEqual(docData, undefined)
              assert.deepEqual(docMetadata.exists, false)
              return docData
            },
          },
        }
      )
      assert.deepEqual(result, undefined)
      assert.deepEqual(inexistentDoc.data, undefined)
    } catch (error) {
      assert.fail(JSON.stringify(error))
    }
  })
}
{
  const testName = 'fetch (doc) edit right before opening'
  test(testName, async () => {
    const { trainerModule } = await createMagnetarInstance(testName, {
      insertDocs: { '': { age: 10, name: 'Luca' } },
    })

    trainerModule.merge({ name: 'L' })
    await trainerModule.fetch().catch((e: any) => assert.fail(e.message))

    assert.deepEqual(trainerModule.data, { name: 'L', age: 10 })
  })
}
{
  const testName = 'fetch (doc) edit right before opening, but already having fetched once'
  test(testName, async () => {
    const { trainerModule } = await createMagnetarInstance(testName, {
      insertDocs: { '': { age: 10, name: 'Luca' } },
    })

    await trainerModule.fetch().catch((e: any) => assert.fail(e.message))
    trainerModule.merge({ name: 'L' })
    await trainerModule.fetch().catch((e: any) => assert.fail(e.message))

    assert.deepEqual(trainerModule.data, { name: 'L', age: 10 })
  })
}
{
  const testName = 'fetch (collection) edit right before opening'
  test(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })

    pokedexModule.doc('1').merge({ name: 'B' })
    await pokedexModule.fetch().catch((e: any) => assert.fail(e.message))

    assert.deepEqual(pokedexModule.data.get('1'), { ...pokedex(1), name: 'B' })
  })
}
{
  const testName = 'fetch (collection) default behaviour'
  test(testName, async () => {
    /// 'fetch' resolves once all stores have given a response with data
    const { pokedexModule } = await createMagnetarInstance('read')
    assert.deepEqual(pokedexModule.doc('1').data, undefined)
    assert.deepEqual(pokedexModule.doc('136').data, undefined)
    assert.deepEqual(pokedexModule.data.size, 0)

    let result: any
    try {
      result = await pokedexModule.where('name', '==', 'Eevee').fetch()
    } catch (error) {
      assert.fail(JSON.stringify(error))
    }
    assert.deepEqual(pokedexModule.doc('1').data, undefined)
    assert.deepEqual(pokedexModule.data.size, 1)
    assert.deepEqual(result.size, 1)
    try {
      result = await pokedexModule.where('type', 'array-contains', 'Fire').fetch()
    } catch (error) {
      assert.fail(JSON.stringify(error))
    }
    assert.deepEqual(result.size, 12)
    assert.deepEqual(pokedexModule.data.size, 13)
  })
}
{
  const testName = 'fetch (collectionGroup) default behaviour'
  test(testName, async () => {
    /// 'fetch' resolves once all stores have given a response with data
    const { movesModuleOf, movesModuleGroupCollection } = await createMagnetarInstance('read')
    assert.deepEqual(movesModuleOf(1).data.size, 0)

    let result: any
    try {
      result = await movesModuleOf(1).fetch()
    } catch (error) {
      assert.fail(JSON.stringify(error))
    }
    assert.deepEqual(result.size, 4)
    assert.deepEqual(movesModuleOf(1).data.size, 4)

    assert.deepEqual(movesModuleGroupCollection.data.size, 0)
    try {
      result = await movesModuleGroupCollection.fetch()
    } catch (error) {
      assert.fail(JSON.stringify(error))
    }
    assert.deepEqual(result.size, 604)
    assert.deepEqual(movesModuleGroupCollection.data.size, 604)
  })
}
