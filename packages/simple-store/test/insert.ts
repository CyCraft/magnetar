import test from 'ava'
import { createVueSyncInstance } from './helpers/createVueSyncInstance'
import { squirtle } from './helpers/pokemon'
import { DocInstance } from '@vue-sync/core'
import { isModuleDataEqual } from './helpers/compareModuleData'

test('write: insert (document)', async t => {
  const { pokedexModule, vueSync } = createVueSyncInstance()
  const insertPayload = squirtle
  isModuleDataEqual(t, vueSync, 'pokedex/007', undefined)

  try {
    await pokedexModule.doc('007').insert(insertPayload)
  } catch (error) {
    t.fail(error)
  }

  isModuleDataEqual(t, vueSync, 'pokedex/007', insertPayload)
})

test('write: insert (collection) → random ID', async t => {
  const { pokedexModule, vueSync } = createVueSyncInstance()
  const insertPayload = squirtle

  let moduleFromResult: DocInstance
  try {
    moduleFromResult = await pokedexModule.insert(insertPayload)
  } catch (error) {
    t.fail(error)
  }
  const newId = moduleFromResult.id
  isModuleDataEqual(t, vueSync, `pokedex/${newId}`, insertPayload)
})
