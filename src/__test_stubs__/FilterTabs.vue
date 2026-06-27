<template>
  <div class="filter-tabs-stub"><slot /></div>
</template>
<script setup lang="ts">
defineProps<{ modelValue?: string; options?: Array<{ label: string; value: string }> }>()
defineEmits<{ 'update:modelValue': [value: string]; change: [value: string] }>()
</script>
