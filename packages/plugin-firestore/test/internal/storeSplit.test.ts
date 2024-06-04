import { pokedex } from '@magnetarjs/test-utils'
import { storeSplit } from '@magnetarjs/utils'
import { merge } from 'merge-anything'
import { assert, test } from 'vitest'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance.js'
import { firestoreDeepEqual } from '../helpers/firestoreDeepEqual.js'

{
  const testName = 'write: merge (document) with storeSplit'
  test(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })

    const doc = pokedexModule.doc('1')
    assert.deepEqual(doc.data, pokedex(1))
    await firestoreDeepEqual(testName, 'pokedex/1', pokedex(1))

    try {
      await doc.merge(
        { base: { HP: storeSplit({ cache: 9000, remote: '9000' }) } },
        { syncDebounceMs: 1 },
      )
    } catch (error) {
      assert.fail(JSON.stringify(error))
    }

    const mergedResult = merge(pokedex(1), { base: { HP: 9000 } })

    assert.deepEqual(pokedexModule.data.get('1'), mergedResult)
    assert.deepEqual(doc.data, mergedResult)

    await firestoreDeepEqual(testName, 'pokedex/1', merge(pokedex(1), { base: { HP: '9000' } }))

    const fetchedDoc = await doc.fetch({ force: true })
    assert.deepEqual(fetchedDoc?.base.HP as any, '9000')
    assert.deepEqual(doc.data?.base.HP as any, '9000')
  })
}
{
  const testName = 'write: merge (document) with storeSplit in hook'
  test(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })

    const doc = pokedexModule.doc('1')
    assert.deepEqual(doc.data, pokedex(1))
    await firestoreDeepEqual(testName, 'pokedex/1', pokedex(1))

    try {
      await doc.merge(
        { base: { HP: 9000 } },
        {
          syncDebounceMs: 1,
          modifyPayloadOn: {
            write: (payload) => {
              assert.deepEqual(payload, { base: { HP: 9000 } })
              return { base: { HP: storeSplit({ cache: 9000, remote: '9000' }) } }
            },
          },
        },
      )
    } catch (error) {
      assert.fail(JSON.stringify(error))
    }

    const mergedResult = merge(pokedex(1), { base: { HP: 9000 } })

    assert.deepEqual(pokedexModule.data.get('1'), mergedResult)
    assert.deepEqual(doc.data, mergedResult)

    await firestoreDeepEqual(testName, 'pokedex/1', merge(pokedex(1), { base: { HP: '9000' } }))

    const fetchedDoc = await doc.fetch({ force: true })
    assert.deepEqual(fetchedDoc?.base.HP as any, '9000')
    assert.deepEqual(doc.data?.base.HP as any, '9000')
  })
}
{
  const testName = 'write: insert (collection) → random ID in hook with storeSplit'
  test(testName, async () => {
    const { pokedexModule, magnetar } = await createMagnetarInstance(testName)

    const payload = pokedex(7)
    const module = await pokedexModule
      .insert(payload, {
        modifyPayloadOn: {
          insert: (_payload) =>
            ({
              ..._payload,
              base: { ..._payload.base, HP: storeSplit({ cache: 9000, remote: '9000' }) },
              id: Math.random().toString(36).substring(7),
            }) as any,
        },
      })
      .catch((e: any) => assert.fail(e.message))

    assert.deepEqual(module.id, module.data?.id as any)
    assert.deepEqual(module.data, {
      ...payload,
      base: { ...payload.base, HP: 9000 },
      id: module.id as any,
    })
    assert.deepEqual(pokedexModule.data.get(module.id), module.data)
    // check data of new references
    assert.deepEqual(pokedexModule.doc(`${module.id}`).data, module.data)
    assert.deepEqual(magnetar.doc(`pokedex/${module.id}`).data, module.data)
    assert.deepEqual(magnetar.collection('pokedex').doc(`${module.id}`).data, module.data)

    await firestoreDeepEqual(testName, `pokedex/${module.id}`, {
      ...module.data,
      base: { ...module.data?.base, HP: '9000' },
    })
  })
}
