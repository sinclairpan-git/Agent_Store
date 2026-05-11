# 045 Plan

1. 建立 045 阶段文档并挂入 program manifest。
2. 读取 031 domain/API 输出字段，按合同建立前端 fixture。
3. 在 Vue 根实例新增 `selectedLifecycleGovernance` 和缺摘要 fallback。
4. 在企业 Vue2 adapter 新增 `sdlc-lifecycle-governance` 面板并接入详情页。
5. 更新前端静态验证，确保生命周期治理只展示 Store-owned projection，不修改 AgentVersion、不执行 Runtime、不签发 Grant、不覆盖 AgentOps PolicyDecision。
6. 运行 `npm run verify`、Python 验证、Playwright 渲染检查与 AI-SDLC close。

## Risk Controls

| 风险 | 控制 |
|---|---|
| security_revoked 被弱化 | fixture 和 UI 展示 `SECURITY_REVOKED_TERMINAL` 阻断 |
| replacement / rollback 缺失却继续推进 | verify 覆盖 replacement、rollback 和 impact 字段 |
| 前端误执行升级/回退 | action 文案固定为 notify / review，不执行 Runtime |
| 越过 AgentOps/Skill Registry 边界 | source-of-truth 和 non-goal 验证固定边界 |
