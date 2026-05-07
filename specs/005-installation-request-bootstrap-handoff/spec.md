# Specification: Installation Request Bootstrap Handoff

**编号**：`005-installation-request-bootstrap-handoff`
**阶段目标**：把 004 的 accepted 安装申请推进到可创建 installation/device binding 的 bootstrap handoff 闭环。

## 范围

- 后端提供 request-to-bootstrap handoff API。
- handoff 必须复用 004 的 canonical request envelope，并校验 `request_id` 与 `audit_id`。
- accepted installable 申请可创建 installation；非 accepted 申请保持原申请状态，不得误创建 installation。
- 前端详情页展示 bootstrap handoff 状态、idempotency key、设备指纹与下一步动作。

## 非目标

- 不接入真实设备密钥生成或真实安装执行。
- 不落真实数据库；本阶段继续使用稳定、可验证的内存模型。
- 不自动签发 installation assertion；assertion 仍由既有 bootstrap/assertion API 负责。

## 功能需求

- **FR-005-001**：installable Agent 的 accepted request 必须能创建 installation，并返回 `handoff`、`request`、`installation`、`permission_decision`。
- **FR-005-002**：handoff 必须要求 `Idempotency-Key`，同一调用身份和同一请求身份重试必须返回同一个 installation。
- **FR-005-003**：客户端传入 `request_id` 时，必须与后端 canonical request id 一致，否则返回稳定错误。
- **FR-005-004**：`PermissionDecision.audit_id` 必须与 request `audit_id` 一致，否则不得创建 installation。
- **FR-005-005**：activation/catalog review/standalone 等非 accepted bootstrap 申请不得创建 installation。
- **FR-005-006**：前端必须显示 handoff 状态和 `create_installation_from_request` 下一步动作。

## 验收

- `uv run pytest tests/contract/test_installation_handoff_api.py -q` 通过。
- `uv run pytest -q` 通过。
- `uv run ruff check app tests` 通过。
- `uv run ruff format --check app tests` 通过。
- `npm --prefix frontend run verify` 通过。
- `node --check frontend/src/app.js` 与 `node --check frontend/src/sdlc-enterprise-vue2.js` 通过。
