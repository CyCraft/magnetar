<template>
  <q-page class="landing-page column items-center justify-evenly">
    <div>
      <div class="mb-xxxl column items-center">
        <q-img src="media/magnetar-logo-white.svg" style="width: 118px" />
        <h1 class="text-logo mt-md">Magnetar</h1>
      </div>
      <div class="pa-md q-gutter-xl flex">
        <RouteLink text="Docs" to="/docs" />
        <AnchorLink href="https://github.com/cycraft/magnetar/releases" text="Changelog" external />
        <AnchorLink href="https://github.com/cycraft/magnetar" text="Github" external />
      </div>
    </div>
  </q-page>
</template>

<style lang="sass">
// $
.landing-page
  +C(background, nasa)
</style>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import AnchorLink from 'components/AnchorLink.vue'
import RouteLink from 'components/RouteLink.vue'

export default defineComponent({
  name: 'PageIndex',
  components: { AnchorLink, RouteLink },
  setup() {
    return {}
  },
})
</script>
