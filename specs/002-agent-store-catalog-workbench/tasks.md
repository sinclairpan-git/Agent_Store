# 任务：Agent Store Catalog Workbench

## Batch 002-A：Catalog View Model

### Task 1.1 实现 Catalog workbench view model

- **状态**：已完成
- **文件**：`app/agent_store/ui/catalog_workbench.py`、`tests/unit/test_catalog_workbench.py`
- **验收**：cards、facets、selected_agent、active_filters、primary_action 均可验证。

### Task 1.2 实现 Catalog API handler

- **状态**：已完成
- **文件**：`app/agent_store/api/agent_catalog.py`、`tests/contract/test_agent_catalog_api.py`
- **验收**：支持 search、agent_type、trust_state、installability；非法枚举返回 `VALIDATION_ERROR`。

## Batch 002-B：Frontend Catalog Workbench

### Task 2.1 增加 Agent 应用列表卡片

- **状态**：已完成
- **文件**：`frontend/src/mock-data.js`、`frontend/src/sdlc-enterprise-vue2.js`、`frontend/src/styles.css`
- **验收**：第一屏展示 Agent 卡片，字段包含类型、版本、Owner、可信状态、企业状态、证据等级。

### Task 2.2 增加目录搜索与筛选

- **状态**：已完成
- **文件**：`frontend/src/app.js`、`frontend/src/sdlc-enterprise-vue2.js`、`frontend/src/styles.css`
- **验收**：支持 search、agent_type、trust_state、installability，且无结果时展示空态。

### Task 2.3 增加选中 Agent 详情联动

- **状态**：已完成
- **文件**：`frontend/index.html`、`frontend/src/app.js`
- **验收**：点击非 Ai_AutoSDLC 卡片时，详情区切换到对应 Agent 的事实、可信状态、激活和 AgentOps 摘要。

### Task 2.4 更新前端契约验证

- **状态**：已完成
- **文件**：`frontend/scripts/verify-frontend.mjs`
- **验收**：验证脚本覆盖列表卡片、筛选、空态、详情联动和企业 Vue2 适配层。
