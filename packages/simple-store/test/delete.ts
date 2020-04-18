import test from 'ava'
import { createVueSyncInstance } from './helpers/createVueSyncInstance'

test('delete: (document)', async t => {
  const { trainerModule, vueSync } = createVueSyncInstance()
  t.deepEqual(trainerModule.data, { age: 10, name: 'Luca' })

  const vueSyncCollectionDoc = vueSync.collection('data').doc('trainer')
  const vueSyncDoc = vueSync.doc('data/trainer')
  const vueSyncCollection = vueSync.collection('data')

  try {
    const result = await trainerModule.delete()
    t.deepEqual(result.data, undefined)
    t.deepEqual(result.id, trainerModule.id)
  } catch (error) {
    t.fail(error)
  }

  t.deepEqual(vueSyncCollection.data.get('trainer'), undefined)
  t.deepEqual(vueSyncCollectionDoc.data, undefined)
  t.deepEqual(vueSyncDoc.data, undefined)
  t.deepEqual(trainerModule.data, undefined)
  t.deepEqual(vueSync.collection('data').doc('trainer').data, undefined)
  t.deepEqual(vueSync.doc('data/trainer').data, undefined)
  t.deepEqual(vueSync.collection('data').data.get('trainer'), undefined)
})
