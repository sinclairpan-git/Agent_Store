# 052 Plan

消费 019 / 020 的 `skill_registry.v1` 与 Skill Registry notification contracts，在 Agent 详情页提供只读生命周期状态，不扩展真实 registry persistence、AgentOps webhook 或发布后台。

1. 建立 052 阶段文档并挂入 program manifest。
2. 新增前端 `skillRegistryLifecycle` mock fixtures，覆盖发布、废弃、安全撤销和注册阻断。
3. 新增 Vue root selector，按当前 Agent 映射 Skill Registry 决策，缺 envelope 时保守降级。
4. 新增企业 Vue2 面板与样式，展示 registry record、event、AgentOps consumption、ack receipt 和边界。
5. 更新前端静态验证并运行本地、浏览器和 AI-SDLC 治理验证。

## Risks

| Risk | Control |
| --- | --- |
| AgentOps ack 被误解为 Skill 状态事实 | 面板和 verify 明确 `AgentOps ack is receipt-only` |
| 前端绕过 Package Validation / Owner approval | registration_blocked fixture 与 fallback 固定 `return_to_validation` |
| security_revoked 被降级为 deprecated | security revoked 文案和 fixture 保留 evidence ref 与终态边界 |
