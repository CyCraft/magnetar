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
- optimistic UI <sup>[？](https://google.com/search?q=what+is+optimistic+ui)</sup> built in by default (can be opt out of)
- dynamic modules for maximum flexibility in your data structure
- small footprint by using only the store plugins you need
- (TS users) type safety and helpers when reading/writing data

> It's like graphQL but much simpler with CRUD-like functions

## Store plugins

The idea of Magnetar is that you only need to learn how to work with one syntax to read/write data. Your store plugins are the ones that do the heavy lifting in the background to either cache the data locally or make API requests for you. The store plugins are set up in a config file, then can be forgotton about.

In most cases you use Magnetar with two store plugins installed:

- A "local" store plugin, for the data you need cached while using the app. (like Vuex or a simple global object)
- A "remote" store plugin, for the remote data stored. (like Firestore or any other database)

**When reading data:** the _remote_ store will fetch the data; the _local_ store will then add that data for you, so you can easily access and use it in your app.

**When writing data:** the _local_ store will save your changes in its cache; the _remote_ will then make an API call to your database. <small>(you can also flip this around, so the local store is only updated after the remote one)</small>

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
