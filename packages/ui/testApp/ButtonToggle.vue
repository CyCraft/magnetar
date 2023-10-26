<script lang="ts" setup>
defineProps<{
  modelValue: any
  options: { label: string; value: any }[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', payload: any): void
}>()
</script>

<template>
  <div class="_toggle">
    <div class="_inner-wrapper">
      <button
        v-for="(o, i) in options"
        :key="i"
        :class="{ _active: o.value === modelValue }"
        @click="() => emit('update:modelValue', o.value)"
      >
        {{ o.label }}
      </button>
    </div>
  </div>
</template>

<style lang="sass" scoped>
._toggle
  display: flex
  justify-content: center
  align-items: center
  border-radius: 8px
  background: #646cff
  ._inner-wrapper
    flex: 1
    position: relative
    display: flex
    justify-content: center
    align-items: center
    padding: 4px
    button
      flex: 1
      position: relative
      z-index: 2
      margin: 0
      border: none
      background: transparent
      text-transform: capitalize
      white-space: nowrap
      color: rgba(36, 42, 56, 0.75)
      &:not(._active)
        cursor: pointer
      &._active
        background: white
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.16)
        border: none
</style>
