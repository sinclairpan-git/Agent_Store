# 017 实施计划

1. 建立 017 阶段文档，继承 016 后续建议并冻结本阶段边界。
2. 将 recommendation state envelope 从浏览器 mock 数据迁移到本地 API fixture。
3. 在前端静态服务器中新增 recommendation state API resolver。
4. 修改 Vue2 应用层，按 Agent 选择通过 HTTP fetch 加载 envelope，并写入响应式缓存。
5. 更新前端静态验证，覆盖 API route、fixture shape、fetch 路径和 fallback。
6. 运行本地验证、AI-SDLC close gate，并补浏览器渲染证据。

## 风险与控制

- 风险：首屏 fetch 完成前面板短暂显示降级状态。
  控制：降级状态明确标记 `recommendation_state_envelope_missing`，且不展示实际 L5。
- 风险：API route 与静态文件路由互相吞路径。
  控制：API resolver 在静态文件 resolver 前执行，并为非 API 路径返回 `null`。
- 风险：fixture 再次漂移为前端全局事实源。
  控制：静态验证要求 `mock-data.js` 不包含 `recommendationStates:`。
