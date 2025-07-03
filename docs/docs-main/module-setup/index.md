# Module Setup

Before you dive in here, it's best to have a basic grasp of how to [Add & Edit Data](../write-data/) and how to [Read Data](../read-data/). So check out that documentation first, and then come back here!

## Documenting your Data Structure

It's always recommended at the very least to document your data structures! Otherwise it's easy to forget how your data looks and what properties and types it uses.

The recommended way to document a data structure is by defining the default values that each document should inherit. This way you can also set up your modules so **whenever you insert a new record, you automatically merge that onto these default values.**

### Example Collection Module Setup

```javascript
import { magnetar } from 'magnetarSetup.js'

/**
 * applies default data structure of each document in the 'pokedex' collection
 */
function pokemonDefaults(payload) {
  const defaults = { name: '', id: '', level: 0 }
  return { ...defaults, ...payload }
}

export const pokedexModule = magnetar.collection('pokedex', {
  modifyPayloadOn: { insert: (payload) => pokemonDefaults(payload) },
  modifyReadResponseOn: { added: (payload) => pokemonDefaults(payload) },
})
```

### Example Doc Module Setup

```javascript
import { magnetar } from 'magnetarSetup.js'

/**
 * applies default data structure of the 'trainer' document
 */
function trainerDefaults(payload) {
  const defaults = { name: '', id: '', items: {}, caughtCount: 0, seenCount: 0 }
  return { ...defaults, ...payload }
}

export const trainerModule = magnetar.doc('app-data/trainer', {
  modifyPayloadOn: { insert: (payload) => trainerDefaults(payload) },
  modifyReadResponseOn: { added: (payload) => trainerDefaults(payload) },
})
```

Now you see it's very clear how a Pokemon document in the `'pokedex'` collection looks and how the 'trainer' document looks!

It's also become clear that these modules might be better off each having their own separate file, but I leave that to you.

> Why do you need to define both `modifyPayloadOn.insert` and `modifyReadResponseOn.added` ?

- `modifyPayloadOn.insert` — is triggered every time you write data locally to cache (which is then synced to the server with those default values)
- `modifyReadResponseOn.added` — is triggered every time data comes in from your remote store (the server)

To learn more about these functions and other possibilities read [Hooks and Events](../hooks-and-events/).

## Filtering Data with Queries

When you need to have only a sub-set of your documents in a collection, you have two options to set up a query.

- Set up a query at the _**module level**_
- OR Set up a query _**whenever you read data**_

### Set up a Query at the Module Level

At the module level the query will be active whenever you try to read data with [fetch](../read-data/#fetch-data-once) or [stream](../read-data/#stream-realtime-updates). You should only set up the query at the module when you never need to query for other data in the same collection throughout your app.

Example use case 1: **Filter and order documents based on some fields**

In this example we will filter out documents that have `isArchived: true`.

<!-- prettier-ignore-start -->
```javascript
import { magnetar } from 'magnetarSetup.js'

export const pokedexModule = magnetar.collection('pokedex', {
  // Fixed query for this module:
  where: [['isArchived', '==', false]],
  orderBy: ['createdAt', 'asc'],

  // Other options:
  modifyPayloadOn: { insert: (payload) => { /* ... */ } },
  modifyReadResponseOn: { added: (payload) => { /* ... */ } },
})
```
<!-- prettier-ignore-end -->

The above example will always have the query enabled whenever you import and use this `pokedexModule`

```js
import { pokedexModule } from 'pokedexModule.js'
;(async () => {
  // making a read request will retrieve docs with the fixed query enabled:
  await pokedexModule.fetch()

  // accessing cached data will also filter on just docs as per the fixed query:
  pokedexModule.data.values()
})()
```

Example use case 2: **Filter for user specific documents**

In this example we need to fetch the documents for a specific user. In this case you might want to wrap your module in a function that accepts the userId:

<!-- prettier-ignore-start -->
```javascript
import { magnetar } from 'magnetarSetup.js'

/**
 * @param {string} userId - this must be fetched first to instantiate the pokedexModule module
 */
export const userPokedexModule = (userId) => {
  return magnetar.collection('pokedex', {
    // Fixed query for this module:
    where: [['userId', '==', userId]],

    // Other options:
    modifyPayloadOn: { insert: (payload) => { /* ... */ } },
    modifyReadResponseOn: { added: (payload) => { /* ... */ } },
  })
}
```
<!-- prettier-ignore-end -->

You will always need to pass a userId in order to use this `userPokedexModule` in the example above:

```js
import { userPokedexModule } from 'userPokedexModule.js'
;(async () => {
  const userId = 'abc123'
  const currentUserPokedexModule = userPokedexModule(userId)

  await currentUserPokedexModule.fetch()

  currentUserPokedexModule.data.values()
})()
```

However, if your database structure is set up that you don't need to filter on the field `userId` but the `userId` is a **part of the module path** then see the documentation at [Dynamic module paths](#dynamic-module-paths).

### Set up a Query Wherever you Read Data

In some cases you might need to query on various things depending on the user input for your app. In this case you will probably need to write the query wherever you are reading the data.

Example use case: **Query documents based on search controls**

```javascript
import { pokedexModule } from 'magnetarModules.js'

/**
 * @param {string} type - the Pokemon Type that's being searched
 */
async function searchPokemon(type) {
  const queriedPokedex = pokedexModule.where('type', '==', type).orderBy('name', 'asc')
  await queriedPokedex.fetch()

  // return all Pokemon for just this query
  return queriedPokedex.data.values()

  // OR
  // return all Pokemon fetched so far (eg. over multiple searches)
  // ↓
  // return pokedexModule.data.values()
}
```

As you can see in the example, using a query in Magnetar is very powerful because it will not only query your read requests to the remote store, but can also apply that same query when reading your cached data.

You can find more information on reading data at [Read Data](../read-data/#query-data-filter-order-by-limit).

## Dynamic Module Paths

If you need to retrieve documents at a path which includes the user ID, you will need to provide this ID as part of the module path.

```js
import { magnetar } from 'magnetarSetup.js'

const userId = 'abc123'
const userPokedexModule = magnetar.collection(`users/${userId}/pokedex`)
// OR
const users = magnetar.collection('users')
const userPokedexModule = users.doc(userId).collection('pokedex')
```

In your app you probably need to encapsulate this in a function which you can trigger once you have the user ID:

```js
import { magnetar } from 'magnetarSetup.js'

const users = magnetar.collection('users')

/**
 * @param {string} userId - this must be fetched first to instantiate the pokedexModule
 */
export const userPokedexModule = (userId) => {
  return users.doc(userId).collection('pokedex')
}
```

You will always need to pass a userId in order to use this `userPokedexModule` in the example above:

```js
import { userPokedexModule } from 'userPokedexModule.js'
;(async () => {
  const userId = 'abc123'
  const currentUserPokedexModule = userPokedexModule(userId)

  await currentUserPokedexModule.fetch()

  currentUserPokedexModule.data.values()
})()
```

However, if your database structure is set up that the user ID is not a part of the module path, but you need to filter documents with a certain `userId` field, then see the documentation at [Filtering Data with Queries](#filtering-data-with-queries).

## Setup for TypeScript

Magnetar has extremely good TypeScript support. You only need to pass the type of your document once and all actions the collection or document instance will be enforce that type.

This example sets up the `pokedexModule` which we pass the `Pokemon` type:

<!-- prettier-ignore-start -->
```js
import { magnetar } from 'magnetarSetup.js'

export type Pokemon = { name: string, nickName?: string, id: string, level: number }

export function pokemonDefaults(payload: Partial<Pokemon>): Pokemon {
  const defaults: Pokemon = { name: '', nickName: '', id: '', level: 0 }

  return { ...defaults, ...payload }
}

const config = {
  modifyPayloadOn: { insert: pokemonDefaults },
  modifyReadResponseOn: { added: pokemonDefaults },
}

// here is how you inject the Type: collection<Pokemon>
export const pokedexModule = magnetar.collection<Pokemon>('pokedex', config)
```
<!-- prettier-ignore-end -->

Now, when writing data, types are enforced. See this example where an error will be thrown:

```js
import { pokedexModule, pokemonDefaults } from 'magnetarModules'

pokedexModule.insert({ name: 'Charmander' }) // error!
/**
  Argument of type '{ name: string; }' is not assignable to parameter
  of type '{ name: string, nickName?: string, id: string, level: number }'.
 */

// instead you must do:
pokedexModule.insert(pokemonDefaults({ name: 'Charmander' })) // OK
```

Also when reading data, types are enforced:

```js
import { pokedexModule } from 'magnetarModules'

async function fetchPokemonById(id) {
  if (!pokedexModule.data.has(id)) {
    await pokedexModule.doc(id).fetch()
  }
  return pokedexModule.data.get(id)
}

const pokemon = await fetchPokemonById('001')
// on hover shows:
/**
  const pokemon: { name: string, nickName?: string, id: string, level: number };
 */
```
