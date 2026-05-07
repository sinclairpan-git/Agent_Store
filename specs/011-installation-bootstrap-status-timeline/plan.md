# Plan: Installation Bootstrap Status Timeline

## 实施步骤

1. 确认 Agent Store 主线干净，并执行 AI-SDLC dry-run。
2. 确认 Ai_AutoSDLC 当前不适合直接改动，避免跨仓越界。
3. 为 Bootstrap status 增加 timeline 数据模型。
4. 根据 AgentOps credential echo 映射 `credential_issued` 和 `signature_verified`。
5. 更新 OpenAPI 与 contract tests。
6. 在 Vue2 页面增加 timeline 组件与 mock 数据。
7. 执行后端、前端和全量验证。
8. 提交、push、创建 PR、触发 Codex Review 并启动 heartbeat 守护。

## 风险与控制

- 风险：Store 自己推进 verified。
  控制：只有传入 AgentOps `signature_verified` echo 时才完成 timeline。
- 风险：前端展示误导用户认为 Store 生成 device proof。
  控制：timeline 明确 `collect_device_proof` owner 为 `ai_autosdlc`。
- 风险：Ai_AutoSDLC 仓库当前脏状态被误改。
  控制：本阶段只在 Agent Store 内实现承接展示。
