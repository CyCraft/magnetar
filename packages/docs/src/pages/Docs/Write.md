# Add & edit data

In the following examples we use this collection instance:

```javascript
export const pokedexModule = magnetar.collection('pokedex')
```

You can instantiate modules and then export them for to use in other files. More on this at the [Setup documentation](#).

## Insert a new document

### Insert with random ID

When you insert a new document without specifying an ID, you can do so by calling `insert` directly on the collection:

```javascript
const pokedexModule = magnetar.collection('pokedex')

const data = { name: 'squirtle' }

// insert a new document with random ID
const newDoc = await pokedexModule.insert(data)
```

`insert` returns a newly created instance of a document-module. You can then retrieve both the generated `id` and the `data` from this.

### Insert with pre-set ID

If you want to provide an ID yourself, you can do so by calling `insert` on the doc instance of that preset id:

```javascript
await pokedexModule.doc(presetId).insert(data)
```

In the case of using a presetId, it will return `Promise<void>`.

:::spoiler How can I batch insert documents?

You can make a simple loop. **Magnetar will automatically optimise** so that only a single "batch" API call is made!

```javascript
const newPokemon = [{ name: 'Flareon' }, { name: 'Vaporeon' }, { name: 'Jolteon' }]
for (const data of newPokemon) {
  pokedexModule.insert(data)
}
```

:::

## Delete a document

```javascript
await pokedexModule.doc('001').delete()
```

:::spoiler How can I batch delete documents?

You can make a simple loop. **Magnetar will automatically optimise** so that only a single "batch" API call is made!

```javascript
const idsToDelete = ['001', '004', '007']
for (const id of idsToDelete) {
  magnetar.doc(id).delete()
}
```

:::

## Delete a document prop

You can delete a single prop or an array of props of a document:

```javascript
await pokedexModule.doc('001').deleteProp('name')
// or
await pokedexModule.doc('001').deleteProp(['name', ...])
```

You can also delete nested props by using the "dot" notation:

```javascript
await pokedexModule.doc('001').deleteProp('moves.tackle')
// will remove 'tackle' from an object called 'moves'
```

## Modify a document

There are 3 ways to modify documents:

- merge
- assign
- replace

### Merge

Merge will update your document and deep-merge any nested properties.

```javascript
const bulbasaur = pokedexModule.doc('001')

// bulbasaur.data === { name: 'bulbasaur', types: { grass: true } }

await bulbasaur.merge({ types: { poison: true } })

// bulbasaur.data === { name: 'bulbasaur', types: { grass: true, poison: true } }
```

In the example above, Bulbasaur kept `grass: true` when `{ poison: true }` was merged onto it.

### Assign

Assign will update your document and shallow-merge any nested properties. That means that nested objects are replaced by what ever you pass.

```javascript
const bulbasaur = pokedexModule.doc('001')

// bulbasaur.data === { name: 'bulbasaur', types: { grass: true } }

await bulbasaur.merge({ types: { poison: true } })

// bulbasaur.data === { name: 'bulbasaur', types: { poison: true } }
```

In the example above, Bulbasaur lost `grass: true` when `{ poison: true }` was assigned onto it.

### Replace

Replace will replace the entire object of your document with whatever you pass.

```javascript
const bulbasaur = pokedexModule.doc('001')

// bulbasaur.data === { name: 'bulbasaur', types: { grass: true } }

await bulbasaur.replace({ level: 16 })

// bulbasaur.data === { level: 16 }
```

In the example above, Bulbasaur **lost** all of its data and it was replaced with whatever was passed.
