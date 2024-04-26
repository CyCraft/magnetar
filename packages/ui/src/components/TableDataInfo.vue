<script setup lang="ts">
import LoadingSpinner from './LoadingSpinner.vue'
import type { CollectionInstance } from '@magnetarjs/types'

const props = defineProps<{
  labels: {
    'magnetar table record counts': string
    'magnetar table info counts total': string
    'magnetar table info counts filtered': string
    'magnetar table info counts fetched': string
    'magnetar table info counts showing': string
  }
  fetchState: 'ok' | 'end' | 'fetching' | { error: string }
  collection: CollectionInstance<any>
  collectionInstance: CollectionInstance<any>
  rows: any[]
}>()
</script>

<template>
  <section class="magnetar-column magnetar-gap-sm magnetar-items-end">
    <h6>{{ labels['magnetar table record counts'] }}</h6>
    <div class="magnetar-row magnetar-gap-md">
      <LoadingSpinner v-if="fetchState === 'fetching'" />
      {{ `${collection.count} ${labels['magnetar table info counts total']} / ` }}
      {{ `${collectionInstance.count} ${labels['magnetar table info counts filtered']} / ` }}
      <template v-if="collectionInstance.data.size !== rows.length">{{
        `${collectionInstance.data.size} ${labels['magnetar table info counts fetched']} / `
      }}</template>
      {{ `${rows.length} ${labels['magnetar table info counts showing']}` }}
    </div>
  </section>
</template>

<style lang="sass" src="./styles.sass" />
