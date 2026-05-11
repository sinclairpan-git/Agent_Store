# 043 Plan

1. 建立 043 阶段文档并挂入 program manifest。
2. 读取 036 domain/API 输出字段，按合同建立前端 fixture。
3. 在 Vue 根实例新增 `selectedInstallationDistribution` 和缺摘要 fallback。
4. 在企业 Vue2 adapter 新增 `sdlc-installation-distribution` 面板并接入详情页。
5. 更新前端静态验证，确保安装分布只展示聚合、不暴露个人标识、不发送通知、不计算质量。
6. 运行 `npm run verify`、相关 Python 验证与 AI-SDLC close。

## Risk Controls

| 风险 | 控制 |
|---|---|
| 0 安装与无库存混淆 | 前端区分 `empty_distribution` 与 `distribution_unavailable` |
| 暴露安装明细 | fixture 和 verify 明确禁止 `individual_users_exposed`、`device_ids_exposed`、raw installation identifiers |
| 前端越权推导质量 | source-of-truth 固定 `quality: agentops_not_computed_here` |
| 通知被误认为已发送 | 只展示 `prepare_owner_notification`，不出现 sent 状态 |
