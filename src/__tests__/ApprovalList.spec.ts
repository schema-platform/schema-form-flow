import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import ApprovalList from '../components/ApprovalList.vue'

vi.mock('../api/flowApi', () => ({
  flowApi: {
    getApprovalLogs: vi.fn(),
  },
}))

import { flowApi } from '../api/flowApi'
const mockedApi = vi.mocked(flowApi)

const mockLogs = {
  items: [
    {
      id: 'log-1',
      instanceId: 'inst-1',
      nodeId: 'node-1',
      nodeName: '部门经理审批',
      taskId: 'task-1',
      action: 'approve',
      operator: '张三',
      comment: '同意，请继续',
      outcome: 'approved',
      createdAt: '2026-06-27T10:00:00Z',
    },
    {
      id: 'log-2',
      instanceId: 'inst-1',
      nodeId: 'node-2',
      nodeName: '财务审批',
      taskId: 'task-2',
      action: 'claim',
      operator: '李四',
      createdAt: '2026-06-27T12:30:00Z',
    },
    {
      id: 'log-3',
      instanceId: 'inst-1',
      nodeId: 'node-3',
      nodeName: '总监审批',
      taskId: 'task-3',
      action: 'reject',
      operator: '王五',
      comment: '金额不符',
      outcome: 'rejected',
      createdAt: '2026-06-27T14:00:00Z',
    },
  ],
  total: 3,
}

describe('ApprovalList', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockedApi.getApprovalLogs.mockResolvedValue(mockLogs as any)
  })

  function createWrapper() {
    return mount(ApprovalList, {
      props: { instanceId: 'inst-1' },
      global: {
        stubs: {
          'el-button': { template: '<button @click="$emit(\'click\')"><slot /></button>', props: ['size', 'type'], emits: ['click'] },
          'el-tag': { template: '<span><slot /></span>', props: ['type', 'size', 'effect'] },
          'el-input': { template: '<textarea v-if="type===\'textarea\'" /><input v-else />', props: ['modelValue', 'type', 'rows', 'maxlength', 'showWordLimit', 'placeholder'], emits: ['update:modelValue'] },
          'el-empty': { template: '<div>{{ description }}</div>', props: ['description'] },
        },
      },
    })
  }

  it('mounts without errors', async () => {
    const wrapper = createWrapper()
    await flushPromises()
    expect(wrapper.exists()).toBe(true)
  })

  it('loads approval logs on mount', async () => {
    createWrapper()
    await flushPromises()
    expect(mockedApi.getApprovalLogs).toHaveBeenCalledWith('inst-1')
  })

  it('displays approval records', async () => {
    const wrapper = createWrapper()
    await flushPromises()
    expect(wrapper.text()).toContain('部门经理审批')
    expect(wrapper.text()).toContain('财务审批')
    expect(wrapper.text()).toContain('张三')
    expect(wrapper.text()).toContain('李四')
  })

  it('displays comment for records with comments', async () => {
    const wrapper = createWrapper()
    await flushPromises()
    expect(wrapper.text()).toContain('同意，请继续')
    expect(wrapper.text()).toContain('金额不符')
  })

  it('displays action labels', async () => {
    const wrapper = createWrapper()
    await flushPromises()
    expect(wrapper.text()).toContain('通过')
    expect(wrapper.text()).toContain('认领')
    expect(wrapper.text()).toContain('驳回')
  })

  it('displays outcome labels', async () => {
    const wrapper = createWrapper()
    await flushPromises()
    expect(wrapper.text()).toContain('驳回')
  })

  it('shows empty state when no records', async () => {
    mockedApi.getApprovalLogs.mockResolvedValue({ items: [], total: 0 } as any)
    const wrapper = createWrapper()
    await flushPromises()
    expect(wrapper.text()).toContain('暂无审批记录')
  })

  it('displays operator for each record', async () => {
    const wrapper = createWrapper()
    await flushPromises()
    expect(wrapper.text()).toContain('操作人')
    expect(wrapper.text()).toContain('张三')
  })

  it('displays time for each record', async () => {
    const wrapper = createWrapper()
    await flushPromises()
    expect(wrapper.text()).toContain('时间')
  })
})
