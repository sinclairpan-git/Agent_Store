# 015 任务清单

- [x] 新增 recommendation state view model。
  - 验收：输出推荐状态、解释、阻断项、缺失证据、下一步动作、事实源、trace/audit。
- [x] 新增 RecommendationStateAPI。
  - 验收：已知 Agent 返回 `OK` envelope；未知 Agent 返回治理型 404。
- [x] 新增 OpenAPI 契约。
  - 验收：contract loader 覆盖 `recommendation-state.openapi.yaml`。
- [x] 增加正负向测试。
  - 验收：AgentOps unavailable 不得默认实际 L5；blocked 状态给出治理 review 动作。
- [x] 跑完整验证并同步 truth snapshot。
