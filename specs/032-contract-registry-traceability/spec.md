# 032 Contract Registry Traceability

031 完成 Agent/version 生命周期治理后，021 中的 Runtime 分层 P0-E 仍缺一个独立落地点：Contract Registry traceability。032 建立只读合同注册追踪基线，让每个 OpenAPI contract 都能反查 Owner、Producer、Consumer、appendix CCT 和 contract test。

## Scope

- 新增 `contract_registry_traceability.v1` domain contract。
- 新增只读 API contract，输出所有 Agent Store OpenAPI 合同的追踪索引。
- 更新 cross-project contract appendix，新增 Contract Registry Traceability V1 与 CCT-017。
- 单元与契约测试覆盖完整追踪、OpenAPI 解析、合同文件全覆盖和必要追踪轴。

## Non-Goals

- 不实现外部 Contract Registry 服务、数据库、后台管理 UI 或跨仓库同步。
- 不替代既有 OpenAPI 合同，也不改变现有生产/消费语义。
- 不自动扫描 GitHub PR 或真实 CI 状态。

## Acceptance

- 每个 `*.openapi.yaml` 合同都有 `contract_id`、`contract_file`、`primary_schema`、`owner`、`producer`、`consumers`、`cct_ids`、`contract_test_files` 和 `appendix_anchor`。
- 新增合同文件未登记时，契约测试必须失败。
- `coverage_summary.unmapped_contracts=0` 时 registry 状态为 `complete`。
- `docs/cross-project-contract-appendix.md` 包含 CCT-017 和 PRD 更新口径。

## Risks

- Governance risk：如果只维护文档矩阵，新增合同容易漏掉消费者或测试文件。
  Control：contract test 直接对比 registry entries 与 OpenAPI 文件集合。
- Scope risk：Contract Registry 可能膨胀成真实注册服务。
  Control：本阶段只做只读 projection，不引入持久化或外部同步。
