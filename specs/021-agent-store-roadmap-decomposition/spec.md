# 021 Agent Store Roadmap Decomposition

基于 2026-05 Runtime 分层后的顶层 PRD 和 Agent Store 独立 PRD，本工作项把后续规划阶段归档为可执行 backlog，并把拆分约束写入仓库。

## Scope

- 新增 Agent Store 后续规划阶段归档文档。
- 固化阶段 0 / 阶段 1 的归档口径，明确阶段 2 当前进行中。
- 将 Runtime 分层后的 P0 强化范围拆成后续工作包。
- 将阶段 2 至阶段 5 的 Agent Store 后续能力拆成 AI-SDLC 可继续 refine / design / decompose / execute 的工作项索引。
- 记录每个工作包的阶段归属、类型和主要验收点。

## Non-Goals

- 不实现新 API、UI、数据库、真实 AgentOps HTTP 调用或 Runtime 集成。
- 不修改现有 OpenAPI contract、fixtures 或业务代码。
- 不重新定义 PRD 边界；本工作项只归档和拆分最新 PRD 已确定的边界。
- 不把阶段 6 生态自优化纳入当前 repo 的近端执行队列。

## Acceptance

- 阶段归档必须覆盖阶段 0 至阶段 6，并说明归档状态。
- AI-SDLC 约束必须覆盖决策入库、契约优先、可追踪、不越界、不破坏 standalone、状态可解释和收尾验证。
- 后续拆分必须优先体现 Runtime 分层后的 P0 强化：AgentManifest、RuntimeAvailability、HealthSummary freshness、Installation / DeviceBinding handoff。
- 拆分索引必须包含阶段 2 剩余工作、阶段 3 运行时联动、阶段 4 反馈/证据增强、阶段 5 生命周期治理。
- 文档必须明确 Store 不执行 Agent、不签发 Grant、不计算质量、不展示完整 Trace。

## Adversarial Review Synthesis

- Product / roadmap view：阶段归档不能把阶段 2 误写成已完成。018-020 只是阶段 2 的第一组后端契约，真正的上架向导、Manifest 适配和草案审核仍需继续拆分。
- Governance / contract view：Runtime 分层后，Agent Store 的近端优先级要先补可被 Runtime / Ops 消费的供给契约，再扩展安装器和生命周期治理；否则后续 UI 会缺少可验证事实源。

