# Development Summary: Bootstrap Source Of Truth Contract

本阶段让 bootstrap status 从单纯状态值升级为可解释的状态事实源契约。

## 完成内容

- `BootstrapStatus` 增加事实源、入口证据、冲突裁决、受影响动作和可选 `source_conflicts`。
- Store assertion expired 时保持 Store 事实源优先，不让 AgentOps echo 改写 blocked timeline。
- AgentOps echo 成为展示事实源时，响应会说明它已通过 installation/device identity match。
- OpenAPI 增加 `BootstrapSourceSignal`。
- Vue2 企业详情新增 source facts 展示。

## 验证

- `uv run ai-sdlc run --dry-run`
- `uv run pytest tests/contract/test_bootstrap_status_recovery.py tests/contract/test_contract_files_parse.py -q`
- `npm run verify`
- `uv run pytest -q`
- `uv run ruff check app tests`
