# Specification: Bootstrap Source Of Truth Contract

**编号**：`012-bootstrap-source-of-truth-contract`
**阶段目标**：让 Agent Store 在 bootstrap status 中显式返回事实源、入口证据、冲突裁决和受影响动作，避免 Store、AgentOps、Ai_AutoSDLC 状态并存时被前端或轮询逻辑误读。

## 背景

阶段 011 已展示跨系统 timeline，但 Codex Review 连续指出：只暴露 `current_step` 和 timeline 还不够，必须告诉调用方哪个系统是当前状态事实源，以及冲突信号如何裁决。本阶段把该规则落到 API、契约测试和 Vue2 企业界面。

## 范围

- Bootstrap Status response 增加 `source_of_truth`、`entry_evidence`、`conflict_resolution`、`can_ignore`、`affected_actions`。
- Store assertion 过期且同时存在 AgentOps echo 时，Store 事实源优先，并通过 `source_conflicts` 暴露被覆盖的 AgentOps 信号。
- AgentOps credential echo 经 installation/device identity 校验后，才可成为 `credential_issued`、`signature_verified`、`failed`、`expired` 的展示事实源。
- OpenAPI 补齐 source-of-truth 字段和 `BootstrapSourceSignal` schema。
- Vue2 企业界面展示 bootstrap 状态事实源、裁决方式和入口证据。

## 非目标

- 不修改 AgentOps 仓库。
- 不修改 Ai_AutoSDLC 仓库。
- 不实现真实跨项目 HTTP 轮询。
- 不改变 Agent Store 不签发 credential、不生成 device proof 的边界。

## 功能需求

- **FR-012-001**：所有 Bootstrap Status response 必须包含事实源字段和入口证据。
- **FR-012-002**：`assertion_issued` 必须声明事实源为 Agent Store，并指向 `collect_device_proof` / `issue_credential` 后续动作。
- **FR-012-003**：AgentOps echo 必须在 identity match 后成为 `credential_issued` / `signature_verified` / failed states 的事实源。
- **FR-012-004**：Store-side assertion expired 必须覆盖 AgentOps echo，并将被覆盖 echo 放入 `source_conflicts`。
- **FR-012-005**：前端必须显示事实源、裁决、是否可忽略和入口证据。

## 验收

- `uv run ai-sdlc run --dry-run` 通过。
- `uv run pytest tests/contract/test_bootstrap_status_recovery.py tests/contract/test_contract_files_parse.py -q` 通过。
- `npm run verify` 在 `frontend/` 下通过。
- `uv run pytest -q` 通过。
- `uv run ruff check app tests` 通过。
