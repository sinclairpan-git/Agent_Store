# Tasks: Installation Request Bootstrap Handoff

## Task 1 后端 Handoff API

- [x] 新增 request-to-bootstrap handoff API。
- [x] accepted request 创建 installation。
- [x] 校验 request id、audit id、idempotency key。
- [x] 非 accepted request 不创建 installation。

## Task 2 测试覆盖

- [x] 成功创建 installation。
- [x] 幂等重试返回同一 installation。
- [x] activation_required 返回 pending request。
- [x] request identity mismatch 返回错误。
- [x] audit mismatch 返回错误。

## Task 3 前端落地

- [x] 新增 bootstrap handoff 计算模型。
- [x] 新增 SDLC 企业 Vue2 handoff 组件。
- [x] 详情页接入 handoff 面板。
- [x] 更新前端 verify 脚本。

## Task 4 验证

- [x] `uv run ai-sdlc run --dry-run`
- [x] `uv run pytest -q`
- [x] `uv run ruff check app tests`
- [x] `uv run ruff format --check app tests`
- [x] `npm --prefix frontend run verify`
- [x] `node --check frontend/src/app.js`
- [x] `node --check frontend/src/sdlc-enterprise-vue2.js`
