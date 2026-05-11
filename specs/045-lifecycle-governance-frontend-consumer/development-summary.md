# Development Summary: Lifecycle Governance Frontend Consumer

## Delivered

- 新增 `lifecycleGovernance` 前端 fixture，覆盖 upgrade_available、rollback_available、security_revoked 和 terminal downgrade blocked。
- Agent 详情页新增“生命周期治理”面板，展示 `lifecycle_governance_baseline.v1` 的 lifecycle state、actor、version scope、replacement、rollback、impact scope、issue、source-of-truth 和 next action。
- 缺摘要 fallback 保守显示 `active`，请求修复生命周期治理投影，不把缺摘要解释为已升级或已撤销。
- 静态前端 verify 已覆盖组件注册、shell prop、security_revoked terminal、Owner/Security actor 分工、replacement/rollback/impact 字段、no AgentVersion mutation、no Runtime execution、no CapabilityGrant 和 no AgentOps policy override。

## Boundaries

本阶段不修改 AgentVersion 存储、不执行真实升级/回退、不下发 Runtime 操作、不替代 Skill Registry lifecycle、不签发 CapabilityGrant、不覆盖 AgentOps PolicyDecision。

## Verification

- `npm run verify`：frontend verification passed。
- `uv run pytest -q`：489 passed。
- `uv run ruff check app tests`：All checks passed。
- `uv run ruff format --check app tests`：150 files already formatted。
- `uv run ai-sdlc program truth sync --execute --yes`：ready，228/228 mapped。
- `uv run ai-sdlc program truth audit`：ready / fresh。
- `uv run ai-sdlc run --dry-run`：Stage close PASS。
- `uv run ai-sdlc run`：Stage close PASS。
- `playwright-cli snapshot` / `playwright-cli screenshot --filename .playwright-cli/agent-store-045.png --full-page`：本地页面渲染确认“生命周期治理”面板。
