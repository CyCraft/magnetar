import test from 'ava'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance'

test('delete', async (t) => {
  const { trainerModule } = createMagnetarInstance()
  t.deepEqual(trainerModule.data, { age: 10, name: 'Luca' })

  try {
    await trainerModule.delete()
  } catch (error) {
    t.fail(error)
  }

  t.deepEqual(trainerModule.data, undefined)
})

test('revert: delete', async (t) => {
  const { trainerModule } = createMagnetarInstance()
  t.deepEqual(trainerModule.data, { age: 10, name: 'Luca' })

  try {
    // @ts-ignore
    await trainerModule.delete('remote', { onError: 'revert' }) // mocks error on delete for remote store mock
  } catch (error) {
    t.truthy(error)
  }

  t.deepEqual(trainerModule.data, { age: 10, name: 'Luca' })
})
