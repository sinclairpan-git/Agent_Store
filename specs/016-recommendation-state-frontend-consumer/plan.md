# 016 实施计划

1. 新增阶段文档，继承 015 后续建议并冻结本阶段边界。
2. 在前端 mock fixture 中加入后端响应形状的 recommendation state envelope。
3. 修改前端应用层，让推荐决策面板消费 envelope，并仅在缺失时显式降级。
4. 修改 Vue2 展示组件，支持 `source_of_truth` 对象和结构化 `trust_blockers`。
5. 更新前端静态验证，锁定 envelope 消费路径。
6. 运行本地验证、AI-SDLC close gate，并补浏览器截图证据。

## 风险与控制

- 风险：前端再次从 catalog 派生可信结论。
  控制：fallback 明确标记 `recommendation_state_envelope_missing`，并强制 `actual_l5_display_allowed=false`。
- 风险：结构化 blocker 渲染为 `[object Object]`。
  控制：组件增加格式化函数和静态校验。
- 风险：静态 mock 与后端契约漂移。
  控制：fixture 字段保持与 015 API response shape 对齐。
