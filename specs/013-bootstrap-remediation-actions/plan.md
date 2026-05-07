# Plan: Bootstrap Remediation Actions

## 决策

- 复用 `ActionDescriptor`，新增 `recommended_actions` 数组，避免引入第二套动作模型。
- 保留 `primary_action` / `secondary_actions` 兼容旧调用方，前端新增动作链展示。
- 推荐动作只描述可执行入口和责任系统，不在 Agent Store 内部伪造 AgentOps credential 或 Ai_AutoSDLC device proof。

## 风险与控制

| 风险 | 控制 |
| --- | --- |
| Store 越界承担 AgentOps 职责 | AgentOps 相关动作 `target_system=agentops`，只展示入口。 |
| Store 越界生成 device proof | CLI 相关动作 `target_system=ai_autosdlc_cli`，Store 不生成 proof。 |
| blocked 状态没有恢复路径 | contract tests 覆盖 expired、failed、permission denied。 |
| 前端继续只展示 primary action | `sdlc-remediation-actions` 展示完整 `recommended_actions`。 |

## 验证

- Contract tests 断言各状态推荐动作 ID、owner system 和权限标记。
- OpenAPI parse test 确认 `recommended_actions` schema 可读。
- Frontend verify 确认组件注册、mock 字段和关键 action id 存在。
