import { VueSyncGenericPlugin } from './pluginMock'
import { VueSync, VueSyncInstance } from '../../src'
import { VueSyncModuleInstance } from '../../src/CreateModule'

export function createVueSyncInstance (
  initialState = {
    // collection
    pokedex: {
      // doc
      '001': { name: 'Bulbasaur', id: '001', type: { grass: 'Grass' } },
    },
    // collection
    data: {
      // doc
      trainer: { name: 'Luca', age: 10 },
    },
  }
): {
  pokedexModule: VueSyncModuleInstance
  trainerModule: VueSyncModuleInstance
  vueSync: VueSyncInstance
} {
  const local = VueSyncGenericPlugin({ storeName: 'local', initialState })
  const remote = VueSyncGenericPlugin({ storeName: 'remote', initialState })
  const vueSync = VueSync({
    stores: { local, remote },
    executionOrder: {
      read: ['local', 'remote'],
      write: ['local', 'remote'],
    },
  })
  const pokedexModule = vueSync.createModule({
    type: 'collection',
    configPerStore: {
      local: { path: 'pokedex' }, // path for the plugin
      remote: { path: 'pokedex' }, // path for the plugin
    },
  })
  const trainerModule = vueSync.createModule({
    type: 'document',
    configPerStore: {
      local: { path: 'data/trainer' }, // path for the plugin
      remote: { path: 'data/trainer' }, // path for the plugin
    },
  })
  return { pokedexModule, trainerModule, vueSync }
}
