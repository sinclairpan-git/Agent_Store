# Specification: Cross-Project Contract Appendix

**编号**：`007-cross-project-contract-appendix`
**阶段目标**：先冻结 Agent Store、AgentOps、Ai_AutoSDLC 三项目的跨项目契约，再让各项目分别实现，避免接口字段、状态和责任边界继续漂移。

## 背景

Agent Store 已完成 installation/assertion handoff，AgentOps 已具备 credential issue 和运行事实工作台雏形，Ai_AutoSDLC PRD 已定义 Reporter/Outbox/enterprise bootstrap。但三方当前没有一个可执行的同名契约来约束：

- assertion 外部字段名；
- bootstrap_id 与 bootstrap session 生命周期；
- device proof 结构；
- credential issue request/response；
- Agent Store 回显状态与 AgentOps 事实状态的映射；
- consumer-driven contract test。

## 范围

- 新增跨项目契约附录 `docs/cross-project-contract-appendix.md`。
- 明确 Agent Store、AgentOps、Ai_AutoSDLC 的事实源边界。
- 冻结 `agentops_credential_handoff.v1`、`signed_installation_assertion.v1`、`device_proof.v1` 的外部字段。
- 定义 bootstrap 状态 crosswalk 和三方 contract test 矩阵。
- 给出三项目 PRD/spec 后续必须同步的修改点。

## 非目标

- 不修改 Agent Store 当前 assertion API 实现。
- 不修改 AgentOps 项目文件。
- 不修改 Ai_AutoSDLC 项目文件。
- 不声称真实三方端到端联调已完成。

## 功能需求

- **FR-007-001**：文档必须把 Agent/Version/Skill/Installation、Credential/DeviceKey/Evidence/L5、Reporter/Outbox 的事实源分别归属到正确项目。
- **FR-007-002**：文档必须定义 Agent Store 到 AgentOps Credential Issue 的可执行 handoff envelope。
- **FR-007-003**：文档必须统一 assertion 外部字段名，明确 `algorithm`、`user_id`、`json-c14n-v1` 等字段语义。
- **FR-007-004**：文档必须定义 device proof 与 assertion hash、installation、device 的绑定关系。
- **FR-007-005**：文档必须明确 Agent Store 不签发 ReporterCredential/IngestionToken/DeviceKey，AgentOps 不写 Agent Store 注册事实。
- **FR-007-006**：文档必须定义三项目 consumer-driven contract tests 和后续实现顺序。

## 验收

- `uv run ai-sdlc run --dry-run` 通过。
- `rg -n "agentops_credential_handoff.v1|signed_installation_assertion.v1|device_proof.v1|CCT-001|State Crosswalk" docs/cross-project-contract-appendix.md` 能命中关键契约。
- `uv run ai-sdlc program validate` 通过或仅保留非阻断提示。

