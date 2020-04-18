import test from 'ava'
import { createVueSyncInstance } from './helpers/createVueSyncInstance'
import { isModuleDataEqual } from './helpers/compareModuleData'

test('delete: (document)', async t => {
  const { trainerModule, vueSync } = createVueSyncInstance()
  isModuleDataEqual(t, vueSync, 'data/trainer', { age: 10, name: 'Luca' })

  try {
    await trainerModule.delete()
  } catch (error) {
    t.fail(error)
  }

  isModuleDataEqual(t, vueSync, 'data/trainer', undefined)
})
