import test from 'ava'
import { createVueSyncInstance } from './helpers/createVueSyncInstance'
import { isModuleDataEqual } from './helpers/compareModuleData'

test('delete', async t => {
  const { trainerModule, vueSync } = createVueSyncInstance()
  isModuleDataEqual(t, vueSync, 'data/trainer', { age: 10, name: 'Luca' })

  try {
    await trainerModule.delete()
  } catch (error) {
    t.fail(error)
  }

  isModuleDataEqual(t, vueSync, 'data/trainer', undefined)
})

test('revert: delete', async t => {
  const { trainerModule, vueSync } = createVueSyncInstance()
  isModuleDataEqual(t, vueSync, 'data/trainer', { age: 10, name: 'Luca' })

  try {
    // @ts-ignore
    await trainerModule.delete('remote', { onError: 'revert' }) // mocks error on delete for remote store mock
  } catch (error) {
    t.fail(error)
  }

  isModuleDataEqual(t, vueSync, 'data/trainer', { age: 10, name: 'Luca' })
})
