# Development Summary: Bootstrap Remediation Actions

本阶段把 bootstrap status 的事实源解释继续推进为可执行恢复链路。

## 完成内容

- `BootstrapStatus` 增加 `recommended_actions`，所有状态分支均返回非空动作链。
- Store assertion expired 推荐重新生成激活命令、复制诊断引用和返回官方应用。
- AgentOps failed / expired echo 推荐 AgentOps 访问复核、credential 刷新或失败证据入口。
- credential issued 推荐 Ai_AutoSDLC CLI 发送签名测试事件，并保留轮询和诊断动作。
- permission denied 推荐 AgentOps 权限申请，不由 Store 本地推导 active。
- Vue2 企业激活区新增推荐动作列表。

## 验证

- `uv run pytest tests/contract/test_bootstrap_status_recovery.py -q`
- `npm run verify`
- `uv run ruff check app/agent_store/domain/bootstrap_status.py tests/contract/test_bootstrap_status_recovery.py`
