import test from 'ava'
import { createVueSyncInstance } from './helpers/createVueSyncInstance'
import { bulbasaur } from './helpers/pokemon'
import { isModuleDataEqual } from './helpers/compareModuleData'

test('write: merge (document)', async t => {
  const { pokedexModule, vueSync } = createVueSyncInstance()
  const mergePayload = { id: '001', type: { alt: 'Leaf' } }
  isModuleDataEqual(t, vueSync, 'pokedex/001', bulbasaur)

  try {
    await pokedexModule.doc('001').merge(mergePayload)
  } catch (error) {
    t.fail(error)
  }

  const mergedResult = { name: 'Bulbasaur', id: '001', type: { grass: 'Grass', alt: 'Leaf' } }
  isModuleDataEqual(t, vueSync, 'pokedex/001', mergedResult)
})
