# Plan: Notification Routing Frontend Consumer

## Scope

消费 039 的 Store-owned notification routing summary，在前端详情页提供可读的路由解释和下一步动作，不扩展真实通知发送能力。

## Steps

1. 建立 040 阶段文档并挂入 program manifest。
2. 补充 `notificationRouting` 前端 fixture，覆盖 ready/degraded/blocked 与 security revoked risk list。
3. 在 Vue 根状态中新增选中 Agent 的 routing summary 选择器和 fallback。
4. 在企业 Vue2 adapter 中新增通知路由组件并接入 shell。
5. 更新样式和前端验证脚本。
6. 运行 AI-SDLC、前端和后端相关验证后提交。

## Risk Controls

- 所有 delivery status 均展示为 `not_sent`。
- 组件只触发可审计预览动作，不调用外部发送器。
- 缺可信受众或缺摘要时必须降级为 blocked。
