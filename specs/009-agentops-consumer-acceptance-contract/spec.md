# Specification: AgentOps Consumer Acceptance Contract

**编号**：`009-agentops-consumer-acceptance-contract`
**阶段目标**：在 Agent Store 仓库冻结 AgentOps 016 的消费方验收清单，确保 AgentOps、Agent Store、Ai_AutoSDLC 后续围绕同一套跨项目 fixtures 和状态事实源继续落地。

## 背景

阶段 008 已让 Agent Store 输出 `signed_installation_assertion.v1` 和 `agentops_credential_handoff.v1` template。AgentOps 随后规划 `016-cross-project-credential-handoff-consumer`，负责消费 handoff 并成为 credential/bootstrap status 事实源。本阶段先把 AgentOps 016 的消费边界写入 appendix，避免 AgentOps 与 Agent Store 对字段、签名/hash、幂等和状态回显再次产生局部解释。

## 范围

- 更新 `docs/cross-project-contract-appendix.md`，增加 AgentOps 016 consumer acceptance。
- 明确 AgentOps 必须消费同名 cross-project fixtures，并记录来源 commit 或 checksum。
- 明确 Credential Issue 的 schema、assertion、device proof、绑定关系、幂等和 unsupported schema 验收。
- 明确 AgentOps response 是 `credential_issue_response.v1` 的 producer，Agent Store 只消费 echo。
- 增加 contract test，锁住 appendix 中 AgentOps 016 的关键约束。

## 非目标

- 不修改 AgentOps 仓库。
- 不修改 Ai_AutoSDLC 仓库。
- 不修改 Agent Store runtime 代码。
- 不实现真实 AgentOps Credential Issue 调用。
- 不把 Agent Store 变成 credential issuer。
- 不把 dry-run 或本地 adapter 状态升级为 `verified_loaded`。

## 功能需求

- **FR-009-001**：appendix 必须声明 AgentOps 016 是 `agentops_credential_handoff.v1` 的规范消费方阶段。
- **FR-009-002**：appendix 必须列出 AgentOps Credential Issue 对 `schema_version`、`assertion_version`、`issuer`、`audience`、`canonicalization`、`revocation_status` 的校验。
- **FR-009-003**：appendix 必须列出 `device_proof.v1`、`assertion_hash`、installation/device/user/artifact 绑定校验。
- **FR-009-004**：appendix 必须禁止 AgentOps 要求 assertion algorithm 与 device proof algorithm 相等。
- **FR-009-005**：appendix 必须声明 AgentOps response 补齐 `bootstrap_status`、`next_action`、`installation_id`、`device_id`，且 Agent Store 只展示 echo、不本地推导 active。
- **FR-009-006**：appendix 必须声明 AgentOps 016 不写 Agent Store 注册事实、不实现 Ai_AutoSDLC CLI、不升级 `verified_loaded`、不切入真实密钥系统。

## 验收

- `uv run ai-sdlc run --dry-run` 通过。
- `uv run pytest tests/contract/test_cross_project_fixtures.py -q` 通过。
- `uv run pytest -q` 通过。
- `uv run ruff check app tests` 通过。
