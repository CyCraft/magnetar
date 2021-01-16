<template>
  <TestSimpleStorePlugin />
  <TestVue3Plugin />
  <div></div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import TestSimpleStorePlugin from './components/TestSimpleStorePlugin.vue'
import TestVue3Plugin from './components/TestVue3Plugin.vue'

export default defineComponent({
  name: 'App',
  components: {
    TestSimpleStorePlugin,
    TestVue3Plugin,
  }
})
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>