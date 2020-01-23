import test from 'ava'
import { VueSyncVuex, vueSyncVuexState } from './helpers/vueSyncVuexMock'
import { store } from './helpers/vueSyncVuexTestData'

test('Should register plugin', t => {
  t.is(vueSyncVuexState.vuexInstance, null)
  const plugin = VueSyncVuex({ vuexInstance: store })
  t.is(vueSyncVuexState.vuexInstance.state.test, 1)
})
