# 022 AgentManifest Runtime Contract

021 已将 Runtime 分层后的近期优先级归档为 P0-A 至 P0-E。本工作项承接 P0-A：冻结 Agent Store 生产、Agent Runtime 消费的 AgentManifest runtime contract，确保 Store 不会把缺少 Runtime 能力要求或与当前 Runtime 不兼容的 Agent 静默展示为可运行。

## Scope

- 新增 `agent_manifest_runtime_contract.v1` OpenAPI contract。
- 新增 AgentManifest runtime contract validation domain model 和 API handler。
- 覆盖 PRD P0 必填字段：`manifest_schema_version`、`agent_id`、`version`、`artifact_hash`、`runtime_contract_version`、`required_runtime_capabilities`、`skills`、`permission_intents`、`data_scopes`、`secret_refs`、`network_allowlist`、`observability_contract`、`guardrail_refs`、`rollback_policy`、`provenance`。
- 覆盖 Runtime capability mismatch：缺少必需 Runtime capability 时必须返回 `runtime_capability_missing`，并给出可执行下一步。
- 更新 cross-project contract appendix，明确 Agent Store 是 AgentManifest 事实源，Runtime 只消费和阻断，不重写 Manifest。

## Non-Goals

- 不实现真实 Runtime 调用、Runtime registry、安装器或执行状态机。
- 不发布 Agent、不创建 AgentVersion、不进入 `pending_review`。
- 不计算质量评分、不签发 CapabilityGrant、不展示 Trace。
- 不替代 018 Package Validation；本工作项只覆盖 Runtime-facing Manifest 契约。

## Acceptance

- 完整 Manifest + 满足能力的 Runtime 返回 `runtime_compatible`，下一步为继续发布/审核。
- 缺 `required_runtime_capabilities`、`runtime_contract_version` 或 `observability_contract` 时返回 manifest issue，且不得标记为可运行。
- Runtime 缺少 `policy_check` / `outbox` / `basic_isolation` 等必需能力时返回 `runtime_capability_missing`，issue 字段定位到 `runtime.capabilities`。
- 响应必须包含 `source_of_truth.agent_manifest=agent_store` 和 `source_of_truth.runtime_availability=agent_runtime_echo_or_probe`。
- OpenAPI contract 必须通过 contract parser，并记录 error response。

## Adversarial Review Synthesis

- Product / user-flow view：缺 Runtime 能力时，用户看到的应该是“需要升级 Runtime / 查看缺失能力”，而不是“安装成功但运行失败”。因此 contract 需要直接产生下一步动作。
- Governance / contract view：Runtime 只消费 Store 的 Manifest 和 Installation facts；Runtime 可以阻断运行并回传 availability summary，但不得改写 Manifest 字段或补齐权限声明。

