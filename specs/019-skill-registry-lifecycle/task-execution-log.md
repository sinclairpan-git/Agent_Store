# 019 执行日志

## Batch A - Skill Registry Lifecycle

- **验证画像**：code-change
- **改动范围**：`app/agent_store/domain/skill_registry.py`, `app/agent_store/api/skill_registry.py`, `tests/unit/test_skill_registry.py`, `tests/contract/test_skill_registry_api.py`, `tests/contract/test_contract_files_parse.py`, `specs/001-agent-store-phase1-trusted-min-loop/contracts/skill-registry.openapi.yaml`, `program-manifest.yaml`, `specs/019-skill-registry-lifecycle/*`
- **PRD 追踪**：阶段 2 Skill Registry 注册、废弃、security_revoked 与 AgentOps 消费边界。
- **边界**：不执行真实数据库写入、AgentOps webhook、权限/IAM、Owner 工作台或完整上架 UI。

### 已完成

- 新增 Skill Registry 领域模型，输出发布 record、生命周期 event、字段级 issue、next action 与 AgentOps consumption notice。
- 新增 `SkillRegistryAPI.publish_skill`，支持 approved + Package Validation passed 的 Skill candidate 发布。
- 新增 `SkillRegistryAPI.update_skill_status`，支持 deprecated 与 security_revoked 转换。
- 新增 Skill Registry OpenAPI contract，并纳入 contract parse gate。
- 新增单元与合同测试，覆盖 publish、blocked publish、idempotency、duplicate conflict、deprecate、security revoke 和 evidence requirement。
- 补强边界测试：非对象 request body、重复发布、unknown Skill transition、security_revoked 终态和 security revoke event evidence ref。
- 修复 Codex Review P1：`security_revoke` 现在接受 OpenAPI `SkillStatusTransitionRequest.evidence_ref` 作为安全证据引用，并保持 `security_evidence_ref` 与 `incident_id` 兼容。
- 修复 Codex Review P1：`SKILL_NOT_FOUND` transition response 不再写入幂等缓存，避免 Skill 后续发布后同一 transition retry 仍回放 stale 404。
- 修复 Codex Review P2：OpenAPI `SkillRegistryEvent` 补充响应字段 `evidence_ref`，与 security revoke event 实现保持一致。
- 修复 Codex Review P2：Skill Registry 幂等缓存按 operation 分区，避免 publish 与 status transition 复用同一客户端 key 时误判冲突。
- 修复 Codex Review P2：`security_revoked` 终态 guard 仅阻止降级为 `deprecated`，允许带证据的重复 `security_revoke` 重新确认最强安全状态。
- 修复 Codex Review P2：缺失 Skill 的 transition 404 标记为 `retryable=True`，与不缓存该可恢复结果的语义一致。

### 双专家对抗评审

**专家 A（PRD / 产品流程视角）**

- 发现：018 已经返回 Package Validation report，但如果 Skill Registry 发布不校验 approval 与 validation status，会绕过“提交审核”与“待审核”状态。
- 发现：security_revoked 对用户和 AgentOps 都是强安全信号，不能被建模成普通 deprecated。
- 结论：019 必须把 publish 前置条件与 security revoke 证据作为机器可验证规则。

**专家 B（治理 / 跨系统契约视角）**

- 发现：PRD 明确 Agent Store 是 Skill Registry Domain Owner，AgentOps 只消费；若 response 表述成 AgentOps 写入，会破坏事实源边界。
- 发现：生命周期事件需要稳定 event shape，方便后续 webhook / queue adapter 消费。
- 结论：019 应输出 AgentOps consumption notice，但 source-of-truth 固定为 Agent Store。

**合议优化**

- Publish 同时要求 `approval_status=approved` 与 `package_validation.validation_status=passed`。
- 高风险 Skill 发布继续要求 `risk_justification`，保持与 Package Validation 一致。
- security_revoked 要求 incident 或 evidence reference，并作为 terminal safety signal。
- OpenAPI documented `evidence_ref`、`security_evidence_ref`、`incident_id` 三种证据入口统一归一到 lifecycle event `evidence_ref`。
- 缺失 Skill 的 transition 404 是可恢复查找结果，不作为幂等事实缓存；真正执行后的 lifecycle transition 继续保持幂等。
- missing-skill transition response 明确提示客户端可重试，避免 eventually consistent 发布路径中断。
- `publish_skill` 与 `update_skill_status` 保留各自操作内的 idempotency conflict 保护，但跨操作复用 key 不再互相污染。
- 已 security_revoked 的 Skill 仍不可降级为 deprecated；重复 security revoke 作为安全状态 reassertion 成功并继续输出 AgentOps notice。
- AgentOps 字段只表达 `consumer`、`contract`、`sync_status` 与 `notify_required`，不成为写入事实源。

### 本地验证

- `uv run pytest tests/unit/test_skill_registry.py tests/contract/test_skill_registry_api.py tests/contract/test_contract_files_parse.py -q`：24 passed。
- `uv run pytest -q`：221 passed。
- `uv run ruff check app tests`：All checks passed。
- `uv run ruff format --check app tests`：首次发现 3 files would be reformatted；执行 `uv run ruff format app/agent_store/api/skill_registry.py app/agent_store/domain/skill_registry.py tests/contract/test_contract_files_parse.py` 后复跑 PASS，80 files already formatted。
- 补强边界测试后 `uv run ruff format tests/unit/test_skill_registry.py` 重新格式化 1 file，最终 `uv run ruff format --check app tests`：80 files already formatted。
- `python -m ai_sdlc program validate`：PASS。
- `python -m ai_sdlc program truth sync --execute --yes`：ready，source inventory 97/97 mapped。
- `python -m ai_sdlc program truth audit`：ready / fresh。
- `python -m ai_sdlc run --dry-run`：PASS。
- `python -m ai_sdlc run`：PASS，Stage close。
- Codex Review P1 修复后复验：`uv run pytest tests/unit/test_skill_registry.py tests/contract/test_skill_registry_api.py tests/contract/test_contract_files_parse.py -q`：26 passed。
- Codex Review P1 修复后复验：`uv run pytest -q`：223 passed；`uv run ruff check app tests`：All checks passed；`uv run ruff format --check app tests`：80 files already formatted。
- Codex Review P1 修复后复验：`python -m ai_sdlc program truth sync --execute --yes`：ready，source inventory 97/97 mapped；`python -m ai_sdlc program truth audit`：ready / fresh；`python -m ai_sdlc run --dry-run`：PASS；`python -m ai_sdlc run`：PASS。
- Codex Review stale 404 / OpenAPI evidence response 修复后复验：`uv run pytest tests/contract/test_skill_registry_api.py tests/contract/test_contract_files_parse.py tests/unit/test_skill_registry.py -q`：27 passed。
- Codex Review stale 404 / OpenAPI evidence response 修复后复验：`uv run pytest -q`：224 passed；`uv run ruff check app tests`：All checks passed；`uv run ruff format --check app tests`：80 files already formatted。
- Codex Review stale 404 / OpenAPI evidence response 修复后复验：`python -m ai_sdlc program truth sync --execute --yes`：ready，source inventory 97/97 mapped；`python -m ai_sdlc program truth audit`：ready / fresh；`python -m ai_sdlc run --dry-run`：PASS；`python -m ai_sdlc run`：PASS。
