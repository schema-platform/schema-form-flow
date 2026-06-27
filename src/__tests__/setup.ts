import { vi } from 'vitest'

// Mock @schema-platform/platform-shared components that don't exist in test environment
vi.mock('@schema-platform/platform-shared/components/common/FilterTabs.vue', () => ({
  default: {
    template: '<div class="filter-tabs-stub"><slot /></div>',
    props: ['modelValue', 'options'],
    emits: ['update:modelValue', 'change'],
  },
}))

vi.mock('@schema-platform/platform-shared/components/common/AppIcon.vue', () => ({
  default: {
    template: '<span class="app-icon-stub" />',
    props: ['name', 'size'],
  },
}))

vi.mock('@schema-platform/platform-shared/components/common/AppDialog.vue', () => ({
  default: {
    template: '<div class="app-dialog-stub" v-if="modelValue"><slot /><slot name="footer" /></div>',
    props: ['modelValue', 'title', 'width', 'closeOnClickModal', 'destroyOnClose'],
    emits: ['update:modelValue', 'close'],
  },
}))