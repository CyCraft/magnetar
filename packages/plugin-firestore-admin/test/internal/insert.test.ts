import { pokedex, PokedexEntry } from '@magnetarjs/test-utils'
import type { DocInstance } from '@magnetarjs/types'
import { assert, test } from 'vitest'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance.js'
import { firestoreDeepEqual } from '../helpers/firestoreDeepEqual.js'

{
  const testName = 'insert multiple documents in fast succession with one fail'
  // TODO: somehow this doesn't work with the admin sdk emulators, but it does with the client sdk emulators!
  //      I think it's not an issue in production though...
  test.skip(testName, async () => {
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
