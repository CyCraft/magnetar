# Module Setup

Before you dive in here, it's best to have a basic grasp of how to [Add & Edit Data](#) and how to [Read Data](#). So check out that documentation first, and then come back here!

## Documenting your Data Structure

It's always recommended at the very least to document your data structures! Otherwise it's easy to forget how your data looks and what properties and types it uses.

The recommended way to document a data structure is by defining the default values that each document should inherit. This way you can also set up your modules so **whenever you insert a new record, you automatically merge that onto these default values.**

```javascript
import { magnetar } from 'magnetar-setup.js'

/**
 * applies default data structure of each document in the 'pokedex' collection
 */
function pokemonDefaults(payload) {
  const defaults = { name: '', id: '', level: 0 }
  return { ...defaults, ...payload }
}

export const pokedexModule = magnetar.collection('pokedex', {
  modifyPayloadOn: { insert: pokemonDefaults },
  modifyReadResponseOn: { added: pokemonDefaults },
})

/**
 * applies default data structure of the 'trainer' document
 */
function trainerDefaults(payload) {
  const defaults = { name: '', id: '', items: {}, caughtCount: 0, seenCount: 0 }
  return { ...defaults, ...payload }
}

export const trainerModule = magnetar.doc('data/trainer', {
  modifyPayloadOn: { insert: trainerDefaults },
  modifyReadResponseOn: { added: trainerDefaults },
})
```

Now you see it's very clear how a pokemon document in the 'pokedex' collection looks and how the 'trainer' document looks!

It's also become clear that these modules might be better off each having their own separate file, but I leave that to you.

> Why do you need to define both `modifyPayloadOn.insert` and `modifyReadResponseOn.added` ?

- `modifyPayloadOn.insert` — is triggered every time you write data locally (which is then synced to the server with those default values)
- `modifyReadResponseOn.added` — is triggered every time data comes in from your remote store (the server)

To learn more about these functions and other possibilities read [Hooks before Writing](#) and [Hooks after Reading](#).

## Filtering Data with Queries

When you need to have only a sub-set of your documents in a collection, you have two options to set up a query.

- Set up a query at the _**module level**_
- OR Set up a query _**wherever you read data**_

### Set up a Query at the Module Level

At the module level the query will be active whenever you try to read data with [get](#) or [stream](#). You should only set up the query at the module when you never need to query for other data in the same collection throughout your app.

Example use case 1: **Never query archived documents** and **always sort ascending**

In this example we will filter out documents that have `isArchived: true`.

<!-- prettier-ignore-start -->
```javascript
import { magnetar } from 'magnetar-setup.js'

const config = {
  // Fixed query for this module:
  where: [['isArchived', '==', false]],
  orderBy: ['createdAt', 'asc'],
  // Other options:
  modifyPayloadOn: { insert: (payload) => { /* ... */ } },
  modifyReadResponseOn: { added: (payload) => { /* ... */ } },
}

export const pokedexModule = magnetar.collection('pokedex', config)
```
<!-- prettier-ignore-end -->

Example use case 2: **User specific documents**

In this example we need to fetch the documents for a specific user. In this case you might want to wrap your module in a function that accepts the userId:

<!-- prettier-ignore-start -->
```javascript
import { magnetar } from 'magnetar-setup.js'

const config = {
  // Fixed query for this module:
  where: [['userId', '==', userId]],
  // Other options:
  modifyPayloadOn: { insert: (payload) => { /* ... */ } },
  modifyReadResponseOn: { added: (payload) => { /* ... */ } },
}

/**
 * @param {string} userId - this must be fetched first to instantiate the pokedexModule module
 */
export const pokedexModule = (userId) => magnetar.collection('pokedex', config)
```
<!-- prettier-ignore-end -->

### Set up a Query Wherever you Read Data

In some cases you might need to query on various things dependening on the user input for your app. In this case you will probably need to write the query wherever you are reading the data.

Example use case: **Query documents based on search controls**

```javascript
import { pokedexModule } from 'db-modules.js'

/**
 * @param {string} type - the Pokemon Type that's being searched
 */
async function searchPokemon(type) {
  const queriedPokedex = pokedexModule.where('type', '==', type).orderBy('name', 'asc')
  await queriedPokedex.get()

  // return all Pokemon for just this query
  return queriedPokedex.data.values()

  // OR
  // return all Pokemon fetched so far (eg. over multiple searches)
  // ↓
  // return pokedexModule.data.values()
}
```

As you can see in the example, using a query in Magnetar is very powerful because it will not only query your read requests to the remote store, but can also apply that same query when reading your local data.

You can find more information on reading data at [Read Data](#).

## Setup for TypeScript

Magnetar has extremely good TypeScript support. You only need to pass the type of your document once and all actions the collection or document instance will be enforce that type.

This example sets up the 'pokedex' module which we pass the `Pokemon` type:

<!-- prettier-ignore-start -->
```js
import { magnetar } from 'magnetar-setup.js'

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
import { pokedexModule, pokemonDefaults } from 'db-modules'

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
import { pokedexModule } from 'db-modules'

async function getPokemonById(id) {
  if (!pokedexModule.data.has(id)) {
    await pokedexModule.doc(id).get()
  }
  return pokedexModule.data.get(id)
}

const pokemon = await getPokemonById('001')
// on hover shows:
/**
  const pokemon: { name: string, nickName?: string, id: string, level: number };
 */
```
