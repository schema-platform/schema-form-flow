import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'

vi.mock('@element-plus/icons-vue', () => ({
  Search: { template: '<span />' },
}))

vi.mock('@schema-platform/platform-shared/components/common/AppIcon.vue', () => ({
  default: { template: '<span class="app-icon-stub" />', props: ['name', 'size'] },
}))

const mockListFlows = vi.fn()

vi.mock('../api/flowApi.js', () => ({
  flowApi: {
    listFlows: (...args: unknown[]) => mockListFlows(...args),
  },
}))

vi.mock('../api/flowApi.ts', () => ({
  flowApi: {
    listFlows: (...args: unknown[]) => mockListFlows(...args),
  },
}))

import SubProcessSelector from '../components/SubProcessSelector.vue'

const mockFlows = [
  { id: 'flow-1', name: '审批流程', description: '用于审批的子流程', status: 'published', category: '审批' },
  { id: 'flow-2', name: '通知流程', description: '', status: 'published', category: '' },
]

const EP_STUBS = {
  'el-button': { template: '<button :disabled="disabled" @click="$emit(\'click\')"><slot /></button>', props: ['size', 'type', 'disabled', 'loading'], emits: ['click'] },
  'el-input': { template: '<input :value="modelValue" :placeholder="placeholder" @input="$emit(\'update:modelValue\', $event.target.value)" />', props: ['modelValue', 'placeholder', 'clearable'], emits: ['update:modelValue', 'clear'] },
  'el-tag': { template: '<span><slot /></span>', props: ['type', 'size'] },
  'el-empty': { template: '<div>{{ description }}</div>', props: ['description'] },
  'el-radio': { template: '<label><slot /></label>', props: ['value'] },
  'el-radio-group': { template: '<div><slot /></div>', props: ['modelValue'] },
}

describe('SubProcessSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockListFlows.mockResolvedValue({ items: mockFlows, total: mockFlows.length })
  })

  function createWrapper(props: Record<string, unknown> = {}) {
    return mount(SubProcessSelector, {
      props,
      global: {
        stubs: {
          AppDialog: {
            template: '<div v-if="modelValue" class="dialog-mock"><slot /><slot name="footer" /></div>',
            props: ['modelValue', 'title', 'width', 'closeOnClickModal'],
          },
          AppIcon: { template: '<span />' },
          ...EP_STUBS,
        },
      },
    })
  }

  it('opens dialog when open() is called', async () => {
    const wrapper = createWrapper()
    const vm = wrapper.vm as any
    vm.open()
    await flushPromises()
    expect(wrapper.find('.dialog-mock').exists()).toBe(true)
  })

  it('fetches published flows on open', async () => {
    const wrapper = createWrapper()
    const vm = wrapper.vm as any
    vm.open()
    await flushPromises()
    expect(mockListFlows).toHaveBeenCalledWith(expect.objectContaining({ status: 'published' }))
  })

  it('displays flow list', async () => {
    const wrapper = createWrapper()
    const vm = wrapper.vm as any
    vm.open()
    await flushPromises()
    expect(wrapper.text()).toContain('审批流程')
    expect(wrapper.text()).toContain('通知流程')
  })

  it('filters flows by name', async () => {
    const wrapper = createWrapper()
    const vm = wrapper.vm as any
    vm.open()
    await flushPromises()
    const input = wrapper.find('input')
    await input.setValue('审批')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('审批流程')
    expect(wrapper.text()).not.toContain('通知流程')
  })

  it('has confirm button', async () => {
    const wrapper = createWrapper()
    const vm = wrapper.vm as any
    vm.open()
    await flushPromises()
    const confirmBtn = wrapper.findAll('button').find(b => b.text() === '确认')
    expect(confirmBtn).toBeTruthy()
  })

  it('has search functionality', async () => {
    const wrapper = createWrapper()
    const vm = wrapper.vm as any
    vm.open()
    await flushPromises()
    const input = wrapper.find('input')
    expect(input.exists()).toBe(true)
  })
})
