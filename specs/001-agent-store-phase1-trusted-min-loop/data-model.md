# 数据模型：Agent Store 阶段 1 可信最小闭环

**编号**：`001-agent-store-phase1-trusted-min-loop`  
**基线**：`agent-platform-baseline-2026-05-v1.4.2`

## 1. 模型边界

Agent Store 是 Agent / Version / Installation / Device Binding 的事实源。AgentOps 是 Quality / Evidence / Approval / Runtime Policy summary 的事实源。阶段 1 不把 AgentOps 原始证据复制进 Agent Store。

## 2. 表定义

### 2.1 agents

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| agent_id | string | 是 | 全局唯一稳定 ID，例如 `framework.ai-autosdlc` |
| display_name | string | 是 | 用户展示名 |
| type | string | 是 | `agent`、`skill`、`framework_capability` |
| category | string | 是 | 受控分类 |
| owner_team | string | 是 | 来自统一组织 |
| owner_user | string | 是 | 来自统一身份 |
| status | string | 是 | draft、official_readonly、manual_installable-preview 等 |
| official_flag | boolean | 是 | 是否官方内置应用 |
| created_at | datetime | 是 | 创建时间 |
| updated_at | datetime | 是 | 更新时间 |
| summary | string | 是 | 官方页短描述 |
| use_cases | json | 是 | 适用场景列表 |
| supported_os | json | 是 | 支持 OS 与最低版本 |

索引：

- 主键：`agent_id`
- 查询索引：`status`、`owner_team`、`official_flag`

### 2.2 agent_versions

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| agent_id | string | 是 | 关联 agents |
| version | string | 是 | 语义化版本 |
| artifact_hash | string | 是 | 包内容 hash |
| signature | string | 是 | 包签名 |
| issuer | string | 是 | 签发方 |
| release_status | string | 是 | official_draft、official_readonly、manual_installable-preview |
| package_signature | string | 是 | 激活命令绑定签名 |
| package_id | string | 是 | 包 ID |
| hash_algorithm | string | 是 | hash 算法 |
| package_signature_alg | string | 是 | 包签名算法 |
| key_id | string | 是 | 签名 key |
| source_repo | string | 否 | 来源代码仓 |
| source_commit | string | 否 | 来源 commit |
| sbom_ref | string | 否 | SBOM 引用 |
| scan_report_ref | string | 否 | 扫描报告引用 |
| compatibility_status | string | 是 | unknown、static_passed、smoke_passed、install_verified |
| issued_at | datetime | 是 | 签发时间 |
| expires_at | datetime | 是 | 激活命令过期时间 |
| created_at | datetime | 是 | 创建时间 |

约束：

- 唯一键：`agent_id + version`
- 同一版本发布后不可覆盖 artifact_hash。

### 2.3 installations

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| installation_id | string | 是 | 企业安装记录 ID |
| agent_id | string | 是 | 关联 Agent |
| agent_version | string | 是 | 关联版本 |
| user_id | string | 是 | 统一身份用户 |
| auth_context_id | string | 是 | 统一认证上下文 ID |
| permission_decision_id | string | 是 | 权限裁决 ID |
| tenant_id | string | 是 | 租户或组织 |
| project_id | string | 否 | 项目或 repo 绑定 |
| device_id | string | 是 | 设备绑定 ID |
| device_os | string | 是 | macOS、Windows、Linux 等 |
| artifact_hash | string | 是 | 本次安装绑定 hash |
| status | string | 是 | activation_required、reporter_pending、failed、revoked 等 |
| enterprise_state | string | 是 | detected_optional、activating、active、degraded 等 |
| trace_id | string | 是 | 链路追踪 |
| created_at | datetime | 是 | 创建时间 |
| updated_at | datetime | 是 | 更新时间 |

索引：

- 主键：`installation_id`
- 查询索引：`agent_id + agent_version`、`user_id`、`device_id`

### 2.4 device_bindings

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| device_id | string | 是 | 设备 ID |
| installation_id | string | 是 | 关联安装记录 |
| user_id | string | 是 | 统一身份用户 |
| artifact_hash | string | 是 | 绑定 artifact |
| device_public_key_thumbprint | string | 是 | 设备公钥指纹 |
| bound_at | datetime | 是 | 绑定时间 |
| expires_at | datetime | 是 | 绑定过期时间 |
| status | string | 是 | active、expired、revoked |

约束：

- `device_id + installation_id` 唯一。
- 过期或吊销后不得签发新的 Reporter credential。

### 2.5 signed_installation_assertions

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| assertion_id | string | 是 | 断言 ID |
| installation_id | string | 是 | 安装记录 |
| device_id | string | 是 | 设备 ID |
| artifact_hash | string | 是 | artifact hash |
| issuer | string | 是 | 签发方 |
| key_id | string | 是 | 签名 key |
| assertion_version | string | 是 | 断言版本 |
| alg | string | 是 | 签名算法 |
| canonicalization | string | 是 | 规范化算法 |
| issued_at | datetime | 是 | 签发时间 |
| audience | string | 是 | 断言接收方 |
| subject_user_id | string | 是 | 从 AuthContext 派生的用户 |
| nonce | string | 是 | 防重放 nonce |
| replay_window_seconds | integer | 是 | 防重放窗口 |
| device_public_key_thumbprint | string | 是 | 设备公钥指纹 |
| assertion_hash | string | 是 | 断言内容 hash |
| signature | string | 是 | 签名 |
| expires_at | datetime | 是 | 过期时间 |
| status | string | 是 | active、expired、revoked |
| revocation_status | string | 是 | not_revoked、revoked、unknown |

### 2.6 agentops_summary_cache

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| summary_id | string | 是 | 摘要 ID |
| agent_id | string | 是 | Agent ID |
| agent_version | string | 是 | 版本 |
| installation_id | string | 否 | 安装记录 |
| summary_type | string | 是 | quality_evidence、approval、runtime_policy、credential_bootstrap |
| payload | json | 是 | AgentOps summary，不含原始证据 |
| calculated_at | datetime | 否 | AgentOps 计算时间 |
| valid_until | datetime | 否 | 摘要有效期 |
| trace_id | string | 是 | 链路追踪 |
| run_id | string | 否 | AgentOps run ID |
| session_id | string | 否 | AgentOps session ID |
| evidence_summary_id | string | 否 | Evidence summary ID |
| source_event_ids | json | 否 | 组成摘要的事件 ID |
| l5_gate_result | string | 否 | passed、failed、pending、not_applicable |
| violation_scan_completed | boolean | 否 | 违约扫描是否完成 |
| identity_confidence | number | 否 | 身份匹配置信度 |
| summary_validity_state | string | 否 | fresh、stale、expired、degraded |

约束：

- `valid_until` 过期后 UI 必须降级为待刷新。
- payload 不得包含 Evidence Vault 原文。

## 3. 状态注册字段

所有状态进入实现前必须补齐：

| 字段 | 说明 |
|---|---|
| machine_value | 稳定枚举值 |
| display_name | 中文展示名 |
| plain_language_explanation | 白话解释 |
| severity | info、warning、error、blocked |
| primary_action | 主动作 |
| secondary_action | 次动作 |
| visible_roles | 可见角色 |
| owner_system | Agent Store、AgentOps、Ai_AutoSDLC |
| notification_rule | 通知规则 |
| audit_required | 是否审计 |
| allowed_next_states | 合法下一状态 |
| source_of_truth | 状态事实源 |
| entry_evidence | 进入该状态所需证据 |
| last_verified_at | 最近校验时间 |
| conflict_resolution | 多事实源冲突时的裁决规则 |
| can_ignore | 用户是否可忽略 |
| affected_actions | 受影响动作 |
| return_path | 跨系统返回路径 |

## 4. 视图与治理辅助模型

### 4.1 official_app_view_models

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| view_id | string | 是 | 页面视图模型 ID |
| agent_id | string | 是 | 官方应用 ID |
| role | string | 是 | 使用者、Owner、AgentOps 管理员、安全/IAM |
| summary | string | 是 | 面向用户的用途摘要 |
| use_cases | json | 是 | 适用场景 |
| current_user_installability | string | 是 | installable、approval_required、activation_required、blocked、standalone_only |
| primary_action_id | string | 是 | 主动作 ID |
| secondary_action_ids | json | 是 | 次动作 ID |
| enterprise_context_id | string | 否 | 企业接入上下文 |
| package_trust_summary_id | string | 是 | 包可信摘要 |
| latest_evidence_summary_id | string | 否 | 最近证据摘要 |

### 4.2 enterprise_contexts

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| enterprise_context_id | string | 是 | 上下文 ID |
| integration_mode | string | 是 | standalone、enterprise_managed、custom_sink |
| enterprise_state | string | 是 | not_detected、detected_optional、required_unactivated、activating、active、degraded、disabled |
| required_by | string | 否 | 要求接入的主体 |
| source | string | 是 | 检测信号来源 |
| issuer | string | 否 | 签发方 |
| policy_owner | string | 否 | 策略 Owner |
| policy_version | string | 否 | 策略版本 |
| can_ignore | boolean | 是 | 是否可忽略 |
| affected_actions | json | 是 | 未激活时受影响动作 |
| requires_enterprise | boolean | 是 | 当前路径是否要求企业接入 |
| custom_sink_support_status | string | 否 | custom_unconfigured、custom_incomplete、custom_connected、custom_degraded |

### 4.3 package_trust_summaries

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| package_trust_summary_id | string | 是 | 摘要 ID |
| package_id | string | 是 | 包 ID |
| trust_state | string | 是 | trusted、warning、blocked、unknown |
| signature_state | string | 是 | verified、expired、mismatch、missing |
| hash_match_state | string | 是 | matched、mismatched、unknown |
| issuer_display | string | 是 | 面向用户展示的签发方 |
| diagnostic_ref | string | 否 | 诊断引用 |

### 4.4 permission_decisions

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| permission_decision_id | string | 是 | 权限裁决 ID |
| auth_context_id | string | 是 | 认证上下文 |
| decision | string | 是 | allow、deny、approval_required |
| denied_scope | string | 否 | 被拒绝的权限范围 |
| request_access_url | string | 否 | 申请权限入口 |
| audit_id | string | 是 | 审计 ID |
| trace_id | string | 是 | 链路追踪 |

### 4.5 error_presentations

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| error_code | string | 是 | 稳定错误码 |
| message_key | string | 是 | 本地化文案 key |
| severity | string | 是 | info、warning、error、blocked |
| retryable | boolean | 是 | 是否可重试 |
| recommended_action_id | string | 是 | 推荐动作 |
| support_ref | string | 否 | 支持或诊断引用 |
| audit_id | string | 否 | 审计 ID |
| trace_id | string | 是 | 链路追踪 |

### 4.6 governance_assertions

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| assertion_id | string | 是 | 治理加载断言 ID |
| adapter_state | string | 是 | verified_loaded、materialized、degraded、unsupported、unknown |
| load_verification_method | string | 是 | 机器校验方式 |
| verified_at | datetime | 否 | 校验时间 |
| evidence_hash | string | 否 | 校验证据 hash |
| degraded_reason | string | 否 | 降级原因 |
| unsupported_reason | string | 否 | 不支持原因 |

## 5. 数据保留原则

- Agent / AgentVersion / Installation 作为治理事实长期保留。
- assertion 和 device binding 按安全策略过期、吊销或轮换。
- AgentOps summary cache 只保留摘要，不保留证据原文。
- audit_id、trace_id、error_code 必须保留到可审计周期结束。
