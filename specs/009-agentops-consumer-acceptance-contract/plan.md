# Plan: AgentOps Consumer Acceptance Contract

## 实施步骤

1. 阅读阶段 007/008 输出和当前 appendix，确认 Agent Store 008 已冻结 producer 侧 fixtures。
2. 将 AgentOps 016 consumer acceptance 写入 appendix，覆盖 schema、assertion、device proof、绑定关系、response echo 和非目标。
3. 增加 contract test，防止后续删除或弱化 AgentOps 016 关键约束。
4. 运行 AI-SDLC dry-run、目标测试、全量测试与 ruff。
5. 按项目规则提交、push、提 PR、触发 `@codex review`，启动 heartbeat 守护。

## 风险与控制

- 风险：把 AgentOps 职责写进 Agent Store runtime。
  控制：本阶段只改文档和 contract test，不修改运行时代码。
- 风险：response echo 被 Store 误解为本地 active 推导。
  控制：appendix 和测试同时锁定“AgentOps producer，Store echo consumer”。
- 风险：AgentOps 016 与 Store 008 fixture 漂移。
  控制：要求 AgentOps vendor fixtures 时记录来源 commit 或 checksum。
