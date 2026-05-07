# Tasks: Cross-Project Contract Appendix

- [x] T007-01 梳理三项目现有边界与偏差。
- [x] T007-02 新增跨项目契约附录。
- [x] T007-03 定义 handoff、assertion、device proof 和 credential response 字段。
- [x] T007-04 定义状态 crosswalk 和 consumer-driven contract tests。
- [x] T007-05 明确三项目 PRD/spec 后续修改点。
- [x] T007-06 执行本地验证并提交 PR。

## 后续实施拆分

- Agent Store 后续阶段：实现 `agentops_credential_handoff.v1` producer/adapter。
- AgentOps 后续阶段：实现 `signed_installation_assertion.v1` consumer/credential adapter。
- Ai_AutoSDLC 后续阶段：实现 `device_proof.v1`、credential 存储和签名测试事件。
