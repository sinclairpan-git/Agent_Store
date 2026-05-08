# Development Summary: Agent Store Catalog Workbench

## 本阶段交付

- 新增 Agent catalog workbench view model，返回 cards、facets、active_filters 与 selected_agent。
- 新增 Agent catalog API handler，支持 search、agent_type、trust_state、installability 查询，并对非法枚举返回稳定治理错误。
- 前端第一屏展示 Agent 应用目录卡片，支持目录搜索、筛选、空态和选中 Agent 详情联动。
- 前端验证脚本覆盖列表、筛选、空态、详情联动和企业 Vue2 适配层。

## 未做事项

- 未引入生产 HTTP server、真实数据库或真实 IAM。
- 未实现完整安装器二进制下载、自动升级或真实 AgentOps HTTP 联调。
- 未在 Agent Store 内计算 AgentOps 质量评分，只回显 AgentOps summary。

## 验证

- `npm --prefix frontend run verify`
- `uv run pytest tests/unit/test_catalog_workbench.py tests/contract/test_agent_catalog_api.py -q`
- `uv run pytest -q`
- `uv run ruff check app tests`
- `uv run ruff format --check app tests`

## 后续建议

1. 推进 `003-agent-installation-workflow-preview` 的 execute/close 证据补齐，让安装流程预览阶段从 decompose_only 进入 close。
2. 在后续阶段把 catalog selection 与 installation request / bootstrap status 继续联动。
3. 保持 Agent Store 只消费 AgentOps 事实，不在目录层推导 active、verified 或 L5 eligibility。
