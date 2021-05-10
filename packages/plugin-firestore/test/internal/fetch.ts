import test from 'ava'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance'
import { DocMetadata } from '../../../core/src'

{
  const testName = 'fetch unexisting (document)'
  test(testName, async (t) => {
    /// get resolves once all stores have given a response with data
    const { trainerModule } = await createMagnetarInstance(testName)
    try {
      const result = await trainerModule
        .collection('inexistent')
        .doc('inexistent-doc', { configPerStore: { remote: { firestorePath: 'bli/blu' } } })
        .fetch(undefined, {
          modifyReadResponseOn: {
            added: (docData: any, docMetadata: DocMetadata) => {
              t.deepEqual(docData, {})
              t.is(docMetadata.exists, false)
            },
          },
        })
      t.is(result.id, 'doc')
      t.deepEqual(result.data, {})
    } catch (error) {
      t.fail(error)
    }
  })
}
