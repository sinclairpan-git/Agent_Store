# 014 Agent Store C 端产品化发现体验

## 背景

阶段 1 已完成可信最小闭环，但当前前端体验更接近治理控制台：用户可以看到 Agent 列表、筛选、安装/激活预览和证据状态，却缺少 C 端 Agent Store 应有的发现、决策、推荐与下一步行动路径。

## 目标

本阶段将 Agent Store 首页推进为可消费的产品发现体验：

- 用户进入页面即可看到推荐集合、可安装集合、企业激活集合和受治理阻断集合。
- Agent 卡片必须展示使用场景、适配对象、预计接入成本、采用度与明确的下一步动作。
- 详情页必须把“为什么选择 / 需要满足什么 / 完成后得到什么”表达清楚。
- 推荐与可信展示只能来自目录或 AgentOps mock truth，前端不得从 `trust_state` 等字段推断真实 L5、签名或 credential 结果。
- 移动端不得出现横向溢出或按钮/文本互相遮挡。

## 非目标

- 不实现真实推荐算法、排序模型或个性化学习。
- 不接入真实 HTTP 后端、IAM、KMS、数据库或 AgentOps 网络调用。
- 不实现真实安装、升级、卸载、回滚。
- 不开放用户评分写入、评论发布或运营后台。

## 验收标准

- 前端暴露 discovery collection 状态，支持推荐、即装、本地、企业激活、治理关注等集合切换。
- Agent 卡片显示 `audience`、`setup_minutes`、`adoption`、`rating_summary`、`product_tags` 等产品化字段。
- 详情页新增决策面板，展示 fit reasons、requirements、outcomes 与主动作。
- 静态前端校验覆盖新增产品化字段、组件和“前端不推断可信事实”的约束。
- `ai-sdlc run --dry-run`、`frontend` 校验、相关 pytest 与 ruff 通过。
