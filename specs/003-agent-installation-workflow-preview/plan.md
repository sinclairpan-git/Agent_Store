# 计划：Agent Installation Workflow Preview

## 决策

- 在完整安装器前先落 workflow preview，避免 UI 只有按钮而没有可解释步骤。
- 后端继续以 typed handler 和 contract test 验证，不引入生产 HTTP server。
- 工作流只编排 Store / AgentOps / Security 的责任边界，不执行真实安装。

## 批次

### Batch 003-A：后端工作流预览

- 新增 `agent_store.ui.installation_workflow`。
- 新增 `agent_store.api.installation_workflow`。
- 覆盖 installable、activation_required、standalone_only、blocked、not found。

### Batch 003-B：前端工作流面板

- 在详情区增加安装与激活流程面板。
- 随选中 Agent 切换步骤、命令预览、audit_id、恢复动作。
- 前端验证脚本增加 workflow 防退化断言。

## 验证

- `npm --prefix frontend run verify`
- `uv run pytest tests/unit/test_installation_workflow_preview.py tests/contract/test_installation_workflow_api.py -q`
- `uv run pytest -q`
- `uv run ruff check app tests`
- `uv run ruff format --check app tests`
