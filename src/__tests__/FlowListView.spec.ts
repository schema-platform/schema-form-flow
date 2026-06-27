import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import FlowListView from '../views/FlowListView.vue'

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('../api/flowApi', () => ({
  flowApi: {
    listFlows: vi.fn(),
    getFlow: vi.fn(),
    createFlow: vi.fn(),
    deleteFlow: vi.fn(),
    publishFlow: vi.fn(),
  },
}))

import { flowApi } from '../api/flowApi'
const mockedApi = vi.mocked(flowApi)

const EP_STUBS = {
  'el-button': { template: '<button @click="$emit(\'click\')"><slot /></button>', props: ['size', 'type', 'loading'], emits: ['click'] },
  'el-input': { template: '<input />', props: ['modelValue', 'placeholder', 'clearable'], emits: ['update:modelValue'] },
  'el-tag': { template: '<span><slot /></span>', props: ['type', 'size'] },
  'el-empty': { template: '<div>{{ description }}</div>', props: ['description'] },
  'el-dialog': { template: '<div v-if="modelValue"><slot /></div>', props: ['modelValue', 'title', 'width'] },
  'el-form': { template: '<form><slot /></form>', props: ['labelPosition'] },
  'el-form-item': { template: '<div><slot /></div>', props: ['label'] },
  'el-select': { template: '<select><slot /></select>', props: ['modelValue'] },
  'el-option': { template: '<option />', props: ['label', 'value'] },
}

describe('FlowListView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockedApi.listFlows.mockResolvedValue({ items: [] } as any)
  })

  function createWrapper() {
    return mount(FlowListView, {
      global: {
        directives: {
          loading: () => {},
        },
        stubs: {
          AppIcon: { template: '<span />' },
          FilterTabs: {
            name: 'FilterTabs',
            template: '<div class="filter-tabs-stub" />',
            props: ['modelValue', 'options'],
            emits: ['update:modelValue'],
          },
          ...EP_STUBS,
        },
      },
    })
  }

  it('mounts without errors', () => {
    const wrapper = createWrapper()
    expect(wrapper.exists()).toBe(true)
  })

  it('displays flow list area', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.filter-tabs-stub').exists()).toBe(true)
  })

  it('has create button', () => {
    const wrapper = createWrapper()
    const buttons = wrapper.findAll('button')
    const createBtn = buttons.find(b => b.text().includes('新建') || b.text().includes('创建'))
    expect(createBtn).toBeTruthy()
  })

  it('loads flows on mount', () => {
    createWrapper()
    expect(mockedApi.listFlows).toHaveBeenCalled()
  })

  it('shows empty state when no flows', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('暂无')
  })
})
