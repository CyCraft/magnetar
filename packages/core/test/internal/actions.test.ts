import { pokedex, PokedexEntry } from '@magnetarjs/test-utils'
import type { DocInstance } from '@magnetarjs/types'
import { merge } from 'merge-anything'
import { assert, test } from 'vitest'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance.js'

test('write: insert (document) → set ID via doc instance', async () => {
  const { pokedexModule, magnetar } = createMagnetarInstance()
  const payload = pokedex(7)
  assert.deepEqual(pokedexModule.data.get('7'), undefined)
  await pokedexModule.doc('7').insert(payload).catch((e: any) => assert.fail(e.message)) // prettier-ignore
  // check data of references executed on
  assert.deepEqual(pokedexModule.data.get('7'), payload)
  // check data of new references
  assert.deepEqual(pokedexModule.doc('7').data, payload)
  assert.deepEqual(magnetar.doc('pokedex/7').data, payload)
  assert.deepEqual(magnetar.collection('pokedex').doc('7').data, payload)
})

test('write: insert (document) → set ID via payload', async () => {
  const { pokedexModule, magnetar } = createMagnetarInstance()
  const payload = { ...pokedex(7), id: '007' }
  assert.deepEqual(pokedexModule.data.get('7'), undefined)
  assert.deepEqual(pokedexModule.data.get('007'), undefined)
  await pokedexModule.insert(payload as any).catch((e: any) => assert.fail(e.message)) // prettier-ignore
  // check data of references executed on
  assert.deepEqual(pokedexModule.data.get('007'), payload as any)
  // check data of new references
  assert.deepEqual(pokedexModule.doc('007').data, payload as any)
  assert.deepEqual(magnetar.doc('pokedex/007').data, payload as any)
  assert.deepEqual(magnetar.collection('pokedex').doc('007').data, payload as any)
})

test('write: insert (collection) → random ID', async () => {
  const { pokedexModule, magnetar } = createMagnetarInstance()
  const payload = pokedex(7)

  let moduleFromResult: DocInstance<PokedexEntry>
  try {
    moduleFromResult = await pokedexModule.insert(payload)
  } catch (error) {
    assert.fail(JSON.stringify(error))
    return
  }
  const newId = moduleFromResult.id
  // check data of reference returned
  assert.deepEqual(moduleFromResult.data, payload)
  // check data of references executed on
  assert.deepEqual(pokedexModule.data.get(newId), payload)
  // check data of new references
  assert.deepEqual(magnetar.doc(`pokedex/${newId}`).data, payload)
  assert.deepEqual(magnetar.collection('pokedex').doc(newId).data, payload)
  assert.deepEqual(pokedexModule.doc(newId).data, payload)
})

test('deleteProp: (document)', async () => {
  const { trainerModule, magnetar } = createMagnetarInstance()
  const prop = 'age'
  assert.deepEqual(trainerModule.data?.age, 10)

  // create references on beforehand
  const magnetarDoc = magnetar.doc('app-data/trainer') // prettier-ignore
  const magnetarCollectionDoc = magnetar.collection('app-data').doc('trainer') // prettier-ignore
  const magnetarCollectionData = magnetar.collection('app-data').data // prettier-ignore

  try {
    const result = await trainerModule.deleteProp(prop)
    // check data of reference returned
    assert.deepEqual(result, trainerModule.data as any)
  } catch (error) {
    assert.fail(JSON.stringify(error))
  }
  // check data of references created on beforehand
  assert.deepEqual(magnetarDoc.data?.[prop], undefined)
  assert.deepEqual(magnetarCollectionDoc.data?.[prop], undefined)
  assert.deepEqual(magnetarCollectionData.get('trainer')?.[prop], undefined)
  // check data of references executed on
  assert.deepEqual(trainerModule.data?.[prop], undefined)
})

test('delete: (document)', async () => {
  const { trainerModule, magnetar } = createMagnetarInstance()
  assert.deepEqual(trainerModule.data, { age: 10, name: 'Luca' })

  // create references on beforehand
  const magnetarCollection = magnetar.collection('app-data')
  const magnetarCollectionDoc = magnetar.collection('app-data').doc('trainer')
  const magnetarDoc = magnetar.doc('app-data/trainer')

  try {
    const result = await trainerModule.delete()
    // check data of reference returned
    assert.deepEqual(result, undefined)
  } catch (error) {
    assert.fail(JSON.stringify(error))
  }
  // check data of references created on beforehand
  assert.deepEqual(magnetarCollection.data.get('trainer'), undefined)
  assert.deepEqual(magnetarCollectionDoc.data, undefined)
  assert.deepEqual(magnetarDoc.data, undefined)
  // check data of references executed on
  assert.deepEqual(trainerModule.data, undefined)
  // check data of new references
  assert.deepEqual(magnetar.collection('app-data').doc('trainer').data, undefined)
  assert.deepEqual(magnetar.doc('app-data/trainer').data, undefined)
  assert.deepEqual(magnetar.collection('app-data').data.get('trainer'), undefined)
})

test('write: merge (document)', async () => {
  const { pokedexModule } = createMagnetarInstance()
  const payload = { base: { HP: 9000 } }
  const doc = pokedexModule.doc('1')
  assert.deepEqual(doc.data, pokedex(1))
  await doc.merge(payload).catch((e: any) => assert.fail(e.message)) // prettier-ignore
  const mergedResult = merge(pokedex(1), { base: { HP: 9000 } })
  assert.deepEqual(pokedexModule.data.get('1'), mergedResult)
  assert.deepEqual(doc.data, mergedResult)
})

test('read: fetch (collection)', async () => {
  // 'fetch' resolves once all stores have given a response with data
  const { pokedexModule } = createMagnetarInstance()
  assert.deepEqual(pokedexModule.data.get('1'), pokedex(1))
  assert.deepEqual(pokedexModule.data.size, 1)
  try {
    const result = await pokedexModule.fetch({ force: true })
    assert.deepEqual(result.get('1'), pokedex(1))
    assert.deepEqual(result.get('136'), pokedex(136))
  } catch (error) {
    assert.fail(JSON.stringify(error))
  }
  assert.deepEqual(pokedexModule.data.get('1'), pokedex(1))
  assert.deepEqual(pokedexModule.data.get('136'), pokedex(136))
  assert.deepEqual(pokedexModule.data.size, 151)
})

test('read: fetch (document)', async () => {
  // get resolves once all stores have given a response with data
  const { trainerModule } = createMagnetarInstance()
  assert.deepEqual(trainerModule.data, { name: 'Luca', age: 10 })
  try {
    const result = await trainerModule.fetch({ force: true })
    assert.deepEqual(result, { name: 'Luca', age: 10, dream: 'job' })
  } catch (error) {
    assert.fail(JSON.stringify(error))
  }
  assert.deepEqual(trainerModule.data, { name: 'Luca', age: 10, dream: 'job' })
})

test('fetch (collection) where-filter: ==', async () => {
  const { pokedexModule, magnetar } = createMagnetarInstance()

  const pokedexModuleWithQuery = pokedexModule.where('name', '==', 'Flareon')
  try {
    const queryModuleRef = pokedexModuleWithQuery
    await queryModuleRef.fetch({ force: true })
    assert.deepEqual([...queryModuleRef.data.values()], [pokedex(136)])
  } catch (error) {
    assert.fail(JSON.stringify(error))
  }
  // try take the query again and see if it's the same result
  const queryModuleRef = pokedexModule.where('name', '==', 'Flareon')
  assert.deepEqual([...queryModuleRef.data.values()], [pokedex(136)])
  // try take the pokedexModuleWithQuery and see if it's the same result
  assert.deepEqual([...pokedexModuleWithQuery.data.values()], [pokedex(136)])
  // check the invididual doc refs from the pokedexModuleWithQuery
  assert.deepEqual(pokedexModuleWithQuery.doc('136').data, pokedex(136))
  // check the invididual doc refs from pokedexModule
  assert.deepEqual(pokedexModule.doc('136').data, pokedex(136))
  // check the invididual doc refs from base
  assert.deepEqual(magnetar.doc('pokedex/136').data, pokedex(136))
  // see if the main module has also received this data
  assert.deepEqual([...pokedexModule.data.values()], [pokedex(1), pokedex(136)])
})
