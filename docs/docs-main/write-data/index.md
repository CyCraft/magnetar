# Write Data

Be sure to first read the [Setup chapter](../setup/) to have a basic understanding.

## Insert a Document

### Insert with Random ID

When you insert a new document without specifying an ID, you can do so by calling `insert` directly on the collection:

```javascript
const pokedexModule = magnetar.collection('pokedex')

// insert a new document with random ID
pokedexModule.insert({ name: 'squirtle' })
```

This is what happens:

Your document is passed to both your store plugins. The local cache store plugin is responsible caching this document, and your remote store plugin is responsible for making the API call to your database.

### Access the New Document

You can access the new document's data like so:

```js
const newDocModule = await magnetar.collection('pokedex').insert({ name: 'squirtle' }) // needs await!

newDocModule.id // the randomly generated id
newDocModule.data // the data you have inserted
```

The document data will also be available on your collection module.
For a collection you'll need to use `data.values()` to list all docs, because collection `data` is a Map <small>[？](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)</small>.

```js
// or access all collection docs
pokedexModule.data.values()
// or access a specific collection doc via ID
pokedexModule.data.get(newDocModule.id)
```

### Insert with Optimistic UI

Since your remote store will make an API call, insert will always returns a promise. However, one of the key features of Magnetar is _Optimistic UI_ <sup>[？](https://google.com/search?q=what+is+optimistic+ui)</sup>.

> If the insert promise only resolves **after** the remote store API call, how is this Optimistic UI?

Awaiting an insert promise will never be _Optimistic_! However, when you insert a new document, your _cache_ store is responsible for generating a new ID and saving the data in your module's cache. This part is done immediately and is therefore _Optimistic_!

> How can I achieve Optimistic UI then? (How can I display changes immediately in the UI?)

Instead of awaiting the insert promise, you need to display the **collection module's data** in your UI, because this is what is updated immediately. Eg.

```js
const pokedexModule = magnetar.collection('pokedex')

// ❌ this would wait for your remote store (NOT optimistic)
const newDocModule = await pokedexModule.insert({ name: 'squirtle' })

// ✅ instead do NOT await
pokedexModule.insert({ name: 'squirtle' })
// you can immediately access the inserted data (even if the remote store takes a while longer)
pokedexModule.data.values()
```

### Insert with Custom ID

If you want to provide a custom ID yourself, you can do so by first creating the doc module with `doc(id)`, then calling `insert`. Eg.

```javascript
const pokedexModule = magnetar.collection('pokedex')

const newId = generateId() // you have to implement this yourself

pokedexModule.doc(newId).insert({ name: 'squirtle' })
```

## Delete a Document

You can delete a document either via the collection or via the document module.

```javascript
const pokedexModule = magnetar.collection('pokedex')

pokedexModule.delete('001')
// or
pokedexModule.doc('001').delete()
```

## Delete a Document Prop

You can delete a single prop or an array of props of a document:

<!-- prettier-ignore-start -->
```javascript
const pokedexModule = magnetar.collection('pokedex')
const bulbasaur = pokedexModule.doc('001')

// bulbasaur.data ≈ { name: 'Bulbasaur', level: 1 }

bulbasaur.deleteProp('level')
// or
bulbasaur.deleteProp(['level', /* etc... */])

// bulbasaur.data ≈ { name: 'Bulbasaur' }
```
<!-- prettier-ignore-end -->

You can also delete _**nested**_ props by using the _**dot notation**_:

```javascript
// bulbasaur.data ≈ { name: 'Bulbasaur', moves: { tackle: true, leafAttack: true } }

bulbasaur.deleteProp('moves.tackle')
// will remove 'tackle' from the `moves` object

// bulbasaur.data ≈ { name: 'Bulbasaur', moves: { leafAttack: true } }
```

## Modify a Document

There are three methods you can use to modify documents:

- `merge`
- `assign`
- `replace`

### Merge

Merge will update your document and _**deep merge**_ any nested properties.

```javascript
const pokedexModule = magnetar.collection('pokedex')
const bulbasaur = pokedexModule.doc('001')

// bulbasaur.data ≈ { name: 'bulbasaur', types: { grass: true } }

bulbasaur.merge({ types: { poison: true } })

// bulbasaur.data ≈ { name: 'bulbasaur', types: { grass: true, poison: true } }
```

In the example above, Bulbasaur kept `grass: true` when `{ poison: true }` was merged onto it.

### Assign

Assign will update your document and _**shallow merge**_ any nested properties. That means that nested objects are replaced by what ever you pass.

```javascript
const pokedexModule = magnetar.collection('pokedex')
const bulbasaur = pokedexModule.doc('001')

// bulbasaur.data ≈ { name: 'bulbasaur', types: { grass: true } }

bulbasaur.assign({ types: { poison: true } })

// bulbasaur.data ≈ { name: 'bulbasaur', types: { poison: true } }
```

In the example above, Bulbasaur lost `grass: true` when `{ poison: true }` was assigned onto it.

### Replace

Replace will replace the entire object of your document with whatever you pass.

```javascript
const pokedexModule = magnetar.collection('pokedex')
const bulbasaur = pokedexModule.doc('001')

// bulbasaur.data ≈ { name: 'bulbasaur', types: { grass: true } }

bulbasaur.replace({ level: 16 })

// bulbasaur.data ≈ { level: 16 }
```

In the example above, Bulbasaur **lost** all of its data and it was replaced with whatever was passed.

## Batch Insert / Delete / Modify

**Magnetar will automatically optimize** any write action so that the remote store only makes a single "batch" API call! Therefore, you can simply loop over multiple methods without performance dips. Eg.

```javascript
const pokedexModule = magnetar.collection('pokedex')

const newPokemon = [{ name: 'Flareon' }, { name: 'Vaporeon' }, { name: 'Jolteon' }]

for (const pkmn of newPokemon) {
  pokedexModule.insert(pkmn)
}
```

Same goes for other methods to delete or modify data.
