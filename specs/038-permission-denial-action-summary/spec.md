# Spec: Permission Denial Action Summary

037 已补齐 Quality / Evidence 的权限化摘要。038 承接 PRD 第 9 节权限失败体验：Agent Store 必须把不可见、可见不可安装、证据原文无权、高风险需审批和 Policy 阻断区分为可解释状态，并给出可执行下一步、通知/审计字段和事实源边界。

## Goals

- 新增 `permission_denial_action_summary.v1`，把权限失败场景投影为 Store/UI 可展示的 action summary。
- 区分 `not_visible`、`visible_not_installable`、`raw_evidence_denied`、`high_risk_approval_required`、`policy_blocked` 五类 PRD 场景。
- 每个场景输出页面标题、白话解释、主动作、次动作、通知规则、审计字段和 return path。
- raw Trace / raw Evidence URL 必须剥离；证据原文无权时只能路由 Evidence Vault 申请入口。
- Store 只展示 IAM / AgentOps / Evidence Vault 的权限事实，不本地签发授权、不绕过 AgentOps Policy。

## Non-Goals

- 不实现真实 IAM、Evidence Vault 或 AgentOps HTTP 调用。
- 不创建审批单、不签发 CapabilityGrant、不裁决 PolicyDecision。
- 不修改现有安装、质量证据或深链 contract 的语义；本阶段只补统一权限失败投影。

## Acceptance Criteria

- 单元测试覆盖五类权限失败、unsupported scenario、raw URL stripped 和缺 trusted auth 降级。
- 合同测试覆盖 API envelope、idempotency、OpenAPI 枚举、raw URL 常量约束和 target_system 枚举。
- Contract Registry 新增 `permission_denial_action_summary.v1`，映射 CCT-023。
- 跨项目 appendix 新增 CCT-023，并更新 Agent Store / AgentOps PRD required update 行。
