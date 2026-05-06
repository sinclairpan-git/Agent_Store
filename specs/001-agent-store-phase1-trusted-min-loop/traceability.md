# 追踪矩阵：Agent Store 阶段 1 可信最小闭环

**工作项**：`001-agent-store-phase1-trusted-min-loop`  
**日期**：2026-05-06  
**范围**：Agent Registry、官方治理视图、manual_installable-preview bootstrap、AgentOps summary、Trusted Evidence Loop、企业 Vue2 官方页。

## FR 到任务

| 规格 | 覆盖任务 | 主要验证 |
|---|---|---|
| FR-001 | Task 2.1、2.2、2.3、5.1 | `tests/contract/test_agent_registry_api.py`、`tests/contract/test_phase1_trusted_loop.py` |
| FR-002 | Task 2.1、2.4、4.8 | `tests/unit/test_agent_models.py`、`tests/unit/test_official_app_view.py`、`frontend/scripts/verify-frontend.mjs` |
| FR-003 | Task 2.4、4.5、5.1 | `tests/unit/test_official_app_view.py`、`tests/contract/test_trusted_evidence_loop.py`、`tests/contract/test_phase1_trusted_loop.py` |
| FR-004 | Task 2.4、4.4、5.1 | `tests/contract/test_standalone_boundary.py`、`tests/contract/test_phase1_trusted_loop.py` |
| FR-005 | Task 3.1、3.2、3.4、3.5 | `tests/unit/test_bootstrap_service.py`、`tests/contract/test_installation_bootstrap_api.py` |
| FR-006 | Task 3.1、3.2、3.4、5.1 | `tests/unit/test_installation_models.py`、`tests/contract/test_phase1_trusted_loop.py` |
| FR-007 | Task 3.3、3.4、3.6、5.1 | `tests/unit/test_installation_assertions.py`、`tests/contract/test_assertion_security_profile.py` |
| FR-008 | Task 4.1、4.2、4.3、5.1 | `tests/unit/test_agentops_summary_models.py`、`tests/contract/test_agentops_summary_api.py` |
| FR-009 | Task 4.1、4.2、4.3、5.1 | `tests/contract/test_agentops_summary_api.py`、`tests/contract/test_phase1_trusted_loop.py` |
| FR-010 | Task 4.1、4.2、4.3、5.1 | `tests/contract/test_agentops_summary_api.py`、`tests/contract/test_phase1_trusted_loop.py` |
| FR-011 | Task 4.1、4.2、4.3、5.1 | `tests/unit/test_agentops_client.py`、`tests/contract/test_phase1_trusted_loop.py` |
| FR-012 | Task 4.2、4.3、4.7、5.1 | `tests/unit/test_agentops_client.py`、`tests/contract/test_cross_system_navigation_permission.py` |
| FR-013 | Task 1.2、2.3、3.4、4.3、5.1 | `tests/contract/test_contract_files_parse.py`、`tests/contract/test_phase1_trusted_loop.py` |
| FR-014 | Task 1.3、5.1 | `tests/unit/test_status_registry.py`、`tests/contract/test_phase1_trusted_loop.py` |
| FR-015 | Task 1.3、4.6、5.1 | `tests/unit/test_status_registry.py`、`tests/unit/test_state_source_guard.py` |
| FR-016 | Task 2.4、2.6、4.8 | `tests/unit/test_official_app_view_snapshots.py`、`frontend/scripts/verify-frontend.mjs` |
| FR-017 | Task 2.5、4.8、5.1 | `tests/unit/test_package_trust_enterprise_context.py`、`tests/contract/test_phase1_trusted_loop.py` |
| FR-018 | Task 3.5、4.8、5.1 | `tests/contract/test_bootstrap_status_recovery.py`、`tests/contract/test_phase1_trusted_loop.py` |
| FR-019 | Task 1.4、3.4、5.1 | `tests/unit/test_governed_actions_errors_permissions.py`、`tests/contract/test_phase1_trusted_loop.py` |
| FR-020 | Task 3.3、3.6、5.1 | `tests/contract/test_assertion_security_profile.py`、`tests/contract/test_phase1_trusted_loop.py` |
| FR-021 | Task 4.5、4.8、5.1 | `tests/contract/test_trusted_evidence_loop.py`、`tests/contract/test_phase1_trusted_loop.py` |
| FR-022 | Task 4.1、4.2、4.3、5.1 | `tests/unit/test_agentops_summary_models.py`、`tests/contract/test_phase1_trusted_loop.py` |
| FR-023 | Task 4.7、4.8、5.1 | `tests/contract/test_cross_system_navigation_permission.py`、`tests/contract/test_phase1_trusted_loop.py` |
| FR-024 | Task 1.4、3.5、5.1 | `tests/unit/test_governed_actions_errors_permissions.py`、`tests/contract/test_phase1_trusted_loop.py` |
| FR-025 | Task 2.5、4.8、5.1 | `tests/unit/test_package_trust_enterprise_context.py`、`tests/contract/test_phase1_trusted_loop.py` |
| FR-026 | Task 4.2、4.3、5.1 | `tests/unit/test_agentops_client.py`、`tests/contract/test_phase1_trusted_loop.py` |
| FR-027 | Task 4.6、4.8、5.1 | `tests/unit/test_state_source_guard.py`、`tests/contract/test_phase1_trusted_loop.py` |

## AS-CT 到测试

| 契约 | Happy path | Failure path |
|---|---|---|
| AS-CT-001 | `test_phase1_trusted_loop_happy_path_connects_registry_bootstrap_agentops_and_view` | `test_phase1_contract_failure_matrix_has_stable_errors_and_actions` |
| AS-CT-003 | `test_phase1_trusted_loop_happy_path_connects_registry_bootstrap_agentops_and_view` | `test_phase1_contract_failure_matrix_has_stable_errors_and_actions` |
| AS-CT-004 | `test_phase1_trusted_loop_happy_path_connects_registry_bootstrap_agentops_and_view` | `test_phase1_contract_failure_matrix_has_stable_errors_and_actions` |
| AS-CT-005 | `test_agentops_summary_api_covers_approval_expired_and_stale_quality` | `test_phase1_contract_failure_matrix_has_stable_errors_and_actions` |
| AS-CT-006 | `test_phase1_trusted_loop_happy_path_connects_registry_bootstrap_agentops_and_view` | `test_phase1_contract_failure_matrix_has_stable_errors_and_actions` |
| AS-CT-007 | `test_phase1_trusted_loop_happy_path_connects_registry_bootstrap_agentops_and_view` | `test_phase1_contract_failure_matrix_has_stable_errors_and_actions` |
| AS-CT-008 | `test_phase1_trusted_loop_happy_path_connects_registry_bootstrap_agentops_and_view` | `test_phase1_contract_failure_matrix_has_stable_errors_and_actions` |
| AS-CT-009 | `test_phase1_trusted_loop_happy_path_connects_registry_bootstrap_agentops_and_view` | `test_phase1_contract_failure_matrix_has_stable_errors_and_actions` |
| AS-CT-010 | `test_phase1_trusted_loop_happy_path_connects_registry_bootstrap_agentops_and_view` | `test_phase1_contract_failure_matrix_has_stable_errors_and_actions` |
| AS-CT-011 | `test_phase1_trusted_loop_happy_path_connects_registry_bootstrap_agentops_and_view` | `test_phase1_contract_failure_matrix_has_stable_errors_and_actions` |
| AS-CT-012 | `test_phase1_trusted_loop_happy_path_connects_registry_bootstrap_agentops_and_view` | `test_phase1_contract_failure_matrix_has_stable_errors_and_actions` |
| AS-CT-013 | `test_phase1_trusted_loop_happy_path_connects_registry_bootstrap_agentops_and_view` | `test_phase1_contract_failure_matrix_has_stable_errors_and_actions` |

## SC 到验收

| 成功标准 | 验收证据 |
|---|---|
| SC-001 | Registry draft、detail 与 official view 在 `test_phase1_trusted_loop_happy_path_connects_registry_bootstrap_agentops_and_view` 串联通过。 |
| SC-002 | Installation / Device Binding 在 bootstrap API happy path 创建并回显。 |
| SC-003 | Signed assertion 字段完整，signature/hash 由 `InstallationAssertionService` 校验。 |
| SC-004 | AgentOps summary 回显 `evidence_level`、`confidence`、`missing_evidence`、`score_template_id`、`valid_until`。 |
| SC-005 | Standalone overcoupling 负向路径返回 `STANDALONE_OVERCOUPLED`。 |
| SC-006 | 关键稳定错误码 `AGENT_OWNER_REQUIRED`、`PACKAGE_HASH_MISMATCH`、`INSTALLATION_ASSERTION_EXPIRED`、`STANDALONE_OVERCOUPLED`、`APPROVAL_EXPIRED` 均由 contract test 对账。 |
| SC-007 | 无权限、过期、降级、AgentOps 不可用均有 action、trace_id 或 audit_id。 |
| SC-008 | Trusted Evidence Loop 通过 signed reporter event 反查 run_id、session_id、evidence_summary_id 和 event_id。 |
| SC-009 | Assertion security 负向覆盖 replay、expired、revoked、audience mismatch、device key mismatch。 |
| SC-010 | 四类角色字段密度由 official app view snapshot 测试覆盖。 |
| SC-011 | Bootstrap status recovery 覆盖轮询、重试、重生命令、诊断和权限申请。 |
| SC-012 | Vue2 官方页 verify 覆盖键盘禁用链接、组件库 adapter、关键字段和静态 server 安全路径。 |

## 不包含项

- 不实现生产 HTTP server、真实 IAM/密钥系统、PostgreSQL 持久化、完整安装器、质量评分引擎或 runtime Capability Grant。
- 不把 AgentOps raw evidence 存入 Agent Store；无权限路径只回显脱敏摘要与 Evidence Vault 申请入口。
- 不要求 Ai_AutoSDLC standalone 路径提供企业 installation_id、device_id、Reporter credential 或 AgentOps endpoint。
