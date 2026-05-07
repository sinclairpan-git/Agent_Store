# Tasks: Installation Assertion Handoff

## Task 1 后端 Assertion Handoff

- [x] assertion API 返回 `assertion_handoff`。
- [x] assertion API 返回 `bootstrap_status`。
- [x] `Idempotency-Key` header 大小写不敏感。
- [x] 保持原 assertion 安全校验语义。

## Task 2 测试覆盖

- [x] assertion handoff envelope。
- [x] bootstrap status envelope。
- [x] lowercase idempotency header。
- [x] 既有 assertion contract 全量回归。

## Task 3 前端落地

- [x] 新增 assertion handoff 计算模型。
- [x] 新增 SDLC 企业 Vue2 assertion 组件。
- [x] 详情页接入 assertion handoff 面板。
- [x] 更新前端 verify 脚本。

## Task 4 验证

- [x] `uv run ai-sdlc run --dry-run`
- [x] `uv run pytest tests/contract/test_installation_bootstrap_api.py -q`
- [x] `uv run pytest -q`
- [x] `uv run ruff check app tests`
- [x] `uv run ruff format --check app tests`
- [x] `npm --prefix frontend run verify`
- [x] `node --check frontend/src/app.js`
- [x] `node --check frontend/src/sdlc-enterprise-vue2.js`
