# Plugins

Here you will find more information on each official store plugin for Magnetar.

> Please note that the documentation below is still WIP

## Firestore

Use the Firestore plugin if you use Cloud Firestore.

> documentation WIP

Example setup:

<!-- prettier-ignore-start -->
```js
import { PluginFirestore } from 'magnetar'
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseApp = initializeApp({ /* pass your config... */ })
const db = getFirestore(firebaseApp)

const remote = PluginFirestore.CreatePlugin({ db })
```
<!-- prettier-ignore-end -->

## Vue 3

> documentation WIP

Use the Vue 3 plugin for Vue 3 projects.

Example setup:

```js
import { PluginVue3 } from 'magnetar'

function generateRandomId() {
  return [Math.random(), Math.random(), Math.random()].join('-')
  // you need to provide your own logic
  // this function is used when you execute `insert` without specifying an ID
}

const local = PluginVue3.CreatePlugin({ generateRandomId })
```

## Vue 2

> documentation WIP

Use the Vue 2 plugin for Vue 2 projects.

Example setup:

```js
import { CreatePlugin as CreatePluginVue2 } from '@magnetarjs/plugin-vue2'
import vue from 'vue'

function generateRandomId() {
  return [Math.random(), Math.random(), Math.random()].join('-')
  // you need to provide your own logic
  // this function is used when you execute `insert` without specifying an ID
}

const local = CreatePluginVue2({ vueInstance: vue, generateRandomId })
```

## Simple Store

> documentation WIP

The Simple Store has no built-in reactivity. Good for a lightweight solution in React / Svelte projects.

Example setup:

```js
import { PluginSimpleStore } from 'magnetar'

function generateRandomId() {
  return [Math.random(), Math.random(), Math.random()].join('-')
  // you need to provide your own logic
  // this function is used when you execute `insert` without specifying an ID
}

const local = PluginSimpleStore.CreatePlugin({ generateRandomId })
```
