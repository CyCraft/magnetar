# About

## TLDR;

- Magnetar is a **_state management_** library.<br />A library that brings a simple syntax for reading and writing data and allows you to easily work with this data in your app like a global store.

- Magnetar has 2-way sync **_database integration_** for Google Firestore (and others coming). You do not need to learn to work with the database SDK.<br />— Whenever you modify data in your local store, Magnetar will update your database on the server.<br />— Whenever the server has changes, Magnetar will reflect those in your local store.

- Magnetar's main focus is to be the **_local representation of your database_**.

- Magnetar is framework-agnostic. It can be used with Vue/React/Angular/Vanilla JS projects.

- Magnetar is modular. It works with plugins that provide capabilities so you can only include what you actually need.

- Magnetar has plugins for Vue 2 & Vue 3 that offer **_built-in reactivity_**.<br />Just like Vuex, displaying data in Vue just works as you would expect and is reactive on local/server changes. (Magnetar does not rely on Vuex)

<img src="/media/magnetar-value-proposition.jpg" style="width: 100%" />

## Learn by Example

Here is a hypothetical example of a To Do list powered by Magnetar that uses the Vue 3 and Firestore plugins.

```html
<script setup>
  import { onCreated, computed } from 'vue'
  // magnetar is instantiated with the firestore and vue 2 plugins
  // (See the Setup chapter)
  import { magnetar } from './my-magnetar-setup.js'

  /**
   * A module for data in firestore, at path 'todo-items'
   */
  const todoItemsModule = magnetar.collection('todo-items')

  onCreated(() => {
    // fetch all documents from Firestore & continue to watch for any changes
    // will keep local data up to date when changes on database occur
    todoItemsModule.stream()
  })

  /**
   * Displays the local data of your module (data comes in via the stream)
   */
  const items = computed(() => {
    // in magnetar, the collection `.data` is a JS Map
    return todoItemsModule.data.values()
  })

  /**
   * Adds a new item to the local data & makes API call to Firestore
   * UI is reflected automatically
   */
  function addItem(newData) {
    todoItemsModule.insert(newData)
  }

  /**
   * Edits an item in the local data & makes API call to Firestore
   * UI is reflected automatically
   */
  function editItem(id, newData) {
    todoItemsModule.doc(id).merge(newData)
  }

  /**
   * Deletes an item from the local data & makes API call to Firestore
   * UI is reflected automatically
   */
  function deleteItem(id) {
    todoItemsModule.delete(id)
  }

  // This example is the top level component representing a todo list
  // it holds the logic to display your UI and act on user interaction
</script>

<template>
  <!-- the TodoItem and AddNewTodoItem are hypothetical UI components -->
  <!-- they should emit events based on user input -->
  <div class="my-todo-list">
    <TodoItem v-for="item in items" :key="item.id" @edit-item="editItem" @delete-item="deleteItem">
      {{ item.name }}
    </TodoItem>

    <AddNewTodoItem @add-item="addItem" />
  </div>
</template>
```
