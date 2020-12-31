import test from 'ava'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance'
import { pokedex } from '@magnetarjs/test-utils'
// @ts-ignore
import Vue from 'vue/dist/vue.common.js'

test('expected behaviour computed prop lifecycle - no reactivity', async (t) => {
  const allPokemon = [{ name: 'bulbasaur' }]
  const ranFns: any[] = []
  const vue = new Vue({
    computed: {
      bulbasaurComputed() {
        ranFns.push('ran')
        return { ...allPokemon[0], name: allPokemon[0].name + '!' }
      },
    },
  })

  let a: any
  a = vue.bulbasaurComputed
  a = vue.bulbasaurComputed
  // should have only ran once
  t.deepEqual(ranFns, ['ran'])

  allPokemon[0].name = 'Bsaur'
  // should have not yet re-run
  t.deepEqual(ranFns, ['ran'])
  // should NOT HAVE updated value because `allPokemon` is not reactive.
  t.is(vue.bulbasaurComputed.name, 'bulbasaur!')
  // should NOT HAVE re-run because `allPokemon` is not reactive.
  t.deepEqual(ranFns, ['ran'])
})

test('expected behaviour computed prop lifecycle - with reactivity via data', async (t) => {
  const allPokemon = [{ name: 'bulbasaur' }]
  const ranFns: any[] = []
  const vue = new Vue({
    data() {
      return { allPokemon }
    },
    computed: {
      bulbasaurComputed(): any {
        ranFns.push('ran')
        return { ...(this as any).allPokemon[0], name: (this as any).allPokemon[0].name + '!' }
      },
    },
  })

  let a: any
  a = vue.bulbasaurComputed
  a = vue.bulbasaurComputed
  // should have only ran once
  t.deepEqual(ranFns, ['ran'])
  // update from the outside
  allPokemon[0].name = 'Bsaur'
  // should have not yet re-run
  t.deepEqual(ranFns, ['ran'])
  // check
  t.is(vue.bulbasaurComputed.name, 'Bsaur!')
  // now it should have re-run
  t.deepEqual(ranFns, ['ran', 'ran'])
})

test('expected behaviour computed prop lifecycle - with reactivity via vue.observable', async (t) => {
  const allPokemon = Vue.observable([{ name: 'bulbasaur' }])
  const ranFns: any[] = []
  const vue = new Vue({
    computed: {
      bulbasaurComputed() {
        ranFns.push('ran')
        return { ...allPokemon[0], name: allPokemon[0].name + '!' }
      },
    },
  })

  let a: any
  a = vue.bulbasaurComputed
  a = vue.bulbasaurComputed
  // should have only ran once
  t.deepEqual(ranFns, ['ran'])
  // update from the outside
  allPokemon[0].name = 'Bsaur'
  // should have not yet re-run
  t.deepEqual(ranFns, ['ran'])
  // check
  t.is(vue.bulbasaurComputed.name, 'Bsaur!')
  // now it should have re-run
  t.deepEqual(ranFns, ['ran', 'ran'])
})

test('reactivity: document - via data', async (t) => {
  const { trainerModule } = createMagnetarInstance()
  t.deepEqual(trainerModule.data, { name: 'Luca', age: 10 })

  const ranFns: any[] = []
  const vue = new Vue({
    data() {
      return { data: trainerModule.data }
    },
    computed: {
      dataComputed(): any {
        ranFns.push('ran')
        console.log(`this.data.__ob__ → `, (this as any).data.__ob__)
        return { ...(this as any).data, name: (this as any).data.name + '!' }
      },
    },
  })

  t.is(vue.dataComputed.name, 'Luca!')
  t.is(vue.dataComputed.name, 'Luca!')
  // should have only ran once
  t.deepEqual(ranFns, ['ran'])
  // update from the outside
  await trainerModule.merge({ name: 'LUCA' })
  // should have not yet re-run
  t.deepEqual(ranFns, ['ran'])
  // check
  t.is(vue.dataComputed.name, 'LUCA!')
  t.is(vue.dataComputed.dream, undefined)
  // now it should have re-run
  t.deepEqual(ranFns, ['ran', 'ran'])
  // get data from server
  try { await trainerModule.get() } catch (error) { t.fail(error) } // prettier-ignore
  // the server mock doesn't really update the server data
  // so a get() call should reset the name back to 'Luca'
  t.deepEqual(trainerModule.data, { name: 'Luca', dream: 'job', age: 10 })

  t.is(vue.dataComputed.name, 'Luca!')
  t.is(vue.dataComputed.dream, 'job')
  t.is(vue.dataComputed.age, 10)
  // now it should have re-run
  t.deepEqual(ranFns, ['ran', 'ran', 'ran'])
})

test('reactivity: document - directly', async (t) => {
  const { trainerModule } = createMagnetarInstance()
  t.deepEqual(trainerModule.data, { name: 'Luca', age: 10 })

  const ranFns: any[] = []
  const vue = new Vue({
    data() {
      return {}
    },
    computed: {
      dataComputed() {
        ranFns.push('ran')
        const data = trainerModule.data
        return { ...data, name: data.name + '!' }
      },
    },
  })

  t.is(vue.dataComputed.name, 'Luca!')
  t.is(vue.dataComputed.name, 'Luca!')
  // should have only ran once
  t.deepEqual(ranFns, ['ran'])
  // update from the outside
  await trainerModule.merge({ name: 'LUCA' })
  t.deepEqual(trainerModule.data, { name: 'LUCA', age: 10 })
  // should have not yet re-run
  t.deepEqual(ranFns, ['ran'])
  // check
  t.is(vue.dataComputed.name, 'LUCA!')
  t.is(vue.dataComputed.dream, undefined)
  // // now it should have re-run
  t.deepEqual(ranFns, ['ran', 'ran'])
  // // get data from server
  try { await trainerModule.get() } catch (error) { t.fail(error) } // prettier-ignore
  // the server mock doesn't really update the server data
  // so a get() call should reset the name back to 'Luca'
  t.deepEqual(trainerModule.data, { name: 'Luca', dream: 'job', age: 10 })
  t.deepEqual(ranFns, ['ran', 'ran'])

  t.is(vue.dataComputed.name, 'Luca!')
  t.is(vue.dataComputed.dream, 'job')
  t.is(vue.dataComputed.age, 10)
  // now it should have re-run
  t.deepEqual(ranFns, ['ran', 'ran', 'ran'])
})

test('reactivity: collection - inserting', async (t) => {
  const { pokedexModule } = createMagnetarInstance()
  const ranFns: any[] = []
  const vue = new Vue({
    computed: {
      countPokemon() {
        ranFns.push('countPokemon')
        return pokedexModule.data.size
      },
      allPokemon() {
        ranFns.push('allPokemon')
        return [...pokedexModule.data.values()]
      },
    },
  })

  let a: any
  a = vue.countPokemon
  a = vue.allPokemon
  // should have only ran once
  t.deepEqual(ranFns, ['countPokemon', 'allPokemon'])
  t.is(vue.countPokemon, 1)
  // update
  pokedexModule.insert(pokedex(4))
  a = vue.countPokemon
  a = vue.allPokemon
  t.is(vue.countPokemon, 2)
  t.deepEqual(ranFns, ['countPokemon', 'allPokemon', 'countPokemon', 'allPokemon'])
  // check pokedexModule directly
})

// test('reactivity: collection - updating', async (t) => {
//   const { pokedexModule } = createMagnetarInstance()
//   const bulbasaurModule = pokedexModule.doc('1')
//   const ranFns: any[] = []
//   const vue = new Vue({
//     computed: {
//       allPokemon() {
//         ranFns.push('allPokemon')
//         return [...pokedexModule.data.values()]
//       },
//       bulbasaur() {
//         ranFns.push('bulbasaur')
//         return bulbasaurModule.data
//       },
//       bulbasaurDirect() {
//         ranFns.push('bulbasaurDirect')
//         return pokedexModule.data.get('1')
//       },
//     },
//   })

//   let a: any
//   a = vue.bulbasaurDirect
//   a = vue.bulbasaurDirect
//   // should have only ran once
//   console.log(`vue.allPokemon[0] → `, vue.allPokemon[0])
//   t.deepEqual(ranFns, ['bulbasaurDirect', 'allPokemon'])
//   // update
//   pokedexModule.doc('1').merge({ name: 'Bsaur' })
//   console.log(`vue.allPokemon[0] → `, vue.allPokemon[0])
//   a = vue.bulbasaurDirect
//   a = vue.bulbasaurDirect
//   // t.deepEqual(ranFns, ['bulbasaurDirect', 'allPokemon', 'bulbasaurDirect'])
//   // check pokedexModule directly
//   t.is(pokedexModule.doc('1').data.name, 'Bsaur')
//   t.is(pokedexModule.data.get('1')?.name, 'Bsaur')
//   console.log(vue.bulbasaurDirect.name)
//   t.is(vue.bulbasaurDirect.name, 'Bsaur')
//   t.is(vue.bulbasaur.name, 'Bsaur')
//   t.deepEqual(ranFns, ['bulbasaurDirect', 'allPokemon', 'bulbasaurDirect', 'bulbasaur'])
// })
