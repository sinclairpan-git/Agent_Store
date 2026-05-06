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
| signature | string | 是 | 签名 |
| expires_at | datetime | 是 | 过期时间 |
| status | string | 是 | active、expired、revoked |

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

## 4. 数据保留原则

- Agent / AgentVersion / Installation 作为治理事实长期保留。
- assertion 和 device binding 按安全策略过期、吊销或轮换。
- AgentOps summary cache 只保留摘要，不保留证据原文。
- audit_id、trace_id、error_code 必须保留到可审计周期结束。
