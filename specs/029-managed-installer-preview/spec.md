# 029 Managed Installer Preview

028 冻结了 AgentOps Policy / Approval echo-only 边界。本工作项承接 `029-managed-installer-preview`：建立托管安装器预览的最小状态机，展示下载、签名校验、隔离安装、smoke test 与失败诊断，但不执行真实安装。

## Scope

- 新增 `managed_installer_preview.v1` domain contract，消费 package trust、policy approval echo、installation runtime handoff 与可选 installer probe。
- 新增幂等 API facade，输出 preview-only installer state machine。
- 新增 OpenAPI contract，明确 `real_install_started=false` 与 `execution_mode=preview_only`。
- 单元与契约测试覆盖 ready、smoke passed、download blocked、signature blocked、policy blocked、runtime blocked、smoke failed 与 idempotency。

## Non-Goals

- 不下载包、不解压、不写文件、不运行真实 smoke test。
- 不签发 CapabilityGrant、不覆盖 AgentOps PolicyDecision。
- 不替代 003 Installation Workflow preview、025 Installation Runtime handoff 或 028 Policy Approval echo。

## Acceptance

- 响应必须包含五步：`download_artifact`、`verify_signature`、`create_isolated_install`、`smoke_test`、`failure_diagnostics`。
- 响应必须固定 `execution_mode=preview_only` 且 `real_install_started=false`。
- 签名/hash 未 verified/matched 时必须阻断在 `signature_blocked`。
- Policy echo 不是 `policy_allowed` 或 Runtime handoff 不是 `runtime_handoff_ready` 时不得进入安装预览通过态。
- Smoke test failed 必须返回可复制诊断引用。
- API 必须要求 `Idempotency-Key`，相同 key + 相同语义 payload 返回同一结果，相同 key + 不同 payload 返回 409。

## Adversarial Review Synthesis

- Product / user-flow view：用户需要看到安装器接下来会做什么，以及失败时能复制哪条诊断。
- Governance / contract view：安装器预览不能伪装成真实安装执行，不能在 Store 内发放 grant，不能绕过 Runtime handoff 或 AgentOps policy authority。
