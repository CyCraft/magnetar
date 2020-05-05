import test from 'ava'
import { createVueSyncInstance } from '../helpers/createVueSyncInstance'
import { firestoreDeepEqual } from '../helpers/firestoreDeepEqual'

{
  const testName = 'delete'
  test(testName, async t => {
    const { trainerModule } = await createVueSyncInstance(testName)
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
{
  const testName = 'revert: delete'
  test(testName, async t => {
    const { trainerModule } = await createVueSyncInstance(testName)
    t.deepEqual(trainerModule.data, { age: 10, name: 'Luca' })

    try {
      // @ts-ignore
      await trainerModule.delete('remote', { onError: 'revert' }) // mocks error on delete for remote store mock
    } catch (error) {
      t.truthy(error)
    }

    const expected = { age: 10, name: 'Luca' }
    t.deepEqual(trainerModule.data, expected)
    await firestoreDeepEqual(t, testName, '', expected)
  })
}
