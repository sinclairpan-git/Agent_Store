# 026 Listing Wizard Shell

021 将阶段 2 剩余工作拆分为上架向导 UI、草案提交审核等后续项。022-025 已补齐 AgentManifest、Runtime availability、HealthSummary freshness 与 Installation Runtime handoff 的 P0 事实源。本工作项承接 `026-listing-wizard-shell`：先建立上架向导壳层，把来源选择、字段确认、校验报告和详情预览串起来，但不提交审核。

## Scope

- 新增 `listing_wizard_shell.v1` view model，组合 package manifest candidate、Package Validation、Runtime availability 与 HealthSummary freshness。
- 前端新增上架向导面板，展示来源选择、字段确认、校验报告、Runtime Gate、详情预览和下一步动作。
- Mock 数据覆盖 `preview_ready`、`runtime_gate_blocked` 与缺 fixture 的保守降级。
- 前端验证脚本新增 Listing Wizard 壳层检查，确保 UI 串联四个核心步骤且不会进入 `pending_review`。

## Non-Goals

- 不实现真实文件上传、仓库扫描、包解压或 Runtime 调用。
- 不创建 AgentVersion、不发布 Agent、不把 draft 状态推进到 `pending_review`。
- 不签发 CapabilityGrant、不计算质量评分、不使用 HealthSummary 做推荐依据。
- 不替代 018 Package Validation、022 AgentManifest contract、023 Runtime availability 或 024 HealthSummary freshness。

## Acceptance

- 上架向导必须展示“来源选择 / 字段确认 / 校验报告 / 详情预览”四个步骤，并保留 Runtime Gate。
- Package Validation 失败时返回 `needs_field_confirmation` 或 `validation_fix_required`，下一步不得是提交审核。
- Runtime availability 不是 `runtime_ready` 时返回 `runtime_gate_blocked`，下一步为处理 Runtime Gate。
- 当校验通过且 Runtime ready 时返回 `preview_ready`，下一步只能是 `prepare_draft_review_submission`，不进入 `pending_review`。
- 响应必须包含 `source_of_truth.draft_review=not_submitted_until_027`。
- 前端必须继续展示 Runtime / HealthSummary / Recommendation 各自事实源，不本地推导质量、L5 或 PolicyDecision。

## Adversarial Review Synthesis

- Product / user-flow view：上架流程需要从“我从哪里导入”一路看到“详情页会长什么样”，否则 Owner 很难知道还差什么字段或门禁。
- Governance / contract view：026 只能做壳层和预览编排。真正的 pending_review 状态、Owner 最终确认和 TODO/unknown 发布阻断必须留到 027，避免 UI 绕过 Package / Manifest / Runtime / HealthSummary 的契约门禁。
