<template>
  <div class="todo-app">
    <pre>{{ items }}</pre>
    <input type="text" @keydown.enter="addNew" v-model="newItem" />
  </div>
</template>

<style lang="sass" scoped>
</style>

<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'TodoApp',
  props: {
    items: { type: Array, default: () => [] },
  },
  setup(props, { emit }) {
    const newItem = ref('')

    function addNew () {
      emit('add', newItem.value)
      newItem.value = ''
    }
    
    return { newItem, addNew }
  },
})
</script>
