<template>
  <div class="app-dialog-stub" v-if="modelValue"><slot /><slot name="footer" /></div>
</template>
<script setup lang="ts">
defineProps<{ modelValue?: boolean; title?: string; width?: string; closeOnClickModal?: boolean; destroyOnClose?: boolean }>()
defineEmits<{ 'update:modelValue': [value: boolean]; close: [] }>()
</script>
