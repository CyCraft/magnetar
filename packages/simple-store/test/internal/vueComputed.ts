import test from 'ava'
import { mount } from '@vue/test-utils'
import { createApp, reactive } from 'vue/dist/vue.cjs.js'
// import { createVueSyncInstance } from '../helpers/createVueSyncInstance'
// import { pokedex } from '../helpers/pokedex'

test('expected behaviour computed prop lifecycle - no reactivity', async t => {
  const allPokemon = [{ name: 'bulbasaur' }]
  const ranFns = []
  const vue = createApp({
    template: `<pre>{{ myComputed }}{{ bulbasaurComputed }}</pre>`,
    computed: {
      myComputed () {
        return 1
      },
      bulbasaurComputed () {
        ranFns.push('ran')
        return { ...allPokemon[0], name: allPokemon[0].name + '!' }
      },
    },
  })
  const wrapper = mount(vue)
  // @ts-ignore
  console.log(`wrapper.vm.myComputed → `, wrapper.vm.myComputed)
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

// test('expected behaviour computed prop lifecycle - with reactivity via data', async t => {
//   const allPokemon = [{ name: 'bulbasaur' }]
//   const ranFns = []
//   const vue = createApp({
//     data () {
//       return { allPokemon }
//     },
//     computed: {
//       bulbasaurComputed () {
//         ranFns.push('ran')
//         return { ...this.allPokemon[0], name: this.allPokemon[0].name + '!' }
//       },
//     },
//   })

//   let a: any
//   a = vue.bulbasaurComputed
//   a = vue.bulbasaurComputed
//   // should have only ran once
//   t.deepEqual(ranFns, ['ran'])
//   // update from the outside
//   allPokemon[0].name = 'Bsaur'
//   // should have not yet re-run
//   t.deepEqual(ranFns, ['ran'])
//   // check
//   t.is(vue.bulbasaurComputed.name, 'Bsaur!')
//   // now it should have re-run
//   t.deepEqual(ranFns, ['ran', 'ran'])
// })

// test('expected behaviour computed prop lifecycle - with reactivity via reactive()', async t => {
//   const allPokemon = reactive([{ name: 'bulbasaur' }])
//   const ranFns = []
//   const vue = createApp({
//     computed: {
//       bulbasaurComputed () {
//         ranFns.push('ran')
//         return { ...allPokemon[0], name: allPokemon[0].name + '!' }
//       },
//     },
//   })

//   let a: any
//   a = vue.bulbasaurComputed
//   a = vue.bulbasaurComputed
//   // should have only ran once
//   t.deepEqual(ranFns, ['ran'])
//   // update from the outside
//   allPokemon[0].name = 'Bsaur'
//   // should have not yet re-run
//   t.deepEqual(ranFns, ['ran'])
//   // check
//   t.is(vue.bulbasaurComputed.name, 'Bsaur!')
//   // now it should have re-run
//   t.deepEqual(ranFns, ['ran', 'ran'])
// })

// test('reactivity: collection - updating', async t => {
//   const { pokedexModule } = createVueSyncInstance()
//   const bulbasaurModule = pokedexModule.doc('1')
//   const ranFns = []
//   const vue = createApp({
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

// test('reactivity: document - via data', async t => {
//   const { trainerModule } = createVueSyncInstance()
//   t.deepEqual(trainerModule.data, { name: 'Luca', age: 10, dream: undefined })

//   const ranFns = []
//   const vue = createApp({
//     data () {
//       return { data: trainerModule.data }
//     },
//     computed: {
//       dataComputed () {
//         ranFns.push('ran')
//         return { ...this.data, name: this.data.name + '!' }
//       },
//     },
//   })

//   t.is(vue.dataComputed.name, 'Luca!')
//   t.is(vue.dataComputed.name, 'Luca!')
//   // should have only ran once
//   t.deepEqual(ranFns, ['ran'])
//   // update from the outside
//   await trainerModule.merge({ name: 'LUCA' })
//   // should have not yet re-run
//   t.deepEqual(ranFns, ['ran'])
//   // check
//   t.is(vue.dataComputed.name, 'LUCA!')
//   t.is(vue.dataComputed.dream, undefined)
//   // now it should have re-run
//   t.deepEqual(ranFns, ['ran', 'ran'])
//   // get data from server
//   try { await trainerModule.get() } catch (error) { t.fail(error) } // prettier-ignore
//   // the server mock doesn't really update the server data
//   // so a get() call should reset the name back to 'Luca'
//   t.deepEqual(trainerModule.data, { name: 'Luca', dream: 'job' })

//   t.is(vue.dataComputed.name, 'Luca!')
//   t.is(vue.dataComputed.dream, 'job')
//   t.is(vue.dataComputed.age, undefined)
//   // now it should have re-run
//   t.deepEqual(ranFns, ['ran', 'ran', 'ran'])
// })

// test('reactivity: document - directly', async t => {
//   const { trainerModule } = createVueSyncInstance()
//   t.deepEqual(trainerModule.data, { name: 'Luca', age: 10, dream: undefined })

//   const ranFns = []
//   const vue = createApp({
//     data () {
//       return {}
//     },
//     computed: {
//       dataComputed () {
//         ranFns.push('ran')
//         return { ...trainerModule.data, name: trainerModule.data.name + '!' }
//       },
//     },
//   })

//   t.is(vue.dataComputed.name, 'Luca!')
//   t.is(vue.dataComputed.name, 'Luca!')
//   // should have only ran once
//   t.deepEqual(ranFns, ['ran'])
//   // update from the outside
//   console.log(`0 → `, 0)
//   await trainerModule.merge({ name: 'LUCA' })
//   console.log(`1 → `, 1)
//   t.deepEqual(trainerModule.data, { name: 'LUCA', age: 10, dream: undefined })
//   console.log(`trainerModule.data.name → `, trainerModule.data.name)
//   console.log(`vue.dataComputed.name → `, vue.dataComputed.name)
//   // should have not yet re-run
//   t.deepEqual(ranFns, ['ran'])
//   // check
//   t.is(vue.dataComputed.name, 'LUCA!')
//   t.is(vue.dataComputed.dream, undefined)
//   // // now it should have re-run
//   // t.deepEqual(ranFns, ['ran', 'ran'])
//   // // get data from server
//   // try { await trainerModule.get() } catch (error) { t.fail(error) } // prettier-ignore
//   // // the server mock doesn't really update the server data
//   // // so a get() call should reset the name back to 'Luca'
//   // t.deepEqual(trainerModule.data, { name: 'Luca', dream: 'job' })

//   // t.is(vue.dataComputed.name, 'Luca!')
//   // t.is(vue.dataComputed.dream, 'job')
//   // t.is(vue.dataComputed.age, undefined)
//   // // now it should have re-run
//   // t.deepEqual(ranFns, ['ran', 'ran', 'ran'])
// })

// test if a computed prop is re-run or not based on how the underlying data is overwritten
// test('computed prop lifecycle', async t => {
//   const { pokedexModule } = createVueSyncInstance()
//   try { await pokedexModule.get() } catch (error) { t.fail(error) } // prettier-ignore

//   const ranFns = []
//   const vue = createApp({
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
