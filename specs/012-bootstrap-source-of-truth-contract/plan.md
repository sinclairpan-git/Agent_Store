# Plan: Bootstrap Source Of Truth Contract

## 决策

- 沿用现有 `BootstrapStatus`，直接在响应层增加 source metadata，避免新增独立状态服务。
- `source_conflicts` 只表达被裁决覆盖的外部信号，不改变主状态和 timeline。
- 前端使用轻量 `sdlc-source-facts` 组件展示来源，不引入新页面。

## 风险与控制

| 风险 | 控制 |
| --- | --- |
| 前端继续只读 `current_step` | 在同一企业激活区展示 `source_of_truth` 和 `conflict_resolution`。 |
| AgentOps echo 被错误套到其他 installation | 011 已补 identity match；012 将其作为入口证据返回。 |
| 冲突裁决不可审计 | `source_conflicts` 保留被覆盖信号和来源。 |

## 验证

- Contract tests 覆盖默认 Store source、AgentOps source、Store expired 覆盖 AgentOps echo。
- OpenAPI parse test 确认 schema 可读。
- Frontend verify 确认 source facts 组件和 mock 字段存在。
