<script setup lang="ts">
const example = ref<'stream' | 'fetch'>('stream')
</script>

<template>
  <div>
    <ButtonToggle
      v-model="example"
      :options="[
        { label: 'Stream Example', value: 'stream' },
        { label: 'Fetch Example', value: 'fetch' },
      ]"
      style="margin-bottom: 1rem"
    />

    <TestFirestorePluginStream v-if="example === 'stream'" />
    <TestFirestorePluginFetch v-if="example === 'fetch'" />
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
