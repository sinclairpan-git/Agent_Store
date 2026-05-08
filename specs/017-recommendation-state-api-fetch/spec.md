# 017 Recommendation State API Fetch

## 背景

016 已让前端推荐决策面板消费 backend-shaped recommendation state envelope，但 envelope 仍预置在 `window.AgentStoreMock` 中。下一阶段需要把推荐状态切换为 HTTP API 获取，让前端路径更接近真实后端契约，同时保留 envelope 缺失时的显式降级。

## 范围

- 新增本地前端 API route：`/api/v1/agents/{agent_id}/recommendation-state`。
- 将 recommendation state envelope 从浏览器全局 mock 中移出，改由 API fixture 提供。
- 前端启动和 Agent 切换时通过 `fetch` 拉取推荐状态，并写入 Vue 响应式缓存。
- API 请求失败、404 或浏览器不支持 `fetch` 时，推荐决策面板继续显示 016 的 `recommendation_state_envelope_missing` 降级状态。
- 更新静态验证，锁定 API route、fetch 路径和 envelope fallback 边界。

## 非目标

- 不引入真实 Python Web 框架或跨进程后端服务。
- 不让前端本地推导实际 L5、包可信或 AgentOps 结论。
- 不执行真实安装、激活、AgentOps 调用或 credential 申请。

## 验收

- `frontend/src/mock-data.js` 不再暴露 `recommendationStates`。
- `frontend/server.mjs` 能返回 backend-shaped recommendation state envelope。
- `frontend/src/app.js` 使用 `window.fetch` 填充 recommendation state cache。
- 静态验证覆盖 API fixture、API resolver、前端 fetch 与缺失状态降级。
