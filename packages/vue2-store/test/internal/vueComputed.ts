import test from 'ava'
import Vue from 'vue/dist/vue.common.js'
import { createVueSyncInstance } from '../helpers/createVueSyncInstance'
import { pokedex } from '../helpers/pokedex'

test('expected behaviour computed prop lifecycle with update - no reactivity', async t => {
  const allPokemon = [{ name: 'bulbasaur' }]
  const ranFns = []
  const vue = new Vue({
    computed: {
      bulbasaurComputed () {
        ranFns.push('ran')
        return { ...allPokemon[0], name: allPokemon[0].name + '!' }
      },
    },
  })

  let a: any
  a = vue.bulbasaurComputed
  a = vue.bulbasaurComputed
  // should have only ran once each
  t.deepEqual(ranFns, ['ran'])

  allPokemon[0].name = 'Bsaur'
  // should have not yet re-run
  t.deepEqual(ranFns, ['ran'])
  // check
  t.is(vue.bulbasaurComputed.name, 'Bsaur!')
  // still should NOT HAVE re-run because `allPokemon` is not reactive.
  t.deepEqual(ranFns, ['ran', 'ran'])
})
test('expected behaviour computed prop lifecycle with update - with reactivity', async t => {
  const allPokemon = [{ name: 'bulbasaur' }]
  const ranFns = []
  const vue = new Vue({
    data () {
      return { allPokemon }
    },
    computed: {
      bulbasaurComputed () {
        ranFns.push('ran')
        return { ...this.allPokemon[0], name: this.allPokemon[0].name + '!' }
      },
    },
  })

  let a: any
  a = vue.bulbasaurComputed
  a = vue.bulbasaurComputed
  // should have only ran once each
  t.deepEqual(ranFns, ['ran'])

  allPokemon[0].name = 'Bsaur'
  // should have not yet re-run
  t.deepEqual(ranFns, ['ran'])
  // check
  t.is(vue.bulbasaurComputed.name, 'Bsaur!')
  // now it should have re-run
  t.deepEqual(ranFns, ['ran', 'ran'])
})

// test('reactivity: collection - updating', async t => {
//   const { pokedexModule } = createVueSyncInstance()
//   const bulbasaurModule = pokedexModule.doc('1')
//   const ranFns = []
//   const vue = new Vue({
//     computed: {
//       allPokemon () {
//         ranFns.push('allPokemon')
//         return [...pokedexModule.data.values()]
//       },
//       bulbasaur () {
//         ranFns.push('bulbasaur')
//         return bulbasaurModule.data
//       },
//       bulbasaurDirect () {
//         ranFns.push('bulbasaurDirect')
//         return pokedexModule.data.get('1')
//       },
//     },
//   })

//   let a: any
//   a = vue.bulbasaur
//   a = vue.bulbasaur
//   // should have only ran once
//   console.log(`vue.allPokemon[0] → `, vue.allPokemon[0])
//   t.deepEqual(ranFns, ['bulbasaur', 'allPokemon'])
//   // update
//   pokedexModule.doc('1').merge({ name: 'Bsaur' })
//   console.log(`vue.allPokemon[0] → `, vue.allPokemon[0])
//   a = vue.bulbasaur
//   a = vue.bulbasaur
//   t.deepEqual(ranFns, ['bulbasaur', 'allPokemon', 'bulbasaur'])
//   // check pokedexModule directly
//   t.is(pokedexModule.doc('1').data.name, 'Bsaur')
//   t.is(pokedexModule.data.get('1').name, 'Bsaur')
//   t.is(vue.bulbasaur.name, 'Bsaur')
//   t.is(vue.bulbasaurDirect.name, 'Bsaur')
//   t.deepEqual(ranFns, ['bulbasaur', 'bulbasaur'])
// })

// test('reactivity: document', async t => {
//   const { trainerModule } = createVueSyncInstance()
//   t.deepEqual(trainerModule.data, { name: 'Luca', age: 10 })
//   try {
//     await trainerModule.get()
//   } catch (error) {
//     t.fail(error)
//   }
//   t.deepEqual(trainerModule.data, { name: 'Luca', age: 10, dream: 'job' })
// })

// test if a computed prop is re-run or not based on how the underlying data is overwritten
// test('computed prop lifecycle', async t => {
//   const { pokedexModule } = createVueSyncInstance()
//   try { await pokedexModule.get() } catch (error) { t.fail(error) } // prettier-ignore

//   const ranFns = []
//   const vue = new Vue({
//     computed: {
//       allPokemon () {
//         ranFns.push('allPokemon')
//         return pokedexModule.data.values()
//       },
//       flareon () {
//         ranFns.push('flareon')
//         return pokedexModule.data.get('136')
//       },
//     },
//   })

//   let a: any
//   a = vue.allPokemon
//   a = vue.allPokemon
//   // should have only ran once
//   t.deepEqual(ranFns, ['allPokemon'])
//   // log flareon twice
//   a = vue.flareon
//   a = vue.flareon
//   // should have only ran once
//   t.deepEqual(ranFns, ['allPokemon', 'flareon'])
//   // // update b text
//   // vue.updateB()
//   // // log flareon twice
//   // a = vue.flareon
//   // a = vue.flareon
//   // // should have only ran once
//   // t.deepEqual(ranFns, ['allPokemon', 'flareon', 'flareon'])
//   // // update A
//   // vue.updateA()
//   // // log flareon again, should have not run in this case
//   // a = vue.flareon
//   // t.deepEqual(ranFns, ['allPokemon', 'flareon', 'flareon'])
//   // // update All
//   // vue.updateAll()
//   // // log flareon again, should have not run in this case
//   // a = vue.flareon
//   // t.deepEqual(ranFns, ['allPokemon', 'flareon', 'flareon'])
// })
