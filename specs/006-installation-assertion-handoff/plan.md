# Plan: Installation Assertion Handoff

## 后端

- 增强 `InstallationBootstrapAPI.issue_installation_assertion`。
- 返回 `assertion_handoff`、`bootstrap_status` 与原始 `assertion`。
- 为 create/assertion 两个入口统一大小写不敏感的 `Idempotency-Key` 读取。
- 保留现有 assertion 签发、校验、nonce replay 和设备绑定逻辑。

## 测试

- 扩展 `tests/contract/test_installation_bootstrap_api.py`。
- 覆盖 assertion handoff envelope、bootstrap status、AgentOps next action。
- 覆盖 lowercase `idempotency-key` header。

## 前端

- 新增 `selectedAssertionHandoff` 计算属性。
- 新增 `sdlc-assertion-handoff` Vue2 组件。
- 在详情页将 assertion handoff 接到 Bootstrap Handoff 之后。
- 更新 `frontend/scripts/verify-frontend.mjs` 静态守护。

## 风险控制

- 不改变 existing assertion 字段。
- 新增字段向后兼容。
- 不引入新外部依赖。
