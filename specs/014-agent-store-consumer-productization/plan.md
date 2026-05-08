# 014 实现计划

## Constitution 对齐

- Persist decisions to the repository：新增 `spec.md`、`plan.md`、`tasks.md`、执行日志与总结，保留阶段决策。
- Prefer contract-level verification before closure：扩展前端静态校验，验证组件、字段和边界字符串。
- Keep docs and code traceable：所有代码改动对应本阶段任务与验收标准。

## 方案

采用前端优先的产品化切片，不引入新服务端依赖：

1. 在 mock catalog 中新增产品发现字段，包括受众、采用度、评分摘要、预计接入时长、推荐理由、前置条件和成果。
2. 在 Vue2 app state 中新增 discovery collection，筛选逻辑先应用搜索/类型/可信/安装状态，再应用集合。
3. 增加 discovery rail、产品化 Agent 卡片和详情决策面板组件。
4. 调整 CSS，使首页更像商店发现页，同时保持工作台信息密度和移动端稳定。
5. 更新 `verify-frontend.mjs`，把新增产品化体验纳入可机器验证范围。

## 风险与约束

- 推荐集合是目录策展结果，不声称个性化模型或真实推荐算法。
- 评分和采用度是展示字段，不驱动可信判定。
- 非官方条目的 L5、签名、credential 仍保持 unavailable，避免前端越权推断。
