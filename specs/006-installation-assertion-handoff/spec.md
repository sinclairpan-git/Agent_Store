# Specification: Installation Assertion Handoff

**编号**：`006-installation-assertion-handoff`
**阶段目标**：把 005 的 installation 创建闭环推进到可签发、可校验、可展示的 installation assertion handoff。

## 范围

- 增强既有 bootstrap assertion API，在签发 assertion 时返回 handoff envelope 与 bootstrap status。
- `Idempotency-Key` header 按 HTTP 语义大小写不敏感读取。
- 前端详情页展示 assertion handoff 状态、audience、nonce、replay window、assertion hash 与下一步 AgentOps 同步动作。
- 保持 assertion nonce replay、设备指纹、auth context、幂等冲突等既有安全语义。

## 非目标

- 不接入真实 AgentOps 事件上传。
- 不改变 assertion 签名算法或密钥管理。
- 不持久化 assertion；沿用现有内存模型。

## 功能需求

- **FR-006-001**：成功签发 assertion 时，响应必须包含 `assertion_handoff`，其状态为 `issued`。
- **FR-006-002**：`assertion_handoff.next_action` 必须指向 `sync_agentops_evidence`。
- **FR-006-003**：响应必须包含 `bootstrap_status`，用于驱动轮询和诊断展示。
- **FR-006-004**：create installation 与 issue assertion 的 `Idempotency-Key` header 必须大小写不敏感。
- **FR-006-005**：前端必须展示 assertion handoff 面板，并区分 ready/issued/waiting 状态。

## 验收

- `uv run pytest tests/contract/test_installation_bootstrap_api.py -q` 通过。
- `uv run pytest -q` 通过。
- `uv run ruff check app tests` 通过。
- `uv run ruff format --check app tests` 通过。
- `npm --prefix frontend run verify` 通过。
- `node --check frontend/src/app.js` 与 `node --check frontend/src/sdlc-enterprise-vue2.js` 通过。
