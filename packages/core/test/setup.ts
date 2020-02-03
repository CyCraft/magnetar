import test from 'ava'
import { VueSync } from '../src/index'
import { VueSyncVuex } from './helpers/vueSyncVuexMock'
import { store } from './helpers/vueSyncVuexTestData'
import { firebase } from './helpers/vueSyncFirestoreTestData'
import { VueSyncFirestore, vueSyncFirestoreState } from './helpers/vueSyncFirestoreMock'

test('Should create vuex mock plugin instance', t => {
  const plugin = VueSyncVuex({ vuexInstance: store })
  const { vuexInstance } = plugin
  t.is(vuexInstance.state.test, 1)
})

test('Should create firestore mock plugin instance', t => {
  t.is(vueSyncFirestoreState.firebaseInstance, null)
  const plugin = VueSyncFirestore({ firebaseInstance: firebase })
  const { firebaseInstance } = plugin
  t.is(firebaseInstance, null)
})

test('Should create VueSync instance', t => {
  const localStore = VueSyncVuex({ vuexInstance: store })
  const remoteStore = VueSyncFirestore({ firebaseInstance: firebase })
  const vueSync = VueSync({
    localStore,
    remoteStore,
  })
  t.is(vueSync.config.localStore.vuexInstance.state.test, 1)
  t.is(vueSync.config.remoteStore.firebaseInstance, null)
})
