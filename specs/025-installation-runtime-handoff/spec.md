# 025 Installation Runtime Handoff

021 将 Runtime 分层后的 P0-D 归档为下一批需求：Installation / DeviceBinding 需要形成可被 Agent Runtime 消费的 handoff contract。022-024 已完成 AgentManifest、Runtime availability 和 HealthSummary freshness，本工作项承接安装激活事实向 Runtime 的只读交接。

## Scope

- 新增 `installation_runtime_handoff.v1` domain model 和 API handler。
- 新增 `installation-runtime-handoff.openapi.yaml`，冻结 Runtime handoff 输入、Store handoff 输出、状态枚举、artifact hash mismatch 和 source-of-truth。
- 将 Store-owned `Installation` 与 `DeviceBinding` 投影为 Runtime 可消费 envelope，包含 installation、device binding、runtime echo、issues、next action 和审计字段。
- 覆盖 Runtime echo 中 `installation_id`、`device_id`、`artifact_hash` 与 Store 事实不一致时的阻断状态。
- 更新 cross-project contract appendix，新增 Installation Runtime Handoff V1 与 CCT-011。

## Non-Goals

- 不实现真实 Agent Runtime HTTP 调用、Runtime process lifecycle、隔离执行或运行状态机。
- 不签发 CapabilityGrant、ReporterCredential、DeviceKey 或 AgentOps PolicyDecision。
- 不改变 AgentManifest runtime contract、Runtime availability summary 或 HealthSummary freshness 的职责边界。
- 不改变 Ai_AutoSDLC standalone 使用路径。

## Acceptance

- Store 中 installation 与 device binding 一致，且 Runtime echo 的 `artifact_hash` 匹配时，返回 `runtime_handoff_ready` 和 `runtime_consumption_allowed=true`。
- Runtime echo 或 device binding 的 `artifact_hash` 与 Store installation 不一致时，返回 `artifact_hash_mismatch`、`runtime_consumption_allowed=false`，下一步为 `regenerate_activation_command`。
- Runtime echo 的 `installation_id` 或 `device_id` 与 Store 事实不一致时，返回 `device_binding_mismatch`，下一步为 `restart_activation`。
- installation 或 device binding 不可消费时，返回 `installation_not_ready`，不得允许 Runtime 消费。
- 响应必须包含 `source_of_truth.installation=agent_store`、`source_of_truth.device_binding=agent_store`、`source_of_truth.package=agent_store`、`source_of_truth.runtime_consumption=agent_runtime_echo_or_request`、`source_of_truth.policy_decision=agentops`。
- OpenAPI contract 必须通过 contract parser，并记录 error response。

## Adversarial Review Synthesis

- Product / user-flow view：用户需要在 Runtime 侧消费安装事实前看到“可消费 / 包哈希不一致 / 设备绑定不一致 / 安装未就绪”的下一步动作，避免 Runtime 启动后才暴露 package mismatch。
- Governance / contract view：Runtime 可以消费 Store 的 installation 和 device binding，也可以回传 echo/request；但 Runtime 不得重写 Store registration facts，Store 也不得从 handoff 投影推导执行成功、PolicyDecision 或 CapabilityGrant。
