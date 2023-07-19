<script setup lang="ts">
// const props = defineProps<{}>()

// const emit = defineEmits<{}>()
</script>

<template>
  <div class="magnetar-loading-spinner"></div>
</template>

<style lang="sass" scoped>
.magnetar-loading-spinner
  border: 4px solid var(--c-primary-extra-light, whitesmoke)
  border-radius: 50%
  border-top: 4px solid var(--c-primary, black)
  width: 16px
  height: 16px
  animation: spin 2s linear infinite

@keyframes spin
  0%
    transform: rotate(0deg)
  100%
    transform: rotate(360deg)
</style>
