# 049 Managed Installer Preview Frontend Consumer

029 已冻结 `managed_installer_preview.v1` 后端/API 契约，覆盖下载、签名校验、隔离安装、smoke test 与失败诊断的 preview-only 状态机。048 已让详情页消费 AgentOps Policy Echo；本阶段继续把托管安装预览接入 Agent Store 前端详情页，让 Owner 可以看到安装器会做什么、卡在哪一步，以及可复制的诊断引用。

## Scope

- 在前端 mock fixtures 中新增 `managedInstallerPreviews`，覆盖 ready、policy blocked、signature blocked 与 smoke failed。
- 在 Vue root 中新增 `selectedManagedInstallerPreview`，按当前 Agent 选择托管安装预览，并在缺失时保守降级。
- 新增企业 Vue2 组件 `sdlc-managed-installer-preview`，展示五步状态机、package/policy/runtime gate、isolation、smoke test、diagnostics、source-of-truth 和下一步动作。
- 更新静态 frontend verification，确保面板、字段、preview-only 边界与 no CapabilityGrant 文案可被机器检查。

## Non-Goals

- 不执行真实下载、解压、沙箱创建、安装或 smoke test。
- 不签发 CapabilityGrant，不覆盖 AgentOps PolicyDecision，不把 approval pending 解释为 allowed。
- 不新增后端 API、数据库、真实 Runtime 调用或 AgentOps 调用。

## Acceptance

- 页面必须展示 `managed_installer_preview.v1`、`execution_mode=preview_only`、`real_install_started=false`。
- 页面必须展示五步：`download_artifact`、`verify_signature`、`create_isolated_install`、`smoke_test`、`failure_diagnostics`。
- Policy Echo 未 allowed、签名/hash 不可信、Runtime Handoff 不就绪或 smoke failed 时，必须展示阻断状态与下一步动作。
- 缺少 preview envelope 时，前端必须保守降级为 blocked，不从 catalog 或 policy echo 本地推导可安装。
- 验证必须覆盖 frontend static check、相关 pytest/ruff、AI-SDLC truth sync/audit 与 dry-run/run。

## Adversarial Review Synthesis

- Product / user-flow view：Owner 需要看到托管安装器的下一步、失败诊断和每个 gate 的事实源，而不是一个模糊的“可安装/不可安装”状态。
- Governance / contract view：前端消费必须继续保持 preview-only；Store 不启动真实安装、不执行包、不签发 grant，也不绕过 AgentOps 或 Runtime 的事实源边界。
