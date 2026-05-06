# 框架缺陷待办

## 2026-05-06 | Recover 误将占位 formal 文档识别为 execute 就绪

| 字段 | 内容 |
|---|---|
| 现象 | 在 `001-agent-store-phase1-trusted-min-loop` 仅完成 refine 且 `plan.md` / `tasks.md` 明确为占位时，执行 `ai-sdlc recover --reconcile` 后 checkpoint 被推进到 `execute`。 |
| 触发场景 | 使用 `ai-sdlc workitem init` 生成 direct-formal 骨架，随后将 `plan.md`、`tasks.md` 标注为等待 design/decompose 的占位，再运行 recover reconcile。 |
| 影响范围 | 可能让后续操作者误以为 design、decompose、verify 已完成，从而绕过阶段门禁进入实现。 |
| 根因分类 | workflow + tool：recover reconcile 主要按文件存在性推断阶段，未识别占位元数据和 gate 结果。 |
| 未来杜绝方案摘要 | recover reconcile 推断阶段时必须读取 formal 文档 frontmatter / gate evidence；若 `stage: design-placeholder` 或 `stage: decompose-placeholder` 存在，不得推进到对应阶段之后。 |
| 建议改动层级 | tool、workflow、eval |
| prompt / context | 用户要求按 AI-SDLC 继续沉淀 Agent Store 阶段 1 规格，当前应停在 refine/design 边界。 |
| rule / policy | 强化 `pipeline` 规则中“文件存在不等于阶段完成”的约束，要求 reconcile 尊重占位状态。 |
| middleware | checkpoint reconcile 中增加 placeholder detector 和 gate-result detector。 |
| workflow | direct-formal 初始化后，如果 plan/tasks 是占位，推荐当前阶段为 design，而不是 execute。 |
| tool | 修改 `ai-sdlc recover --reconcile` 的阶段推断逻辑。 |
| eval | 增加回归用例：spec 存在、plan/tasks 为 placeholder、recover 后 current_stage 必须为 design。 |
| 风险等级 | 高 |
| 可验证成功标准 | 在同类占位 work item 上运行 recover 后，checkpoint 只记录 init/refine 完成，current_stage 为 design。 |
| 是否需要回归测试补充 | 是 |
