<script setup lang="ts">
import { ref } from 'vue'
import ButtonToggle from './components/ButtonToggle.vue'
import TestFirestorePluginFetch from './components/TestFirestorePluginFetch.vue'
import TestFirestorePluginStream from './components/TestFirestorePluginStream.vue'
import TestVanillaJsSDK from './components/TestVanillaJsSDK.vue'

const example = ref<'stream' | 'fetch' | 'vanilla'>('stream')
</script>

<template>
  <div>
    <ButtonToggle
      v-model="example"
      :options="[
        { label: 'Stream Example', value: 'stream' },
        { label: 'Fetch Example', value: 'fetch' },
        { label: 'Vanilla JS SDK Test', value: 'vanilla' },
      ]"
      style="margin-bottom: 1rem"
    />

    <TestFirestorePluginStream v-if="example === 'stream'" />
    <TestFirestorePluginFetch v-if="example === 'fetch'" />
    <TestVanillaJsSDK v-if="example === 'vanilla'" />
  </div>
</template>

<style lang="sass">
#app
  font-family: Avenir, Helvetica, Arial, sans-serif
  -webkit-font-smoothing: antialiased
  -moz-osx-font-smoothing: grayscale
  text-align: center
  margin-top: 60px
</style>
