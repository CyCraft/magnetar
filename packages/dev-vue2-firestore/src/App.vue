<template>
  <div id="app">
    <TestVue2Plugin />
    <!-- <TestManual /> -->
  </div>
</template>

<script>
import TestVue2Plugin from './components/TestVue2Plugin.vue'
// import TestManual from './components/TestManual.vue'

export default {
  name: 'App',
  components: {
    TestVue2Plugin,
    // TestManual,
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
