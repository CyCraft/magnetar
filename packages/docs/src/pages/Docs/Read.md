# Read Data

There are two ways to retrieve data from your remote stores. Either of these methods can be used with documents and collections.

- Execute a function to fetch data once
- Set up a "stream" to receive realtime updates

## Fetch Data Once

When you get data by executing `fetch()`, the data will be fetched from a server by your "remote" store plugin and then added to your module's data by your "local" store plugin.

For displaying fetched data in the DOM see the [Displaying data in the DOM](#displaying-data-in-the-dom).

### Fetch a Single Document

When you call `fetch()` on a document module, your remote store will go and fetch the document from your database and add it to your local store.

```javascript
const bulbasaur = magnetar.doc('pokedex/001')

// bulbasaur's data is not yet in local data
// bulbasaur.data ≈ {}

await bulbasaur.fetch()

// now it is available locally:

const data = bulbasaur.data
// bulbasaur.data ≈ { name: 'Bulbasaur' }
```

The `fetch` action returns whatever data was fetched. When fetching a single document, the data will be an object.

```js
// create the module and immidiately use the fetched data
const bulbasaurData = await magnetar.doc('pokedex/001').fetch()

// bulbasaurData ≈ { name: 'Bulbasaur' }
```

Fetching is **optimistic by default**!

```js
const bulbasaur = magnetar.collection('pokedex').doc('001')

await bulbasaur.fetch()
// ⤷　does nothing if already fetched once

await bulbasaur.fetch({ force: true })
// ⤷　makes API call to remote store
```

### Fetch Multiple Documents

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

The `fetch` action returns whatever data was fetched. When fetching a collection, the data will be a Map <small>[？](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)</small>.

```js
// create the module and immidiately use the fetched data
const pokedexData = await magnetar.collection('pokedex').fetch()

// pokedexData ≈ Map<
//   '001': { name: 'Bulbasaur' },
//   /* etc...*/
// >
```

Fetching is **optimistic by default**!

```js
const pokedex = magnetar.collection('pokedex')

pokedex.fetch()
// ⤷　does nothing if already fetched once

pokedex.fetch({ force: true })
// ⤷　makes API call to remote store
```

### Fetch and get document data

You can fetch and immediately return a document's data. This is optimistic by default — meaning it will only make an API call once and otherwise return the _already fetched data_. Add the `force` option to force multiple fetch calls.

```js
// this will only fetch the data once, and from there on always return the same data:
const bulbasaurData = await magnetar.doc('pokedex/001').fetch()

// every time this is executed, it will (re)fetch and return the data:
const bulbasaurData = await magnetar.doc('pokedex/001').fetch({ force: true })
```

## Stream Realtime Updates

When you set up a _**stream**_ for a document or collection, just like `fetch()`, your the data will be fetched from a server by your _remote_ store plugin and then added to your module's _local_ data.

Afterwards, any changes to this document remotely will automatically be reflected in your module's _local_ data while the stream is open.

Please note: a streaming promise will never resolve as long as your stream is open! There is **no way** to know when or how many documents will be loaded in, as this depends on your remote store.

For displaying streamed data in the DOM see the [Displaying data in the DOM](#displaying-data-in-the-dom).

### Firestore vs Magnetar

The Firestore JS SDK has a [built-in feature for realtime updates](https://firebase.google.com/docs/firestore/query-data/listen) via a method called `onSnapshot`. The main pain points are:

- The syntax you have to use is very convoluted and complex
- If your not careful, you can open the same stream twice and they both will use memory
- You need to write a lot of code to capture the documents that comes in and save them in local cache
- You need to organise where and how to temporarily save the function you get back to stop the stream

Magnetar's Firestore Plugin uses `onSnapshot` [under the hood](https://github.com/CyCraft/magnetar/blob/production/packages/plugin-firestore/src/actions/stream.ts) but does these things for you:

- The syntax is super clean. It's just `.stream()`
- A stream cannot be opened twice on accident, the already open stream will be returned in case you open it again
- No need to write any extra code, Magnetar captures the documents that comes in and saves them in local cache for you
- No need to keep around the function to stop the stream, Magnetar does this for you

### Stream a Collection

```javascript
const pokedexModule = magnetar.collection('pokedex')
// open the stream
pokedexModule.stream()
  .catch((error) => {
    // the stream was closed because of an error    
  })

// ... some time later

// incoming data from the remote store will be
// added to your module's data and stay in sync

// pokedexModule.data ≈ Map<
//   '001': { name: 'Bulbasaur' },
//   /* etc...*/
// >
// pokedexModule.data.values() ≈ [{ name: 'Bulbasaur' }, /* etc...*/ ]
```

That's it! You don't need any other logic!!

### Stream a Single Document

```javascript
const bulbasaur = magnetar.doc('pokedex/001')
// open the stream
bulbasaur.stream()
  .catch((error) => {
    // the stream was closed because of an error    
  })

// ... some time later

// incoming data from the remote store will be
// added to your module's data and stay in sync

// bulbasaur.data ≈ { name: 'Bulbasaur' }
```

That's it! You don't need any other logic!!

### Closing a Stream

You can close a stream again simply by executing `closeStream` on the same module:

```javascript
const pokedexModule = magnetar.collection('pokedex')

// close the collection stream:
pokedexModule.closeStream()

// close the doc stream:
pokedexModule.doc('001').closeStream()
```

### The Streaming Promise

You don't need to `await` a stream, because the promise won't resolve as long as its open!

```js
// open the stream
await magnetar.collection('pokedex').stream()

// The code here will only get executed after the stream was closed!
console.log('closed!')
```

Instead, for a stream, it might be better to just use `.then()` and `.catch()`

```js
// open the stream
magnetar.collection('pokedex')
  .stream()
  .then(() => {
    // the stream was closed via `closeStream()` !
  })
  .catch(() => {
    // the stream was closed because of an error! !
  })

// The code here will get executed immidiately
console.log('The stream was opened!')
```

## Query Data (filter, order by, limit...)

There are three methods to query more specific data in a collection:

- `where`
- `orderBy`
- `limit`

You can execute and chain these methods on collections to create a _queried module_ that is just like a regular module but with your query applied.

When you apply a query it affects both the remote and local stores:

- If you make a `fetch()` call with a _queried module_, it will pass the queries to the remote store, which will make sure that your query is applied to the API call.
- If you access module data with a _queried module_, the local store will also make sure that your query is applied to whatever data it returns.

```js
const pokedexModule = magnetar.collection('pokedex')
const fireTypePokemon = pokedexModule.where('type', '==', 'fire')

await fireTypePokemon.fetch()

fireTypePokemon.data.values() // returns just the queried docs that were fetched
pokedexModule.data.values() // returns all docs fetched so far, including those fire types you just fetched
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

<!-- prettier-ignore-start -->
```js
magnetar
  .collection('pokedex')
  .where('type', '==', 'fire')
  .where('level', '>', 16)
```
<!-- prettier-ignore-end -->

For now read the Firestore documentation on [Simple and Compound Queries](https://firebase.google.com/docs/firestore/query-data/queries#array_membership). The concept is inspired by Firestore, but with Magnetar _every_ local and remote store plugin implements the proper logic to work with these kind of queries!

More Magnetar specific information on this will come soon.

### Order by

You can order docs coming in by a specific field, ascending or descending. `orderBy` needs 2 parameters.

1. the prop name to order by
2. `'asc'` or `'desc'`

Eg. "all Pokemon sorted alphabetically"

<!-- prettier-ignore-start -->
```js
magnetar
  .collection('pokedex')
  .orderBy('name', 'asc')
```
<!-- prettier-ignore-end -->

### Limit

Limit is mainly for the remote store to limit the amount of records fetched at a time. `limit` needs 1 parameter.

1. The count to limit by

Eg. "get the first 10 Pokemon sorted alphabetically"

<!-- prettier-ignore-start -->
```js
magnetar
  .collection('pokedex')
  .orderBy('name', 'asc')
  .limit(10)
```
<!-- prettier-ignore-end -->

### More Examples

You can combine `where` with `orderBy`:

<!-- prettier-ignore-start -->
```js
magnetar
  .collection('pokedex')
  .where('type', '==', 'fire')
  .orderBy('name', 'asc')
```
<!-- prettier-ignore-end -->

You can either `stream` or `fetch` a queried module:

<!-- prettier-ignore-start -->
```js
const fireTypePokemon = magnetar
  .collection('pokedex')
  .where('type', '==', 'fire')
  .orderBy('name', 'asc')

fireTypePokemon.fetch()
// or
fireTypePokemon.stream()
```
<!-- prettier-ignore-end -->

Here is a complete example for a search function:

```javascript
const pokedexModule = magnetar.collection('pokedex')

/**
 * @param {string} type - the Pokemon Type that's being searched
 * @returns {Record<string, any>[]}
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

### Query Limitations

Based on your remote store plugin there might be limitations to what/how you can query data.

For Cloud Firestore be sure check the [Query Limitations](https://firebase.google.com/docs/firestore/query-data/queries#query_limitations) in their official documentation.

### Opening & Closing Multiple Streams

You can have multiple streams open with different queries.

```js
const pokedexModule = magnetar.collection('pokedex')

// open two streams with different filters:
pokedexModule.where('type', '==', 'fire').stream()
pokedexModule.where('type', '==', 'water').stream()

// access the documents from the two streams separately:
pokedexModule.where('type', '==', 'fire').data.values()
pokedexModule.where('type', '==', 'water').data.values()

// access all the documents at once:
pokedexModule.data.values()

// close the streams once by one:
pokedexModule.where('type', '==', 'fire').closeStream()
pokedexModule.where('type', '==', 'water').closeStream()

// close all streams at once:
pokedexModule.closeAllStreams()
```

## Collection Groups (WIP)

> This chapter is still being written

If you need to query data from multiple sub modules you can do so by using a _Collection Group_.

<!-- Say your database looks like this:

collection: `'pokedex'`<br />records:

▪ '001': `{ name: 'Bulbasaur' }`<br />sub-collection: `'pokedex/001/attacks'`<br />records:

- 'leaf-attack': `{ name: 'Leaf Attack', effectiveAgainst: { water: true } }`

▪ '002': `{ name: 'Ivysaur' }`<br />sub-collection: `'pokedex/002/attacks'`<br />records:

- 'leaf-attack': `{ name: 'Leaf Attack', effectiveAgainst: { water: true } }` -->

```js
const waterAttacks = magnetar.collectionGroup(`pokedex/*/attacks`).where('type', '==', 'water')

waterAttacks.fetch()
```

> This syntax is not fully implemented yet!
