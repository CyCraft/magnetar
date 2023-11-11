<script setup lang="ts">
import { ref } from 'vue'
import TestFirestorePluginFetch from './TestFirestorePluginFetch.vue'
import TestFirestorePluginStream from './TestFirestorePluginStream.vue'
import TestTable from './TestTable.vue'
import TestTableManualFilters from './TestTableManualFilters.vue'

const example = ref<'stream' | 'fetch' | 'table' | 'table-manual-filters'>('table')
</script>

<template>
  <div>
    <TestTable v-if="example === 'table'" />
    <TestTableManualFilters v-if="example === 'table-manual-filters'" />
    <TestFirestorePluginStream v-if="example === 'stream'" />
    <TestFirestorePluginFetch v-if="example === 'fetch'" />

    <select v-model="example" style="margin: 3rem 1rem">
      <option value="table">Table Example</option>
      <option value="table-manual-filters">Table Manual Filters</option>
      <!-- <option name="stream">Stream Example</option> -->
      <!-- <option name="fetch">Fetch Example</option> -->
    </select>
  </div>
</template>

<style lang="sass">
#app
  font-family: Avenir, Helvetica, Arial, sans-serif
  -webkit-font-smoothing: antialiased
  -moz-osx-font-smoothing: grayscale
  margin-top: 60px
</style>
