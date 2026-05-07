# Task Execution Log: Cross-Project Contract Appendix

**功能编号**：`007-cross-project-contract-appendix`
**执行日期**：2026-05-07
**状态**：本地文档完成，待 PR 评审

## 执行记录

| 任务 | 状态 | 说明 |
| --- | --- | --- |
| T007-01 梳理边界 | 完成 | 已对比顶层 PRD、Agent Store PRD、AgentOps PRD、当前 Agent Store/AgentOps 实现。 |
| T007-02 契约附录 | 完成 | 新增 `docs/cross-project-contract-appendix.md`。 |
| T007-03 字段冻结 | 完成 | 定义 `agentops_credential_handoff.v1`、`signed_installation_assertion.v1`、`device_proof.v1`。 |
| T007-04 状态与测试 | 完成 | 定义 bootstrap state crosswalk 和 CCT-001 到 CCT-006。 |
| T007-05 PRD/spec 后续修改点 | 完成 | 明确顶层 PRD、Agent Store、AgentOps、Ai_AutoSDLC 后续同步项。 |
| T007-06 本地验证 | 完成 | AI-SDLC dry-run、关键契约搜索和 program validate 已通过。 |

## 统一验证命令

- **验证画像**：code-change
- **改动范围**：`docs/cross-project-contract-appendix.md`、`specs/007-cross-project-contract-appendix/*`、`program-manifest.yaml`、`.ai-sdlc/state/*`

- `uv run ai-sdlc run --dry-run`
- `rg -n "agentops_credential_handoff.v1|signed_installation_assertion.v1|device_proof.v1|CCT-001|State Crosswalk" docs/cross-project-contract-appendix.md`
- `uv run pytest -q`
- `uv run ruff check app tests`
- `uv run ai-sdlc verify constraints`
- `uv run ai-sdlc program validate`
- `uv run ai-sdlc program truth sync --execute --yes`

## 已完成验证

- `uv run pytest -q`：147 passed。
- `uv run ruff check app tests`：通过。
- `rg -n "agentops_credential_handoff.v1|signed_installation_assertion.v1|device_proof.v1|CCT-001|State Crosswalk" docs/cross-project-contract-appendix.md`：命中关键契约。
- `uv run ai-sdlc program validate`：PASS。
- `uv run ai-sdlc program truth sync --execute --yes`：truth snapshot ready，001-007 mapped。
- `uv run ai-sdlc verify constraints`：命中既有 release docs consistency blockers，要求 Ai_AutoSDLC v0.7.9 发布文档、README current-flow markers、USER_GUIDE、offline packaging docs 等；该检查针对框架发布文档一致性，不属于本跨项目契约附录实现范围，本批不伪造无关 release docs。

## 代码审查

- 自检结论：本阶段只修改契约与治理文档，不改变运行时行为。
- 对抗重点：避免 Agent Store 越权签发 ReporterCredential/IngestionToken/DeviceKey；避免 AgentOps 越权写 Agent Store 注册事实；避免 Ai_AutoSDLC standalone 被企业接入阻断。
- Review evidence：已明确 CCT-001 到 CCT-006，由三项目共享 fixture 验证 producer/consumer 契约。
- Codex Review 修复：PR #9 初审指出 checkpoint `linked_wi_id` 已切到 007，但 `linked_plan_uri` 仍指向 001，可能导致恢复/同步工具加载错误 work item。已将其修正为 `specs/007-cross-project-contract-appendix/spec.md`。
- 安全边界：附录禁止从弱状态推断 `active`、`verified_loaded` 或 L5 eligibility。

## 任务/计划同步状态

- `tasks.md` 同步状态：T007-01 到 T007-06 已全部完成。
- `plan.md` 同步状态：5 个计划步骤已落到附录、规格、验证与 PR 准备。
- `program-manifest.yaml` 同步状态：已将 001-007 specs 纳入 manifest，并通过 `uv run ai-sdlc program validate`。
- 关联 branch/worktree disposition 计划：当前交付分支为 `feature/007-cross-project-contract-appendix`，计划提交后创建 PR；Codex Review 明确无问题且 GitHub required checks 全部通过后自动合入 `main`，随后删除远端/本地已合入分支。

## Git close-out

- **已完成 git 提交**：是（随本批 PR head 提交）
- **提交哈希**：pending-pr-head
- 当前分支：`feature/007-cross-project-contract-appendix`
- 当前批次 branch disposition 状态：planned_merge_after_pr_guard
- 当前批次 worktree disposition 状态：retained_until_merge

## 重要结论

- 顶层 PRD 的项目边界基本正确：Agent Store 是安装/注册事实源，AgentOps 是运行事实/credential/L5 事实源，Ai_AutoSDLC 是 Reporter/Outbox 生产侧。
- 当前偏差主要来自跨项目 handoff 契约没有原子冻结，而不是顶层方向错误。
- 后续应先把该附录同步到三项目 PRD/spec，再分别实现 producer/consumer/CLI device proof。
