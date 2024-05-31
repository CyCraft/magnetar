import { waitMs } from '@magnetarjs/test-utils'
import { collection, doc, onSnapshot } from 'firebase/firestore'
import { test } from 'vitest'
import { db } from './initFirebase.js'

test('firebase sdk', async () => {
  const pokemonPath = `magnetarTests/read/pokedex/136`
  console.log(`1)`)
  await onSnapshot(
    doc(db, pokemonPath),
    { includeMetadataChanges: false },
    async (querySnapshot) => {
      console.log(
        `doc(${pokemonPath}).onSnapshot
  querySnapshot.metadata.fromCache → `,
        querySnapshot.metadata.fromCache
      )
      console.log(`keys that change order... → `, Object.keys(querySnapshot.data() || {}))
    }
  )

  // wait x seconds to make sure it's after the first doc has loaded.
  // the bug occurs no matter how many seconds is waited
  await waitMs(2000)

  const pokedexPath = `magnetarTests/read/pokedex`
  console.log(`\n2)`)
  await onSnapshot(
    collection(db, pokedexPath),
    { includeMetadataChanges: false },
    async (querySnapshot) => {
      // this always gets executed twice.
      // expected: once from cache, once from the server
      console.log(
        `collection(${pokedexPath}).onSnapshot
  querySnapshot.metadata.fromCache → `,
        querySnapshot.metadata.fromCache
        // this flag is often TRUE two times in a row! While I would always expect TRUE once, FALSE the second time.
      )
      console.log(`querySnapshot.size → `, querySnapshot.size)
    }
  )
  await waitMs(1000)
})
