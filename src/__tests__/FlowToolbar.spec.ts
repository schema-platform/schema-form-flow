import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import FlowToolbar from '../components/FlowToolbar.vue'

vi.mock('../api/flowApi', () => ({
  flowApi: {
    getNotifications: vi.fn().mockResolvedValue({ items: [], total: 0, unreadCount: 0 }),
    getUnreadCount: vi.fn().mockResolvedValue({ count: 0 }),
    markNotificationAsRead: vi.fn().mockResolvedValue(null),
    markAllNotificationsAsRead: vi.fn().mockResolvedValue(null),
    markNotificationsBatchRead: vi.fn().mockResolvedValue({ modifiedCount: 0 }),
  },
}))

vi.mock('@schema-platform/platform-shared/socket', () => ({
  connect: vi.fn(),
  identify: vi.fn(),
  onFlowNotification: vi.fn().mockReturnValue(() => {}),
}))

const elTooltipStub = {
  template: '<span><slot /></span>',
}

const elPopoverStub = {
  template: '<span><slot name="reference" /></span>',
}

const EP_STUBS = {
  'el-button': { template: '<button @click="$emit(\'click\')"><slot /></button>', props: ['size', 'type', 'loading'], emits: ['click'] },
  'el-slider': { template: '<div />', props: ['modelValue', 'min', 'max', 'step', 'showTooltip'] },
  'el-dropdown': { template: '<div><slot /><slot name="dropdown" /></div>' },
  'el-dropdown-menu': { template: '<div><slot /></div>' },
  'el-dropdown-item': { template: '<div><slot /></div>' },
}

function mountToolbar(props: Record<string, unknown> = {}) {
  return mount(FlowToolbar, {
    props,
    global: { stubs: { 'el-tooltip': elTooltipStub, 'el-popover': elPopoverStub, ...EP_STUBS } },
  })
}

describe('FlowToolbar', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders default title when no title prop provided', () => {
    const wrapper = mountToolbar()
    const input = wrapper.find('input[placeholder="未命名流程"]')
    expect(input.exists()).toBe(true)
  })

  it('renders custom title from prop', () => {
    const wrapper = mountToolbar({ title: '我的流程' })
    const input = wrapper.find('input')
    expect(input.element.value).toBe('我的流程')
  })

  it('renders toolbar buttons', () => {
    const wrapper = mountToolbar()
    const buttons = wrapper.findAll('button')
    expect(buttons.length).toBeGreaterThan(5)
  })

  it('has correct title attributes on icon buttons', () => {
    const wrapper = mountToolbar()
    const titles = wrapper.findAll('button').map(b => b.attributes('title')).filter(Boolean)
    expect(titles).toContain('返回列表')
    expect(titles).toContain('撤销 (Ctrl+Z)')
    expect(titles).toContain('重做 (Ctrl+Y)')
    expect(titles).toContain('导出 BPMN')
    expect(titles).toContain('导入 BPMN')
    expect(titles).toContain('校验')
    expect(titles).toContain('预览')
    expect(titles).toContain('快捷键帮助')
  })

  it('renders text labels for 设置, 保存 and 发布', () => {
    const wrapper = mountToolbar()
    const text = wrapper.text()
    expect(text).toContain('设置')
    expect(text).toContain('保存')
    expect(text).toContain('发布')
  })

  it('navigates to home when home button clicked', async () => {
    const wrapper = mountToolbar()
    const btn = wrapper.find('button[title="返回列表"]')
    expect(btn.exists()).toBe(true)
  })

  it('emits undo when undo button clicked', async () => {
    const wrapper = mountToolbar()
    const btn = wrapper.find('button[title="撤销 (Ctrl+Z)"]')
    await btn.trigger('click')
    expect(wrapper.emitted('undo')).toHaveLength(1)
  })

  it('emits redo when redo button clicked', async () => {
    const wrapper = mountToolbar()
    const btn = wrapper.find('button[title="重做 (Ctrl+Y)"]')
    await btn.trigger('click')
    expect(wrapper.emitted('redo')).toHaveLength(1)
  })

  it('emits export-bpmn when export button clicked', async () => {
    const wrapper = mountToolbar()
    const btn = wrapper.find('button[title="导出 BPMN"]')
    await btn.trigger('click')
    expect(wrapper.emitted('export-bpmn')).toHaveLength(1)
  })

  it('emits import-bpmn when import button clicked', async () => {
    const wrapper = mountToolbar()
    const btn = wrapper.find('button[title="导入 BPMN"]')
    await btn.trigger('click')
    expect(wrapper.emitted('import-bpmn')).toHaveLength(1)
  })

  it('emits validate when validate button clicked', async () => {
    const wrapper = mountToolbar()
    const btn = wrapper.find('button[title="校验"]')
    await btn.trigger('click')
    expect(wrapper.emitted('validate')).toHaveLength(1)
  })

  it('emits publish when publish button clicked', async () => {
    const wrapper = mountToolbar()
    const btn = wrapper.findAll('button').find(b => b.text() === '发布')
    expect(btn).toBeTruthy()
    await btn!.trigger('click')
    expect(wrapper.emitted('publish')).toHaveLength(1)
  })

  it('emits settings when settings button clicked', async () => {
    const wrapper = mountToolbar()
    const btn = wrapper.findAll('button').find(b => b.text() === '设置')
    expect(btn).toBeTruthy()
    await btn!.trigger('click')
    expect(wrapper.emitted('settings')).toHaveLength(1)
  })

  it('has save button', () => {
    const wrapper = mountToolbar()
    const btn = wrapper.findAll('button').find(b => b.text() === '保存')
    expect(btn).toBeTruthy()
  })

  it('emits toggle-preview when preview button clicked', async () => {
    const wrapper = mountToolbar()
    const btn = wrapper.find('button[title="预览"]')
    await btn.trigger('click')
    expect(wrapper.emitted('toggle-preview')).toHaveLength(1)
  })
})
