# Plugins

Here you will find more information on each official store plugin for Magnetar.

> Please note that the documentation below is still WIP

## Firestore

Use the Firestore plugin if you use Cloud Firestore. This plugin wraps the `firebase` JS SDK for use in the browser.

> documentation WIP

Example setup:

<!-- prettier-ignore-start -->
```js
import { PluginFirestore } from '@magnetarjs/plugin-firestore'
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseApp = initializeApp({ /* pass your config... */ })
const db = getFirestore(firebaseApp)

const remote = PluginFirestore.CreatePlugin({ db })
```
<!-- prettier-ignore-end -->

You can enable console logging by adding `debug: true` when you set up the plugin:

```ts
const remote = PluginFirestore.CreatePlugin({ db, debug: true })
```

## Firebase Admin (for Firestore)

Use the Firestore Admin plugin if you use Cloud Firestore and you want to use Magnetar in NodeJS (eg. Cloud Functions). This plugin wraps the `firebase-admin` NodeJS SDK.

> documentation WIP

Example setup:

<!-- prettier-ignore-start -->
```js
import { CreatePlugin as PluginFirestoreAdmin } from '@magnetarjs/plugin-firestore-admin'
import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const firebaseApp = initializeApp({ /* pass your config... */ })
const db = getFirestore(firebaseApp)

const remote = PluginFirestoreAdmin({ db })
```
<!-- prettier-ignore-end -->

You can enable console logging by adding `debug: true` when you set up the plugin:

```ts
const remote = PluginFirestore.CreatePlugin({ db, debug: true })
```

## Vue 3

> documentation WIP

Use the Vue 3 plugin for Vue 3 projects.

Example setup:

```js
import { CreatePlugin as PluginVue3 } from '@magnetarjs/plugin-vue3'

function generateRandomId() {
  return [Math.random(), Math.random(), Math.random()].join('-')
  // you need to provide your own logic
  // this function is used when you execute `insert` without specifying an ID
}

const local = PluginVue3.CreatePlugin({ generateRandomId })
```

## Simple Store

> documentation WIP

The Simple Store has no built-in reactivity. Good for a lightweight solution in React / Svelte projects.

Example setup:

```js
import { CreatePlugin as PluginSimpleStore } from '@magnetarjs/plugin-simple-store'

function generateRandomId() {
  return [Math.random(), Math.random(), Math.random()].join('-')
  // you need to provide your own logic
  // this function is used when you execute `insert` without specifying an ID
}

const local = PluginSimpleStore.CreatePlugin({ generateRandomId })
```
