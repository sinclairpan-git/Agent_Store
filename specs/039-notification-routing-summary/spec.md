# Spec: Notification Routing Summary

038 已把权限失败页统一成可执行 action summary。039 承接 PRD 服务蓝图、跨项目导航和状态注册模板中的通知触点：安装、审批、反馈、生命周期、安全撤销等事件必须能路由到通知中心、待办中心、企微或风险列表，并保留审计与降级说明。

## Goals

- 新增 `notification_routing_summary.v1`，把 Store 事件投影为可展示、可审计的通知路由摘要。
- 覆盖 `installation_failed`、`approval_required`、`feedback_owner_replied`、`lifecycle_replacement_available`、`security_revoked` 五类近端通知事件。
- 输出通知状态、目标 channel、受众、通知规则、触达 SLA、审计字段和下一步动作。
- 缺少 trusted audience / audit / event identity 时降级为 `routing_blocked`，不得伪装成已通知。
- Store 只准备通知路由，不发送真实企微消息、不创建 AgentOps 审批、不替代风险处置系统。

## Non-Goals

- 不实现真实通知发送器、队列消费、企微 webhook 或待办中心持久化。
- 不修改既有 feedback、lifecycle、installation 或 permission contract 语义。
- 不用通知成功替代 AgentOps PolicyDecision、Approval、Evidence 或 Runtime 状态。

## Acceptance Criteria

- 单元测试覆盖五类事件、缺受众阻断、security revoked 强制 risk list、unsupported event 降级和 channel 去重。
- 合同测试覆盖 API envelope、idempotency、OpenAPI 枚举、target_system 和 routing source-of-truth。
- Contract Registry 新增 `notification_routing_summary.v1`，映射 CCT-024。
- Cross-project appendix 新增 CCT-024，并更新 Agent Store / AgentOps PRD required update 行。
