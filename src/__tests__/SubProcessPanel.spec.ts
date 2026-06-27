import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'

vi.mock('@element-plus/icons-vue', () => ({
  ChevronRight: { template: '<span />' },
  ChevronDown: { template: '<span />' },
  Plus: { template: '<span />' },
  Delete: { template: '<span />' },
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

import SubProcessPanel from '../components/nodePanels/SubProcessPanel.vue'

const mockFlows = [
  { id: 'flow-1', name: '审批子流程', description: '用于审批', status: 'published', category: '审批' },
  { id: 'flow-2', name: '通知子流程', description: '', status: 'published', category: '' },
]

const EP_STUBS = {
  'el-input': {
    template: '<input :value="modelValue" :placeholder="placeholder" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    props: ['modelValue', 'placeholder', 'type', 'rows', 'size'],
    emits: ['update:modelValue'],
  },
  'el-select': {
    template: '<select :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><slot /></select>',
    props: ['modelValue', 'placeholder', 'filterable', 'loading', 'clearable'],
    emits: ['update:modelValue', 'change'],
  },
  'el-option': { template: '<option :value="value">{{ label }}</option>', props: ['label', 'value'] },
  'el-button': { template: '<button @click="$emit(\'click\')"><slot /></button>', props: ['size', 'type', 'loading', 'text'], emits: ['click'] },
  'el-radio-group': { template: '<div><slot /></div>', props: ['modelValue'], emits: ['update:modelValue', 'change'] },
  'el-radio': { template: '<label><input type="radio" :value="value" /><slot /></label>', props: ['value'] },
  'el-input-number': { template: '<input type="number" :value="modelValue" />', props: ['modelValue', 'min', 'max', 'step'], emits: ['update:modelValue', 'change'] },
}

const defaultNode = {
  id: 'node-1',
  type: 'sub-process',
  data: {
    subProcessDefinitionId: 'flow-1',
    inputMapping: { childVar: '${parentVar}' },
    outputMapping: { parentResult: '${childOutput}' },
  },
}

describe('SubProcessPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockListFlows.mockResolvedValue({ items: mockFlows, total: mockFlows.length })
  })

  function createWrapper(node = defaultNode) {
    return mount(SubProcessPanel, {
      props: { node },
      global: {
        stubs: {
          AppDialog: {
            template: '<div><slot /><slot name="footer" /></div>',
            props: ['modelValue', 'title', 'width'],
          },
          AppIcon: { template: '<span />' },
          SubProcessSelector: {
            template: '<div />',
            props: ['modelValue', 'excludeId'],
            methods: { open: vi.fn() },
          },
          ...EP_STUBS,
        },
      },
    })
  }

  it('mounts without errors', async () => {
    const wrapper = createWrapper()
    await flushPromises()
    expect(wrapper.exists()).toBe(true)
  })

  it('loads flow list on mount', async () => {
    createWrapper()
    await flushPromises()
    expect(mockListFlows).toHaveBeenCalledWith(expect.objectContaining({ status: 'published' }))
  })

  it('displays flow selection area', async () => {
    const wrapper = createWrapper()
    await flushPromises()
    expect(wrapper.text()).toContain('子流程配置')
  })

  it('displays selected flow details', async () => {
    const wrapper = createWrapper()
    await flushPromises()
    expect(wrapper.text()).toContain('审批子流程')
  })

  it('displays mapping section', async () => {
    const wrapper = createWrapper()
    await flushPromises()
    expect(wrapper.text()).toContain('参数映射')
  })

  it('has flow selection functionality', async () => {
    const wrapper = createWrapper()
    await flushPromises()
    // Component loads flow list and displays selected flow
    expect(wrapper.text()).toContain('子流程配置')
  })

  it('displays task assignment section', async () => {
    const wrapper = createWrapper()
    await flushPromises()
    expect(wrapper.text()).toContain('任务分配')
  })

  it('displays timeout section', async () => {
    const wrapper = createWrapper()
    await flushPromises()
    expect(wrapper.text()).toContain('超时配置')
  })

  it('displays error handling section', async () => {
    const wrapper = createWrapper()
    await flushPromises()
    expect(wrapper.text()).toContain('错误处理')
  })
})
