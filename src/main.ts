import 'element-plus/dist/index.css'
import '@schema-platform/platform-shared/styles/theme.scss'
import '@schema-platform/platform-shared/styles/css-variables.scss'
import './styles/variables.scss'
import './styles/theme.scss'

import { createApp, type App } from 'vue'
import { createPinia } from 'pinia'
import { setupElementPlus } from '@schema-platform/platform-shared/config/element'
import { initQiankunProps } from '@schema-platform/platform-shared/qiankun'
import { flowLog } from '@schema-platform/platform-shared/utils/logger'
import AppRoot from './App.vue'
import { createFlowRouter } from './router/index.js'
import { setTokenProvider } from './api/flowApi.js'

let app: App | null = null
let router: ReturnType<typeof createFlowRouter> | null = null

let currentRouteBase: string | undefined
let tokenProviderSet = false

function render() {
  if (!tokenProviderSet) {
    setTokenProvider(() => localStorage.getItem('sfp_access_token') || '')
    tokenProviderSet = true
  }

  router = createFlowRouter(currentRouteBase)
  app = createApp(AppRoot)
  app.use(createPinia())
  app.use(router)
  setupElementPlus(app)

  const mountEl = document.getElementById('flow-app')
  if (!mountEl) throw new Error('[flow] #flow-app not found')
  app.mount(mountEl)
}

// ── Qiankun 生命周期 ──

export async function bootstrap() {
  flowLog.lifecycle('bootstrap')
}

export async function mount(props: Record<string, unknown>) {
  flowLog.lifecycle('mount start')
  document.getElementById('loading')?.remove()

  // 注入 shell props → globalState 事件通道
  if (typeof props.onGlobalStateChange === 'function' && typeof props.setGlobalState === 'function') {
    initQiankunProps(props as any)
  }

  // token
  const getToken = props.getToken as (() => string) | undefined
  const token = getToken ? getToken() : (props.token as string)
  if (token) localStorage.setItem('sfp_access_token', token)

  // routeBase：shell 下发优先，否则用环境变量
  const getRouteBase = props.getRouteBase as (() => string) | undefined
  if (getRouteBase) {
    currentRouteBase = getRouteBase()
  }

  render()

  const emitEvent = props.emitEvent as ((event: string, data: unknown) => void) | undefined
  emitEvent?.('shell:sub-app-mounted', { app: 'flow' })
  flowLog.lifecycle('mount done')
}

export async function unmount() {
  flowLog.lifecycle('unmount')
  if (app) {
    app.unmount()
    app = null
    router = null
  }
}

// 独立模式：仅开发环境且非 qiankun 子应用时渲染
if (import.meta.env.DEV && !window.__POWERED_BY_QIANKUN__) {
  render()
}
