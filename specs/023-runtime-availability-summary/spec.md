# 023 Runtime Availability Summary

021 将 Runtime 分层后的 P0-B 归档为下一批需求：Agent Store 必须消费 Runtime echo/probe，并展示“缺 Runtime / 需升级 / 缺能力 / 可运行”等可解释状态。本工作项承接 022 的 AgentManifest runtime contract，不实现 Runtime 本身。

## Scope

- 新增 `runtime_availability_summary.v1` domain model 和 API handler。
- 新增 `runtime-availability.openapi.yaml`，冻结 Runtime echo/probe 输入、Store summary 输出、状态枚举和 source-of-truth。
- 将 AgentManifest `runtime_contract_version`、`required_runtime_capabilities` 与 Runtime echo 的 `runtime_contract_version`、`capabilities` 做只读匹配。
- UI 增加 Runtime 可用性摘要，展示 machine state、中文展示、原因、缺失能力、下一步动作、事实源和审计字段。
- 更新 cross-project contract appendix，明确 Agent Store 只投影 Runtime 可用性摘要，不执行 Agent、不补写 Runtime 事实。

## Non-Goals

- 不实现真实 Runtime registry、Runtime HTTP 调用、Agent 执行或运行状态机。
- 不签发 CapabilityGrant、不计算质量评分、不覆盖 AgentOps PolicyDecision。
- 不引入 HealthSummary freshness 规则；`valid_until` 过期保护留给 024。
- 不改变 Ai_AutoSDLC standalone 使用路径。

## Acceptance

- 没有 Runtime echo/probe 时返回 `runtime_missing`，下一步为安装或配置 Runtime。
- Runtime contract 版本低于 AgentManifest 要求时返回 `runtime_upgrade_required`。
- Runtime 缺少必需 capability 时返回 `runtime_capability_missing`，并列出 `missing_runtime_capabilities`。
- Runtime 版本与能力满足 AgentManifest 时返回 `runtime_ready`，下一步允许继续上架/安装审核。
- 响应必须包含 `source_of_truth.agent_manifest=agent_store`、`source_of_truth.runtime_availability=agent_runtime_echo_or_probe`、`source_of_truth.policy_decision=agentops`。
- UI 不得把 Runtime 摘要扩展成完整 Trace、执行状态或 L5 判断。

## Adversarial Review Synthesis

- Product / user-flow view：用户需要在上架或安装前看到“缺 Runtime / 需升级 / 缺能力 / 可运行”的下一步动作，避免安装后才发现运行不可用。
- Governance / contract view：Runtime availability 是 Runtime echo/probe 事实；Store 只能做展示投影和路由，不得改写 AgentManifest、Runtime facts、PolicyDecision 或运行结果。
