# 任务：Installation Request Audit Queue

## Batch 004-A：后端申请闭环

### Task 1.1 实现 installation request view model

- **状态**：已完成
- **文件**：`app/agent_store/ui/installation_request.py`、`tests/unit/test_installation_request.py`
- **验收**：四类 installability 均可生成稳定 request envelope。

### Task 1.2 实现 installation request API handler

- **状态**：已完成
- **文件**：`app/agent_store/api/installation_request.py`、`tests/contract/test_installation_request_api.py`
- **验收**：已知 Agent 返回 request envelope；未知 Agent 和非法 action 返回稳定治理错误。

## Batch 004-B：前端申请状态面板

### Task 2.1 增加安装申请状态面板

- **状态**：已完成
- **文件**：`frontend/src/app.js`、`frontend/src/sdlc-enterprise-vue2.js`、`frontend/src/styles.css`
- **验收**：选中 Agent 后展示 request_state、queue、audit_id、next_action，并随筛选空态联动。

### Task 2.2 更新前端契约验证

- **状态**：已完成
- **文件**：`frontend/scripts/verify-frontend.mjs`
- **验收**：验证脚本覆盖 `sdlc-install-request`、`selectedInstallationRequest` 和 HTML prop wiring。
