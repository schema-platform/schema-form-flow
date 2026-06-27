# schema-form-flow

`@schema-form/flow-web` — BPMN 流程设计器前端。

## 项目规则

### 技术栈
- Vue 3 + Vue Flow 可视化设计器
- TypeScript + CSS Module 样式隔离

### 架构规则
- **Token 执行模型**：支持 12 种 BPMN 节点类型
- **流程引擎共享层**：核心逻辑在 `@schema-platform/flow-shared`，本项目只做 UI
- **组件嵌套规则**：同 editor，基础组件只允许嵌套在布局组件内部

### 分层规范
1. 全局状态 → Pinia Store（`src/stores/`）
2. 公共逻辑 → 组合式 API（`src/composables/`）
3. API 接口 → `src/api/`（禁止组件直接 fetch）
4. UI 组件 → 只做渲染，不写复杂业务逻辑
5. 工具函数 → `src/utils/`

## 迭代规则

- **禁止回滚 git**，渐进式推进
- 新增节点类型需同步更新 `flow-shared` 的类型定义
- 流程执行逻辑变更必须在 shared 层修改，不在 web 层硬编码

## 常用命令

```bash
pnpm dev      # vite dev server
pnpm build    # vue-tsc + vite build
pnpm test     # vitest run
```
