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

## Batch 004-C：C 端交互与可信边界修复

### Task 3.1 建立可见动作反馈闭环

- **状态**：已完成
- **文件**：`frontend/index.html`、`frontend/src/app.js`、`frontend/src/sdlc-enterprise-vue2.js`、`frontend/src/styles.css`
- **验收**：安装、激活、handoff、assertion 和推荐动作通过按钮事件进入 `actionFeedback`，展示审计编号、下一步说明和事实边界。

### Task 3.2 移除前端可信链本地推导

- **状态**：已完成
- **文件**：`frontend/src/app.js`、`frontend/src/mock-data.js`、`frontend/src/sdlc-enterprise-vue2.js`
- **验收**：非官方 Agent 缺少 AgentOps / PackageTrust 摘要时展示 `unavailable`、待验证和降级说明；前端不再从 catalog `trust_state` 推导 signature/hash/Trusted Loop/实际 L5。

### Task 3.3 用户可见文案产品化

- **状态**：已完成
- **文件**：`frontend/src/sdlc-enterprise-vue2.js`
- **验收**：用户可见按钮、筛选、状态 chip 映射为中文产品文案；机器 ID 只保留在按钮 title 或审计上下文中。

### Task 3.4 移动端溢出防退化

- **状态**：已完成
- **文件**：`frontend/src/styles.css`、`frontend/scripts/verify-frontend.mjs`
- **验收**：390px 视口下步骤、推荐动作和 CTA 纵向折叠；验证脚本覆盖移动端样式守护。
