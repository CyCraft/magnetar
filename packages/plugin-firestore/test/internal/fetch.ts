import test from 'ava'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance'
import { DocMetadata } from '../../../core/src'

{
  const testName = 'fetch unexisting (document)'
  test(testName, async (t) => {
    /// get resolves once all stores have given a response with data
    const { trainerModule } = await createMagnetarInstance(testName)
    const inexistentDoc = trainerModule.collection('inexistent').doc('inexistent-doc')
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
