# 054 Installation Runtime Handoff Frontend Consumer

025 已冻结 `installation_runtime_handoff.v1`，将 Store-owned Installation 与 DeviceBinding 投影为 Agent Runtime 可消费的只读 handoff。053 已让 AgentManifest Runtime contract 在详情页独立可见；本阶段继续补齐 Installation Runtime Handoff 的前端消费，让 Owner / reviewer 在托管安装预览前看到 Runtime 是否可消费安装事实，以及 artifact hash、device binding、installation status 的阻断原因。

## Scope

- 在前端 mock fixtures 中新增 `installationRuntimeHandoffs`，覆盖 `runtime_handoff_ready`、`artifact_hash_mismatch`、`device_binding_mismatch` 和 `installation_not_ready`。
- 在 Vue root 中新增 `selectedInstallationRuntimeHandoff`，按当前 Agent 选择 Runtime handoff，并在缺失时保守降级为 `installation_not_ready`。
- 新增企业 Vue2 组件 `sdlc-installation-runtime-handoff`，展示 installation fact、device binding、runtime echo、runtime consumption allowance、source-of-truth、issue 和下一步动作。
- 更新静态 frontend verification，确保 `installation_runtime_handoff.v1`、Runtime echo read-only、no Runtime process、no CapabilityGrant 和 no PolicyDecision 边界可被机器检查。

## Non-Goals

- 不实现真实 Agent Runtime HTTP 调用、Runtime process lifecycle、隔离执行、安装状态机或 smoke test。
- 不签发 CapabilityGrant、ReporterCredential、DeviceKey 或 AgentOps PolicyDecision。
- 不允许 Runtime 改写 Store-owned Installation、DeviceBinding、Package 或 PolicyDecision 事实。
- 不改变 Ai_AutoSDLC standalone 使用路径。

## Acceptance

- 页面必须展示 `installation_runtime_handoff.v1`、`handoff_state`、`runtime_consumption_allowed`、`installation`、`device_binding`、`runtime_echo`、issues 和 source-of-truth。
- `runtime_handoff_ready` 必须显示 Runtime 可消费，但仍明确 Store 不启动 Runtime process。
- `artifact_hash_mismatch` 必须显示 runtime echo/package hash 不一致和 `regenerate_activation_command`。
- `device_binding_mismatch` 必须显示 Runtime echo device/installation binding 不一致和 `restart_activation`。
- `installation_not_ready` 必须显示 `review_installation_status`，不得允许 Runtime 消费。
- 验证必须覆盖 frontend static check、相关 pytest/ruff、AI-SDLC truth sync/audit、dry-run/run 与浏览器验证。

## Adversarial Review Synthesis

- Product / user-flow view：用户需要在托管安装预览或 Runtime 激活前看到 handoff 是否可消费，以及是包 hash、设备绑定还是安装状态阻断。
- Governance / contract view：025 的边界是 Runtime 只读消费 Store Installation / DeviceBinding facts；Runtime echo 可以阻断，但不得改写 Store facts，Store UI 也不能推导执行成功、PolicyDecision 或 CapabilityGrant。
