# 055 Package Validation Report Frontend Consumer

018 已冻结 `package_validation_report.v1`，输出字段级 issue、fix prompt、validation status、draft status 与 source-of-truth。054 已补齐 Installation Runtime Handoff 的详情页消费；本阶段回补 Package Validation Report 的独立前端消费，让 Owner / reviewer 在上架向导和草案提交前直接看到包候选校验结果、证据缺口、AI 字段来源和修复提示安全边界。

## Scope

- 在前端 mock fixtures 中新增 `packageValidationReports`，覆盖 `passed`、warning evidence gap、`fixable` 和 `validation_failed`。
- 在 Vue root 中新增 `selectedPackageValidationReport`，按当前 Agent 选择 Package Validation report，并在缺失时保守降级为 `validation_failed`。
- 新增企业 Vue2 组件 `sdlc-package-validation-report`，展示 validation status、draft status、issues、fix prompts、evidence summary、source-of-truth 和下一步动作。
- 更新静态 frontend verification，确保 `package_validation_report.v1`、field-level issues、fix prompt safety、candidate-only AI 字段边界和 no SBOM / no static scan / no Skill publish 可被机器检查。

## Non-Goals

- 不实现真实包扫描、SBOM 生成、静态扫描、包上传器或后台修复执行器。
- 不把 warning evidence gap 伪装成真实扫描完成，不把 AI-generated text 直接写成治理事实。
- 不创建 Skill Registry record，不提交 review queue，不绕过 Owner confirmation 或 Runtime gate。

## Acceptance

- 页面必须展示 `package_validation_report.v1`、`validation_status`、`draft_status`、issues、fix_prompts、evidence summary 和 source-of-truth。
- `passed` 必须能显示无 issue 或仅 warning evidence gap，并保留缺口可见。
- `fixable` 必须展示 safe fix prompt，但不自动应用为治理事实。
- `validation_failed` 必须展示 blocked issue，并指向 `return_to_draft` 或 validation 修复路径。
- 组件必须明确当前只是 package candidate validation，不代表真实 SBOM、静态扫描、Skill 发布或 Owner bypass。
- 验证必须覆盖 frontend static check、相关 pytest/ruff、AI-SDLC truth sync/audit、dry-run/run 与浏览器验证。

## Adversarial Review Synthesis

- Product / reviewer view：Owner 需要在上架向导摘要之外看到字段级失败原因、证据缺口和修复提示是否可安全应用。
- Governance / contract view：018 的边界是 Package Validation 只校验上传候选包；warning evidence gap 可以继续审核但必须可见，AI 字段必须保持 candidate-only，不能变成已确认治理事实。
