# 规格：Agent Store Catalog Workbench

**编号**：`002-agent-store-catalog-workbench`  
**阶段目标**：把阶段 1 的单 Agent 可信详情页推进为可浏览、可筛选、可选中联动详情的 Agent 应用目录工作台。

## 范围

- Agent 应用列表卡片：展示 Agent / Skill / Framework Capability 的名称、类型、Owner、版本、发布阶段、可信状态、企业状态、证据等级和主操作。
- 目录筛选：支持搜索、类型筛选、可信状态筛选、安装状态筛选，并提供空态。
- 详情联动：选中任意卡片后，下方详情区按选中 Agent 展示事实、可信状态、企业激活、AgentOps 摘要和证据闭环。
- 后端契约：提供 catalog workbench view model 和 list API handler，响应包含 schema_version、trace_id、error_code、facets、selected_agent。

## 非范围

- 不实现生产 HTTP server、真实数据库或真实 IAM。
- 不实现完整安装器二进制下载、自动升级和真实 AgentOps HTTP 联调。
- 不把质量评分计算迁入 Agent Store；仍只回显 AgentOps summary。

## 功能需求

- **FR-002-001**：系统必须返回可筛选的 Agent catalog cards，并包含 facets 与 selected_agent。
- **FR-002-002**：前端必须以 Agent 应用列表作为第一屏入口，而不是只展示单 Agent 详情。
- **FR-002-003**：前端必须支持 search、agent_type、trust_state、installability 四类筛选。
- **FR-002-004**：任意卡片被选中后，详情区必须使用该 Agent 的名称、类型、Owner、版本、release_status、trust_state、enterprise_state 和 evidence_level。
- **FR-002-005**：禁用或 blocked Agent 的主操作必须不可键盘触发。
- **FR-002-006**：后端 catalog API 必须拒绝不支持的筛选枚举，并返回稳定治理错误。

## 成功标准

- `npm --prefix frontend run verify` 覆盖列表、筛选、空态和详情联动契约。
- `uv run pytest tests/unit/test_catalog_workbench.py tests/contract/test_agent_catalog_api.py -q` 通过。
- 全量 `uv run pytest -q` 和 `uv run ruff check app tests` 通过。
