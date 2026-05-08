# 016 Recommendation State 前端消费

## 背景

015 已新增后端 `recommendation_state` view model、API handler 与 OpenAPI contract。当前 C 端发现页的推荐决策面板仍在前端根据 catalog、安装申请和 AgentOps mock 摘要二次推导推荐状态，容易与后端契约漂移。

## 目标

- 前端推荐决策面板消费后端形状的 `recommendation_state` envelope。
- 面板展示后端返回的 `source_of_truth`、`trust_blockers`、`missing_evidence`、`next_best_action` 与 `actual_l5_display_allowed`。
- envelope 缺失时必须显式降级，不得在前端本地推导实际 L5 或伪造 AgentOps 结论。
- 补充前端静态验证和浏览器截图证据，覆盖推荐面板联动。

## 非目标

- 不接入真实网络 API、数据库或 AgentOps HTTP。
- 不新增个性化推荐排序、打分模型或用户画像。
- 不改变安装、激活和目录复核仍为可审计预览动作的边界。

## 验收标准

- `selectedRecommendationDecision` 优先读取 backend-shaped `recommendationStates` envelope。
- 前端能正确展示对象形态的 `source_of_truth` 和结构化 `trust_blockers`。
- envelope 缺失时返回 `recommendation_state_api` 缺失证据，且 `actual_l5_display_allowed=false`。
- `npm run verify`、JS 语法检查、相关 pytest、ruff、AI-SDLC dry-run 与正式 run 通过。
- 完成浏览器打开和截图检查，证明推荐面板可渲染。
