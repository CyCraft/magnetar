import test from 'ava'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance'
import { DocMetadata } from '../../../core/src'

{
  const testName = 'fetch unexisting (document)'
  test(testName, async (t) => {
    /// get resolves once all stores have given a response with data
    const { trainerModule } = await createMagnetarInstance(testName)
    try {
      t.deepEqual(trainerModule.collection('inexistent').doc('inexistent-doc').data, {})
      const result = await trainerModule
        .collection('inexistent')
        .doc('inexistent-doc')
        .fetch(undefined, {
          modifyReadResponseOn: {
            added: (docData: any, docMetadata: DocMetadata) => {
              t.deepEqual(docData, undefined)
              t.is(docMetadata.exists, false)
            },
          },
        })
      t.is(result.id, 'inexistent-doc')
      t.deepEqual(result.data, {})
    } catch (error) {
      t.fail(error)
    }
  })
}
