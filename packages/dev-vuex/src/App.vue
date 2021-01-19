<template>
  <div id="app">
    <TestVuexPlugin />
  </div>
</template>

<script>
import TestVuexPlugin from './components/TestVuexPlugin.vue'

export default {
  name: 'App',
  components: {
    TestVuexPlugin,
  },
}
</script>

<style lang="sass">
#app
  font-family: Avenir, Helvetica, Arial, sans-serif
  -webkit-font-smoothing: antialiased
  -moz-osx-font-smoothing: grayscale
  text-align: center
  color: #2c3e50
  margin-top: 60px
</style>
