import { pokedex, PokedexEntry } from '@magnetarjs/test-utils'
import type { DocInstance } from '@magnetarjs/types'
import { assert, test } from 'vitest'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance.js'
import { firestoreDeepEqual } from '../helpers/firestoreDeepEqual.js'

{
  const testName = 'insert multiple documents in fast succession with one fail'
  test(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance(testName)
    const payloadNg = { ...pokedex(7), failBecauseOf: undefined }
    const payloadOk = pokedex(8)
    assert.deepEqual(pokedexModule.doc('7').data, undefined)
    assert.deepEqual(pokedexModule.doc('8').data, undefined)

    let moduleOk: DocInstance<PokedexEntry> | undefined
    let error: any
    const result = await Promise.allSettled([
      pokedexModule.insert(payloadNg, { syncDebounceMs: 0 }),
      pokedexModule.insert(payloadOk, { syncDebounceMs: 0 }),
    ])
    result.forEach((settled) => {
      if (settled.status === 'fulfilled') moduleOk = settled.value
      if (settled.status === 'rejected') error = settled.reason
    })
    // check if definitely the error occured
    assert.deepEqual(error?.code, 'invalid-argument')

    // none should have succeeded
    // one bad payload and the entire batch fails!
    if (moduleOk) {
      assert.fail()
      return
    }

    await firestoreDeepEqual(testName, `pokedex/7`, undefined as any)
    await firestoreDeepEqual(testName, `pokedex/8`, undefined as any)
  })
}
{
  const testName = 'write: insert (document) → set ID via doc instance'
  test(testName, async () => {
    const { pokedexModule, magnetar } = await createMagnetarInstance(testName)
    await firestoreDeepEqual(testName, `pokedex/7`, undefined)
    await firestoreDeepEqual(testName, `pokedex/007`, undefined)
    const payload = pokedex(7)
    assert.deepEqual(pokedexModule.data.get('7'), undefined)
    await pokedexModule.doc('007').insert(payload).catch((e: any) => assert.fail(e.message)) // prettier-ignore
    // check data of references executed on
    assert.deepEqual(pokedexModule.data.get('007'), payload)
    // check data of new references
    assert.deepEqual(pokedexModule.doc('007').data, payload)
    assert.deepEqual(magnetar.doc('pokedex/007').data, payload)
    assert.deepEqual(magnetar.collection('pokedex').doc('007').data, payload)
    await firestoreDeepEqual(testName, `pokedex/007`, payload)
  })
}
{
  const testName = 'write: insert (document) → set ID via payload'
  test(testName, async () => {
    const { pokedexModule, magnetar } = await createMagnetarInstance(testName)
    await firestoreDeepEqual(testName, `pokedex/7`, undefined)
    await firestoreDeepEqual(testName, `pokedex/007`, undefined)

    const payload = { ...pokedex(7), id: '007' } as any
    assert.deepEqual(pokedexModule.data.get('7'), undefined)
    assert.deepEqual(pokedexModule.data.get('007'), undefined)
    await pokedexModule.insert(payload).catch((e: any) => assert.fail(e.message)) // prettier-ignore
    // check data of references executed on
    assert.deepEqual(pokedexModule.data.get('007'), payload)
    // check data of new references
    assert.deepEqual(pokedexModule.doc('007').data, payload)
    assert.deepEqual(magnetar.doc('pokedex/007').data, payload)
    assert.deepEqual(magnetar.collection('pokedex').doc('007').data, payload)
    await firestoreDeepEqual(testName, `pokedex/007`, payload)
  })
}
{
  const testName = 'write: insert (document) → set ID via hook'
  test(testName, async () => {
    const { pokedexModule, magnetar } = await createMagnetarInstance(testName)
    await firestoreDeepEqual(testName, `pokedex/7`, undefined)
    await firestoreDeepEqual(testName, `pokedex/007`, undefined)

    const payload = pokedex(7)
    assert.deepEqual(pokedexModule.data.get('7'), undefined)
    assert.deepEqual(pokedexModule.data.get('007'), undefined)
    await pokedexModule
      .insert(payload, {
        modifyPayloadOn: {
          insert: (_payload) => ({ ..._payload, id: '007' }) as any,
        },
      })
      .catch((e: any) => assert.fail(e.message))
    const newExpected = { ...payload, id: '007' } as any
    // check data of references executed on
    assert.deepEqual(pokedexModule.data.get('007'), newExpected)
    // check data of new references
    assert.deepEqual(pokedexModule.doc('007').data, newExpected)
    assert.deepEqual(magnetar.doc('pokedex/007').data, newExpected)
    assert.deepEqual(magnetar.collection('pokedex').doc('007').data, newExpected)
    await firestoreDeepEqual(testName, `pokedex/007`, newExpected)
  })
}
{
  const testName = 'write: insert (collection) → random ID'
  test(testName, async () => {
    const { pokedexModule, magnetar } = await createMagnetarInstance(testName)
    await firestoreDeepEqual(testName, `pokedex/7`, undefined)
    await firestoreDeepEqual(testName, `pokedex/007`, undefined)
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
    await firestoreDeepEqual(testName, `pokedex/${newId}`, payload)
  })
}
