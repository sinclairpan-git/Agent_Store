# 计划：Agent Store Catalog Workbench

## 技术决策

- 继续使用 Vue2 与 SDLC 内置企业 Vue2 组件库适配层。
- 后端沿用 Python typed handler 与 in-memory contract verification，不引入生产 Web 框架。
- Catalog 是 Agent Store 的入口与分发面；AgentOps 事实只作为摘要回显，不在 Store 内计算质量。

## 批次

### Batch 002-A：Catalog View Model

- 新增 `agent_store.ui.catalog_workbench`，输出 cards、facets、active_filters、selected_agent。
- 新增 `agent_store.api.agent_catalog`，支持 search、agent_type、trust_state、installability 查询。
- 新增单元与契约测试。

### Batch 002-B：Frontend Catalog Workbench

- 在官方详情上方增加 Agent 应用列表第一屏。
- 增加搜索、类型、可信状态、安装状态筛选。
- 增加空态和选中 Agent 详情联动。
- 更新前端验证脚本，防止退化为单详情页。

## 验证

- `npm --prefix frontend run verify`
- `uv run pytest tests/unit/test_catalog_workbench.py tests/contract/test_agent_catalog_api.py -q`
- `uv run pytest -q`
- `uv run ruff check app tests`
- `uv run ruff format --check app tests`
