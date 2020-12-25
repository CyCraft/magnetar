# Read Data

There are two ways to retrieve data from your remote stores. Either of these methods can be used with documents and collections.

- Execute a function to get data once
- Set up a "stream" to receive realtime updates

## Get data once

When you get data by executing `get()`, the data will be fetched from a server by your "remote" store plugin and then added to your module's data by your "local" store plugin.

### Get a single document

When you create a module instance of a document, but the data is still on the server, you can retrieve it with `get()` like so:

```javascript
const bulbasaur = magnetar.doc('pokedex/001')

// bulbasaur.data === {} // empty!

await pokedexModule.get()

// now it is available locally:

const bulbasaurData = bulbasaur.data
// bulbasaurData === { name: 'Bulbasaur' }
```

### Get multiple documents in a collection

```javascript
const pokedexModule = magnetar.collection('pokedex')

// pokedexModule.data === Map<> // empty!
// pokedexModule.data.values() === [] // empty!

await pokedexModule.get()

// now they are available locally:
// pokedexModule.data === Map<'001': { name: 'Bulbasaur' }, ...>

const allPokemon = pokedexModule.data.values()
// allPokemon === [{ name: 'Bulbasaur' }, ...]
```

## Stream realtime updates

When you set up a "stream" for a document or collection, just like `get()`, your the data will be fetched from a server by your "remote" store plugin and then added to your module's data by your "local" store plugin.

Afterwards, if there are any changes to this document, they will automatically be updated in your "local" data while the stream is open.

### Stream a collection

```javascript
const pokedexModule = magnetar.collection('pokedex')
// open the stream
pokedexModule.stream()

// data that comes in from the remote store will be added to your data and stays in sync

// now they are available locally:
// pokedexModule.data === Map<'001': { name: 'Bulbasaur' }, ...>

const allPokemon = pokedexModule.data.values()
// allPokemon === [{ name: 'Bulbasaur' }, ...]
```

### Stream a single document

```javascript
const bulbasaur = pokedexModule.doc('001')
// open the stream
bulbasaur.stream()

// data that comes in from the remote store will be added to your data and stays in sync

const data = bulbasaur.data
// data === { name: 'Bulbasaur' }
```

:::hint
The promise returned from a stream is only resolved if the stream channel was closed. Either by the dev or because of an error (in which case it will reject). As long as the stream is open, the promise returned will not resolve.
:::

### Closing a stream

You can list all open streams like so:

```javascript
magnetar.collection('pokedex').openStreams.entries()

// or for a doc:
magnetar.doc('pokedex/001').openStreams.entries()
```

`openStreams` is a [Map](link to mdn) with the payload you passed to start the stream as key, and the "close" function as value.

Here is a full example of opening and closing a stream:

```javascript
// open the stream:
const streamOptions = {}
magnetar.collection('pokedex').stream(streamOptions)

// close the stream:
const streamCloseId = streamOptions
const closeFn = magnetar.collection('pokedex').openStreams.get(streamCloseId)
closeFn()
```

Note if you didn't pass any options when you opened the stream, like so: `stream()` then it's "id" in the openStreams map will be `undefined`.

## Query data (filter, order by, limit...)

You might only want to get or stream _some_ documents, filtered by a field; limited to X docs; or in a certain order.

MORE DOCUMENTATION COMING ON THIS SOON

You can pass an object with options to `get()` and `stream()` like so:

```javascript
const clauses = {
  /* some options */
}

await magnetar.collection('pokedex').get(clauses)
```

More information on what kind of options you can pass can be found in the documentation of your store plugin.
