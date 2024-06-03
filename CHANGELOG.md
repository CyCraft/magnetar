# CHANGELOG

## v1.0.0

##### ESM Only & Node v18+

- Magnetar is now ESM only. This means you need to use `import` instead of `require`.
- Magnetar now requires Node v18+.
- `@magnetarjs/plugin-vue2` was removed.
- `local` store plugin now needs to be called `cache`

Before:

```js
import { CreatePlugin as PluginVue3 } from '@magnetarjs/plugin-vue3'

const local = PluginVue3({ generateRandomId })
const remote = ...

export const magnetar = Magnetar({
  localStoreName: 'local',
  stores: { local, remote },
  executionOrder: {
    read: ['local', 'remote'],
    write: ['local', 'remote'],
    // ...
```

After:

```js
import { CreatePlugin as PluginVue3 } from '@magnetarjs/plugin-vue3'

const cache = PluginVue3({ generateRandomId })
const remote = ...

export const magnetar = Magnetar({
  stores: { cache, remote },
  executionOrder: {
    read: ['cache', 'remote'],
    write: ['cache', 'remote'],
    // ...
```

## v0.4.0

##### breaking changes

###### plugin-firestore

Now it's possible to use firebase v9 modular syntax:

Before:

```js
// initialise Firebase
import firebase from 'firebase/app'
import 'firebase/firestore'

firebase.initializeApp({
  /* pass your config... */
})

// initialise PluginFirestore
import { CreatePlugin as PluginFirestore } from '@magnetarjs/plugin-firestore'

const remote = PluginFirestore({ firebaseInstance: firebase })
```

After:

```js
// initialise Firebase
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseApp = initializeApp({
  /* pass your config... */
})
const db = getFirestore(firebaseApp)

// initialise PluginFirestore
import { CreatePlugin as PluginFirestore } from '@magnetarjs/plugin-firestore'

const remote = PluginFirestore({ db })
```

## v0.3.0

highly improved the way streams can be closed. MUCH easier to use syntax now!!

##### breaking changes

###### stream

Before:

```js
magnetar.collection('my-collection').stream()

// close stream:
const closeStream = magnetar.collection('my-collection').openStreams.get(undefined)
closeStream()
```

After:

```js
magnetar.collection('my-collection').stream()

// close stream:
magnetar.collection('my-collection').closeStream()
```

See the new docs at: https://magnetar.cycraft.co/docs#stream-realtime-updates
