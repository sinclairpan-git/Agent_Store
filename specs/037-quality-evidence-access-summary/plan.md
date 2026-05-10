# Plan: Quality Evidence Access Summary

1. 运行 AI-SDLC adapter status 与 dry-run，确认治理入口可用。
2. 新增领域模型和 API handler，沿用现有 idempotency / ErrorResponse / ActionDescriptor 模式。
3. 新增 OpenAPI 契约和 parser contract test，固化 summary state、source of truth 与 raw URL stripping。
4. 更新 contract registry、cross-project appendix 和 program manifest。
5. 运行专项测试、全量 pytest、ruff、AI-SDLC truth sync/audit/run。

## Risk Controls

- Store 只投影 AgentOps summary，不计算质量。
- Evidence Vault 是 raw evidence / raw trace 的事实源；Store response 永不回传 raw URL。
- Expired summary 只可展示为待刷新，`recommendation_basis_allowed=false`。
