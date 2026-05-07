# Tasks: AgentOps Handoff Producer Contract

- [x] T008-01 新增阶段 spec/plan/tasks。
- [x] T008-02 新增跨项目 fixtures 和 README 边界声明。
- [x] T008-03 增加 `SignedInstallationAssertion.to_agentops_handoff_assertion()`。
- [x] T008-04 bootstrap assertion API 追加 AgentOps handoff 视图。
- [x] T008-05 增加 CCT-001 与 CCT-003 前半段测试。
- [x] T008-06 执行本地验证并准备提交、推送、创建 PR 与守护。

## 后续实施拆分

- AgentOps 后续阶段：实现完整 `agentops_credential_handoff.v1` consumer 与 credential issue response producer。
- Ai_AutoSDLC 后续阶段：实现 `device_proof.v1` producer、credential 存储与签名测试事件。
