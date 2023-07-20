<script setup lang="ts">
import { computed } from 'vue'
import { splitOnLink } from '../utils'

const props = defineProps<{
  text: string
}>()

const textChunks = computed(() => splitOnLink(props.text))
</script>

<template>
  <div class="magnetar-text-with-anchor-tags">
    <template v-for="(part, i) of textChunks" :key="i">
      <span v-if="part.kind === 'text'">
        <template v-for="(line, _i) of part.content.split(/[\n\r]/)" :key="_i"
          ><br v-if="_i !== 0" />{{ line }}</template
        >
      </span>
      <a v-if="part.kind === 'link'" :href="part.content" target="_blank">{{ part.content }}</a>
    </template>
  </div>
</template>

<style lang="sass" scoped>
.magnetar-text-with-anchor-tags
  white-space: pre-line
  word-break: break-word
  text-align: left
</style>
