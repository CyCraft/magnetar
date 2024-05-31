<script lang="ts" setup>
import { isNumber } from 'is-what'
import LoadingSpinner from './LoadingSpinner.vue'

defineProps<{
  pageIndex: number
  pageCountFetched: number
  pageCountHypothetical: number
  /** If we have a page size that is not 0 or Infinity, we return it, otherwise `false` */
  pageSize: false | number
  fetchMore: () => Promise<void>
  fetchState: 'ok' | 'end' | 'fetching' | { error: string }
  labels: {
    'magnetar table fetch-more button end': string
    'magnetar table fetch-more button': string
    'magnetar table previous-next first-page button': string
    'magnetar table previous-next last-page button': string
    'magnetar table previous-next previous button': string
    'magnetar table previous-next next button': string
    'magnetar table previous-next end': string
  }
}>()

const emit = defineEmits<{
  (e: 'update:pageIndex', payload: number): void
}>()
</script>

<template>
  <section>
    <template v-if="!pageSize || pageSize === Infinity">
      <button
        :disabled="fetchState === 'end' || fetchState === 'fetching'"
        @click="() => fetchMore()"
      >
        {{
          fetchState === 'end'
            ? labels['magnetar table fetch-more button end']
            : labels['magnetar table fetch-more button']
        }}
      </button>
      <div v-if="fetchState === 'fetching'"><LoadingSpinner /></div>
    </template>

    <template v-if="isNumber(pageSize) && pageSize > 0 && pageSize !== Infinity">
      <button
        :disabled="pageIndex === 0 || fetchState === 'fetching'"
        @click="() => emit('update:pageIndex', 0)"
      >
        {{ labels['magnetar table previous-next first-page button'] }}
      </button>
      <button
        :disabled="pageIndex === 0 || fetchState === 'fetching'"
        @click="() => emit('update:pageIndex', pageIndex - 1)"
      >
        {{ labels['magnetar table previous-next previous button'] }}
      </button>
      <button
        :disabled="
          (pageIndex === pageCountHypothetical - 1 && fetchState === 'end') ||
          fetchState === 'fetching'
        "
        @click="() => emit('update:pageIndex', pageIndex + 1)"
      >
        {{ labels['magnetar table previous-next next button'] }}
      </button>
      <button
        v-if="pageCountFetched === pageCountHypothetical"
        :disabled="
          (pageIndex === pageCountHypothetical - 1 && fetchState === 'end') ||
          fetchState === 'fetching'
        "
        @click="() => emit('update:pageIndex', pageCountFetched - 1)"
      >
        {{ labels['magnetar table previous-next last-page button'] }}
      </button>
      <div v-if="fetchState === 'fetching'">
        <LoadingSpinner />
      </div>
      <div class="magnetar-ml-auto"></div>
      <div v-if="fetchState === 'end'">{{ labels['magnetar table previous-next end'] }}</div>
      <div>{{ pageIndex + 1 }} / {{ pageCountHypothetical }}</div>
    </template>
  </section>
</template>

<style scoped></style>
