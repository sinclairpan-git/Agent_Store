# Development Summary: Agent Installation Workflow Preview

## 本阶段交付

- 新增 installation workflow preview view model，覆盖 installable、activation_required、standalone_only 和 blocked 路径。
- 新增 workflow preview API handler，返回 schema_version、trace_id、error_code、audit_id、primary_action 和步骤详情。
- 前端详情区新增安装与激活流程面板，并随选中 Agent 联动。
- 前端验证脚本覆盖 workflow_state、command_preview、steps、audit_id 和恢复动作展示。

## 未做事项

- 未执行真实安装命令。
- 未签发真实 credential 或调用真实 AgentOps。
- 未实现完整安装器下载、升级、卸载或回滚。

## 验证

- `npm --prefix frontend run verify`
- `uv run pytest tests/unit/test_installation_workflow_preview.py tests/contract/test_installation_workflow_api.py -q`
- `uv run pytest -q`
- `uv run ruff check app tests`
- `uv run ruff format --check app tests`

## 后续建议

1. 推进 `004-installation-request-audit-queue` 的 execute/close 证据补齐，让安装申请队列阶段从 decompose_only 进入 close。
2. 将 workflow preview 与后续 installation request / bootstrap handoff 继续串联。
3. 保持 Agent Store 只做可解释预览和治理 envelope，不在本阶段执行真实安装或 credential 签发。
