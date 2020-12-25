# About

Magnetar is a library that brings a unified syntax for reading and writing data and allows you to easily work with this data in your app like a "global" store.

You can power Magnetar with "store plugins" that work in the background to keep this data automatically in sync with whatever service/database or local store you use.

## Benefits of Magnetar

- an easy to use global store
- unified syntax for reading and writing data
- integration of cloud services and databases (like Firebase, MongoDB, ...)
- integration of local state libraries (like Vuex, Redux, ...)
- your data automatically stays in sync with external services
- you do not need to learn each service's SDK
- API calls are optimised and handled for you (to be as economic as possible)
- optimistic UI built in by default (can be opt out of)
- dynamic modules for maximum flexibility in your data structure
- small footprint by using only the store plugins you need
- (TS users) type safety and helpers when reading/writing data

> It's like graphQL but much simpler with CRUD-like functions

## Store plugins

In most cases you use Magnetar with two store plugins installed:

- A "local" store plugin, for the data you need stored in memory while using the app. (like Vuex or a simple global object)
- A "remote" store plugin, for the remote data stored. (like Firestore or any other database)

**When reading data:** the remote store will fetch the data; the local store will then add that data for you, so you can easily access and use it in your app.

**When writing data:** both the local and remote stores will update the data for you. You can choose if you want to show updates immidiately and sync remote store in the background (optimistic UI) or wait for the remote store to complete before its reflected locally.

The idea of Magnetar is that store plugins are set up in a config file, then can be forgotton about. The important part of Magnetar is its actual syntax when reading and writing data, as explained in the Modules section below.

## Modules

With Magnetar, the idea is that your data is organised and accessible through modules. A module could be a single object (a "document") or a map of objects (a "collection").

Modules are dynamically created and destroyed when you read/write data! JavaScript will automatically garbage-collect modules that are not referenced anymore.

The concept of modules in Magnetar was inspired by [Google Firestore and the Firebase SDK](https://firebase.google.com/docs/firestore/data-model). If you are already familiar with this SDK, feel free to skip this section and go straight to [Setup](#setup)

### Collection vs document modules

A "module" is something that points to a certain chunk of data in your database.

A module instance provides you with these four things: (1) functions to read data; (2) functions to write data; (3) the data itself; (4) other meta data.

Every module can be one of two types:

- **document:** has a single object as data
- **collection:** has an map of objects as data

Collections can hold several documents, and documents can have sub-collections with more documents. Like so:

```javascript
collection / document / collection / document
```

As an example: `pokedex/001/moves/leafAttack`

- `pokedex` & `moves` are "collections"
- `001` & `leafAttack` are "documents"

:::spoiler Further reading

Collections and documents was inspired by Google Firebase's database called **Firestore**.

If you are still new to this concept you should also read [their documentation on the "data model"](https://firebase.google.com/docs/firestore/data-model).
:::

### Access a module and its data

You can access modules with a simple `collection(id)` & `doc(id)` syntax.

```javascript
// access the collection:
magnetar.collection('pokedex')

// access a sub-doc via its collection:
magnetar.collection('pokedex').doc('001')

// access a sub-doc via its path:
magnetar.doc('pokedex/001')
```

With these collection or document instances, you can then access the `data`, `id` and several functions of this "module". Eg.

```javascript
// a collection module
const pokedexModule = magnetar.collection('pokedex')

pokedexModule.id // === 'pokedex'
pokedexModule.data // === Map<'001': { name: 'bulbasaur' }, ... >
pokedexModule.insert({ name: 'Squirtle' }) // inserts a new document

// a document module
const bulbasaur = magnetar.doc('pokedex/001')

bulbasaur.id // === '001'
bulbasaur.data // === { name: 'bulbasaur' }
bulbasaur.replace({ name: 'Ivysaur' }) // sets new data
```

:::spoiler ~~The data is also accessible directly like so:~~ (TBD)

```javascript
const pokedexModule = magnetar.collection('pokedex')

pokedexModule['001'] // === { name: 'bulbasaur' }
pokedexModule['001'].name // === 'bulbasaur'
```

:::

↑
To be decided

As an added layer of protection, **any data accesses is readonly!** To "mutate" the data, you'll have to use the functions that are provided (which we explain down below).

This is good because any mutation is supposed to go through a function so it can be synced to all your stores.
