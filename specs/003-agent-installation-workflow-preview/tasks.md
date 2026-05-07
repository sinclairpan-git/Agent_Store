# 任务：Agent Installation Workflow Preview

## Batch 003-A：后端工作流预览

### Task 1.1 实现 workflow preview view model

- **状态**：已完成
- **文件**：`app/agent_store/ui/installation_workflow.py`、`tests/unit/test_installation_workflow_preview.py`
- **验收**：installable、activation_required、blocked 三类路径均有稳定 steps、primary_action、audit_id。

### Task 1.2 实现 workflow preview API handler

- **状态**：已完成
- **文件**：`app/agent_store/api/installation_workflow.py`、`tests/contract/test_installation_workflow_api.py`
- **验收**：已知 Agent 返回 workflow envelope，未知 Agent 返回 `AGENT_NOT_FOUND`。

## Batch 003-B：前端工作流面板

### Task 2.1 接入选中 Agent 的 workflow 面板

- **状态**：已完成
- **文件**：`frontend/index.html`、`frontend/src/app.js`、`frontend/src/sdlc-enterprise-vue2.js`
- **验收**：选中不同 Agent 后，详情区显示对应 workflow_state、steps、command_preview、audit_id。

### Task 2.2 增加 workflow 面板样式和验证

- **状态**：已完成
- **文件**：`frontend/src/styles.css`、`frontend/scripts/verify-frontend.mjs`
- **验收**：面板在桌面与移动布局中稳定展示；验证脚本覆盖 workflow 防退化断言。
