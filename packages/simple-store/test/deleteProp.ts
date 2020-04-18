import test from 'ava'
import { createVueSyncInstance } from './helpers/createVueSyncInstance'
import { isModuleDataEqual } from './helpers/compareModuleData'

test('deleteProp: (document)', async t => {
  const { trainerModule, vueSync } = createVueSyncInstance()
  const deletePayload = 'age'
  isModuleDataEqual(t, vueSync, 'data/trainer', { name: 'Luca', age: 10 })

  try {
    await trainerModule.deleteProp(deletePayload)
  } catch (error) {
    t.fail(error)
  }

  isModuleDataEqual(t, vueSync, 'data/trainer', { name: 'Luca' })
})
