# Plan: Installation Request Bootstrap Handoff

## 后端

- 新增 `app/agent_store/api/installation_handoff.py`。
- 通过 `InstallationRequestAPI` 先生成 canonical request envelope。
- 对 accepted installable request 调用 `BootstrapService.create_installation`。
- 使用 source 里的 canonical `AgentVersion` 填充版本与 artifact hash，避免客户端覆盖包身份。
- 校验 `request_id`、`audit_id`、`Idempotency-Key` 与设备字段。

## 测试

- 新增 `tests/contract/test_installation_handoff_api.py`。
- 覆盖成功创建、幂等重试、非 accepted 状态、request identity mismatch、audit mismatch。

## 前端

- 新增 `selectedBootstrapHandoff` 计算属性。
- 新增 `sdlc-bootstrap-handoff` Vue2 组件。
- 在详情页展示 handoff 状态、idempotency key、设备指纹、安装 id 与下一步动作。
- 更新 `frontend/scripts/verify-frontend.mjs` 作为静态守护。

## 风险控制

- 不改变既有 bootstrap/assertion API 行为。
- 不引入新外部依赖。
- 不改变 004 request envelope 字段名。
