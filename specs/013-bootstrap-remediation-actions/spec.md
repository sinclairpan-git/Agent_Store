# Specification: Bootstrap Remediation Actions

**编号**：`013-bootstrap-remediation-actions`
**阶段目标**：让 Bootstrap Status 不只解释事实源，还能返回可执行、可审计的推荐补救动作链，覆盖轮询、重试、重新生成命令、诊断复制、权限申请和跨系统恢复入口。

## 背景

阶段 012 已明确 Agent Store、AgentOps、Ai_AutoSDLC 在 bootstrap status 中的事实源和冲突裁决。下一步需要把这些状态转换成稳定动作，避免前端或用户只看到 blocked / expired / running，却不知道下一步由哪个系统处理。

## 范围

- `BootstrapStatus` 增加 `recommended_actions`，使用既有 `ActionDescriptor` 结构。
- Store assertion expired 返回重新生成激活命令、复制诊断引用、返回官方应用页。
- AgentOps expired / failed echo 返回 AgentOps 侧刷新、访问复核或失败证据入口。
- `credential_issued` 返回 Ai_AutoSDLC CLI 发送签名测试事件、轮询状态、复制诊断引用。
- `signature_verified` 返回 AgentOps 证据查看和官方应用返回入口。
- 权限拒绝状态返回权限申请、诊断复制和官方应用返回入口。
- Vue2 企业界面展示推荐动作链。

## 非目标

- 不修改 AgentOps 仓库。
- 不修改 Ai_AutoSDLC 仓库。
- 不把 Agent Store 做成 credential issuer。
- 不让 Agent Store 生成、签名或补齐 `device_proof.v1`。
- 不实现真实 AgentOps HTTP remediation 调用。

## 功能需求

- **FR-013-001**：所有 Bootstrap Status response 必须包含非空 `recommended_actions`。
- **FR-013-002**：每个推荐动作必须包含稳定 `action_id`、`target_system`、`enabled`、`requires_permission`、`audit_required`。
- **FR-013-003**：跨系统动作必须标注真实 owner：AgentOps 处理 credential / permission，Ai_AutoSDLC 处理签名测试，Agent Store 处理轮询、诊断和命令重发。
- **FR-013-004**：blocked / expired / permission denied 状态必须至少返回一个主恢复动作和一个诊断动作。
- **FR-013-005**：前端必须在企业激活区展示推荐动作顺序、目标系统和可点击动作。

## 验收

- `uv run ai-sdlc run --dry-run` 通过。
- `uv run pytest tests/contract/test_bootstrap_status_recovery.py tests/contract/test_contract_files_parse.py -q` 通过。
- `npm run verify` 在 `frontend/` 下通过。
- `uv run pytest -q` 通过。
- `uv run ruff check app tests` 通过。
