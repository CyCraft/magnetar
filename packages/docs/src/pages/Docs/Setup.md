# Setup

## Main Setup

To instantiate Magnetar, you need to first instantiate the store plugins you will use:

1. instantiate a plugin for a _**remote**_ data store
2. instantiate a plugin for a _**local**_ data store
3. _then_ instantiate the Magnetar instance with those plugins

### Example

This is a complete setup example which uses:

- the **Firestore** plugin for remote data store
- the **Vue 3** plugin for local data store

> Please note: in reality it's cleaner to have **all imports at the top**

<!-- prettier-ignore-start -->
```javascript
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, doc } from 'firebase/firestore'
import { PluginFirestore, PluginVue3, Magnetar, logger } from 'magnetar'
// ---------------------------------------------
// 0. Initialise firebase
// ---------------------------------------------
const firebaseApp = initializeApp({ /* pass your config... */ })
const db = getFirestore(firebaseApp)
/**
 * A helper function that generates a random Firestore ID
 */
function generateRandomId () { return doc(collection(db, 'random')).id }

// ---------------------------------------------
// 1. the plugin firestore for remote data store
//    create the remote store plugin instance & pass your `db`:
// ---------------------------------------------
const remote = PluginFirestore.CreatePlugin({ db })

// ---------------------------------------
// 2. the plugin vue3 for local data store
//    create the local store plugin instance & pass your `generateRandomId`:
// ---------------------------------------
const local = PluginVue3.CreatePlugin({ generateRandomId })

// -----------------------------------------------------
// 3. instantiate the Magnetar instance with the store plugins
// -----------------------------------------------------
export const magnetar = Magnetar({
  stores: { local, remote },
  localStoreName: 'local',
  executionOrder: {
    read: ['local', 'remote'],
    write: ['local', 'remote'],
    delete: ['local', 'remote'],
  },
  on: { success: logger }, // disable this on production builds
})
```
<!-- prettier-ignore-end -->

Some info on the main Magnetar instance props:

- `stores` ⸺ an object with the store name as key and the store plugin instance as value
- `localStoreName` ⸺ the name of the store that saves data locally
- `executionOrder` ⸺ the execution order of your stores, this order is required for optimistic UI (but can be flipped)
- `on` ⸺ event listeners for anything that happens in Magnetar, see the [Events chapter](#events) for more info

## Working with Modules

You can access/create modules with a simple `collection(path)` and `doc(path)` syntax. The path will be interpreted by whichever store plugins you use.

Eg. Using the Firestore plugin, these module paths will point to the Firestore collection and document paths in our Firebase console.

```javascript
// access the collection:
magnetar.collection('pokedex')

// access a sub-doc via its collection:
magnetar.collection('pokedex').doc('001')

// access a sub-doc via its path:
magnetar.doc('pokedex/001')
```

Ideally you want to create a separate file for the modules you intend to use (or one file per module). This way you can more easily add some documentation on how the data structure looks for your database documents. <small>(for more info on this read [Module Setup](#))</small>

```javascript
import { magnetar } from 'magnetarSetup.js'

export const pokedexModule = magnetar.collection('pokedex')
export const trainerModule = magnetar.doc('app-data/trainer')
```

## Module Data & Methods

Using your collection or document modules, you can access the `data`, `id` and several methods.

**Any data accessed is readonly!** To "mutate" the data, you **have** to use the provided methods. This is good because any kind of mutation is supposed to go through a function so it can be synced to your local & remote stores.

Here we show some of the data and methods you can access on a module:

### Collection Modules

You can access all documents in a collection via the `data` property. `data` is a Map <small>[？](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)</small> with the document ids as key and the document data as value.

```js
const pokedexModule = magnetar.collection('pokedex')

// accessing data
pokedexModule.data // Map<'001': { name: 'bulbasaur' }, /* etc...*/  >
pokedexModule.id // 'pokedex'
pokedexModule.path // 'pokedex' (the full path)

// methods to write data
pokedexModule.insert({ name: 'Squirtle' }) // inserts a new document
pokedexModule.delete('001') // deletes a document

// methods to read data
pokedexModule.fetch() // fetches documents from the remote store & adds them locally
pokedexModule.stream() // opens a database stream & adds incoming documents locally
```

### Document Modules

You can access a document's data via the `data` property. In this case it will be a single object, since a document module represents only a single object.

```js
const pokemonModule = magnetar.doc('pokedex/001')
// or
const pokemonModule = magnetar.collection('pokedex').doc('001')

// accessing data
pokemonModule.data // { name: 'Bulbasaur', level: 1 }
pokemonModule.id // '001'
pokemonModule.path // 'pokedex/001'

// methods to write data
pokemonModule.replace({ name: 'Ivysaur', level: 16 }) // sets new data
pokemonModule.merge({ level: 17 }) // updates the document by deep merging the new data
pokemonModule.assign({ level: 17 }) // updates the document by shallow merging the new data
pokemonModule.deleteProp('name') // deletes a property from the document
pokemonModule.delete() // deletes the document

// methods to read data
pokemonModule.fetch() // fetches the document from the remote store & adds it locally
pokemonModule.stream() // opens a database stream & keeps the document up to date locally
```

## Displaying Data in the DOM

- A Magnetar collection's `.data` is a _**Map**_ <small>[？](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)</small>
- A document's `.data` is a _**plain object**_

Here we show to how make sure your DOM is updated reactively whenever this data changes.

### Vue Example

In Vue you must make sure you use the Vue 2 or Vue 3 plugin as local store which will enable reactivity.

You can use a computed prop to show the data in your template like so:

```html
<template>
  <div>
    <div v-for="p in pokemon" :key="p.id">{{ p.name }}</div>
  </div>
</template>
```

```js
export default {
  computed: {
    pokemon() {
      return pokedexModule.data.values()
    },
  },
}
```

### React Example

// todo

### Svelte Example

// todo

### Vanilla JS Example

// todo
