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
import { addCreatedAt, addUpdatedAt } from './helpers'

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

Some remote stores (eg. Firestore) do not allow the value `undefined`. In this case you can set up a hook that completely removes `undefined` before the data is sent to your local and remote stores. For this example we're going to use a tiny helper utility I wrote called [remove-anything](https://github.com/mesqueeb/remove-anything).

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

Your `modifyReadResponseOn`-function will receive a `payload` as param which is the _incoming data_ and **must** return that `payload` again. The main purpose is that you can modify the payload before it is added to your local store.

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

> documentation below is still WIP

> hint: returning `undefined` will discard the document change and do nothing with the local store

### Accessing Metadata when Reading Data

> documentation WIP

> hint: you can access the metadata as second param

## Events

> documentation WIP

on

> hint: use case: toasts

> hint: use case: developer logging (see setup for now)

### Global Events

> documentation WIP

> hint: you can setup global events when you instantiate magnetar
