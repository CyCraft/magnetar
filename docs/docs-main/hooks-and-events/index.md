# Hooks and Events

## Hooks before Writing

When you define a module, you can pass the `modifyPayloadOn` config, in which you can define functions you want to be executed every time **_BEFORE_ a write method is called**.

The config you can pass for `modifyPayloadOn` is an object with the following properties. All properties are optional.

- `write` — triggered every time for methods `insert`, `merge`, `assign`, `replace`
- `insert` — triggered every time for method `insert`
- `merge` — triggered every time for method `merge`
- `assign` — triggered every time for method `assign`
- `replace` — triggered every time for method `replace`
- `deleteProp` — triggered every time for method `deleteProp`
- `read` — triggered every time for method `stream`, `fetch`
- `stream` — triggered every time for method `stream`
- `fetch` — triggered every time for method `fetch`

Your `modifyPayloadOn`-function will receive the `payload` as param and **must** return the `payload` again. The main purpose is that you can modify the payload before anything happens.

Here we give some examples with common use cases.

### Apply Default Values on Insert

In this example we ensure that every insert will always include a set of props with some default values we choose.

```js
const defaultsPokemon = () => ({
  name: '',
  type: '',
  level: 0,
})

const pokedexModule = magnetar.collection('pokedex', {
  modifyPayloadOn: {
    insert: (payload) => {
      return { ...defaultsPokemon(), ...payload }
    },
  },
})

// default values will be applied
pokedexModule.doc('abc').insert({ name: 'Unown' })

// pokedexModule.doc('abc').data ≈ { name: 'Unown', type: '', level: 0 }
```

### Add Created At / Updated At Fields

In this example we ensure that every write will always include `createdAt` and `updatedAt` fields.

```js
const pokedexModule = magnetar.collection('pokedex', {
  modifyPayloadOn: {
    insert: (payload) => {
      const createdAt = new Date().toISOString()
      return { createdAt, ...payload }
    },
    write: (payload) => {
      const updatedAt = new Date().toISOString()
      return { updatedAt, ...payload }
    },
  },
})

// default values will be applied
pokedexModule.doc('abc').insert({ name: 'Ponyta' })

// pokedexModule.doc('abc').data ≈ { name: 'Ponyta', createdAt: '2020-12-18T05:56:06.735Z', updatedAt: '2020-12-18T05:56:06.735Z' }

pokedexModule.doc('abc').merge({ name: 'Rappidash' })

// pokedexModule.doc('abc').data ≈ { name: 'Rappidash', createdAt: '2020-12-18T05:56:06.735Z', updatedAt: '2021-02-22T04:06:06.735Z' }
```

Here is a clean way you could reuse such logic easily in multiple modules:

```js
export function addCreatedAt(payload) {
  const createdAt = new Date().toISOString()
  return { createdAt, ...payload }
}

export function addUpdatedAt(payload) {
  const updatedAt = new Date().toISOString()
  return { updatedAt, ...payload }
}
```

And then in the file(s) you define your modules:

```js
import { addCreatedAt, addUpdatedAt } from './helpers/index.js'

const pokedexModule = magnetar.collection('pokedex', {
  modifyPayloadOn: {
    insert: addCreatedAt,
    write: addUpdatedAt,
  },
})
```

### Convert `undefined` to `null`

Some remote stores (eg. Firestore) do not allow the value `undefined`. In this case you can set up a hook that converts `undefined` to `null` whenever data is written. For this example we're going to use a tiny helper utility I wrote called [find-and-replace-anything](https://github.com/mesqueeb/find-and-replace-anything).

```js
import { findAndReplace } from 'find-and-replace-anything'

const pokedexModule = magnetar.collection('pokedex', {
  modifyPayloadOn: {
    write: (payload) => findAndReplace(payload, undefined, null),
  },
})

// undefined will be converted to null
pokedexModule.doc('abc').insert({ name: 'Unown', type: undefined })

// pokedexModule.doc('abc').data ≈ { name: 'Unown', type: null }
```

### Remove Certain Values

Some remote stores (eg. Firestore) do not allow the value `undefined`. In this case you can set up a hook that completely removes `undefined` before the data is sent to your cache and remote stores. For this example we're going to use a tiny helper utility I wrote called [remove-anything](https://github.com/mesqueeb/remove-anything).

```js
import { removeProp } from 'remove-anything'

const pokedexModule = magnetar.collection('pokedex', {
  modifyPayloadOn: {
    write: (payload) => removeProp(payload, undefined),
  },
})

// undefined will be removed
pokedexModule.doc('abc').insert({ name: 'Unown', type: undefined })

// pokedexModule.doc('abc').data ≈ { name: 'Unown' }
```

### Omit Certain Props

If you have some props that you never want to be included, you can omit them from the payload on every write. For this example we're going to use a tiny helper utility I wrote called [filter-anything](https://github.com/mesqueeb/filter-anything).

```js
import { omit } from 'filter-anything'

/**
 * These props will be omitted on every write (the props below are hypothetical examples)
 */
const propsToOmit = ['metadataXYZ', '_temporaryTag']

const pokedexModule = magnetar.collection('pokedex', {
  modifyPayloadOn: {
    write: (payload) => omit(payload, propsToOmit),
  },
})

// propsToOmit will be removed
pokedexModule.doc('abc').insert({ name: 'Unown', metadataXYZ: 'xyz', _temporaryTag: 'new' })

// pokedexModule.doc('abc').data ≈ { name: 'Unown' }
```

## Hooks after Reading

When you define a module, you can pass the `modifyReadResponseOn` config, in which you can define functions you want to be executed every time **_AFTER_ a document is retrieved from the remote store**.

The config you can pass for `modifyReadResponseOn` is an object with the following properties. All properties are optional.

- `added` — triggered every time data comes in from your remote store (the server), during the methods `stream` and `fetch`
- `modified` — triggered every time data is modified on your remote store (the server), during the method `stream`
- `removed` — triggered every time data is removed from your remote store (the server) OR if a document satisfy the query filters of your module anymore, during the method `stream`

Your `modifyReadResponseOn`-function will receive a `payload` as param which is the _incoming data_ and **must** return that `payload` again. The main purpose is that you can modify the payload before it is added to your local cache store.

Here we give some examples with common use cases.

### Apply Default Values on Read

In this example we ensure that every time a document is read from your remote store (the server) that we always include a set of props with some default values we choose.

This might be useful when there is a chance that some parts of your database is outdated and misses props that you need in your front-end.

```js
const defaultsPokemon = () => ({
  name: '',
  type: '',
  level: 0,
})

const pokedexModule = magnetar.collection('pokedex', {
  modifyReadResponseOn: {
    added: (payload) => {
      return { ...defaultsPokemon(), ...payload }
    },
  },
})

// default values will be applied when docs are retrieved during stream
pokedexModule.stream()
```

### Prevent Doc Removal During Stream

When using Firestore streams with `where` clauses, documents can be removed from your local cache if they no longer match the query filters. This happens when a document's data changes and no longer satisfies the stream's conditions.

You can prevent this automatic removal by returning `undefined` from the `removed` hook. This keeps the document in your local cache even when it no longer matches the stream's where clause.

**Real-world example**: In a Pokemon game, you might have a stream showing only Pokemon that are "available for battle" (not fainted, not in the PC, etc.). But you want to keep legendary Pokemon visible in the UI even if they temporarily become unavailable, so players can see their stats and plan their team.

```js
const pokedexModule = magnetar.collection('pokedex')

// Stream only Pokemon available for battle, but keep ALL in cache when they faint
pokedexModule
  .where('status', '==', 'available')
  .where('hp', '>', 0)
  .orderBy('level', 'desc')
  .stream(undefined, {
    modifyReadResponseOn: {
      removed: (payload) => {
        // Keep ALL Pokemon in cache even if they become unavailable
        // This allows us to see their stats and plan our team
        return undefined // This prevents removal from local cache
      },
    },
  })

// Later, when any Pokemon faints (hp becomes 0):
// - Firestore removes it from the stream because hp <= 0
// - Our removed hook prevents it from being removed from local cache
// - The Pokemon stays visible in the UI for reference and team planning
// - We can still see their stats, moves, and other information
```

### Accessing Metadata when Reading Data

When reading data from your remote store, you can access metadata as a second parameter in your `modifyReadResponseOn` functions. This metadata contains the full Firestore DocumentSnapshot, which includes the document ID and other server-side information.

**Real-world example**: You might want to add the document ID to your data in the frontend cache, but not store it as a field in the Firestore document itself. This is useful when you want to keep your database documents clean while still having easy access to the ID in your frontend code.

```js
const pokedexModule = magnetar.collection('pokedex', {
  modifyReadResponseOn: {
    added: (payload, metadata) => {
      // Add the document ID to the data for frontend use
      return {
        ...payload,
        id: metadata.id, // Add ID from metadata to the document data
      }
    },
    modified: (payload, metadata) => {
      // Ensure the ID is always present when documents are modified
      return {
        ...payload,
        id: metadata.id,
      }
    },
  },
})

// Now when you access the data in your frontend:
// pokedexModule.doc('001').data // { name: 'Bulbasaur', type: 'grass', id: '001' }
//
// Instead of having to do:
// const pokemon = pokedexModule.doc('001').data
// const pokemonWithId = { ...pokemon, id: '001' }
```

## Events

Magnetar provides a global event system that you can use to listen to various actions happening throughout your app. This is useful for showing toasts, logging, analytics, or any other side effects.

### Global Events

You can set up global events when you instantiate Magnetar. These events will be triggered for all modules and actions.

```js
import { logger } from '@magnetarjs/utils'

export const magnetar = Magnetar({
  stores: { cache, remote },
  executionOrder: {
    read: ['cache', 'remote'],
    write: ['cache', 'remote'],
    delete: ['cache', 'remote'],
  },
  on: {
    // Log all successful actions
    success: (event) => {
      console.log('✅ Success:', event.actionName, event.path)
    },
    // Show toast for errors
    error: (event) => {
      showToast(`Error: ${event.error.message}`, 'error')
    },
    // Track analytics for writes
    before: (event) => {
      if (
        event.actionName === 'insert' ||
        event.actionName === 'merge' ||
        event.actionName === 'replace'
      ) {
        analytics.track('data_written', {
          action: event.actionName,
          path: event.path,
          store: event.storeName,
        })
      }
    },
  },
})
```

### Available Events

The following events are available:

- `before` — triggered before any action starts
- `success` — triggered when any action completes successfully
- `error` — triggered when any action fails
- `revert` — triggered when an action is reverted due to an error

Each event object contains:

- `actionName` — the action that was performed (fetch, insert, merge, etc.)
- `path` — the module path where the action occurred
- `storeName` — the store name where the action occurred
- `payload` — the data involved in the action
- `collectionPath` — the collection path
- `docId` — the document ID (if applicable)
- `pluginModuleConfig` — the module configuration
- `error` — error details (for error events only)
- `result` — the result of the action (for success events)
- `abort` — function to abort the action (for before events)

### Debug Logging

Magnetar provides a built-in logger for debugging database operations. Enable it by adding the logger to your success events:

```js
import { logger } from '@magnetarjs/utils'

export const magnetar = Magnetar({
  stores: { cache, remote },
  on: {
    success: logger, // Logs all successful operations
  },
})
```

The logger outputs formatted messages like:

```
💫 [magnetar] db.collection('pokedex').where('type', '==', 'fire').fetch() fetch()
💫 [magnetar] db.collection('pokedex').doc('006').insert({ name: 'Charizard' }) insert()
```

**Important**: Disable logging in production:

```js
on: {
  success: import.meta.env.DEV ? logger : undefined,
}
```
