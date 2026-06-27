import 'element-plus/dist/index.css'
import '@schema-platform/platform-shared/styles/theme.scss'
import '@schema-platform/platform-shared/styles/css-variables.scss'
import './styles/variables.scss'
import './styles/theme.scss'

import { createApp, type App } from 'vue'
import { createPinia } from 'pinia'
import { setupElementPlus } from '@schema-platform/platform-shared/config/element'
import AppRoot from './App.vue'
import { createFlowRouter } from './router/index.js'
import { setTokenProvider } from './api/flowApi.js'

setTokenProvider(() => localStorage.getItem('sfp_access_token') || '')

let app: App | null = null
let router: ReturnType<typeof createFlowRouter> | null = null

let currentRouteBase = '/list'

function render(container?: HTMLElement) {
  router = createFlowRouter(currentRouteBase)
  app = createApp(AppRoot)
  app.use(createPinia())
  app.use(router)
  setupElementPlus(app)

  const mountEl = container?.querySelector('#app') || container || document.getElementById('app')
  if (mountEl) {
    app.mount(mountEl)
  }
}

// ── Qiankun 生命周期 ──

export async function bootstrap() {}

export async function mount(props: { container?: HTMLElement; getRouteBase?: () => string }) {
  const token = (props as Record<string, unknown>).token as string | undefined
  if (token) localStorage.setItem('sfp_access_token', token)

  if (props.getRouteBase) {
    const routeBase = props.getRouteBase()
    const browserPath = window.location.pathname
    const subPath = browserPath.slice(routeBase.length) || '/list'
    const search = window.location.search
    currentRouteBase = subPath + search
  }

  render(props.container)
}

export async function unmount() {
  if (app) {
    app.unmount()
    app = null
    router = null
  }
}

// 注册到 vite-plugin-qiankun 全局生命周期
const g = window as unknown as Record<string, unknown>
if (!g.moudleQiankunAppLifeCycles) g.moudleQiankunAppLifeCycles = {}
;(g.moudleQiankunAppLifeCycles as Record<string, unknown>)['flow'] = { bootstrap, mount, unmount }

// 独立模式
if (!window.__POWERED_BY_QIANKUN__) {
  render()
}
