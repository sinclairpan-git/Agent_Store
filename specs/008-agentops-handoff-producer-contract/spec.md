# Specification: AgentOps Handoff Producer Contract

**编号**：`008-agentops-handoff-producer-contract`
**阶段目标**：在 Agent Store 侧落地跨项目 producer 契约，输出 AgentOps 可消费的 assertion 外部字段和 handoff template，同时保持 AgentOps 与 Ai_AutoSDLC 的事实源边界。

## 背景

阶段 007 已合入跨项目契约附录，明确 Agent Store 是安装与 assertion 事实源，AgentOps 是 credential response 事实源，Ai_AutoSDLC 是 device proof 生产方。AgentOps 侧复核指出 Agent Store 当前仍暴露内部字段 `alg`、`subject_user_id`、`issuer="Agent Store"` 与 `assertion_version="1"`。本阶段先补 Agent Store 的 producer adapter 和共享 fixtures。

## 范围

- 新增跨项目 fixtures：`signed_installation_assertion.v1`、`device_proof.v1`、`agentops_credential_handoff.v1`、`credential_issue_response.v1`、unsupported schema 样例。
- 为 `SignedInstallationAssertion` 增加 AgentOps 外部字段导出。
- 在 installation assertion API 中保留旧 `assertion` 响应，同时新增 `agentops_handoff_assertion` 与 `agentops_credential_handoff_template`。
- 增加 CCT-001 与 CCT-003 前半段测试。

## 非目标

- 不修改 AgentOps 仓库。
- 不修改 Ai_AutoSDLC 仓库。
- 不改变内部 assertion 签名与校验语义。
- 不让 Agent Store 生成、签名或补全 `device_proof.v1`。
- 不让 Agent Store 生成 ReporterCredential、IngestionToken 或 DeviceKey。
- 不让 Agent Store 从 `credential_issued` 本地推导 `active` 或 `signature_verified`。

## 功能需求

- **FR-008-001**：Agent Store 必须能导出 `signed_installation_assertion.v1` 外部字段，字段名使用 `algorithm`、`user_id`、`issuer=agent-store`。
- **FR-008-002**：Agent Store 必须保留内部 assertion 模型和既有 API 字段兼容性。
- **FR-008-003**：API 必须返回 AgentOps handoff template，但 `device_proof` 必须为空或待 Ai_AutoSDLC 填充，不得由 Store 伪造。
- **FR-008-004**：共享 fixture README 必须声明 `device_proof.v1` 生产方是 Ai_AutoSDLC。
- **FR-008-005**：Agent Store 只消费 AgentOps credential response echo，展示 `credential_issued` 与 `next_action`，不得本地推导 `active`。

## 验收

- `uv run ai-sdlc run --dry-run` 通过。
- `uv run pytest tests/unit/test_installation_assertions.py tests/contract/test_installation_bootstrap_api.py tests/contract/test_cross_project_fixtures.py -q` 通过。
- `uv run pytest tests/unit/test_agentops_summary_models.py -q` 通过。
- `uv run pytest -q` 通过。
- `uv run ruff check app tests` 通过。

