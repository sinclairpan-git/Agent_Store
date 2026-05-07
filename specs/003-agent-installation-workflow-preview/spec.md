# 规格：Agent Installation Workflow Preview

**编号**：`003-agent-installation-workflow-preview`  
**阶段目标**：在完整安装器交付前，为 Agent Store Catalog 提供可执行的安装、企业激活和阻断恢复工作流预览。

## 范围

- 从目录卡片的 installability 派生工作流状态：`ready_to_install`、`activation_required`、`standalone_only`、`blocked`。
- 展示步骤、Owner system、命令预览、audit_id、主操作和恢复动作。
- 后端提供 typed workflow preview 与 API handler。
- 前端详情区展示安装与激活流程面板，并随选中 Agent 联动。

## 非范围

- 不执行真实安装命令。
- 不签发真实 credential 或调用真实 AgentOps。
- 不实现完整安装器下载、升级、卸载和回滚。

## 功能需求

- **FR-003-001**：installable Agent 必须展示 verify_package、create_installation、issue_assertion、sync_agentops 四步。
- **FR-003-002**：activation_required Agent 必须展示企业策略确认、激活命令、Reporter credential、签名测试四步。
- **FR-003-003**：blocked Agent 必须展示阻断原因和 request_catalog_review 恢复动作。
- **FR-003-004**：standalone_only Agent 必须展示 standalone 边界确认、standalone 使用入口，且不得展示 blocked recovery action。
- **FR-003-005**：workflow response 必须包含 schema_version、trace_id、error_code、audit_id、primary_action。
- **FR-003-006**：前端详情区必须展示 workflow_state、command_preview、steps、audit_id、primary/recovery action。

## 成功标准

- `uv run pytest tests/unit/test_installation_workflow_preview.py tests/contract/test_installation_workflow_api.py -q` 通过。
- `npm --prefix frontend run verify` 覆盖安装流程面板契约。
- 全量测试和 lint 通过。
