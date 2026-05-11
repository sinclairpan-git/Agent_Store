# Spec: Permission Denial Frontend Consumer

038 已交付 `permission_denial_action_summary.v1` 后端投影。041 负责把该摘要接到 Agent Store 前端详情页，让不可见、可见不可安装、证据原文无权、高风险需审批和 Policy 阻断都能被用户读懂并进入可审计恢复动作。

## Goals

- 在前端 mock/API fixture 中暴露 `permissionDenialActions`，覆盖 PRD 第 9 节五类权限失败场景。
- 在 Agent 详情页新增“权限恢复”面板，展示 denial scenario、denial state、permission state、页面解释、通知规则、事实源、审计、主/次动作和 issue。
- raw Trace / raw Evidence URL 必须固定为空，页面必须明确 Store 不展示原文。
- Store grant 和 policy override 必须固定为 false，不得把前端动作展示成授权或策略覆盖。
- 前端验证脚本必须覆盖 fixture、Vue 根状态、shell prop、组件注册和关键边界文案。

## Non-Goals

- 不实现真实 IAM、Evidence Vault 或 AgentOps HTTP 调用。
- 不创建审批单、不签发 CapabilityGrant、不裁决 PolicyDecision。
- 不修改 038 API 语义，也不扩大证据、通知或安装 contract。

## Acceptance Criteria

- `frontend/src/mock-data.js` 包含 `permission_denial_action_summary.v1` fixture，并覆盖五类权限失败场景。
- `frontend/src/app.js` 输出 `selectedPermissionDenialAction`，缺摘要时保守降级为 `denial_unavailable`。
- `frontend/src/sdlc-enterprise-vue2.js` 注册 `sdlc-permission-denial-action` 并接入 `sdlc-shell`。
- `frontend/index.html` 将 `selectedPermissionDenialAction` 传入 shell。
- `frontend/scripts/verify-frontend.mjs` 对 raw URL stripped、no Store grant、no policy override 和恢复动作进行静态验证。
