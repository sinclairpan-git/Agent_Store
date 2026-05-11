# 044 Plan

1. 建立 044 阶段文档并挂入 program manifest。
2. 读取 030 domain/API 输出字段，按合同建立前端 fixture。
3. 在 Vue 根实例新增 `selectedFeedbackOwnerResponseLoop` 和缺摘要 fallback。
4. 在企业 Vue2 adapter 新增 `sdlc-feedback-owner-response-loop` 面板并接入详情页。
5. 更新前端静态验证，确保反馈闭环只展示 Store-owned lifecycle projection，不实现评论、排行、真实通知或 release notes 生成。
6. 运行 `npm run verify`、相关 Python 验证、Playwright 渲染检查与 AI-SDLC close。

## Risk Controls

| 风险 | 控制 |
|---|---|
| 非 Owner 关闭反馈 | fixture 和 UI 展示 `OWNER_RESPONSE_REQUIRED` 阻断状态 |
| release 未绑定但显示 released | 验证 `RELEASE_LINK_REQUIRED` 和 release linkage 字段 |
| 被误认为评论系统 | 文案和 verify 明确 no comments / no ranking / no marketplace |
| 被误认为通知已发送 | source-of-truth 固定 `agent_store_notification_queue`，只展示下一步 |
