<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps<{
  modelValue: string | null
  options: {
    label: string
    sublabel?: string
    value: string | null
    class?: string
    style?: string
  }[]
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', payload: string | null): void
}>()

const activeValue = computed<string | null>({
  get: () => props.modelValue,
  set: (newVal) => emit('update:modelValue', newVal),
})
</script>

<template>
  <select v-model="activeValue">
    <option v-if="placeholder" :value="null">{{ placeholder }}</option>
    <option
      v-for="option in options"
      :key="option.value || '--'"
      :value="option.value"
      :class="option.class"
      :style="option.style"
    >
      {{ option.label }}<small v-if="option.sublabel"> {{ option.sublabel }}</small>
    </option>
  </select>
</template>
