# Agent Store 后续规划阶段归档

> 归档日期：2026-05-09  
> 归档范围：Agent Store 后续规划、Runtime 分层后的 P0 收紧、阶段 2 以后拆分顺序  
> 来源 PRD：`Agent_Store_项目_PRD.md`、`Agent_Store_AgentOps_AiSDLC_应用底座顶层规划_PRD.md`、`Agent_Runtime_项目_PRD.md`、`AgentOps_项目_PRD.md`、`Ai_AutoSDLC_框架改造_PRD.md`

## 1. 归档结论

Agent Store 后续规划归档为一个主线：

```text
可信供给事实源
  -> AgentManifest / Package / Skill / Installation
  -> 安装激活与 Runtime 可用性摘要
  -> AgentOps Evidence / Health / Policy / Approval 摘要回显
  -> 上架、安装、反馈、升级、下架、禁用生命周期治理
```

边界冻结：

- Agent Store 管 Agent 从哪里来、怎么发布、怎么安装、怎么升级和下架。
- Agent Runtime 管 Agent 怎么跑，不由 Store 执行 Agent 或生产 Trace。
- AgentOps 管治理、PolicyDecision、CapabilityGrant、Approval、EvidenceSummary、HealthSummary 和质量评测。
- Ai_AutoSDLC 管标准 SDLC 证据生产，必须继续 standalone 可用。

## 2. AI-SDLC 约束归档

后续所有拆分必须遵守以下约束：

| 约束 | 归档规则 |
|---|---|
| 决策入库 | 阶段判断、非目标、边界和验收口径必须写入 `docs/` 或 `specs/` |
| 契约优先 | 涉及跨项目事实源时，先冻结 schema / OpenAPI / fixture / contract test，再做 UI 或服务实现 |
| 可追踪 | 每个工作项必须能追踪到 PRD 阶段、Domain Owner、Producer、Consumer 和验收指标 |
| 不越界 | Store 不计算质量、不签发 Grant、不展示完整 Trace、不执行 Agent |
| 不破坏 standalone | Ai_AutoSDLC 的 dry-run、run、本地报告不得依赖 Store / Runtime / Ops |
| 状态可解释 | 状态必须包含 machine value、中文展示、原因、下一步动作、事实源和审计字段 |
| 收尾验证 | 每个实现类工作项 close 前至少执行 `ai-sdlc run --dry-run`，按变更范围执行 pytest / ruff / frontend verify |

## 3. 阶段归档矩阵

| 阶段 | 归档状态 | 已落地或已冻结 | 后续处理规则 |
|---|---|---|---|
| 阶段 0：标准、体验与可行性确认 | 已归档为基线 | PRD 边界、核心旅程、统一状态语义、跨项目契约、Contract Registry 口径 | 不再新增功能性开发；如边界变化，先开变更型 spec |
| 阶段 1：可信最小闭环 | 已归档为本地可验证闭环 | `001` 至 `017` 覆盖官方页、安装申请、bootstrap、assertion、AgentOps echo、推荐状态等第一阶段切片 | 保留非目标：不声明完整托管安装器、真实生产 HTTP、自动升级或完整质量评分 |
| 阶段 2：上架向导与包校验 | 进行中 | `018` 包校验报告、`019` Skill Registry 生命周期、`020` Skill Registry AgentOps 通知 | 下一步补齐 AgentManifest / Runtime 能力校验、上架向导 UI、草案提交审核 |
| 阶段 3：运行时注册联动与权限治理 | 待启动 | PRD 已冻结安装器、Runtime 可用性摘要、Policy Check 回显、审批闭环口径 | 必须等 Runtime 分层 P0 契约可消费后启动实现 |
| 阶段 4：安装分布、反馈与质量证据增强 | 待启动 | PRD 已冻结 EvidenceSummary / HealthSummary 回显和反馈闭环 | 只展示 AgentOps 摘要，不在 Store 本地推导质量 |
| 阶段 5：生命周期治理 | 待启动 | PRD 已冻结升级、回退、下架、禁用、替代版本、运营后台目标 | 必须建立影响范围、替代版本和吊销传播 contract test |
| 阶段 6：生态自优化 | 暂不进入 Agent Store 当前执行队列 | 顶层 PRD 保留框架与 Agent 生态优化方向 | 不进入当前 repo 的近端 backlog，避免稀释 P0/P1 治理闭环 |

## 4. Runtime 分层后的优先级调整

2026-05 Runtime 分层后，Agent Store 阶段 2 不能只继续做上架表单；必须先补一组 P0 供给契约，让 Runtime / Ops 能稳定消费 Store 事实。

| 优先级 | 工作包 | 原因 |
|---|---|---|
| P0-A | AgentManifest contract and validation | Runtime 必须消费 `runtime_contract_version`、`required_runtime_capabilities`、`permission_intents`、`observability_contract` 等字段 |
| P0-B | Runtime availability summary consumer | Store 需要展示“缺 Runtime / 需升级 / 缺能力 / 可运行”等下一步动作 |
| P0-C | HealthSummary freshness guard | Store 展示健康摘要必须带 `valid_until`，过期后只能显示“待刷新” |
| P0-D | Installation / DeviceBinding Runtime handoff | 安装激活事实需要同时服务 Runtime、Ops、Ai_AutoSDLC |
| P0-E | Contract Registry traceability appendix | 变更必须能追踪 Producer / Consumer / Owner / contract test |

## 5. 拆分索引

后续执行按以下工作项拆分，编号为规划建议，实际创建时可根据 repo 当前最大编号递增：

| 建议编号 | 工作项 | 所属阶段 | 类型 | 主要验收 |
|---|---|---|---|---|
| 021 | Roadmap phase archive and decomposition | 阶段归档 | 文档 / 规划 | 阶段归档、AI-SDLC 约束、后续工作包索引入库 |
| 022 | AgentManifest runtime contract | 阶段 2 / Runtime 分层 P0 | 契约优先 | Manifest 必填字段、缺字段错误码、Runtime capability mismatch contract test |
| 023 | Runtime availability summary | 阶段 2 / Runtime 分层 P0 | 后端契约 + UI 摘要 | Store 展示 Runtime 缺失、版本过低、缺能力、可运行状态 |
| 024 | HealthSummary freshness guard | 阶段 2 / Runtime 分层 P0 | 后端契约 + UI 摘要 | `valid_until` 过期后只展示待刷新，不作为推荐依据 |
| 025 | Installation Runtime handoff | 阶段 3 前置 | 跨项目契约 | Installation / DeviceBinding 可被 Runtime 消费，artifact_hash mismatch 有可解释动作 |
| 026 | Listing wizard shell | 阶段 2 | 前端 / API 编排 | 来源选择、字段确认、校验报告、详情预览串联 |
| 027 | Draft review submission | 阶段 2 | 后端契约 | validation passed + Owner 确认后进入 pending_review，不允许 TODO/unknown 发布 |
| 028 | Policy and approval echo | 阶段 3 | 跨项目摘要 | Store 只回显 AgentOps Policy / Approval 摘要，不覆盖裁决 |
| 029 | Managed installer preview | 阶段 3 | 安装器预览 | 下载、签名校验、隔离安装、smoke test、失败诊断的最小状态机 |
| 030 | Feedback and owner response loop | 阶段 4 | 产品闭环 | submitted -> triaged -> owner_replied -> planned/fixed/rejected -> released |
| 031 | Lifecycle governance baseline | 阶段 5 | 生命周期治理 | 升级、回退、deprecated、disabled、security_revoked、替代版本影响范围 |
| 032 | Contract Registry traceability | Runtime 分层 P0-E | 治理追踪 | 每个 OpenAPI contract 可反查 Producer、Consumer、Owner、appendix anchor 和 contract test |

## 6. 不进入近期规划

- 评论、排行、商业化 marketplace 运营。
- Store 内嵌完整运行详情、Trace Timeline 或 Evidence 原文。
- Store 签发 CapabilityGrant 或覆盖 AgentOps PolicyDecision。
- 云端 serverless Runtime、完整 replay / simulation、多 Agent DAG。
- 以 Agent Store 作为 Ai_AutoSDLC 个人/外部用户唯一安装入口。
