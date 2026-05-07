# Plan: AgentOps Credential Echo Consumer

## 实施步骤

1. 确认 AgentOps 016/017 已在相邻仓库主线落地。
2. 增加 Store 侧 AgentOps credential echo client，仅消费已注册或测试替身返回的 AgentOps response。
3. 扩展 `CredentialBootstrapSummary`，支持 `signature_verified` 状态回显。
4. 增加 signed test event 后的 AgentOps echo fixture。
5. 更新 OpenAPI 中 credential bootstrap echo 的可见字段和 reporter 状态枚举。
6. 增加 CCT 与单元测试，覆盖 credential_issued、signature_verified、缺 device proof、缺 AgentOps response。
7. 执行本地验证，提交、push、创建 PR 并触发 Codex Review 守护。

## 风险与控制

- 风险：Store 越界成为 credential issuer。
  控制：client 没有默认 credential 生成逻辑，缺少 AgentOps response 直接失败。
- 风险：Store 越界生成 device proof。
  控制：handoff 中 `device_proof` 必须是 Ai_AutoSDLC 提供的 `device_proof.v1`。
- 风险：把 `credential_issued` 误显示为 active。
  控制：只有 `signature_verified` echo 才显示 `enterprise_state=active`。
