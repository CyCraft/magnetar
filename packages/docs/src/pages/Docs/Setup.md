# Setup

## Instantiate Magnetar

To instantiate Magnetar, you need to first instantiate the store plugins you will use:

1. instantiate a plugin for a _**remote**_ data store
2. instantiate a plugin for a _**local**_ data store
3. _Then_ instantiate the Magnetar instance with those plugins

This is a complete setup example which uses:

- the **firestore** plugin for remote data store
- the **vue2** plugin for local data store

> Please note: in reality it's cleaner to have **all imports at the top**

```javascript
// ---------------------------------------------
// 1. the plugin firestore for remote data store
// ---------------------------------------------
import { CreatePlugin as PluginFirestore } from '@magnetarjs/firestore'
import Firebase from 'firebase'

const firestoreInstance = Firebase.firestore()

// create the remote store plugin instance:
const remote = PluginFirestore({ firestoreInstance })

// ---------------------------------------
// 2. the plugin vue2 for local data store
// ---------------------------------------
import { CreatePlugin as PluginVue } from '@magnetarjs/vue2'
import Vue from 'vue'

const vueInstance = Vue
const generateRandomId = () => Firebase.firestore().collection('random').doc().id

// create the local store plugin instance:
const local = PluginVue({ vueInstance, generateRandomId })

// -----------------------------------------------------
// 3. instantiate the Magnetar instance with the store plugins
// -----------------------------------------------------
import { Magnetar } from 'magnetar'

const magnetar = Magnetar({
  stores: { local, remote },
  localStoreName: 'local',
  executionOrder: {
    read: ['local', 'remote'],
    write: ['local', 'remote'],
    delete: ['local', 'remote'],
  },
})
```

Some info on the main Magnetar instance props:

- `stores` ⸺ an object with as key the store name and value the store plugin instance
- `localStoreName` ⸺ the name of the store that saves data locally
- `executionOrder` ⸺ the execution order of your stores, this order is required for optimistic UI (but can be flipped)

## Instantiate your Modules

Ideally you want to create a separate file for the modules you intend to use (or one file per module). This way you can more easily add some documentation on how the data structure looks for your database documents.

To instantiate a module you need to at least pass a module path. This will be interpreted by whichever store plugins you use to connect to the correct endpoint of your database.

As per our example, with the Firestore plugin, these module paths will point to the Firestore collection and document paths in our console.

```javascript
import { magnetar } from 'magnetar-setup.js'

export const pokedexModule = magnetar.collection('pokedex')
export const trainerModule = magnetar.doc('data/trainer')
```

Actual usage of these modules (reading & writing data) is further explained in [Add & Edit Data](#) and [Read Data](#).

PS: It's highly recommended that you **document your data structures** for each module! Be sure to read the chapter on [Module Setup](#).
