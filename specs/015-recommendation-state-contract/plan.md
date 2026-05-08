# 015 实现计划

## Constitution 对齐

- Persist decisions to the repository：新增阶段规格、计划、任务、执行日志和总结。
- Prefer contract-level verification before closure：先以 OpenAPI 和 contract/unit tests 固化推荐决策响应。
- Keep docs and code traceable：实现范围绑定 014 后续建议与阶段 1 FR-016、FR-023、FR-024、FR-027 的事实源边界。

## 方案

1. 新增 `agent_store.ui.recommendation_state`，把 catalog source、package trust、enterprise context 与 AgentOps summary 聚合成推荐决策。
2. 新增 `agent_store.api.recommendation_state`，提供纯 Python handler，保持不绑定 Web 框架。
3. 新增 `recommendation-state.openapi.yaml`，并纳入现有 contract loader 的 envelope 校验。
4. 增加单元和合同测试，覆盖推荐、激活、阻断、AgentOps unavailable 和 not found。
5. 同步 `program-manifest.yaml` truth snapshot。

## 风险与约束

- 推荐状态只解释目录和 AgentOps summary 的已知事实，不声称真实个性化推荐。
- `actual_l5_display_allowed` 只能来自 AgentOps L5 gate；缺失或 degraded 时必须为 false。
- 下一步动作仍是 action contract，不执行真实安装、激活或 AgentOps 网络调用。
