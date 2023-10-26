<script setup lang="ts">
import { ref } from 'vue'
import TestFirestorePluginFetch from './TestFirestorePluginFetch.vue'
import TestFirestorePluginStream from './TestFirestorePluginStream.vue'
import TestTable from './TestTable.vue'

const example = ref<'stream' | 'fetch' | 'table'>('table')
</script>

<template>
  <div>
    <!-- <ButtonToggle
      v-model="example"
      :options="[
        { label: 'Table Example', value: 'table' },
        { label: 'Stream Example', value: 'stream' },
        { label: 'Fetch Example', value: 'fetch' },
      ]"
      style="margin-bottom: 1rem"
    /> -->

    <TestFirestorePluginStream v-if="example === 'stream'" />
    <TestFirestorePluginFetch v-if="example === 'fetch'" />
    <TestTable v-if="example === 'table'" />
  </div>
</template>

<style lang="sass">
#app
  font-family: Avenir, Helvetica, Arial, sans-serif
  -webkit-font-smoothing: antialiased
  -moz-osx-font-smoothing: grayscale
  margin-top: 60px
</style>
