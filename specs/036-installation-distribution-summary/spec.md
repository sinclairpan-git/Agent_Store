# 036 Installation Distribution Summary

035 完成了 Store 到 AgentOps Run Detail 的脱敏深链。036 承接 PRD 阶段 4 “安装分布、反馈闭环、质量/证据增强回显”中的安装分布部分：Owner 需要看到某个 Agent / 版本的安装状态、OS、企业接入状态和通知影响范围，但 Store 不得暴露个人安装明细，也不得在本地计算质量。

## Scope

- 新增 `installation_distribution_summary.v1` domain/API projection。
- 聚合 Store-owned installation inventory，输出 status、OS、version、enterprise_state 分布。
- 输出 notification impact summary，供 Owner 后续通知受影响用户。
- 新增 OpenAPI contract、unit/API contract tests 和 parser assertions。
- 更新 Contract Registry traceability 与 cross-project appendix，新增 CCT-021。

## Non-Goals

- 不实现真实数据库查询、趋势图 UI、通知发送器或 AgentOps webhook。
- 不返回个人 user、device_id、installation_id 明细。
- 不计算质量、不替代 AgentOps HealthSummary / EvidenceSummary。

## Acceptance

- Owner 有权限且 inventory 存在时返回 `distribution_ready` 与聚合计数。
- 无权限 viewer 返回 `permission_required`，不得暴露任何分布计数。
- 空 inventory 返回 `distribution_unavailable`，下一步为刷新 Store inventory。
- 输入含 user/device 明细时，响应必须保持 `individual_users_exposed=false`、`device_ids_exposed=false` 并返回 `INDIVIDUAL_IDENTIFIERS_STRIPPED`。
- Contract Registry 可追踪 producer、consumer、CCT-021 和 contract tests。
