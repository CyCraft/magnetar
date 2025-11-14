# Frequently Asked Questions

## How do I use Firebase helpers like arrayUnion or serverTimestamp?

Use store-split payloads so your remote store can receive Firestore helpers, while your cache store receives a compatible value. See the [storeSplit examples in the write guide](../write-data/#pass-different-data-to-different-stores).

## Why not just use Firebase SDK? (since the syntax is so similar)

TLDR; Firestore SDK **charges you on every read**. Magnetar does cache management for free.

Firestore has its own implementation of locally cached data. However, every time you access that data it will also double check if the data is up to date with the server. This means that you are charged money every time you simply want to use your cached data locally.

When you think about this, most devs end up saving the data in some sort of object or in a state management library Vue data or Vuex/Redux. This means that you then have to add write logic to write the data back to the database either way.

Magnetar's goal is to replace all this logic you need to write yourself to read and write data, providing its own local cache store so you can more easily prevent Firebase from charging you when reading docs you already fetched.

## Why did you build Magnetar?

I'm the creator of [Vuex Easy Firestore](https://mesqueeb.github.io/vuex-easy-firestore/), a library that connected Firestore and Vuex with just 4 lines on configuration. However, I wanted to create a better solution that does not rely on Vuex at all and is compatible with more project types and databases.

## Magnetar vs Vuex Easy Firestore architecture

### Vuex Easy Firestore architecture

<!-- ![](/architecture/vuex-easy-firestore-architecture.png) -->
<img src="/architecture/vuex-easy-firestore-architecture.png" style="width: 100%" />

### Magnetar architecture

<!-- ![](/architecture/magnetar-architecture.png) -->
<img src="/architecture/magnetar-architecture.png" style="width: 100%" />

## Why the concept of cache/remote store plugins?

I wanted Magnetar to be compatible with a wide variety of use cases and projects.

When it comes to remote stores, I wanted to be able to use Firestore but competitors like Fauna and Supabase also looked interesting. I didn't want to limit the future to just Firestore.

When it comes to local cache stores, there are different approaches again. A simple store that just works with a Map or Object is tricky to make reactive out of the box for Vue projects. Adding reactivity out of the box needed a different implementation for Vue 2 and Vue 3. Again, not to limit the future and prevent code bloat, using a similar plugin system for local cache stores was the way to go.

Finally I also like the idea of having your own data caching options. I'm planning to also add store plugins that work with localStorage, indexedDB, etc. All of this meant that a store plugin system was the best choice!

See the [Magnetar architecture](#magnetar-architecture) above for a better idea of how this works.
