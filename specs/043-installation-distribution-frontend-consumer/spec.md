# 043 Installation Distribution Frontend Consumer

036 已冻结 `installation_distribution_summary.v1` 后端投影，并在 Contract Registry 中声明 Agent Store UI 是消费者。040-042 已分别消费通知路由、权限失败和质量证据摘要；本工作项补齐 036 的前端消费，让 Owner 在 Agent 详情页看到安装分布聚合状态。

## Scope

- 在前端 fixture 中新增 `installationDistribution`，覆盖 ready、permission required、distribution unavailable 和 empty distribution。
- 在 Agent 详情页新增“安装分布”面板，展示合同版本、分布状态、权限状态、安装总量、状态/OS/版本/企业状态聚合、通知影响、隐私边界、source-of-truth、issue 和 next action。
- 缺摘要时保守降级为 `distribution_unavailable`，只给出刷新 Store inventory 动作。
- 前端验证必须覆盖不展示 individual user、device_id、installation_id 明细，不计算质量、不发送通知。

## Non-Goals

- 不实现真实数据库查询、趋势图、通知发送器、AgentOps webhook 或安装明细导出。
- 不暴露个人 user、device_id、installation_id。
- 不在 Store 前端计算质量，不替代 AgentOps HealthSummary / EvidenceSummary。

## Acceptance

- Owner 有权限且聚合存在时，面板展示 `distribution_ready` 和聚合计数。
- 无权限 viewer 只看到 `permission_required` 与申请权限动作，不展示安装数量。
- 空 inventory 显示 `distribution_unavailable` 与刷新动作。
- 空版本范围显示 `empty_distribution`，不得把它误读为无风险 0 安装。
- 静态前端验证覆盖 fixture、组件注册、shell prop、隐私边界和 action 文案。
