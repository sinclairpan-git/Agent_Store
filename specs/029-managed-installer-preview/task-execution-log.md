# 029 Task Execution Log

## 2026-05-09

- AI-SDLC dry-run 入口通过。
- 从 `codex/policy-approval-echo-028` 创建 `codex/managed-installer-preview-029`。
- 新增 `managed_installer_preview.v1`，表达下载、签名校验、隔离安装、smoke test、失败诊断五步。
- 新增 API facade，要求 `Idempotency-Key` 并复用现有 envelope/error shape。
- 新增 OpenAPI contract 与 contract-loader 断言。
- 新增单元测试和 API 契约测试，覆盖 preview-only 边界和主要状态分支。
