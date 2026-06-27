import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'

export interface RealtimeNotification {
  type: 'new-task' | 'task-updated' | 'flow-completed'
  taskId?: string
  instanceId?: string
  message: string
}

export function useRealtimeNotifications() {
  const connected = ref(false)
  const wsUrl = import.meta.env.VITE_WS_URL || ''
  let ws: WebSocket | null = null
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  let reconnectDelay = 1000
  const MAX_RECONNECT_DELAY = 30000

  function connect() {
    if (!wsUrl || ws) return

    try {
      const token = localStorage.getItem('token') || ''
      const url = token ? `${wsUrl}?token=${encodeURIComponent(token)}` : wsUrl
      ws = new WebSocket(url)

      ws.onopen = () => {
        connected.value = true
        reconnectDelay = 1000 // Reset delay on successful connection
      }

      ws.onmessage = (event) => {
        try {
          const notification = JSON.parse(event.data) as RealtimeNotification
          handleNotification(notification)
        } catch {
          // ignore malformed messages
        }
      }

      ws.onclose = () => {
        connected.value = false
        ws = null
        // Exponential backoff reconnect
        reconnectTimer = setTimeout(connect, reconnectDelay)
        reconnectDelay = Math.min(reconnectDelay * 2, MAX_RECONNECT_DELAY)
      }

      ws.onerror = () => {
        ws?.close()
      }
    } catch {
      // WebSocket not available
    }
  }

  function disconnect() {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
    if (ws) {
      ws.close()
      ws = null
    }
    connected.value = false
  }

  function handleNotification(notification: RealtimeNotification) {
    switch (notification.type) {
      case 'new-task':
        ElMessage.info(notification.message || '您有新的待办任务')
        break
      case 'task-updated':
        ElMessage.info(notification.message || '任务状态已更新')
        break
      case 'flow-completed':
        ElMessage.success(notification.message || '流程已完成')
        break
    }
  }

  onMounted(() => {
    connect()
  })

  onUnmounted(() => {
    disconnect()
  })

  return {
    connected,
    connect,
    disconnect,
  }
}
