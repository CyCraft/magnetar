<template>
  <div id="app">
    <Test />
    <TestManual />
  </div>
</template>

<script>
import Test from './components/Test.vue'
import TestManual from './components/TestManual.vue'

export default {
  name: 'App',
  components: {
    Test,
    TestManual,
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
