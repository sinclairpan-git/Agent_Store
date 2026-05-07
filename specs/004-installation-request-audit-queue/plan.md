# 计划：Installation Request Audit Queue

## Batch 004-A：后端申请闭环

- 新增 `app/agent_store/ui/installation_request.py`，负责从 `CatalogAgentSource` 构建稳定安装申请 envelope。
- 新增 `app/agent_store/api/installation_request.py`，负责提交申请、校验 action、返回治理错误。
- 增加 unit/contract 测试覆盖 installable、activation_required、standalone_only、blocked 与非法动作。

## Batch 004-B：前端申请状态面板

- 在 Vue2 适配层新增 `sdlc-install-request` 组件。
- 在 `app.js` 中为选中 Agent 派生 `selectedInstallationRequest`。
- 在 `index.html`、样式和验证脚本中接入安装申请面板。

## 门禁

- AI-SDLC dry-run 通过后实施。
- 本阶段不引入真实外部依赖。
- 所有新增状态必须通过测试或前端验证脚本 machine-verifiable。
