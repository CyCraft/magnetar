# Read Data

There are two ways to retrieve data from your remote stores. Either of these methods can be used with documents and collections.

- Execute a function to fetch data once
- Set up a "stream" to receive realtime updates

## Fetch data once

When you get data by executing `fetch()`, the data will be fetched from a server by your "remote" store plugin and then added to your module's data by your "local" store plugin.

For displaying fetched data in the DOM see the [Displaying data in the DOM](#displaying-data-in-the-dom).

### Fetch a single document

When you call `fetch()` on a document module, your remote store will go and fetch the document from your database and add it to your local store.

```javascript
const bulbasaur = magnetar.doc('pokedex/001')

// bulbasaur's data is not yet in local data
// bulbasaur.data ≈ {}

await pokedexModule.fetch()

// now it is available locally:

const data = bulbasaur.data
// bulbasaur.data ≈ { name: 'Bulbasaur' }
```

The `fetch` action will also return a doc or collection module you can use:

```js
// create the module and immidiately await the fetch()
const bulbasaur = await magnetar.doc('pokedex/001').fetch()

// bulbasaur.data ≈ { name: 'Bulbasaur' }
```

### Fetch multiple documents

```javascript
const pokedexModule = magnetar.collection('pokedex')

// pokedexModule.data ≈ Map<> // empty!
// pokedexModule.data.values() ≈ [] // empty!

await pokedexModule.fetch()

// now they are available locally:
// pokedexModule.data ≈ Map<
//   '001': { name: 'Bulbasaur' },
//   /* etc...*/
// >

const allPokemon = pokedexModule.data.values()
// allPokemon ≈ [{ name: 'Bulbasaur' }, /* etc...*/ ]
```

## Stream realtime updates

When you set up a _**stream**_ for a document or collection, just like `fetch()`, your the data will be fetched from a server by your _remote_ store plugin and then added to your module's _local_ data.

Afterwards, any changes to this document remotely will automatically be reflected in your module's _local_ data while the stream is open.

Please note: a streaming promise will never resolve as long as your stream is open! There is **no way** to know when or how many documents will be loaded in, as this depends on your remote store.

For displaying streamed data in the DOM see the [Displaying data in the DOM](#displaying-data-in-the-dom).

### Stream a collection

```javascript
const pokedexModule = magnetar.collection('pokedex')
// open the stream
pokedexModule.stream()

// ... some time later

// incoming data from the remote store will be
// added to your module's data and stay in sync

// pokedexModule.data ≈ Map<
//   '001': { name: 'Bulbasaur' },
//   /* etc...*/
// >
// pokedexModule.data.values() ≈ [{ name: 'Bulbasaur' }, /* etc...*/ ]
```

### Stream a single document

```javascript
const bulbasaur = pokedexModule.doc('001')
// open the stream
bulbasaur.stream()

// ... some time later

// incoming data from the remote store will be
// added to your module's data and stay in sync

// bulbasaur.data ≈ { name: 'Bulbasaur' }
```

### Closing a stream

You can list all open streams like so:

```javascript
const pokedexModule = magnetar.collection('pokedex')

// collections:
pokedexModule.openStreams.entries()

// docs:
pokedexModule.doc('001').openStreams.entries()
```

`openStreams` is a Map <small>[？](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)</small> with the payload you passed to start the stream as key, and the function to _close the stream_ as value.

Here is a full example of opening and closing a stream:

```javascript
const pokedexModule = magnetar.collection('pokedex')

// open the stream:
const streamOptions = {}
pokedexModule.stream(streamOptions)

// to close the stream, you need to use the `streamOptions` reference
const closeStream = pokedexModule.openStreams.get(streamOptions)
closeStream()

// be careful, this won't work
const closeStream = pokedexModule.openStreams.get({})
// closeStream === undefined
```

Because openStreams is a Map <small>[？](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)</small>, you need to use the same options variable to retrieve your _close stream function_. This is how a Map works natively.

One caveat is when you want to retrieve an open stream when you did not pass any options. In this case you can access the _close stream function_ via the key `undefined`.

```js
pokedexModule.stream()
const closeStream = pokedexModule.openStreams.get(undefined)
closeStream()
```

> Why this weird mechanic to close streams?

Since every module can have multiple streams open with different filters or options, there needs to be some sort of dictionary to save the functions that can close the streams again.

In the case you have multiple streams, you would probably want to differanciate them by which options you passed any way. One way we can create _a stream ID_ could be to `JSON.stringify` the stream options. But because a Map can have an actual object as key, there is no need to `JSON.stringify`.

## Query data (filter, order by, limit...)

There are three methods to query more specific data in a collection:

- `where`
- `orderBy`
- `limit`

You can execute and chain these methods on collections to create a _queried module_ that is just like a regular module but with your query applied.

When you apply a query it affects both the remote and local stores:

- If you make a `fetch()` call with a _queried module_, it will pass the queries to the remote store, which will make sure that your query is applied to the API call.
- If you access module data with a _queried module_, the local store will also make sure that your query is applied to whatever data it returns.

```js
const queriedModule = pokedexModule.where('type', '==', 'fire')
await queriedModule.fetch()

queriedModule.data.values() // returns just the queried docs that were fetched
pokedexModule.data.values() // returns all docs fetched so far
```

### Where

`where` needs 3 parameters.

1. the prop name
2. the operator
3. the value to compare with

The possible operators include:

- `'=='`
- `'!='`
- `'<'`
- `'<='`
- `'>'`
- `'>='`
- `'array-contains'`
- `'array-contains-any'`
- `'in'`
- `'not-in'`

Eg. "all Fire Pokemon above level 16"

```js
pokedexModule.where('type', '==', 'fire').where('level', '>', 16)
```

For now read the Firestore documentation on [Simple and Compound Queries](https://firebase.google.com/docs/firestore/query-data/queries#array_membership). The concept is inspired by Firestore, but with Magnetar _every_ local and remote store plugin implements the proper logic to work with these kind of queries!

More Magnetar specific information on this will come soon.

### Order by

You can order docs coming in by a specific field, ascending or descending. `orderBy` needs 2 parameters.

1. the prop name to order by
2. `'asc'` or `'desc'`

Eg. "all Pokemon sorted alphabetically"

```js
pokedexModule.orderBy('name', 'asc')
```

### Limit

Limit is mainly for the remote store to limit the amount of records fetched at a time. `limit` needs 1 parameter.

1. The count to limit by

Eg. "get the first 10 Pokemon sorted alphabetically"

```js
pokedexModule.orderBy('name', 'asc').limit(10)
```

### More Examples

You can combine `where` with `orderBy`:

```js
pokedexModule.where('type', '==', type).orderBy('name', 'asc')
```

You can either `stream` or `fetch` a queried module:

```js
const queriedModule = pokedexModule.where('type', '==', type).orderBy('name', 'asc')
queriedModule.fetch()
// or
queriedModule.stream()
```

Here is a complete example for a search function:

```javascript
const pokedexModule = magnetar.collection('pokedex')

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

### Query Groups

If you need to query data from multiple sub modules you can do so by using a _Collection Group_.

Say your database looks like this:

collection: `'pokedex'`<br />records:

▪ '001': `{ name: 'Bulbasaur' }`<br />subcollection: `'pokedex/001/attacks'`<br />records:

- 'leaf-attack': `{ name: 'Leaf Attack', effectiveAgainst: { water: true } }`

▪ '002': `{ name: 'Ivysaur' }`<br />subcollection: 'pokedex/002/attacks'<br />records:

- 'leaf-attack': `{ name: 'Leaf Attack', effectiveAgainst: { water: true } }`

```js
const queriedModule = magnetar
  .collectionGroup(`pokedex/*/attacks`)
  .where('effectiveAgainst.water', '==', true)

queriedModule.fetch()
```

### Query Limitations

Based on your remote store plugin there might be limitations to what/how you can query data.

For Cloud Firestore be sure check the [Query Limitations](https://firebase.google.com/docs/firestore/query-data/queries#query_limitations) in their official documentation.
