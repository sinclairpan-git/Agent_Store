# 技术调研：Agent Store 阶段 1 可信最小闭环

**编号**：`001-agent-store-phase1-trusted-min-loop`  
**基线**：`agent-platform-baseline-2026-05-v1.4.2`  
**阶段**：design

## 1. 调研目标

本阶段目标是把 PRD 中的阶段 1 Agent Store 能力收敛为可实现、可验证、可与 AgentOps / Ai_AutoSDLC 对接的设计基线。

调研只覆盖 Agent Store 侧最小闭环：

- Agent Registry 草案。
- Ai_AutoSDLC 官方只读页。
- `manual_installable-preview` 企业激活入口。
- Installation / Device Binding / Signed Installation Assertion。
- AgentOps 摘要回显。
- standalone 与 enterprise managed 的边界保护。
- Trusted Evidence Loop：Reporter signed event -> AgentOps ingestion -> Evidence summary -> Agent Store 回显。
- 官方页治理视图模型、bootstrap 恢复路径、跨系统导航和可访问错误响应。

## 2. 方案决策

| 决策 | 结论 | 理由 | 对应规格 |
|---|---|---|---|
| 阶段 1 是否做完整安装器 | 不做 | PRD 明确阶段 1 只展示 `manual_installable-preview`，完整安装器在后续阶段 | FR-005 |
| 官方应用页形态 | 只读详情页 + 激活状态卡 | 最小闭环需要前台入口，但不需要商店运营能力 | FR-002、FR-003 |
| Registry 发布级别 | 草案级 Registry | 支撑 Owner、版本、artifact、AgentOps 回显映射，不承诺正式发布生命周期 | FR-001 |
| 质量/证据处理 | 只消费 AgentOps summary | 顶层基线规定 AgentOps 是运行事实与质量面 | FR-009、FR-012 |
| bootstrap 归属 | Store 写 installation / device，AgentOps 写 credential | 符合项目 PRD 的 Producer-Consumer 契约矩阵 | FR-006、FR-007、FR-008 |
| standalone 保护 | 作为 contract test 固化 | 防止企业接入把 Ai_AutoSDLC 个人/外部使用变成硬依赖 | AS-CT-006 |
| 可信证据闭环 | 增加 consumer-driven contract | 阶段 1 必须能证明 run/session/event/evidence/display 同源 | FR-021、AS-CT-008 |
| assertion 安全语义 | 纳入 contract，不停留在 signature 字段 | 防止验签退化为字符串存在性检查 | FR-020、AS-CT-009 |
| 用户恢复路径 | status / action contract 化 | bootstrap 失败需要可审计、可重试、可恢复 | FR-018、AS-CT-011 |
| UX 与证据分层 | action_id/message_key 入 contract，具体文案留给 UI | 避免把页面文案写死进核心证据契约 | FR-016、FR-024 |

## 3. 接口风格

阶段 1 采用 HTTP JSON 契约描述，不绑定具体 Web 框架。后续实现若使用 Python 3.11+，推荐先以 FastAPI 或等价 typed handler 落地，但 design 阶段不强制框架选型。

统一要求：

- 所有响应包含 `schema_version`、`trace_id`、`error_code`。
- 写操作支持 `idempotency_key`。
- 所有跨系统跳转或摘要展示携带 `trace_id` 或 `audit_id`。
- 枚举值使用 machine value，页面展示名通过状态注册表映射。
- 普通用户视图使用 `action_id`、`message_key`、`trust_state`、`availability_state`，管理员诊断视图才展示 hash、key、nonce、signature 等原始字段。

## 4. 数据持久化策略

阶段 1 可以使用关系型数据库、文档数据库或内存 mock 作为试点实现，但领域模型必须保持以下边界：

- Agent Store 持久化 Agent、AgentVersion、Installation、DeviceBinding、SignedInstallationAssertion 的企业安装事实。
- Agent Store 不持久化 Evidence Vault 原文。
- Agent Store 不持久化 AgentOps 评分计算过程，只缓存 summary 响应时必须保留 `valid_until` 并按过期降级展示。
- AgentOps summary 可通过同步 API 拉取或异步回写，页面只按 summary contract 渲染。
- run/session 级 Evidence summary 必须保留来源引用：`source_event_ids`、`evidence_summary_id`、`l5_gate_result`、`violation_scan_completed`、`summary_validity_state`。
- AuthContext 和 PermissionDecision 必须由统一认证/IAM 或 AgentOps policy 派生，不接受客户端裸 `user_id` 作为可信事实。

## 5. 安全与降级策略

| 场景 | 设计响应 |
|---|---|
| artifact_hash 不匹配 | 阻断 bootstrap，返回 `PACKAGE_HASH_MISMATCH` |
| assertion 过期 | 阻断 credential 请求，返回 `INSTALLATION_ASSERTION_EXPIRED` |
| AgentOps 不可用 | 显示企业证据待同步，不影响 standalone 说明 |
| 统一认证不可用 | 阻断企业激活，保留官方只读页 |
| 证据原文无权限 | 显示脱敏摘要和 Evidence Vault 申请入口 |
| summary 超过 valid_until | 展示待刷新，不展示有效质量结论 |

## 6. 阶段 2 以后延展

以下内容保留到后续阶段，不进入本工作项实现计划：

- 完整安装器、升级、卸载、回滚。
- 上架向导、包校验和修复 Prompt。
- Skill Registry 完整发布生命周期。
- 运行时 Capability Grant 签发。
- 完整质量评分和生命周期治理。
