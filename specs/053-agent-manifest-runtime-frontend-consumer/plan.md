# 053 Plan

消费 022 的 `agent_manifest_runtime_contract.v1`，在 Agent 详情页提供只读 Manifest Runtime 合同状态，不扩展真实 Runtime probe、Manifest editor、CapabilityGrant 或质量计算。

1. 建立 053 阶段文档并挂入 program manifest。
2. 新增前端 `agentManifestRuntimeContracts` mock fixtures，覆盖兼容、缺 Runtime 能力、Manifest 不完整和 Runtime 未探测。
3. 新增 Vue root selector，按当前 Agent 映射 Manifest Runtime 合同，缺 envelope 时保守降级。
4. 新增企业 Vue2 面板与样式，展示 Manifest required fields、Runtime capability echo、missing capabilities、source-of-truth 和边界。
5. 更新前端静态验证并运行本地、浏览器和 AI-SDLC 治理验证。

## Risks

| Risk | Control |
| --- | --- |
| Runtime echo 被误解为可改写 Manifest | 面板和 verify 明确 `Runtime echo is read-only` |
| 前端本地推导 runtime compatible | `runtime_unknown` fixture 与 fallback 固定需要 `check_runtime_capabilities` |
| Manifest incomplete 被误展示为可运行 | component tone / issue / next action 固定 `complete_agent_manifest` |
