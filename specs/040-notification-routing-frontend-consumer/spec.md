# Spec: Notification Routing Frontend Consumer

039 已交付 `notification_routing_summary.v1` 后端投影。040 负责把该摘要接到 Agent Store 前端详情页，让通知中心、待办中心、企微和风险列表的路由状态可以被 Owner 读懂，同时保持 Store 不发送真实通知的边界。

## Goals

- 在前端 mock/API fixture 中暴露 `notificationRouting`，覆盖 `routing_ready`、`routing_degraded` 和 `routing_blocked` 三类展示状态。
- 在 Agent 详情页新增“通知路由”面板，展示事件类型、delivery status、trusted audience、channels、issues、source-of-truth、audit 和 next action。
- 所有 route 的 `delivery_status` 必须保持 `not_sent`，避免把路由摘要误展示为真实触达结果。
- `security_revoked` 场景必须显示 `risk_list` channel 和可信受众缺口。
- 前端验证脚本必须覆盖 fixture、Vue 根状态、shell prop、组件注册和关键文案。

## Non-Goals

- 不实现真实通知发送、企微 webhook、队列消费、待办中心持久化或风险系统写入。
- 不新增后端 notification contract，不修改 039 API 语义。
- 不用通知路由摘要替代 AgentOps 审批、PolicyDecision、Evidence 或 Runtime 状态。

## Acceptance Criteria

- `frontend/src/mock-data.js` 包含可展示的 `notification_routing_summary.v1` fixture，并覆盖 ready/degraded/blocked。
- `frontend/src/app.js` 为选中 Agent 输出 `selectedNotificationRouting`，缺摘要时保守降级为 `routing_blocked`。
- `frontend/src/sdlc-enterprise-vue2.js` 注册 `sdlc-notification-routing` 并接入 `sdlc-shell`。
- `frontend/index.html` 将 `selectedNotificationRouting` 传入 shell。
- `frontend/scripts/verify-frontend.mjs` 对本阶段新增 UI/fixture 边界进行静态验证。
