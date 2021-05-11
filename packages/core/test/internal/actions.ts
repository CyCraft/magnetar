import test from 'ava'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance'
import { pokedex, PokedexEntry } from '@magnetarjs/test-utils'
import { merge } from 'merge-anything'
import { DocInstance } from '../../src'

test('write: insert (document)', async (t) => {
  const { pokedexModule, magnetar } = createMagnetarInstance()
  const payload = pokedex(7)
  t.deepEqual(pokedexModule.data.get('7'), undefined)
  await pokedexModule.doc('7').insert(payload).catch((e: any) => t.fail(e.message)) // prettier-ignore
  // check data of references executed on
  t.deepEqual(pokedexModule.data.get('7'), payload)
  // check data of new references
  t.deepEqual(pokedexModule.doc('7').data, payload)
  t.deepEqual(magnetar.doc('pokedex/7').data, payload)
  t.deepEqual(magnetar.collection('pokedex').doc('7').data, payload)
})

test('write: insert (collection) → random ID', async (t) => {
  const { pokedexModule, magnetar } = createMagnetarInstance()
  const payload = pokedex(7)

  let moduleFromResult: DocInstance<PokedexEntry>
  try {
    moduleFromResult = await pokedexModule.insert(payload)
  } catch (error) {
    return t.fail(error)
  }
  const newId = moduleFromResult.id
  // check data of reference returned
  t.deepEqual(moduleFromResult.data, payload)
  // check data of references executed on
  t.deepEqual(pokedexModule.data.get(newId), payload)
  // check data of new references
  t.deepEqual(magnetar.doc(`pokedex/${newId}`).data, payload)
  t.deepEqual(magnetar.collection('pokedex').doc(newId).data, payload)
  t.deepEqual(pokedexModule.doc(newId).data, payload)
})

test('deleteProp: (document)', async (t) => {
  const { trainerModule, magnetar } = createMagnetarInstance()
  const prop = 'age'
  t.deepEqual(trainerModule.data?.age, 10)

  // create references on beforehand
  const magnetarDoc = magnetar.doc('app-data/trainer') // prettier-ignore
  const magnetarCollectionDoc = magnetar.collection('app-data').doc('trainer') // prettier-ignore
  const magnetarCollectionData = magnetar.collection('app-data').data // prettier-ignore

  try {
    const result = await trainerModule.deleteProp(prop)
    // check data of reference returned
    t.deepEqual(result.data, trainerModule.data)
  } catch (error) {
    t.fail(error)
  }
  // check data of references created on beforehand
  t.deepEqual(magnetarDoc.data?.[prop], undefined)
  t.deepEqual(magnetarCollectionDoc.data?.[prop], undefined)
  t.deepEqual(magnetarCollectionData.get('trainer')?.[prop], undefined)
  // check data of references executed on
  t.deepEqual(trainerModule.data?.[prop], undefined)
})

test('delete: (document)', async (t) => {
  const { trainerModule, magnetar } = createMagnetarInstance()
  t.deepEqual(trainerModule.data, { age: 10, name: 'Luca' })

  // create references on beforehand
  const magnetarCollection = magnetar.collection('app-data')
  const magnetarCollectionDoc = magnetar.collection('app-data').doc('trainer')
  const magnetarDoc = magnetar.doc('app-data/trainer')

  try {
    const result = await trainerModule.delete()
    // check data of reference returned
    t.deepEqual(result.data, undefined)
    t.deepEqual(result.id, trainerModule.id)
  } catch (error) {
    t.fail(error)
  }
  // check data of references created on beforehand
  t.deepEqual(magnetarCollection.data.get('trainer'), undefined)
  t.deepEqual(magnetarCollectionDoc.data, undefined)
  t.deepEqual(magnetarDoc.data, undefined)
  // check data of references executed on
  t.deepEqual(trainerModule.data, undefined)
  // check data of new references
  t.deepEqual(magnetar.collection('app-data').doc('trainer').data, undefined)
  t.deepEqual(magnetar.doc('app-data/trainer').data, undefined)
  t.deepEqual(magnetar.collection('app-data').data.get('trainer'), undefined)
})

test('write: merge (document)', async (t) => {
  const { pokedexModule } = createMagnetarInstance()
  const payload = { base: { HP: 9000 } }
  const doc = pokedexModule.doc('1')
  t.deepEqual(doc.data, pokedex(1))
  await doc.merge(payload).catch((e: any) => t.fail(e.message)) // prettier-ignore
  const mergedResult = merge(pokedex(1), { base: { HP: 9000 } })
  t.deepEqual(pokedexModule.data.get('1'), mergedResult)
  t.deepEqual(doc.data, mergedResult)
})

test('read: fetch (collection)', async (t) => {
  // 'fetch' resolves once all stores have given a response with data
  const { pokedexModule } = createMagnetarInstance()
  t.deepEqual(pokedexModule.data.get('1'), pokedex(1))
  t.is(pokedexModule.data.size, 1)
  try {
    const result = await pokedexModule.fetch()
    t.deepEqual(result.data.get('1'), pokedex(1))
    t.deepEqual(result.data.get('136'), pokedex(136))
  } catch (error) {
    t.fail(error)
  }
  t.deepEqual(pokedexModule.data.get('1'), pokedex(1))
  t.deepEqual(pokedexModule.data.get('136'), pokedex(136))
  t.is(pokedexModule.data.size, 151)
})

test('read: fetch (document)', async (t) => {
  // get resolves once all stores have given a response with data
  const { trainerModule } = createMagnetarInstance()
  t.deepEqual(trainerModule.data, { name: 'Luca', age: 10 })
  try {
    const result = await trainerModule.fetch()
    t.deepEqual(result.data, { name: 'Luca', age: 10, dream: 'job' })
  } catch (error) {
    t.fail(error)
  }
  t.deepEqual(trainerModule.data, { name: 'Luca', age: 10, dream: 'job' })
})

test('fetch (collection) where-filter: ==', async (t) => {
  const { pokedexModule, magnetar } = createMagnetarInstance()

  const pokedexModuleWithQuery = pokedexModule.where('name', '==', 'Flareon')
  try {
    const queryModuleRef = await pokedexModuleWithQuery.fetch()
    t.deepEqual([...queryModuleRef.data.values()], [pokedex(136)])
  } catch (error) {
    t.fail(error)
  }
  // try take the query again and see if it's the same result
  const queryModuleRef = pokedexModule.where('name', '==', 'Flareon')
  t.deepEqual([...queryModuleRef.data.values()], [pokedex(136)])
  // try take the pokedexModuleWithQuery and see if it's the same result
  t.deepEqual([...pokedexModuleWithQuery.data.values()], [pokedex(136)])
  // check the invididual doc refs from the pokedexModuleWithQuery
  t.deepEqual(pokedexModuleWithQuery.doc('136').data, pokedex(136))
  // check the invididual doc refs from pokedexModule
  t.deepEqual(pokedexModule.doc('136').data, pokedex(136))
  // check the invididual doc refs from base
  t.deepEqual(magnetar.doc('pokedex/136').data, pokedex(136))
  // see if the main module has also received this data
  t.deepEqual([...pokedexModule.data.values()], [pokedex(1), pokedex(136)])
})
