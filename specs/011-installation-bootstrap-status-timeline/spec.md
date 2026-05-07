# Specification: Installation Bootstrap Status Timeline

**编号**：`011-installation-bootstrap-status-timeline`
**阶段目标**：在 Agent Store 中展示安装激活跨系统进度，让用户能看到 Agent Store、Ai_AutoSDLC、AgentOps 在 bootstrap credential handoff 中各自负责的步骤和事实来源。

## 背景

阶段 010 已让 Agent Store 消费 AgentOps credential/bootstrap echo，并明确 `signature_verified` 只能来自 AgentOps。当前安装详情仍只显示单一 `current_step`/`step_status`，用户无法判断卡在哪个系统：Store assertion、Ai_AutoSDLC device proof、AgentOps credential issue，还是 signed test event。本阶段补齐 timeline。

## 范围

- 为 `BootstrapStatus` 增加 `timeline` 步骤数组。
- 根据 AgentOps credential echo 生成 `credential_issued` 与 `signature_verified` 时间线。
- Bootstrap Status API 支持传入 AgentOps credential echo 并返回三项目 timeline。
- OpenAPI 补充 `BootstrapTimelineStep` schema。
- 前端 Vue2 详情页展示 bootstrap timeline。
- 前端 mock 数据覆盖 `credential_issued` 后等待 signed test event 的状态。

## 非目标

- 不修改 AgentOps 仓库。
- 不修改 Ai_AutoSDLC 仓库。
- 不实现真实 HTTP 轮询。
- 不生成或签名 `device_proof.v1`。
- 不把 `credential_issued` 本地推进为 `signature_verified`。

## 功能需求

- **FR-011-001**：Bootstrap status response 必须包含 `create_installation`、`issue_assertion`、`collect_device_proof`、`issue_credential`、`verify_signature_test` 五个 timeline 步骤。
- **FR-011-002**：`assertion_issued` 状态下，`collect_device_proof` 必须显示 Ai_AutoSDLC 负责且正在等待/运行。
- **FR-011-003**：`credential_issued` echo 下，device proof 与 credential issue 步骤必须完成，当前动作必须是 `send_signature_test_event`。
- **FR-011-004**：`signature_verified` echo 下，timeline 必须完成，primary action 指向 AgentOps evidence。
- **FR-011-005**：前端必须展示 timeline，并区分 `completed`、`running`、`pending`、`blocked`。

## 验收

- `uv run ai-sdlc run --dry-run` 通过。
- `uv run pytest tests/contract/test_bootstrap_status_recovery.py -q` 通过。
- `npm run verify` 在 `frontend/` 下通过。
- `uv run pytest -q` 通过。
- `uv run ruff check app tests` 通过。
