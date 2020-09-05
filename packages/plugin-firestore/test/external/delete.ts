import test from 'ava'
import { createVueSyncInstance } from '../helpers/createVueSyncInstance'
import { firestoreDeepEqual } from '../helpers/firestoreDeepEqual'

{
  const testName = 'delete'
  test(testName, async t => {
    const { trainerModule } = await createVueSyncInstance(testName, {
      insertDocs: { '': { age: 10, name: 'Luca' } },
    })
    t.deepEqual(trainerModule.data, { age: 10, name: 'Luca' })

    try {
      await trainerModule.delete()
    } catch (error) {
      t.fail(error)
    }

    const expected = undefined
    t.deepEqual(trainerModule.data, expected)
    await firestoreDeepEqual(t, testName, '', expected)
  })
}
