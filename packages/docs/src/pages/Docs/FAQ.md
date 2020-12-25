# Frequently Asked Questions

## Why not just use Firebase SDK? (since the syntax is so similar)

TLDR; Firestore SDK **charges you on every read**. Magnetar does cache management for free.

Firestore has its own implementation of locally cached data. However, every time you access that data it will also double check if the data is up to date with the server. This means that you get charged money every time you simply want to use your data locally.

When you think about this, most devs end up saving the data in some sort of object or in a state management library Vue data or Vuex/Redux. This means that you then have to add write logic to write the data back to the database either way.

Magnetar's goal is to replace all this logic you need to write yourself to read and write data, providing its own local store to prevent Firebase from charging you when reading docs you already fetched.
