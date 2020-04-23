import test from 'ava'
import * as Vue from 'vue/dist/vue.common.js'
import { flattenObject } from 'flatten-anything'
import pathToProp from 'path-to-prop'
import { isPlainObject } from 'is-what'

/**
 * Creates the params needed to $set a target based on a nested.path
 *
 * @param {object} target
 * @param {string} path
 * @param {*} value
 * @returns {[object, string, any]}
 */
function getSetParams (target: object, path: string, value: any): [object, string, any] {
  const pathParts = path.split('.')
  const prop = pathParts.pop()
  const pathParent = pathParts.join('.')
  const targetForNestedProp = pathToProp(target, pathParent)
  if (!isPlainObject(targetForNestedProp)) {
    // the target doesn't have an object ready at this level to set the value to
    // so we need to step down a level and try again
    return getSetParams(target, pathParent, { [prop]: value })
  }
  const valueToSet = value
  return [targetForNestedProp, prop, valueToSet]
}

// test if a computed prop is re-run or not based on how the underlying data is overwritten
test('computed prop lifecycle', t => {
  const ranFns = []

  const vue = new Vue({
    data: {
      items: {
        a: { text: 'My second note!' },
        b: { text: 'My note!' },
      },
    },
    computed: {
      always () {
        // should rerun if either a.text or b.text is update
        ranFns.push('always')
        return Object.keys(this.items)
      },
      onlyB () {
        // should not re-run if a.text is edited
        ranFns.push('onlyB')
        return this.items.b.text
      },
    },
    methods: {
      updateAll () {
        const target = this.items
        const payload = {
          a: { text: 'new new text!!!' },
          b: { text: 'new text' },
        }
        const flatPayload = flattenObject(payload)
        for (const [path, value] of Object.entries(flatPayload)) {
          const targetVal = pathToProp(target, path)
          // do not update anything if the values are the same
          if (targetVal === value) continue
          const setParams = getSetParams(target, path, value)
          this.$set(...setParams)
        }
      },
      updateA () {
        this.$set(this.items.a, 'text', 'new text')
      },
      updateB () {
        this.$set(this.items.b, 'text', 'new text')
      },
    },
  })
  let a: any
  a = vue.always
  a = vue.always
  // should have only ran once
  t.deepEqual(ranFns, ['always'])
  // log onlyB twice
  a = vue.onlyB
  a = vue.onlyB
  // should have only ran once
  t.deepEqual(ranFns, ['always', 'onlyB'])
  // update b text
  vue.updateB()
  // log onlyB twice
  a = vue.onlyB
  a = vue.onlyB
  // should have only ran once
  t.deepEqual(ranFns, ['always', 'onlyB', 'onlyB'])
  // update A
  vue.updateA()
  // log onlyB again, should have not run in this case
  a = vue.onlyB
  t.deepEqual(ranFns, ['always', 'onlyB', 'onlyB'])
  // update All
  vue.updateAll()
  // log onlyB again, should have not run in this case
  a = vue.onlyB
  t.deepEqual(ranFns, ['always', 'onlyB', 'onlyB'])
})
