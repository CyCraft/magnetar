import test from 'ava'
import { VueSync } from '../src/index'
import { VueSyncVuex } from './helpers/vueSyncVuexMock'
import { store } from './helpers/vueSyncVuexTestData'
import { firebase } from './helpers/vueSyncFirestoreTestData'
import { VueSyncFirestore, vueSyncFirestoreState } from './helpers/vueSyncFirestoreMock'

test('-', t => {
  t.pass()
})

// test('Should create vuex mock plugin instance', t => {
//   const plugin = VueSyncVuex({ vuexInstance: store })
//   const { vuexInstance } = plugin.config
//   t.is(vuexInstance.state.test, 1)
// })

// test('Should create firestore mock plugin instance', t => {
//   t.is(vueSyncFirestoreState.config.firebaseInstance, null)
//   const plugin = VueSyncFirestore({ firebaseInstance: firebase })
//   const { firebaseInstance } = plugin.config
//   t.is(firebaseInstance, null)
// })

// test('Should create VueSync instance', t => {
//   const local = VueSyncVuex({ vuexInstance: store })
//   const remote = VueSyncFirestore({ firebaseInstance: firebase })
//   const vueSync = VueSync({ stores: { local, remote }, executionOrder: { read: [], write: [] } })
//   t.is(vueSync.config.stores.local.config.vuexInstance.state.test, 1)
//   t.is(vueSync.config.stores.remote.config.firebaseInstance, null)
// })
