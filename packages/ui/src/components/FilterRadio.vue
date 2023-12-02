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
  <div
    v-for="option in options"
    class="magnetar-inline-block"
    :class="option.class"
    :style="option.style"
  >
    <input
      :id="option.value || '-'"
      type="radio"
      :checked="option.value === activeValue"
      @change="(e) =>
          activeValue = (e.target as HTMLInputElement)?.checked ? (option.value) : null
        "
    />
    <label :for="option.value || '-'"
      >{{ option.label }} <small v-if="option.sublabel"> {{ option.sublabel }}</small></label
    >
  </div>
</template>
