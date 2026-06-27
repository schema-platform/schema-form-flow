<template>
  <div :class="$style.container">
    <div v-if="loading" :class="$style.loading">
      <el-icon class="is-loading"><Loading /></el-icon>
    </div>

    <div v-else-if="schema" :class="$style.form">
      <!-- 表单预览 -->
      <el-form
        ref="formRef"
        :model="formData"
        label-width="100px"
      >
        <el-form-item
          v-for="field in schemaFields"
          :key="field.field"
          :label="field.label"
          :prop="field.field"
        >
          <!-- 输入框 -->
          <el-input
            v-if="field.type === 'input'"
            v-model="formData[field.field]"
            :placeholder="field.props?.placeholder"
            :disabled="isFieldDisabled(field.field)"
          />

          <!-- 数字输入框 -->
          <el-input-number
            v-else-if="field.type === 'number'"
            v-model="formData[field.field]"
            :min="field.props?.min"
            :max="field.props?.max"
            :disabled="isFieldDisabled(field.field)"
          />

          <!-- 选择器 -->
          <el-select
            v-else-if="field.type === 'select'"
            v-model="formData[field.field]"
            :placeholder="field.props?.placeholder"
            :disabled="isFieldDisabled(field.field)"
          >
            <el-option
              v-for="opt in field.options ?? []"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>

          <!-- 日期选择器 -->
          <el-date-picker
            v-else-if="field.type === 'date'"
            v-model="formData[field.field]"
            type="date"
            :placeholder="field.props?.placeholder"
            :disabled="isFieldDisabled(field.field)"
          />

          <!-- 文本域 -->
          <el-input
            v-else-if="field.type === 'textarea'"
            v-model="formData[field.field]"
            type="textarea"
            :rows="3"
            :placeholder="field.props?.placeholder"
            :disabled="isFieldDisabled(field.field)"
          />

          <!-- 默认文本显示 -->
          <span v-else>{{ formData[field.field] ?? '-' }}</span>
        </el-form-item>
      </el-form>
    </div>

    <div v-else :class="$style.empty">
      <span>未找到表单定义</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Loading } from '@element-plus/icons-vue'
import { flowApi } from '../api/flowApi'

const props = defineProps<{
  schemaId?: string
  publishId?: string
  mode?: 'edit' | 'view' | 'readonly' | 'partial'
  initialData?: Record<string, unknown>
  editableFields?: string[]
  readonlyFields?: string[]
}>()

const emit = defineEmits<{
  submit: [data: Record<string, unknown>]
}>()

const loading = ref(false)
const schema = ref<any>(null)
const formData = ref<Record<string, unknown>>({})
const formRef = ref<any>(null)

/** Check if a field should be disabled based on mode and editableFields/readonlyFields */
function isFieldDisabled(field: string): boolean {
  if (props.mode === 'view' || props.mode === 'readonly') return true
  if (props.mode === 'partial') {
    if (props.editableFields?.length) {
      return !props.editableFields.includes(field)
    }
    if (props.readonlyFields?.length) {
      return props.readonlyFields.includes(field)
    }
    return true
  }
  return false
}

const schemaFields = computed(() => {
  if (!schema.value?.json) return []

  const widgets = Array.isArray(schema.value.json) ? schema.value.json : []
  const fields: Array<{
    field: string
    label: string
    type: string
    props?: Record<string, unknown>
    options?: Array<{ label: string; value: unknown }>
  }> = []

  function extractFields(widgets: any[]) {
    for (const widget of widgets) {
      if (widget.field) {
        fields.push({
          field: widget.field,
          label: widget.label ?? widget.field,
          type: widget.type ?? 'input',
          props: widget.props,
          options: widget.options,
        })
      }
      if (widget.children) {
        extractFields(widget.children)
      }
    }
  }

  extractFields(widgets)
  return fields
})

async function loadSchema() {
  if (!props.schemaId && !props.publishId) return

  loading.value = true
  try {
    if (props.publishId) {
      schema.value = await flowApi.getPublishedFormSchema(props.publishId)
    } else if (props.schemaId) {
      // Fetch flow definition to get the schema JSON
      const flow = await flowApi.getFlow(props.schemaId)
      // Flow definition may contain schema in its latest version
      // Try to get the latest version's schema
      try {
        const version = await flowApi.getLatestVersion(props.schemaId)
        schema.value = { json: version.graph?.nodes ? extractSchemaFromGraph(version.graph) : [], name: flow.name }
      } catch {
        schema.value = { json: [], name: flow.name }
      }
    }
  } catch (err) {
    console.error('Failed to load schema:', err)
  } finally {
    loading.value = false
  }
}

/** Extract form schema from flow graph (placeholder — depends on how forms are stored in graph nodes) */
function extractSchemaFromGraph(graph: Record<string, unknown>): unknown[] {
  // The graph contains nodes, each node may have a formSchemaId
  // For preview purposes, return empty — actual form rendering is done via iframe
  return []
}

// 初始化表单数据
function initFormData() {
  const data: Record<string, unknown> = {}
  for (const field of schemaFields.value) {
    data[field.field] = props.initialData?.[field.field] ?? null
  }
  formData.value = data
}

watch(() => props.schemaId, loadSchema, { immediate: true })
watch(() => props.publishId, loadSchema, { immediate: true })
watch(schemaFields, initFormData)
</script>

<style module>
.container {
  width: 100%;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.form {
  padding: 16px;
}

.empty {
  text-align: center;
  color: var(--el-text-color-secondary);
  padding: 40px;
}
</style>
