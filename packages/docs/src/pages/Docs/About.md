# About

## TLDR;

- Magnetar is a **_state management_** library.<br />A library that brings a unified syntax for reading and writing data and allows you to easily work with this data in your app like a global store.

- Magnetar has **_database integration_** for Google Firestore and others.<br />Whenever you modify data in your global store, Magnetar will keep this data automatically in sync with your database. It also keeps the local data up to date on server changes.

- Magnetar's main focus is to be the **_local representation of your database_**.

- Magnetar has **_built-in reactivity_** for Vue 2 & Vue 3.<br />Just like Vuex, displaying data in Vue just works as you would expect and is reactive on local/server changes. (Magnetar does not rely on Vuex)

<!-- ![](/Magnetar Value Proposition.jpg) -->
<img src="/Magnetar Value Proposition.jpg" style="width: 100%" />

## Learn by example

Here is a hypothetical example of a To Do list powered by Magnetar that uses the Vue 2 and Firestore plugins.

```js
// magnetar is instantiated with the firestore and vue 2 plugins
// (See the Setup chapter)
import { magnetar } from './my-magnetar-setup.js'

/**
 * A module for data in firestore, at path 'todo-items'
 */
const todoItemsModule = magnetar.collection('todo-items')

// This example is the top level component representing a todo list
// it holds the logic to display your UI and act on user interaction

Vue.component('TodoList', {
  // the TodoItem and AddNewTodoItem are hypothetical UI components
  // they should emit events based on user input
  template: `<div>
    <TodoItem
      v-for="item in items"
      :key="item.id"
      @edit-item="editItem"
      @delete-item="deleteItem"
    >
      {{ item.name }}
    </TodoItem>

    <AddNewTodoItem
      @add-item="addItem"
    />
  </div>`,

  created() {
    // fetch all documents from Firestore & continue to watch for any changes
    // will keep local data up to date when changes on database occur
    todoItemsModule.stream()
  },
  computed: {
    /**
     * Displays the local data of your module (data comes in via the stream)
     */
    items() {
      // in magnetar, the collection `.data` is a JS Map
      return todoItemsModule.data.values()
    },
  },
  methods: {
    /**
     * Adds a new item to the local data & makes API call to Firestore
     * UI is reflected automatically
     */
    addItem(newData) {
      itemsModule.insert(newData)
    },
    /**
     * Edits an item in the local data & makes API call to Firestore
     * UI is reflected automatically
     */
    editItem(id, newData) {
      itemsModule.doc(id).merge(newData)
    },
    /**
     * Deletes an item from the local data & makes API call to Firestore
     * UI is reflected automatically
     */
    deleteItem(id) {
      itemsModule.delete(id)
    },
  },
})
```

# Concepts

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
