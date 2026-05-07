# Plan: AgentOps Handoff Producer Contract

1. 建立 008 阶段规格与任务记录。
2. 新增跨项目 fixture 与 README，明确 producer/consumer 所有权。
3. 在 assertion domain 增加 AgentOps 外部导出 adapter。
4. 在 bootstrap API 返回中追加 handoff assertion 与 handoff template。
5. 用 CCT-001、CCT-003 前半段和单元测试固定字段与边界。
6. 执行本地验证，提交并提 PR，按项目守护规则自动合入。

## 风险控制

| 风险 | 控制 |
| --- | --- |
| Store 误生成 device proof | README 与测试明确 Ai_AutoSDLC 是 producer，API template 保持 `device_proof` 为空。 |
| Store 误推导 active | credential response 消费模型将 `credential_issued` 保持为 `activating`，等待签名测试事件。 |
| 破坏旧 API | 保留原 `assertion` 字段，仅追加 `agentops_handoff_assertion`。 |

