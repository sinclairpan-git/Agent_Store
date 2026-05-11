# 051 Contract Registry Traceability Frontend Consumer

032 已冻结 `contract_registry_traceability.v1` 只读后端/API 投影，要求每个 OpenAPI contract 能反查 Owner、Producer、Consumer、appendix anchor 和 contract test。050 已补齐草案提交审核前端消费；本阶段继续把合同注册追踪接入 Agent 详情页，让 Owner / reviewer 在 UI 中看到当前 Agent 相关 contract 的治理来源与覆盖率。

## Scope

- 在前端 mock fixtures 中新增 `contractRegistryTraceability`，覆盖 25 个 OpenAPI contract 的 registry 完整覆盖摘要和焦点 contract 映射。
- 在 Vue root 中新增 `selectedContractRegistryTraceability`，按当前 Agent 选择焦点 contract，并在缺失时保守降级为 `incomplete`。
- 新增企业 Vue2 组件 `sdlc-contract-registry-traceability`，展示 registry status、coverage summary、focus contract、Owner / Producer、Consumers、CCT、contract test 和 source-of-truth。
- 更新静态 frontend verification，确保 `contract_registry_traceability.v1`、CCT-017、coverage、appendix anchor、contract test 和只读边界可被机器检查。

## Non-Goals

- 不实现外部 Contract Registry 服务、数据库、后台管理 UI 或跨仓库同步。
- 不扫描 GitHub PR、不读取真实 CI 状态、不自动修改 OpenAPI 或 appendix。
- 不改变既有 contract producer / consumer 语义，只消费 032 的只读 projection。

## Acceptance

- 页面必须展示 `contract_registry_traceability.v1`、`registry_status`、`coverage_summary`、`total_contracts=25`、`unmapped_contracts=0`。
- 页面必须展示当前 Agent 关联的 focus contract，并显示 `contract_id`、`contract_file`、`primary_schema`、`owner`、`producer`、`consumers`、`cct_ids`、`contract_test_files` 和 `appendix_anchor`。
- 缺少 registry envelope 时，前端必须保守降级为 `incomplete`，下一步为 `complete_contract_traceability`。
- 组件必须明确只读边界：不提供外部 registry 服务、不扫描 PR、不修改 CI 状态。
- 验证必须覆盖 frontend static check、相关 pytest/ruff、AI-SDLC truth sync/audit 与 dry-run/run。

## Adversarial Review Synthesis

- Product / reviewer view：reviewer 需要在详情页直接看到“这个面板背后的 contract 有谁负责、谁生产、谁消费、哪个 CCT 和测试兜底”，避免跨文档翻找。
- Governance / contract view：Contract Registry 是只读 projection，前端不得把展示能力扩展成扫描器、状态裁决器或外部注册服务。
