# Plan: Notification Routing Summary

1. 运行 AI-SDLC adapter status 与 dry-run，确认治理入口可用。
2. 冻结 `notification_routing_summary.v1` OpenAPI contract。
3. 新增 domain projector：输入 Store event + audience context，输出 UI-safe notification routing summary。
4. 新增幂等 API facade，覆盖 request validation 与 idempotency conflict。
5. 更新 Contract Registry、cross-project appendix 和 program manifest truth。
6. 运行单元、契约、ruff、AI-SDLC dry-run / run 验证。

## Risks

- 风险：通知路由被误读为通知已发送。
  Control: 响应区分 `routing_ready` 与 `delivery_confirmed`，本阶段永远不返回已发送状态。
- 风险：安全撤销未进入风险列表。
  Control: `security_revoked` 强制包含 `risk_list` channel，否则返回 blocked issue。
- 风险：缺少受众或 audit 时仍准备通知。
  Control: 缺 trusted audience、event id 或 audit id 时降级为 `routing_blocked`。
