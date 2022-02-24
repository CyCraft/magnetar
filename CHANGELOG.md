# CHANGELOG

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
import { PluginFirestore } from 'magnetar'

const remote = PluginFirestore.CreatePlugin({ firebaseInstance: firebase })
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
import { PluginFirestore } from 'magnetar'

const remote = PluginFirestore.CreatePlugin({ db })
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
