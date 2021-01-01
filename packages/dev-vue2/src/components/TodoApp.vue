<template>
  <div class="todo-app">
    <pre>{{ items }}</pre>
    <input type="text" @keydown.enter="addNew" v-model="newItem" />
  </div>
</template>

<style lang="sass" scoped>
// $

// .todo-app
</style>

<script>
export default {
  name: 'TodoApp',
  props: {
    items: { type: Array, default: () => [] },
  },
  data() {
    return { newItem: '' }
  },
  computed: {},
  methods: {
    addNew() {
      const { newItem } = this
      this.$emit('add', newItem)
      this.newItem = ''
    },
  },
}
</script>
