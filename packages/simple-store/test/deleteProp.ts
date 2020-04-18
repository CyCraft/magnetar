import test from 'ava'
import { createVueSyncInstance } from './helpers/createVueSyncInstance'

test('deleteProp: (document)', async t => {
  const { trainerModule, vueSync } = createVueSyncInstance()
  const deletePayload = 'age'
  const vueSyncDoc = vueSync.doc('data/trainer') // prettier-ignore
  const vueSyncCollectionDoc = vueSync.collection('data').doc('trainer') // prettier-ignore
  const vueSyncCollectionData = vueSync.collection('data').data // prettier-ignore
  t.deepEqual(trainerModule.data.age, 10)

  try {
    const result = await trainerModule.deleteProp(deletePayload)
    t.deepEqual(result.data, trainerModule.data)
  } catch (error) {
    t.fail(error)
  }

  t.deepEqual(trainerModule.data.age, undefined)
  t.deepEqual(vueSyncDoc.data.age, undefined)
  t.deepEqual(vueSyncCollectionDoc.data.age, undefined)
  t.deepEqual(vueSyncCollectionData.get('trainer').age, undefined)
})
