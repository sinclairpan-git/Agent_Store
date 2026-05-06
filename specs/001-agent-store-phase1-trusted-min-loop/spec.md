---
related_doc:
  - "/Users/sinclairpan/project/AI-Native底座开发文档/Agent_Store_AgentOps_AiSDLC_应用底座顶层规划_PRD.md"
  - "/Users/sinclairpan/project/AI-Native底座开发文档/Agent_Store_项目_PRD.md"
baseline_id: "agent-platform-baseline-2026-05-v1.4.2"
work_item_type: "new_requirement"
---

# 功能规格：Agent Store 阶段 1 可信最小闭环

**功能编号**：`001-agent-store-phase1-trusted-min-loop`  
**创建日期**：2026-05-05  
**状态**：已通过 refine/design/decompose/verify，等待 execute 授权  
**PRD 来源**：顶层规划 PRD v1.4.2 与 Agent Store 项目 PRD  

## 1. 背景与目标

Agent Store 项目要建设企业内部 Agent 应用商店、包管理和生命周期治理入口。阶段 1 不追求完整商店、完整安装器或完整上架向导，而是打通一条可证明、可运行、可验收的可信最小闭环。

本工作项只覆盖 Agent Store 侧阶段 1 能力：

- 登记 Agent Registry 草案，并把 Agent / Version / Owner / artifact metadata 作为后续 AgentOps 回显的入口事实。
- 展示 Ai_AutoSDLC 官方 Framework Capability 的只读详情页。
- 展示 `manual_installable-preview` 手动安装/激活入口，但不宣称完整托管安装、自动升级或完整 L5。
- 回显企业 bootstrap 状态，包括 installation assertion、device binding、Reporter credential 和签名测试事件结果。
- 消费 AgentOps 的质量、证据、审批和策略摘要，只展示摘要、状态和跳转，不计算质量、不存储证据原文、不签发运行时 Grant。
- 明确 Ai_AutoSDLC standalone 与 enterprise managed 的边界，保证本地独立使用不被 Agent Store / AgentOps 强制阻断。

## 2. 范围

### 2.1 本期包含

- Agent Registry 草案数据模型和草案详情查询能力。
- Ai_AutoSDLC 官方应用只读详情页信息结构。
- `manual_installable-preview` 状态展示和企业激活命令展示规则。
- Installation / Device Binding / Signed Installation Assertion 的最小字段契约。
- Quality / Evidence Summary、Approval Status、Runtime Policy Summary 的回显契约。
- 官方应用页上的 standalone、enterprise managed、degraded、pending verification 文案和状态行为。
- 阶段 1 contract test 设计，覆盖 schema、幂等、签名、状态降级和 standalone 不过度耦合。

### 2.2 本期不包含

- 完整 Agent 安装器、自动升级、卸载和回滚。
- 上架向导、包自动识别、包校验、修复 Prompt 和 Skill Registry 完整发布流程。
- AgentOps 质量评分引擎、Evidence Store 原文查询和 L5 完整判定链。
- Policy Service 的运行时 Grant 签发和高风险审批完整闭环。
- 商店推荐、榜单、运营后台、安装分布统计和反馈闭环。
- 改造 Ai_AutoSDLC CLI、Reporter、Outbox 的内部实现。

## 3. 用户角色

| 角色 | 阶段 1 核心任务 |
|---|---|
| Agent 使用者 | 进入官方应用页，理解 Ai_AutoSDLC 是什么、能否本地使用、是否可企业激活、当前激活/上报状态如何 |
| Ai_AutoSDLC 维护者 | 维护官方应用元数据、版本、artifact hash、签名、安装说明、兼容性和降级说明 |
| Agent Owner | 查看 Agent 草案、Owner、版本、证据摘要和后续发布准备状态 |
| AgentOps 管理员 | 通过 Agent Store 元数据定位 installation、device、run、evidence summary 和降级原因 |
| 安全/IAM | 查看签名、issuer、expires_at、审批/策略摘要和高风险降级状态 |

## 4. 用户场景与测试

### 用户故事 1 - 查看 Ai_AutoSDLC 官方应用页（优先级：P0）

作为 Agent 使用者，我希望在 Agent Store 中看到 Ai_AutoSDLC 的官方只读详情页，以便判断它是官方 SDLC Framework、能解决什么问题、能否本地独立使用、是否可以接入企业证据平台。

**优先级说明**：这是阶段 1 最小闭环的前台入口；没有官方页，就无法承载 `manual_installable-preview`、standalone 说明和 AgentOps 回显。

**独立测试**：使用固定官方应用种子数据打开详情页，验证首屏字段、状态、主按钮、降级说明和权限字段均符合本规格。

**验收场景**：

1. **场景 1：官方页首屏信息完整**  
   **Given** 官方应用 `framework.ai-autosdlc` 处于 `official_readonly` 或 `manual_installable-preview`，**When** 用户打开详情页，**Then** 页面必须展示 official 标识、类型、维护团队、版本、用途、standalone 使用说明、企业接入收益、证据能力说明和当前主按钮。
2. **场景 2：standalone 不要求企业 installation_id**  
   **Given** 用户只查看本地安装说明，**When** 页面展示 standalone 命令或 README 入口，**Then** 页面不得要求 installation_id、device_id、Reporter credential 或企业登录作为本地使用前置。
3. **场景 3：企业接入提示可解释**  
   **Given** 检测到企业受管上下文，**When** 页面展示企业接入提示，**Then** 必须展示 `required_by`、`source`、`issuer`、`policy_owner`、`policy_version`、`can_ignore` 和 `affected_actions`。

### 用户故事 2 - 手动激活并回显 bootstrap 状态（优先级：P0）

作为企业内部使用者，我希望在完整安装器交付前通过 `manual_installable-preview` 获得可信激活路径，以便 AgentOps 能把后续企业上报与 installation、device、artifact 和 user 绑定。

**优先级说明**：PRD 明确阶段 1 如果无法完成 bootstrap，只能展示 pending L5 verification 或最高 L4；因此 bootstrap 状态是区分 L5-capable 与实际 L5 的关键。

**独立测试**：调用最小 bootstrap mock/service，创建 installation assertion、device binding、credential 状态和签名测试事件，验证 Agent Store 的状态推进与错误降级。

**验收场景**：

1. **场景 1：生成可信安装断言**  
   **Given** 用户点击企业激活入口，**When** 统一认证通过且 artifact metadata 有效，**Then** Agent Store 必须创建 installation_id、device_id、artifact_hash、agent_version、issuer、expires_at 和 signed_installation_assertion。
2. **场景 2：签名测试成功后回显激活状态**  
   **Given** AgentOps 已签发 Reporter credential 并验签测试事件，**When** Agent Store 拉取状态摘要，**Then** 官方页必须展示 enterprise_state 为 `active`，bootstrap_status 至少达到 `signature_verified`。
3. **场景 3：签名或 hash 不匹配时阻断**  
   **Given** 本地请求携带的 artifact_hash 与 Agent Store 发布事实不一致，**When** 请求创建 installation 或 credential，**Then** 系统必须返回 `PACKAGE_HASH_MISMATCH`，并在页面展示重新获取命令的主动作。

### 用户故事 3 - AgentOps 摘要回显而不越界计算（优先级：P0）

作为 Agent Owner 或 AgentOps 管理员，我希望 Agent Store 只展示 AgentOps 产生的质量、证据、审批和策略摘要，以便用户能理解可信状态，同时保持事实源边界清晰。

**优先级说明**：顶层基线规定 Agent Store 是入口与分发面，AgentOps 是运行事实与质量面；越界计算会破坏跨项目事实源。

**独立测试**：以 AgentOps mock 响应覆盖正常、无权限、降级、过期四类摘要，验证 Agent Store 展示摘要、trace_id/audit_id 和跳转，而不保存原文证据。

**验收场景**：

1. **场景 1：质量证据摘要正常回显**  
   **Given** AgentOps 返回 evidence_level、confidence、missing_evidence、score_template_id 和 valid_until，**When** 用户查看官方页证据卡片，**Then** 页面必须展示摘要和缺失项，并提供携带 trace_id 的 AgentOps 跳转。
2. **场景 2：摘要过期时展示待刷新**  
   **Given** 当前时间超过 valid_until，**When** 页面渲染质量摘要，**Then** 不得继续展示为有效质量结论，必须展示“待刷新”或等价降级状态。
3. **场景 3：证据原文无权限时不泄露**  
   **Given** AgentOps 返回 evidence raw access denied，**When** 用户点击查看原文，**Then** Agent Store 只能展示脱敏摘要和 Evidence Vault 申请入口，并记录 audit_id。

### 用户故事 4 - 登记 Agent Registry 草案（优先级：P1）

作为 Ai_AutoSDLC 维护者，我希望在 Agent Store 中登记官方应用草案元数据，以便后续阶段可以延展到正式发布、安装器和生命周期治理。

**优先级说明**：Registry 草案是阶段 1 的后端事实入口，但相比官方页和 bootstrap 可稍后落地。

**独立测试**：创建 `framework.ai-autosdlc` 草案，验证同一版本不可覆盖、Owner 字段来源可追溯、草案能被 AgentOps 消费。

**验收场景**：

1. **场景 1：草案创建成功**  
   **Given** 提交的官方应用草案包含 agent_id、display_name、version、owner_team、artifact_hash、signature 和 status，**When** 调用 Agent Registry API，**Then** 系统必须创建草案并返回 schema_version、trace_id 和草案详情。
2. **场景 2：缺少 Owner 时拒绝**  
   **Given** 草案缺少 owner_team 或 owner_user 来源，**When** 调用创建接口，**Then** 系统必须返回 `AGENT_OWNER_REQUIRED`，不得进入 published。
3. **场景 3：同版本不可覆盖**  
   **Given** `framework.ai-autosdlc@x.y.z` 已存在，**When** 再次提交同 agent_id 与 version 但 artifact_hash 不同的草案，**Then** 系统必须拒绝覆盖并提示发布新版本。

### 用户故事 5 - 理解可信证据链与实际 L5 状态（优先级：P0）

作为 Agent 使用者或 Owner，我希望官方页能用白话解释当前证据来自哪次 run、是否完成违约扫描、是否通过 L5 gate，以及为什么仍处于待验证或降级，以便我不会把 `L5-capable` 误解成实际 AgentOps L5。

**优先级说明**：阶段 1 的可信闭环如果没有 run/session 级证据来源，就只能展示聚合状态，无法证明“这次运行”的证据链。

**独立测试**：构造 Reporter signed event、AgentOps summary 和 Store official view model，验证 `trace_id`、`run_id`、`session_id`、`evidence_summary_id`、`l5_gate_result` 和官方页状态一致。

**验收场景**：

1. **场景 1：run 级证据链可追踪**  
   **Given** AgentOps 返回 run/session 级证据摘要，**When** 用户查看官方页证据卡片，**Then** 页面必须展示最近同步时间、证据等级、缺失证据、L5 gate 结果、违约扫描状态，并提供携带 trace_id 的跳转。
2. **场景 2：违约扫描未完成不得展示 actual L5**  
   **Given** `l5_gate_result=passed` 但 `violation_scan_completed=false`，**When** 页面渲染证据状态，**Then** 不得展示实际 L5，只能展示待验证或降级原因。
3. **场景 3：治理加载状态降级可解释**  
   **Given** Ai_AutoSDLC governance assertion 返回 `degraded` 或 `unsupported`，**When** 用户查看官方页，**Then** 页面必须解释降级原因、影响动作和诊断入口。

### 用户故事 6 - 从激活失败中恢复（优先级：P0）

作为企业内部使用者，我希望手动激活过程能显示当前步骤、是否可重试、何时轮询、命令是否过期、如何重新生成命令和复制诊断 ID，以便激活失败时可以自助恢复。

**优先级说明**：bootstrap 失败是阶段 1 最常见的阻断点；只返回错误码会让用户停在半安装状态。

**独立测试**：覆盖 assertion 过期、hash mismatch、AgentOps credential 暂不可用、权限不足四类失败，验证状态 API 给出可执行恢复动作。

**验收场景**：

1. **场景 1：激活状态可轮询**  
   **Given** installation 已创建但 credential 尚未签发，**When** 前端轮询 bootstrap status，**Then** API 必须返回 current_step、step_status、next_poll_after、primary_action 和 diagnostic_ref。
2. **场景 2：命令过期可重新生成**  
   **Given** activation command 或 assertion 已过期，**When** 用户查看激活状态，**Then** 页面必须展示重新生成命令的主动作，并阻断旧命令继续使用。
3. **场景 3：权限不足可申请或返回说明**  
   **Given** PermissionDecision 返回 denied，**When** 用户尝试企业激活，**Then** 页面必须展示 denied_scope、request_access_url、audit_id 和返回官方页的 return_path。

## 5. 边界情况

- AgentOps 不可用：官方页展示“企业证据待同步”或“待验证”，但 standalone 本地说明仍可查看。
- 统一认证不可用：企业激活入口不可用，低风险只读页面可继续展示。
- credential 过期、吊销或轮换中：页面必须展示 credential_status，并给出重新激活或联系 Owner 的下一步。
- installation assertion 过期：用户必须重新从 Agent Store 获取激活命令，不得复用过期命令。
- `enterprise_state = active` 但 reporter_status 降级：不得展示实际 L5，只能展示 L5-capable 或待验证。
- `l5_gate_result=passed` 但 `violation_scan_completed=false`：不得展示实际 L5，只能展示待验证。
- AgentOps summary 缺 run_id 或 session_id：不得把聚合摘要展示为 run 级结论。
- 用户无证据详情权限：只展示脱敏摘要、申请入口和 audit_id。
- custom_sink 或 standalone：不得冒用 AgentOps L5 判定。

## 6. 功能需求

- **FR-001**：系统必须提供 Agent Registry 草案创建和查询能力，草案至少包含 `agent_id`、`display_name`、`version`、`owner_team`、`owner_user`、`status`、`artifact_hash`、`signature`、`issuer`、`created_at`、`schema_version` 和 `trace_id`。
- **FR-002**：系统必须把 Ai_AutoSDLC 官方应用识别为 `Framework Capability / SDLC Framework`，并支持 `official_draft`、`official_readonly`、`manual_installable-preview` 三类阶段 1 展示状态。
- **FR-003**：系统必须在官方页区分 `L5-capable` 与实际 AgentOps L5；未完成 bootstrap、credential、签名测试和 L5 Eligibility Gate 时不得展示实际 L5。
- **FR-004**：系统必须展示 standalone 本地使用说明，并保证 standalone 路径不要求企业 `installation_id`、`device_id`、Reporter credential 或 AgentOps endpoint。
- **FR-005**：系统必须支持 `manual_installable-preview` 企业激活入口，激活命令必须绑定 `artifact_hash`、`package_signature`、`issuer`、`issued_at`、`expires_at` 和 `agent_version`。
- **FR-006**：系统必须创建 Installation / Device Binding 最小记录，包含 `installation_id`、`device_id`、`agent_id`、`agent_version`、`artifact_hash`、`user`、`device_os`、`status`、`created_at` 和 `trace_id`。
- **FR-007**：系统必须生成或接收 signed_installation_assertion，断言至少包含 `installation_id`、`device_id`、`artifact_hash`、`issuer`、`expires_at` 和 `key_id`。
- **FR-008**：系统必须消费 AgentOps Credential Bootstrap 结果，并展示 `bootstrap_status`、`credential_status`、`reporter_status`、`enterprise_state` 和 `degraded_reason`。
- **FR-009**：系统必须消费 AgentOps Quality / Evidence Summary，展示 `evidence_level`、`confidence`、`missing_evidence`、`score_template_id`、`calculated_at`、`valid_until` 和 `trace_id`。
- **FR-010**：系统必须消费 AgentOps Approval Status Summary，展示 `approval_id`、`status`、`SLA`、`decision`、`expires_at`、`audit_id` 和下一步动作。
- **FR-011**：系统必须消费 AgentOps Runtime Policy Summary，展示 `policy_ref`、`fallback_action`、`runtime_risk_level`、`enforcement_mode` 和策略阻断原因。
- **FR-012**：系统不得计算质量评分、不得存储证据原文、不得签发运行时 Capability Grant，相关动作必须跳转或回显 AgentOps / Evidence Vault。
- **FR-013**：系统所有阶段 1 API 响应必须包含 `schema_version`、`error_code` 和 `trace_id`；写操作必须支持幂等键。
- **FR-014**：系统必须为关键错误返回稳定错误码，包括 `AGENT_OWNER_REQUIRED`、`PACKAGE_HASH_MISMATCH`、`INSTALLATION_ASSERTION_EXPIRED`、`STANDALONE_OVERCOUPLED`、`APPROVAL_EXPIRED`。
- **FR-015**：系统必须按统一状态注册模板记录状态字段的展示名、白话解释、严重程度、主按钮、次按钮、可见角色、通知规则、审计要求和允许流转。
- **FR-016**：系统必须提供官方应用治理视图模型，包含 `summary`、`use_cases`、`current_user_installability`、`supported_os`、`package_trust_summary`、`standalone_action`、`enterprise_activation_action`、`primary_action`、`secondary_actions` 和角色可见字段密度。
- **FR-017**：系统必须提供企业接入上下文 `enterprise_context`，包含 `integration_mode`、`required_by`、`source`、`issuer`、`policy_owner`、`policy_version`、`can_ignore`、`affected_actions`、`custom_sink_support_status` 和 `requires_enterprise`。
- **FR-018**：系统必须提供 bootstrap status 查询能力，返回 `current_step`、`step_status`、`next_poll_after`、`retryable`、`retry_after`、`regenerate_command_url`、`diagnostic_ref`、`last_error_code` 和可执行 action。
- **FR-019**：系统必须使用受控 AuthContext / PermissionDecision 派生可信身份和权限结论，不得把客户端提交的裸 `user_id` 作为安装、设备绑定或 credential 请求的事实源。
- **FR-020**：系统必须扩展 signed_installation_assertion 安全语义，包含 `assertion_version`、`alg`、`canonicalization`、`issued_at`、`audience`、`subject_user_id`、`nonce`、`replay_window_seconds`、`device_public_key_thumbprint`、`assertion_hash` 和 `revocation_status`。
- **FR-021**：系统必须提供 Trusted Evidence Loop 契约，证明 Reporter signed event、AgentOps ingestion、Evidence summary 和 Agent Store 回显共享可校验的 `trace_id`、`run_id`、`session_id`、`installation_id` 和 `artifact_hash`。
- **FR-022**：系统必须在 AgentOps Summary 中包含 run/session 级来源字段：`run_id`、`session_id`、`identity_confidence`、`source_event_ids`、`evidence_summary_id`、`l5_gate_result`、`violation_scan_completed`、`summary_validity_state` 和 `degraded_reason`。
- **FR-023**：系统必须为跨系统导航和权限失败返回 `links`、`permission_state`、`request_access_url`、`return_url`、`redaction_reason`、`audit_id` 和 `trace_id`，不得把 Evidence Vault 原文暴露给无权限用户。
- **FR-024**：系统必须提供治理型错误响应，包含稳定 `error_code`、`message_key`、`severity`、`retryable`、`recommended_action_id`、`support_ref`、`audit_id`、`trace_id` 和脱敏 details；具体展示文案由 UI 映射。
- **FR-025**：系统必须提供 PackageTrustSummary，至少包含 `package_id`、`hash_algorithm`、`package_signature_alg`、`key_id`、`source_repo`、`source_commit`、`sbom_ref`、`scan_report_ref`、`compatibility_status`、`trust_state` 和 `signature_state`。
- **FR-026**：系统必须提供 AI-SDLC governance assertion 回显，包含 `adapter_state`、`load_verification_method`、`verified_at`、`evidence_hash`、`degraded_reason` 和 `unsupported_reason`。
- **FR-027**：系统必须把状态注册表升级为共享状态机契约，记录 `source_of_truth`、`entry_evidence`、`last_verified_at`、`conflict_resolution`、`can_ignore`、`affected_actions`、`return_path`、`notification_rule`、`audit_required` 和 `allowed_next_states`。

## 7. 关键实体

| 实体 | 事实源 | 阶段 1 关键字段 |
|---|---|---|
| Agent | Agent Store | agent_id、display_name、category、owner_team、owner_user、status、official_flag |
| AgentVersion | Agent Store | agent_id、version、artifact_hash、signature、issuer、release_status、created_at |
| Installation | Agent Store | installation_id、agent_id、version、user、device_id、device_os、status、trace_id |
| DeviceBinding | Agent Store | device_id、installation_id、user、artifact_hash、bound_at、expires_at |
| SignedInstallationAssertion | Agent Store + AgentOps 验证 | installation_id、device_id、artifact_hash、issuer、expires_at、key_id、signature |
| CredentialBootstrapSummary | AgentOps | credential_status、bootstrap_status、signature_test_status、degraded_reason |
| QualityEvidenceSummary | AgentOps | evidence_level、confidence、missing_evidence、score_template_id、valid_until |
| ApprovalStatusSummary | AgentOps | approval_id、status、SLA、decision、expires_at、audit_id |
| RuntimePolicySummary | AgentOps | policy_ref、fallback_action、runtime_risk_level、enforcement_mode |
| OfficialAppViewModel | Agent Store | summary、use_cases、installability、actions、enterprise_context、package_trust_summary |
| EnterpriseContext | Agent Store + Ai_AutoSDLC | integration_mode、required_by、policy_owner、can_ignore、affected_actions、requires_enterprise |
| PackageTrustSummary | Agent Store | package_id、hash_algorithm、signature_state、source_commit、sbom_ref、scan_report_ref |
| AuthContext | 统一认证 / IAM | subject、tenant、org、project、repo、identity_confidence、auth_context_id |
| PermissionDecision | AgentOps / IAM | decision、denied_scope、permission_decision_id、audit_id、request_access_url |
| RunEvidenceSummary | AgentOps | run_id、session_id、evidence_summary_id、source_event_ids、l5_gate_result、violation_scan_completed |
| GovernanceAssertion | Ai_AutoSDLC + AgentOps | adapter_state、load_verification_method、verified_at、evidence_hash、degraded_reason |

## 8. 状态与流转

| 状态域 | 阶段 1 枚举 | 阶段 1 展示要求 |
|---|---|---|
| official_app_stage | official_draft、official_readonly、manual_installable-preview | 中文展示为官方草案、官方只读页、可手动激活预览 |
| installation_status | not_installed、activation_required、reporter_pending、failed、revoked | 阶段 1 不展示完整 installed 生命周期承诺 |
| bootstrap_status | not_started、assertion_issued、device_bound、credential_issued、signature_verified、expired、failed | 每个状态必须有主按钮和诊断路径 |
| enterprise_state | not_detected、detected_optional、required_unactivated、activating、active、degraded、disabled | active 只在 credential、device、installation 验证完成后展示 |
| reporter_status | disabled、local_only、pending_upload、sent、degraded、failed | 只消费 Ai_AutoSDLC / AgentOps 回显，不自算 |

状态进入共享状态机前必须补齐 `source_of_truth`、`entry_evidence`、`last_verified_at`、`conflict_resolution`、`can_ignore`、`affected_actions`、`return_path`、`notification_rule`、`audit_required` 和 `allowed_next_states`。当多个系统给出冲突状态时，页面必须展示降级解释，不得选择性展示最乐观状态。

## 9. 契约测试要求

| test_id | 契约 | 正例 | 反例/错误码 |
|---|---|---|---|
| AS-CT-001 | Agent Registry | 官方草案创建后可查询并可同步 AgentOps | 缺 Owner 返回 `AGENT_OWNER_REQUIRED` |
| AS-CT-003 | Installation / Device Binding | 创建 installation_id/device_id 并保持幂等 | artifact_hash 不匹配返回 `PACKAGE_HASH_MISMATCH` |
| AS-CT-004 | Quality / Evidence Summary | 展示证据摘要、缺失项和 trace_id | 无权限时只展示脱敏摘要 |
| AS-CT-005 | Approval Status | pending/approved/rejected 可回显 | 过期返回 `APPROVAL_EXPIRED` |
| AS-CT-006 | Ai_AutoSDLC Standalone Official Page | standalone 页面展示本地安装路径 | standalone 要求 installation_id 返回 `STANDALONE_OVERCOUPLED` |
| AS-CT-007 | Signed Installation Assertion | assertion 字段完整且可验签 | 过期返回 `INSTALLATION_ASSERTION_EXPIRED` |
| AS-CT-008 | Trusted Evidence Loop | signed Reporter event -> AgentOps ingestion -> Evidence summary -> Store official view 共用 trace/run/session | 缺 run_id/session_id 或事件签名不一致时不得展示 actual L5 |
| AS-CT-009 | Assertion Security Profile | alg/canonicalization/nonce/replay/device key/revocation 均可校验 | replay、revoked、audience 不匹配返回稳定错误 |
| AS-CT-010 | AuthContext / PermissionDecision | 安装身份由 SSO token 派生并返回 permission decision | 客户端伪造 user_id 被拒绝并记录 audit_id |
| AS-CT-011 | Bootstrap Status Recovery | status API 返回轮询、重试、重生命令和诊断入口 | 过期命令不得继续使用 |
| AS-CT-012 | Cross-System Navigation | AgentOps summary 返回 links、permission_state、return_url 和 audit_id | 无权限只能展示脱敏摘要和申请入口 |
| AS-CT-013 | State Source Guard | source_of_truth 和 entry_evidence 控制状态进入 | `enterprise_state=active` 且 `reporter_status=degraded` 不得展示 actual L5 |

## 10. 成功标准

- **SC-001**：Ai_AutoSDLC 官方页可从 Agent Registry 草案渲染，P0 首屏字段完整率达到 100%。
- **SC-002**：阶段 1 bootstrap 试点中 installation_id 和 device_id 创建成功率达到 PRD 要求的 95%。
- **SC-003**：有效 signed_installation_assertion 的 schema 和 signature 校验通过率达到 99%，无签名事件不得进入实际 L5 展示。
- **SC-004**：Quality / Evidence Summary 回显 100% 带 `evidence_level`、`confidence`、`missing_evidence`、`score_template_id` 和 `valid_until`。
- **SC-005**：standalone contract test 100% 通过，未配置 Agent Store / AgentOps 时本地说明不得出现强制企业登录或企业 installation_id 要求。
- **SC-006**：关键错误码 contract test 覆盖率达到 100%，至少覆盖本规格列出的 5 个稳定错误码。
- **SC-007**：无权限、过期、降级、AgentOps 不可用四类状态均有可执行主按钮、次按钮、trace_id 或 audit_id。
- **SC-008**：Trusted Evidence Loop contract test 100% 通过，所有 actual L5 展示均能反查 run_id、session_id、evidence_summary_id 和 signed source event。
- **SC-009**：assertion 安全负向测试覆盖 replay、expired、revoked、audience mismatch、device key mismatch，覆盖率达到 100%。
- **SC-010**：官方页治理视图模型覆盖普通使用者、Owner、AgentOps 管理员、安全/IAM 四种角色，角色字段密度和可执行 action 均通过 snapshot 测试。
- **SC-011**：bootstrap 状态恢复链路覆盖轮询、重试、重新生成命令、诊断复制和权限申请，关键失败场景 100% 有 recommended_action_id。
- **SC-012**：可访问性验收覆盖键盘可达、焦点可见、状态 live update、复制命令反馈和窄屏文本不遮挡，阶段 1 P0 页面用例通过率 100%。

## 11. 宪章对齐

- 决策持久化：本工作项把阶段 1 范围、非目标、状态和契约落到仓库 `specs/001-agent-store-phase1-trusted-min-loop/spec.md`。
- 契约优先验证：本规格先定义 AS-CT-001、AS-CT-003、AS-CT-004、AS-CT-005、AS-CT-006、AS-CT-007，再进入实现。
- 文档与代码可追踪：后续 `plan.md`、`data-model.md`、`contracts/`、`tasks.md` 必须引用本规格 FR / SC / AS-CT 编号。

## 12. 阶段出口

本 refine 阶段完成的出口是：本规格通过 `ai-sdlc gate refine --wi specs/001-agent-store-phase1-trusted-min-loop`。通过后进入 design，产出 `research.md`、`data-model.md`、`plan.md` 和 `contracts/`，不得直接进入产品代码实现。
