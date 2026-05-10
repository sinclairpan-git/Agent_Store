# Plan: Installation Distribution Summary

## Implementation

1. 新增纯 domain projection，输入安装事实数组与 viewer context，输出聚合分布。
2. API handler 沿用现有 idempotency 模式，保持 request identity 忽略 trace/audit。
3. OpenAPI 固化 privacy 字段：`individual_users_exposed=false`、`device_ids_exposed=false`、`aggregation_only=true`。
4. Contract Registry 增加 `installation_distribution_summary.v1`，映射 CCT-021。
5. 跑定向 pytest、全量 pytest、ruff、AI-SDLC truth/audit。

## Risks

| Risk | Control |
|---|---|
| Owner 分布变成个人明细 | 输出只包含聚合计数，privacy const 锁定不暴露个人和设备 |
| Store 越界计算质量 | source_of_truth 明确 `quality=agentops_not_computed_here` |
| 空库存被误认为 0 安装 | 区分 `distribution_unavailable` 和 `empty_distribution` |
