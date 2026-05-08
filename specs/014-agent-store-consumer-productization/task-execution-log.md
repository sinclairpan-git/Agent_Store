# 014 执行日志

## Batch A - 产品化前端切片

### 已完成

- 新增 C 端发现 rail，支持推荐、可开始、本地可用、企业激活、治理关注、全部集合切换。
- 扩展 catalog mock 数据，加入 `audience`、`discovery_bucket`、`product_tags`、`rating_summary`、`adoption`、`setup_minutes`、`discovery_reasons`、`prerequisites`、`expected_outcomes`。
- 新增推荐决策面板，汇总 recommendation state、verdict、事实源、trace/audit、推荐理由、前置条件、结果、阻断项和 next best action。
- Agent 卡片改为面向 C 端决策的信息结构，突出适合对象、接入成本、评分/采用度和安装意图。
- 保持前端可信边界：非官方条目仍不从目录字段推导 AgentOps/L5/signature/credential 结果。
- 修复集合切换后的反馈状态重置与阻断项重复 key 问题。
- 根据 Codex Review 修复空目录租户下集合切换 fallback 读取 `catalog[0].agent_id` 的崩溃风险。
- 修复工作区卡片在 CSS grid 中被同一行强行拉高的问题。

### 本地验证

- `ai-sdlc run --dry-run`：PASS。
- `ai-sdlc adapter status`：codex 规则已安装并完成宿主验证。
- `npm run verify`：frontend verification passed。
- `node --check frontend/src/app.js`：PASS。
- `node --check frontend/src/sdlc-enterprise-vue2.js`：PASS。
- `node --check frontend/src/mock-data.js`：PASS。
- `uv run pytest tests/unit/test_official_app_view.py tests/unit/test_catalog_workbench.py tests/unit/test_agentops_client.py -q`：18 passed。
- `uv run pytest -q`：170 passed。
- `uv run ruff check app tests`：All checks passed。
- `ai-sdlc program validate`：PASS。
- Playwright：打开 `http://127.0.0.1:4173` 后控制台 0 error；390px 移动视口 `scrollWidth == viewport`；集合切换后详情、推荐决策与反馈状态随选中 Agent 更新。

### 已知边界

- 本阶段不实现真实推荐算法、真实安装器、真实 AgentOps HTTP、IAM/KMS/数据库。
- `ai-sdlc run` 初次执行因新增阶段导致 truth snapshot stale；按框架提示需在 close-out 中刷新 truth snapshot 后重跑。
