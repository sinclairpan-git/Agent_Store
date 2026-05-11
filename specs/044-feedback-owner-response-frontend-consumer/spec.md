# 044 Feedback Owner Response Frontend Consumer

030 已冻结 `feedback_owner_response_loop.v1` 后端投影，约束 submitted -> triaged -> owner_replied -> planned/fixed/rejected -> released 的产品闭环。043 补齐 Owner 安装分布视角后，本工作项继续补齐反馈与 Owner 回复闭环的前端消费，让 Agent 详情页可以解释当前反馈状态、Owner 承诺、release linkage 和可执行下一步。

## Scope

- 在前端 fixture 中新增 `feedbackOwnerResponseLoops`，覆盖 triaged、owner_replied、released 和 blocked owner response 四类状态。
- 在 Agent 详情页新增“反馈闭环”面板，展示 `feedback_owner_response_loop.v1` 的状态、上一步、transition action、feedback snapshot、Owner response、release linkage、timeline、source-of-truth、issue 和 next action。
- 缺摘要时保守降级为 `submitted`，只显示返回 feedback queue / request owner response 路径。
- 前端验证必须覆盖 Owner-only 动作、release link requirement、timeline audit/trace、no comments/ranking/commercial marketplace、no real notification send。

## Non-Goals

- 不实现评论系统、排行、商业化 marketplace 运营。
- 不发送真实通知、不生成 release notes、不修改 AgentVersion。
- 不把 feedback loop 作为 AgentOps policy、Runtime evidence 或质量事实源。

## Acceptance

- triaged 状态显示请求 Owner 回复下一步。
- owner_replied 状态显示 Owner message / commitment，并展示 plan or reject 下一步。
- released 状态展示 release_ref / release_version / released_at，下一步为查看 release notes。
- 非 Owner 执行 owner reply 时展示 `OWNER_RESPONSE_REQUIRED`，按钮 disabled。
- 静态前端验证覆盖 fixture、组件注册、shell prop、timeline、issue、source-of-truth 和 non-goal 边界。
