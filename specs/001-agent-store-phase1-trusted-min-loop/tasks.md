# 任务分解：Agent Store 阶段 1 可信最小闭环

**编号**：`001-agent-store-phase1-trusted-min-loop`  
**来源**：`spec.md` + `plan.md` + `data-model.md` + `contracts/`  
**当前阶段**：decompose

## 分批策略

```text
Phase 0: 项目骨架与契约测试基础
Phase 1: Agent Registry 草案与官方页 view model
Phase 2: manual_installable-preview 与 bootstrap
Phase 3: AgentOps summary 回显与 standalone 边界
Phase 4: 验证、归档与交付检查
```

## Phase 0：项目骨架与契约测试基础

### Task 1.1 初始化 Python 服务骨架

- **覆盖规格**：FR-001、FR-013
- **优先级**：P0
- **依赖**：无
- **文件**：`pyproject.toml`、`app/agent_store/__init__.py`、`app/agent_store/api/__init__.py`、`app/agent_store/domain/__init__.py`、`tests/__init__.py`
- **可并行**：否
- **验收标准**：
  1. Python 3.11+ 项目可以被测试工具发现。
  2. 包路径与后续任务引用一致。
- **验证**：`python -m pytest -q`

### Task 1.2 固化 contract schema 加载与校验工具

- **覆盖规格**：AS-CT-001、AS-CT-003、AS-CT-004、AS-CT-005、AS-CT-006、AS-CT-007
- **优先级**：P0
- **依赖**：T001
- **文件**：`app/agent_store/contracts/loader.py`、`tests/contract/test_contract_files_parse.py`
- **可并行**：否
- **验收标准**：
  1. `specs/001-agent-store-phase1-trusted-min-loop/contracts/*.openapi.yaml` 可被测试加载。
  2. contract 文件缺少 `schema_version`、`trace_id`、`error_code` 响应字段时测试失败。
- **验证**：`python -m pytest tests/contract/test_contract_files_parse.py -q`

### Task 1.3 建立错误码与状态注册表

- **覆盖规格**：FR-014、FR-015
- **优先级**：P0
- **依赖**：T001
- **文件**：`app/agent_store/domain/status_registry.py`、`tests/unit/test_status_registry.py`
- **可并行**：是
- **验收标准**：
  1. 注册 `AGENT_OWNER_REQUIRED`、`PACKAGE_HASH_MISMATCH`、`INSTALLATION_ASSERTION_EXPIRED`、`STANDALONE_OVERCOUPLED`、`APPROVAL_EXPIRED`。
  2. 关键状态均有 display_name、plain_language_explanation、primary_action、secondary_action、owner_system。
- **验证**：`python -m pytest tests/unit/test_status_registry.py -q`

## Phase 1：Agent Registry 草案与官方页 view model

### Task 2.1 实现 Agent 与 AgentVersion 领域模型

- **覆盖规格**：FR-001、FR-002、SC-001
- **优先级**：P0
- **依赖**：T001
- **文件**：`app/agent_store/domain/models.py`、`tests/unit/test_agent_models.py`
- **可并行**：是
- **验收标准**：
  1. Agent 支持 `framework_capability` 类型和 official 标识。
  2. AgentVersion 同一 `agent_id + version` 不允许 artifact_hash 覆盖。
- **验证**：`python -m pytest tests/unit/test_agent_models.py -q`

### Task 2.2 实现 Agent Registry 草案 repository

- **覆盖规格**：FR-001、AS-CT-001
- **优先级**：P0
- **依赖**：T004
- **文件**：`app/agent_store/domain/repositories.py`、`tests/unit/test_agent_registry_repository.py`
- **可并行**：否
- **验收标准**：
  1. 创建草案成功返回 agent_id、version、artifact_hash、trace_id。
  2. 缺 Owner 返回 `AGENT_OWNER_REQUIRED`。
  3. 同版本不同 hash 返回稳定错误。
- **验证**：`python -m pytest tests/unit/test_agent_registry_repository.py -q`

### Task 2.3 实现 Agent Registry API handler

- **覆盖规格**：FR-001、FR-013、AS-CT-001
- **优先级**：P0
- **依赖**：T005
- **文件**：`app/agent_store/api/agent_registry.py`、`tests/contract/test_agent_registry_api.py`
- **可并行**：否
- **验收标准**：
  1. `createAgentDraft` 和 `getAgentDetail` 响应包含 `schema_version`、`trace_id`、`error_code`。
  2. 写操作支持 `Idempotency-Key`。
- **验证**：`python -m pytest tests/contract/test_agent_registry_api.py -q`

### Task 2.4 实现 Ai_AutoSDLC 官方页 view model

- **覆盖规格**：FR-002、FR-003、FR-004、SC-001、AS-CT-006
- **优先级**：P0
- **依赖**：T004、T003
- **文件**：`app/agent_store/ui/official_app_view.py`、`tests/unit/test_official_app_view.py`
- **可并行**：是
- **验收标准**：
  1. 页面模型展示 official 标识、Framework Capability 类型、维护团队、版本、standalone 说明和企业接入说明。
  2. 未完成 bootstrap 时只展示 L5-capable，不展示实际 L5。
  3. standalone 分支不要求 installation_id。
- **验证**：`python -m pytest tests/unit/test_official_app_view.py -q`

## Phase 2：manual_installable-preview 与 bootstrap

### Task 3.1 实现 Installation 与 DeviceBinding 领域模型

- **覆盖规格**：FR-006、SC-002
- **优先级**：P0
- **依赖**：T004
- **文件**：`app/agent_store/domain/installation.py`、`tests/unit/test_installation_models.py`
- **可并行**：是
- **验收标准**：
  1. installation 包含 installation_id、device_id、agent_id、agent_version、artifact_hash、user、device_os、status。
  2. 状态枚举限制在阶段 1 安装状态内。
- **验证**：`python -m pytest tests/unit/test_installation_models.py -q`

### Task 3.2 实现安装创建和幂等绑定

- **覆盖规格**：FR-006、FR-013、AS-CT-003
- **优先级**：P0
- **依赖**：T008、T005
- **文件**：`app/agent_store/domain/bootstrap_service.py`、`tests/unit/test_bootstrap_service.py`
- **可并行**：否
- **验收标准**：
  1. 同一 idempotency key 重试返回同一 installation / device binding。
  2. artifact_hash 不匹配返回 `PACKAGE_HASH_MISMATCH`。
- **验证**：`python -m pytest tests/unit/test_bootstrap_service.py -q`

### Task 3.3 实现 signed installation assertion

- **覆盖规格**：FR-007、SC-003、AS-CT-007
- **优先级**：P0
- **依赖**：T009
- **文件**：`app/agent_store/domain/assertions.py`、`tests/unit/test_installation_assertions.py`
- **可并行**：否
- **验收标准**：
  1. assertion 包含 installation_id、device_id、artifact_hash、issuer、expires_at、key_id、signature。
  2. 过期 assertion 返回 `INSTALLATION_ASSERTION_EXPIRED`。
- **验证**：`python -m pytest tests/unit/test_installation_assertions.py -q`

### Task 3.4 实现 Installation Bootstrap API handler

- **覆盖规格**：FR-005、FR-006、FR-007、FR-013、AS-CT-003、AS-CT-007
- **优先级**：P0
- **依赖**：T009、T010
- **文件**：`app/agent_store/api/installation_bootstrap.py`、`tests/contract/test_installation_bootstrap_api.py`
- **可并行**：否
- **验收标准**：
  1. API 响应符合 `installation-bootstrap.openapi.yaml`。
  2. hash mismatch、assertion expired、validation error 均有稳定错误码。
- **验证**：`python -m pytest tests/contract/test_installation_bootstrap_api.py -q`

## Phase 3：AgentOps summary 回显与 standalone 边界

### Task 4.1 实现 AgentOps summary 数据结构

- **覆盖规格**：FR-008、FR-009、FR-010、FR-011、SC-004
- **优先级**：P0
- **依赖**：T001
- **文件**：`app/agent_store/domain/agentops_summary.py`、`tests/unit/test_agentops_summary_models.py`
- **可并行**：是
- **验收标准**：
  1. quality、approval、runtime_policy、credential_bootstrap summary 字段与契约一致。
  2. `valid_until` 过期时模型能标记待刷新。
- **验证**：`python -m pytest tests/unit/test_agentops_summary_models.py -q`

### Task 4.2 实现 AgentOps summary client 和降级映射

- **覆盖规格**：FR-008、FR-009、FR-010、FR-011、FR-012、AS-CT-004、AS-CT-005
- **优先级**：P0
- **依赖**：T012、T003
- **文件**：`app/agent_store/integrations/agentops_client.py`、`tests/unit/test_agentops_client.py`
- **可并行**：否
- **验收标准**：
  1. AgentOps 不可用时返回企业证据待同步状态。
  2. 证据原文无权限时只返回脱敏摘要和 Evidence Vault 申请入口。
  3. Store 不计算 quality score。
- **验证**：`python -m pytest tests/unit/test_agentops_client.py -q`

### Task 4.3 实现 AgentOps summary API handler

- **覆盖规格**：FR-009、FR-010、FR-011、FR-013、AS-CT-004、AS-CT-005
- **优先级**：P1
- **依赖**：T013
- **文件**：`app/agent_store/api/agentops_summary.py`、`tests/contract/test_agentops_summary_api.py`
- **可并行**：否
- **验收标准**：
  1. API 响应符合 `agentops-summary.openapi.yaml`。
  2. `APPROVAL_EXPIRED`、无权限摘要、valid_until 过期均被覆盖。
- **验证**：`python -m pytest tests/contract/test_agentops_summary_api.py -q`

### Task 4.4 强化 standalone 防过度耦合 contract test

- **覆盖规格**：FR-004、SC-005、AS-CT-006
- **优先级**：P0
- **依赖**：T007、T011
- **文件**：`tests/contract/test_standalone_boundary.py`
- **可并行**：否
- **验收标准**：
  1. standalone 官方页不要求 enterprise installation_id。
  2. 若 standalone 路径要求企业字段，测试返回 `STANDALONE_OVERCOUPLED`。
- **验证**：`python -m pytest tests/contract/test_standalone_boundary.py -q`

## Phase 4：验证、归档与交付检查

### Task 5.1 补齐端到端 contract test 套件

- **覆盖规格**：SC-006、SC-007
- **优先级**：P0
- **依赖**：T006、T011、T014、T015
- **文件**：`tests/contract/test_phase1_trusted_loop.py`
- **可并行**：否
- **验收标准**：
  1. AS-CT-001、003、004、005、006、007 均有端到端 happy path 和 failure path。
  2. 5 个稳定错误码覆盖率 100%。
- **验证**：`python -m pytest tests/contract/test_phase1_trusted_loop.py -q`

### Task 5.2 补齐文档追踪矩阵

- **覆盖规格**：宪章原则 3、SC-001 至 SC-007
- **优先级**：P1
- **依赖**：T016
- **文件**：`specs/001-agent-store-phase1-trusted-min-loop/traceability.md`
- **可并行**：是
- **验收标准**：
  1. FR、SC、AS-CT 到任务编号的映射完整。
  2. 本期不包含项没有对应实现任务。
- **验证**：人工对账 + `rg -n "FR-|SC-|AS-CT-" specs/001-agent-store-phase1-trusted-min-loop/traceability.md`

### Task 5.3 建立执行归档文件

- **覆盖规格**：宪章原则 1
- **优先级**：P1
- **依赖**：T017
- **文件**：`specs/001-agent-store-phase1-trusted-min-loop/task-execution-log.md`
- **可并行**：否
- **验收标准**：
  1. 执行日志包含批次记录模板。
  2. 记录当前 docs 分支 disposition 待 close 阶段决策。
- **验证**：人工对账

## 依赖关系检查

```text
T001 -> T002
T001 -> T003
T001 -> T004
T004 -> T005 -> T006
T004 + T003 -> T007
T004 -> T008 -> T009 -> T010 -> T011
T001 -> T012 -> T013 -> T014
T007 + T011 -> T015
T006 + T011 + T014 + T015 -> T016 -> T017 -> T018
```

依赖关系无循环。
