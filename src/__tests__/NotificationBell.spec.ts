import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import NotificationBell from '../components/NotificationBell.vue'

vi.mock('../api/flowApi', () => ({
  flowApi: {
    getNotifications: vi.fn(),
    getUnreadCount: vi.fn(),
    markNotificationAsRead: vi.fn(),
    markAllNotificationsAsRead: vi.fn(),
  },
}))

import { flowApi } from '../api/flowApi.js'
const mockedApi = vi.mocked(flowApi)

const stubs = {
  'AppIcon': {
    template: '<svg class="app-icon-stub"></svg>',
    props: ['name', 'size'],
  },
  'el-popover': {
    template: '<div class="el-popover-stub"><slot name="reference" /><slot /></div>',
    props: ['placement', 'width', 'trigger'],
    emits: ['show'],
  },
  'el-badge': {
    template: `<div class="el-badge-stub"><slot /><span v-if="!hidden && value" class="el-badge__content">{{ value }}</span></div>`,
    props: ['value', 'hidden', 'max'],
  },
  'el-button': {
    template: '<button class="el-button-stub"><slot /></button>',
    props: ['type', 'link', 'size'],
    emits: ['click'],
  },
  'el-tag': {
    template: '<span class="el-tag-stub"><slot /></span>',
    props: ['type', 'size', 'effect'],
  },
  'el-empty': {
    template: '<div class="el-empty-stub">{{ description }}</div>',
    props: ['description'],
  },
}

describe('NotificationBell', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockedApi.getUnreadCount.mockResolvedValue({ count: 0 })
    mockedApi.getNotifications.mockResolvedValue({
      items: [],
      total: 0,
      unreadCount: 0,
    })
  })

  function createWrapper() {
    return mount(NotificationBell, {
      global: { stubs },
    })
  }

  it('mounts without errors', () => {
    const wrapper = createWrapper()
    expect(wrapper.exists()).toBe(true)
  })

  it('displays bell icon', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('fetches unread count on mount', () => {
    createWrapper()
    expect(mockedApi.getUnreadCount).toHaveBeenCalled()
  })

  it('displays unread count badge when count > 0', async () => {
    mockedApi.getUnreadCount.mockResolvedValue({ count: 5 })
    const wrapper = createWrapper()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    const badge = wrapper.find('.el-badge__content')
    expect(badge.exists()).toBe(true)
    expect(badge.text()).toBe('5')
  })

  it('hides badge when unread count is 0', async () => {
    mockedApi.getUnreadCount.mockResolvedValue({ count: 0 })
    const wrapper = createWrapper()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    const badge = wrapper.find('.el-badge__content')
    expect(badge.exists()).toBe(false)
  })
})
