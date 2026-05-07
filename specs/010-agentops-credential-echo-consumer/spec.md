# Specification: AgentOps Credential Echo Consumer

**编号**：`010-agentops-credential-echo-consumer`
**阶段目标**：在 Agent Store 侧消费 AgentOps 016/017 的 credential/bootstrap status 回显，让 Store 正确展示 `credential_issued` 与 `signature_verified`，但不签发 credential、不生成 device proof、不本地推导 verified。

## 背景

AgentOps 已完成 `016-cross-project-credential-handoff-consumer` 和 `017-signed-test-event-credential-activation`。AgentOps 现在是 ReporterCredential、IngestionToken、DeviceKey、bootstrap status 和 signed test event verification 的事实源。Agent Store 008/009 已完成 producer contract 与 AgentOps 016 验收冻结，本阶段开始接入 Store 侧 consumer 行为。

## 范围

- 新增 AgentOps credential issue echo client，用于消费 AgentOps response fixture 或测试替身返回。
- `CredentialBootstrapSummary` 支持 `signature_verified` 回显，并将 Store 展示推进为 `enterprise_state=active`、`reporter_status=sent`。
- 保持 `credential_issued` 为 `enterprise_state=activating`、`reporter_status=pending_signature_test`。
- 增加 `credential_bootstrap_signature_verified.v1` fixture。
- 更新 AgentOps summary OpenAPI，使 Store 返回的 credential bootstrap echo 字段完整可见。
- 增加 CCT-003 后半段和单元测试，防止 Store 伪造 device proof 或 AgentOps credential response。

## 非目标

- 不修改 AgentOps 仓库。
- 不修改 Ai_AutoSDLC 仓库。
- 不实现真实 HTTP client、认证、重试或密钥系统。
- 不让 Agent Store 生成、签名或补全 `device_proof.v1`。
- 不让 Agent Store 生成 ReporterCredential、IngestionToken 或 DeviceKey。
- 不把 `credential_issued` 本地推导成 `active`。

## 功能需求

- **FR-010-001**：Store 必须能消费 AgentOps `credential_issued` response，并保持 activation 状态，等待 signed test event。
- **FR-010-002**：Store 必须能消费 AgentOps `signature_verified` echo，并仅基于 AgentOps 回显展示 active。
- **FR-010-003**：Store credential issue client 必须拒绝缺少 `device_proof.v1` 的 handoff，不能由 Store 生成或补字段。
- **FR-010-004**：Store credential issue client 必须拒绝缺少 AgentOps response 的场景，不能本地伪造 credential。
- **FR-010-005**：OpenAPI 必须暴露 `next_action`、credential ids、installation/device echo 与 `pending_signature_test` reporter 状态。

## 验收

- `uv run ai-sdlc run --dry-run` 通过。
- `uv run pytest tests/unit/test_agentops_client.py tests/unit/test_agentops_summary_models.py tests/contract/test_cross_project_fixtures.py -q` 通过。
- `uv run pytest -q` 通过。
- `uv run ruff check app tests` 通过。
