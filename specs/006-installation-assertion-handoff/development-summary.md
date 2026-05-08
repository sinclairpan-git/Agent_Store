# Development Summary: Installation Assertion Handoff

## 本阶段交付

- 增强 installation bootstrap assertion API，成功签发时返回 `assertion_handoff`。
- 响应包含 `bootstrap_status`，用于前端轮询和诊断展示。
- `assertion_handoff.next_action` 指向 `sync_agentops_evidence`，保持 AgentOps 同步为后续动作。
- create installation 与 issue assertion 两个入口均支持大小写不敏感的 `Idempotency-Key` header。
- 前端详情页展示 assertion handoff 状态、audience、nonce、replay window、assertion hash 与下一步动作。
- 前端验证脚本覆盖 `sdlc-assertion-handoff`、`selectedAssertionHandoff` 和 HTML prop wiring。

## 未做事项

- 未接入真实 AgentOps 事件上传。
- 未改变 assertion 签名算法或密钥管理。
- 未持久化 assertion；继续沿用现有内存模型。

## 验证

- `ai-sdlc run --dry-run`
- `uv run pytest tests/contract/test_installation_bootstrap_api.py -q`
- `uv run pytest -q`
- `uv run ruff check app tests`
- `uv run ruff format --check app tests`
- `npm --prefix frontend run verify`
- `node --check frontend/src/app.js`
- `node --check frontend/src/sdlc-enterprise-vue2.js`

## 后续建议

1. 006 close 后解除 007 的 install assertion 依赖阻塞，并继续保持跨项目契约 appendix 的事实源边界。
2. 后续实现 AgentOps evidence sync 时，必须消费 `sync_agentops_evidence` 回显，不在前端本地推导同步完成或实际 L5。
3. 把 assertion handoff 的 issued/ready/waiting 状态纳入后续 Playwright smoke，防止前端展示回退为机器字段。

