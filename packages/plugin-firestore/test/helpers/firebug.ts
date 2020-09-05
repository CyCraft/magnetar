import test from 'ava'
import { firestore } from '../helpers/firestore'
import { waitMs } from '../helpers/wait'

test('firebase sdk', async t => {
  const pokemonPath = `vueSyncTests/read/pokedex/136`
  console.log(`1)`)
  await firestore
    .doc(pokemonPath)
    .onSnapshot({ includeMetadataChanges: false }, async querySnapshot => {
      console.log(
        `doc(${pokemonPath}).onSnapshot
  querySnapshot.metadata.fromCache → `,
        querySnapshot.metadata.fromCache
      )
      console.log(`keys that change order... → `, Object.keys(querySnapshot.data()))
    })

  // wait x seconds to make sure it's after the first doc has loaded.
  // the bug occurs no matter how many seconds is waited
  await waitMs(2000)

  const pokedexPath = `vueSyncTests/read/pokedex`
  console.log(`\n2)`)
  await firestore
    .collection(pokedexPath)
    .onSnapshot({ includeMetadataChanges: false }, async querySnapshot => {
      // this always gets executed twice.
      // expected: once from cache, once from the server
      console.log(
        `collection(${pokedexPath}).onSnapshot
  querySnapshot.metadata.fromCache → `,
        querySnapshot.metadata.fromCache
        // this flag is often TRUE two times in a row! While I would always expect TRUE once, FALSE the second time.
      )
      console.log(`querySnapshot.size → `, querySnapshot.size)
    })
  await waitMs(1000)
})
