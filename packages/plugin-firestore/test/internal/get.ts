import test from 'ava'
import { createVueSyncInstance } from '../helpers/createVueSyncInstance'
import { DocMetadata } from '@vue-sync/core'

{
  const testName = 'get unexisting (document)'
  test(testName, async t => {
    /// get resolves once all stores have given a response with data
    const { trainerModule } = await createVueSyncInstance(testName)
    try {
      const result = await trainerModule
        .collection('unexistent')
        .doc('doc', { configPerStore: { remote: { firestorePath: 'bli/blu' } } })
        .get(undefined, {
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
