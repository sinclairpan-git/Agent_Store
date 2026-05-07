# Plan: Cross-Project Contract Appendix

1. 梳理顶层 PRD、Agent Store PRD、AgentOps PRD 和当前实现差异。
2. 产出跨项目契约附录，先冻结三方共同字段和责任边界。
3. 新增 007 阶段 spec/plan/tasks，确保后续开发从统一契约继续。
4. 运行 AI-SDLC dry-run、关键契约搜索和 program validate。
5. 提交、推送、创建 PR，并按项目 PR 守护规则等待 Codex Review 和 GitHub checks。

## 风险控制

| 风险 | 控制 |
| --- | --- |
| 继续各项目单点修补导致字段漂移 | 先冻结 `agentops_credential_handoff.v1` 和 contract tests，再进代码实现。 |
| Agent Store 越权签发运行 credential | 文档明确 Credential/DeviceKey/IngestionToken 由 AgentOps 拥有。 |
| AgentOps 越权写注册事实 | 文档明确 Agent/Version/Skill/Installation 由 Agent Store 拥有。 |
| Ai_AutoSDLC standalone 被企业接入阻断 | contract test 保留 standalone regression。 |

