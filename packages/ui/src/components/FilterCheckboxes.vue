<script lang="ts" setup>
const props = defineProps<{
  modelValue: string[]
  options: {
    label: string
    sublabel?: string
    value: string
    class?: string
    style?: string
  }[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', payload: string[]): void
}>()

function onCheck(value: string, checked: boolean) {
  const newValues = [...props.modelValue]
  const existingIndex = newValues.indexOf(value)
  if (!checked && existingIndex !== -1) {
    newValues.splice(existingIndex, 1)
  }
  if (checked && existingIndex === -1) {
    newValues.push(value)
  }
  emit('update:modelValue', newValues)
}
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
      type="checkbox"
      :checked="modelValue.includes(option.value)"
      @change="(e) =>
          onCheck(option.value, !!(e.target as HTMLInputElement)?.checked)
        "
    />
    <label :for="option.value || '-'"
      >{{ option.label }} <small v-if="option.sublabel"> {{ option.sublabel }}</small></label
    >
  </div>
</template>
