# Development Summary: Installation Request Bootstrap Handoff

## 本阶段交付

- 新增 request-to-bootstrap handoff API，复用 004 canonical request envelope。
- accepted installable request 可创建 installation/device binding，并返回 handoff、request、installation、permission_decision。
- handoff 创建校验 `Idempotency-Key`、`request_id` 和 `PermissionDecision.audit_id`。
- activation_required、catalog review、standalone 等非 accepted request 不创建 installation，只回显原申请状态与下一步。
- 前端详情页展示 bootstrap handoff 状态、idempotency key、设备指纹、安装 id 和下一步动作。
- 前端验证脚本覆盖 `sdlc-bootstrap-handoff`、`selectedBootstrapHandoff` 和 HTML prop wiring。

## 未做事项

- 未接入真实设备密钥生成。
- 未执行真实安装命令。
- 未自动签发 installation assertion；assertion 仍由后续阶段处理。

## 验证

- `ai-sdlc run --dry-run`
- `uv run pytest tests/contract/test_installation_handoff_api.py -q`
- `uv run pytest -q`
- `uv run ruff check app tests`
- `uv run ruff format --check app tests`
- `npm --prefix frontend run verify`
- `node --check frontend/src/app.js`
- `node --check frontend/src/sdlc-enterprise-vue2.js`

## 后续建议

1. 推进 `006-installation-assertion-handoff` 的 close 证据补齐，把 installation_created 状态推进到 assertion issuance handoff。
2. 保持 004/005 的事实源边界：前端展示 handoff 和下一步，不本地推进 installation/assertion 可信结论。
3. 后续接入真实 API submit/poll 时，保留 idempotency、audit_id 和 canonical request identity 校验。

