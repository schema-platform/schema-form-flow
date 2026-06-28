# schema-form-flow

`@schema-form/flow-web` — BPMN 流程设计器前端。

## 项目规则

### 技术栈
- Vue 3 + Vue Flow 可视化设计器
- TypeScript + CSS Module 样式隔离

### 架构规则
- **Token 执行模型**：支持 25 种 BPMN 节点类型
- **流程引擎共享层**：核心逻辑在 `@schema-platform/flow-shared`，本项目只做 UI
- **组件嵌套规则**：同 editor，基础组件只允许嵌套在布局组件内部

### 分层规范
1. 全局状态 → Pinia Store（`src/stores/`）
2. 公共逻辑 → 组合式 API（`src/composables/`）
3. API 接口 → `src/api/`（禁止组件直接 fetch）
4. UI 组件 → 只做渲染，不写复杂业务逻辑
5. 工具函数 → `src/utils/`

### 公共包规则
- **修改公共包必须发包并拉取**：修改 `@schema-platform/platform-shared`、`@schema-platform/flow-shared` 等公共包源码后，必须发包（更新版本号 → `pnpm publish`），然后在本项目执行 `pnpm update` 拉取新版本。仅修改源码不发包 = 改动不生效。

### 环境规则
- **gh CLI 已认证**：`gh` 已登录、`GITHUB_TOKEN` 环境变量已就绪，禁止检查 token、禁止询问用户设置

### 代码质量规则
- **禁止跳过问题**：遇到任何报错、警告、异常，必须找到根因并修复，不能以"预存问题""之前就有""不影响运行"为由跳过。每个问题都要记录原因和修复方式

### 项目隔离规则
- **禁止跨项目修改**：本项目只能修改自己的代码，禁止修改其他项目。需要改其他项目时，明确告知用户。

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
