# 053 AgentManifest Runtime Frontend Consumer

022 已冻结 `agent_manifest_runtime_contract.v1`，023 又基于该合同生成 Runtime Availability 摘要。052 已补齐 Skill Registry lifecycle 在详情页的前端消费；本阶段继续把 AgentManifest Runtime contract 本身展示到 Agent 详情页，让 Owner / reviewer 在 Runtime availability 之前看到 Manifest 完整性、必需 Runtime capability、Runtime echo 缺口和 source-of-truth 边界。

## Scope

- 在前端 mock fixtures 中新增 `agentManifestRuntimeContracts`，覆盖 `runtime_compatible`、`runtime_capability_missing`、`manifest_incomplete` 和 `runtime_unknown`。
- 在 Vue root 中新增 `selectedAgentManifestRuntimeContract`，按当前 Agent 选择 AgentManifest Runtime 合同，并在缺失时保守降级为 `manifest_incomplete`。
- 新增企业 Vue2 组件 `sdlc-agent-manifest-runtime`，展示 contract schema、Manifest summary、Runtime capability echo、missing capabilities、source-of-truth、issue 和下一步动作。
- 更新静态 frontend verification，确保 `agent_manifest_runtime_contract.v1`、Manifest required field summary、Runtime echo read-only 边界和 no Runtime execution / no Grant / no quality inference 可被机器检查。

## Non-Goals

- 不实现真实 AgentManifest 编辑器、Runtime registry、Runtime probe、安装器或执行状态机。
- 不允许 Runtime 改写 AgentManifest、Package、Skill Registry 或 PolicyDecision 事实。
- 不签发 CapabilityGrant，不展示 Trace，不计算质量，不把缺失 Runtime echo 本地推导为兼容。

## Acceptance

- 页面必须展示 `agent_manifest_runtime_contract.v1`、`manifest_status`、`runtime_compatibility`、`required_runtime_capabilities`、`runtime_capabilities`、`missing_runtime_capabilities` 和 source-of-truth。
- `runtime_capability_missing` 必须展示缺失 capability 与 `view_missing_runtime_capabilities` / Runtime remediation 下一步。
- `manifest_incomplete` 必须展示 Manifest issue 与 `complete_agent_manifest`，不得显示为 Runtime compatible。
- `runtime_unknown` 必须显示需要 Runtime echo/probe，不得由前端自行判断兼容。
- 验证必须覆盖 frontend static check、相关 pytest/ruff、AI-SDLC truth sync/audit、dry-run/run 与浏览器验证。

## Adversarial Review Synthesis

- Product / reviewer view：Owner 需要在 Runtime availability 摘要之前看到 Manifest 合同本体是否完整、缺哪些 Runtime capability，以及该缺口如何影响上架和安装审核。
- Governance / contract view：022 的边界是 Store owns AgentManifest；Runtime echo/probe 只读消费和阻断，不得补齐或改写 Manifest，也不能由 Store UI 推导运行成功、Grant 或质量分。
