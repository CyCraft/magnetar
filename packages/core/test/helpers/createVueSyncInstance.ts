import { VueSyncGenericPlugin } from './pluginMock'
import { VueSync, VueSyncInstance } from '../../src'
import { VueSyncModuleInstance } from '../../src/CreateModule'
import { bulbasaur } from './pokemon'

export function createVueSyncInstance (): {
  pokedexModule: VueSyncModuleInstance
  trainerModule: VueSyncModuleInstance
  vueSync: VueSyncInstance
} {
  const local = VueSyncGenericPlugin({ storeName: 'local' })
  const remote = VueSyncGenericPlugin({ storeName: 'remote' })
  const vueSync = VueSync({
    dataStoreName: 'local',
    stores: { local, remote },
    executionOrder: {
      read: ['local', 'remote'],
      write: ['local', 'remote'],
      delete: ['local', 'remote'],
    },
  })
  const getInitialDataCollection = () => ({
    // doc
    '001': bulbasaur,
  })
  const getInitialDataDocument = () => ({ name: 'Luca', age: 10 })
  const pokedexModule = vueSync.createModule({
    configPerStore: {
      local: { path: 'pokedex', initialData: getInitialDataCollection() }, // path for the plugin
      remote: { path: 'pokedex', initialData: getInitialDataCollection() }, // path for the plugin
    },
  })
  const trainerModule = vueSync.createModule({
    configPerStore: {
      local: { path: 'data/trainer', initialData: getInitialDataDocument() }, // path for the plugin
      remote: { path: 'data/trainer', initialData: getInitialDataDocument() }, // path for the plugin
    },
  })
  return { pokedexModule, trainerModule, vueSync }
}
