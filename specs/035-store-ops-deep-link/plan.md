# Plan: Store Ops Deep Link

## Implementation

1. 复用现有 dataclass projection + in-memory idempotency API 模式。
2. 新增 `StoreOpsDeepLink`，只消费 AgentOps summary envelope 和 viewer context。
3. OpenAPI 固化 `raw_trace_exposed=false`、`raw_evidence_exposed=false`，并把 raw URL 字段限制为空字符串。
4. Contract Registry 增加 `store_ops_deep_link.v1`，映射 CCT-020。
5. 跑定向 pytest、ruff、contract parser、AI-SDLC truth/audit。

## Risks

| Risk | Control |
|---|---|
| Store 越界展示 Trace 原文 | projection 永远输出空 raw URL，并将原文事实源指向 Evidence Vault |
| 缺 run/session 时仍生成链接 | `RUN_ID_REQUIRED` / `SESSION_ID_REQUIRED` 阻断，target href 为空 |
| 权限状态被误判 | viewer context 只决定 Store projection，不替代 AgentOps / Evidence Vault 权限事实 |
