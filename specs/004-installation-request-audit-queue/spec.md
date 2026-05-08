# 规格：Installation Request Audit Queue

**编号**：`004-installation-request-audit-queue`
**阶段目标**：把 003 的安装流程预览推进为可提交、可审计、可排队跟踪的安装申请闭环。

## 范围

- 后端提供安装申请 request model 与提交 API handler。
- 根据 Agent installability 派生申请状态、审计编号、队列、下一步动作和阻断原因。
- blocked Agent 不允许直接安装，只允许提交 catalog review 申请。
- 前端详情区展示当前选中 Agent 的申请快照、队列状态、审计编号和下一步动作。

## 非范围

- 不执行真实安装命令。
- 不落真实数据库；本阶段使用稳定、可验证的 request envelope。
- 不实现审批人的真实工作台、通知系统或外部 IAM 调用。

## 功能需求

- **FR-004-001**：installable Agent 提交 `start_install` 后必须进入 `accepted` 状态，并给出 `create_installation` 下一步。
- **FR-004-002**：activation_required Agent 提交 `start_enterprise_activation` 后必须进入 `pending_enterprise_activation` 状态，并进入企业激活队列。
- **FR-004-003**：standalone_only Agent 提交 `open_standalone_readme` 后必须进入 `standalone_ready` 状态，且不得要求企业审批。
- **FR-004-004**：blocked Agent 直接安装必须被拒绝；提交 `request_catalog_review` 时进入 `pending_catalog_review` 状态并包含阻断原因。
- **FR-004-005**：申请响应必须包含 `schema_version`、`trace_id`、`error_code`、`request_id`、`audit_id`、`request_state`、`queue`、`next_action`。
- **FR-004-006**：前端必须在安装流程面板旁展示申请快照，且随选中 Agent 联动。
- **FR-004-007**：前端所有安装、激活、handoff、assertion 主动作必须进入可见反馈状态，展示用户可理解的下一步、审计编号和事实源边界；不得只跳转 hash。
- **FR-004-008**：前端不得从目录字段本地推导 AgentOps、PackageTrust、Trusted Loop 或实际 L5 结论；缺少真实摘要时必须展示 `unavailable` / 待验证 / 降级解释。
- **FR-004-009**：前端必须把用户可见的 action、trust、installability、workflow 枚举映射为中文产品文案；机器 ID 只能作为审计或 tooltip 辅助信息。
- **FR-004-010**：移动端 390px 宽度下不得出现横向溢出；推荐动作、步骤列表和主 CTA 必须在窄屏下纵向折叠。

## 成功标准

- `uv run pytest tests/unit/test_installation_request.py tests/contract/test_installation_request_api.py -q` 通过。
- `npm --prefix frontend run verify` 覆盖安装申请面板契约。
- `node --check frontend/src/app.js` 与 `node --check frontend/src/sdlc-enterprise-vue2.js` 通过。
- Playwright 本地渲染检查确认主 CTA 点击后反馈状态更新，且 390px 视口 `scrollWidth <= clientWidth`。
- 全量测试、ruff 和前端验证通过。
