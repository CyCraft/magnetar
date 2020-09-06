import test from 'ava'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance'
import { firestoreDeepEqual } from '../helpers/firestoreDeepEqual'

{
  const testName = 'delete'
  test(testName, async (t) => {
    const { trainerModule } = await createMagnetarInstance(testName, {
      insertDocs: { '': { age: 10, name: 'Luca' } },
    })
    t.deepEqual(trainerModule.data, { age: 10, name: 'Luca' })

    try {
      await trainerModule.delete()
    } catch (error) {
      t.fail(error)
    }

    const expected = undefined
    t.deepEqual(trainerModule.data, expected as any)
    await firestoreDeepEqual(t, testName, '', expected as any)
  })
}
