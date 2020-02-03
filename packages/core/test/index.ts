import test from 'ava'
import { VueSync } from '../src/index'
import { VueSyncVuex } from './helpers/vueSyncVuexMock'
import { store } from './helpers/vueSyncVuexTestData'
import { firebase } from './helpers/vueSyncFirestoreTestData'
import { VueSyncFirestore, vueSyncFirestoreState } from './helpers/vueSyncFirestoreMock'

// // local events
// const beforeLocal = loc === 'local' && status === 'before'
// const localSuccess = loc === 'local' && status === 'success'
// const localError = loc === 'local' && status === 'error'

// // remote events
// const beforeRemote = loc === 'remote' && status === 'before'
// const remoteSuccess = loc === 'remote' && status === 'success'
// const remoteError = loc === 'remote' && status === 'error'

test('emits events', async t => {
  const localStore = VueSyncVuex({ vuexInstance: store })
  const remoteStore = VueSyncFirestore({ firebaseInstance: firebase })
  const vueSync = VueSync({
    localStore,
    remoteStore,
  })
  t.is(vueSync.config.localStore.vuexInstance.state.test, 1)
  t.is(vueSync.config.remoteStore.firebaseInstance, null)

  const usersModule = vueSync.createModule({
    type: 'collection',
    localStore: { path: 'users' }, // path for vuex
    remoteStore: { path: 'users' }, // path for firestore
  })

  const insertPayload = { name: 'luca' }
  await usersModule.insert(insertPayload, {
    on: {
      beforeLocal: ({ payload, abort }) => {
        t.deepEqual(payload, insertPayload)
      },
      localSuccess: ({ payload, abort }) => {
        t.deepEqual(payload, insertPayload)
      },
      // localError: ({payload, abort}) => { t.deepEqual(payload, insertPayload) },
      // beforeRemote: ({ payload, abort }) => {
      //   t.deepEqual(payload, insertPayload)
      // },
      // remoteSuccess: ({ payload, abort }) => {
      //   t.deepEqual(payload, insertPayload)
      // },
      // remoteError: ({payload, abort}) => { t.deepEqual(payload, insertPayload) },
    },
  })
})
