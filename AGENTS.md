# AI-SDLC（Codex / OpenAI Codex CLI 提示）

本工程使用 **AI-SDLC** 自动化流水线。

- 宪章：`.ai-sdlc/memory/constitution.md`
- **终端约定**：引导用户在已配置好的终端（venv 已激活、`ai-sdlc` 在 PATH）中执行；Codex 对话环境未必继承该 PATH。若裸命令不可用，使用 `python -m ai_sdlc ...`。
- 分阶段清单：`ai-sdlc stage show <阶段名>`
- 先检查接入真值：`ai-sdlc adapter status`
- 启动入口（先执行）：`ai-sdlc run --dry-run` 或 `python -m ai_sdlc run --dry-run`（安全预演；不证明治理激活）
- 全流程执行：`ai-sdlc run`

当前 Codex adapter 以 `AGENTS.md` 作为 canonical path。治理侧以 `materialized / verified_loaded / degraded / unsupported` 为准；只有存在 machine-verifiable 证据时，才可视为 `verified_loaded`。

当用户在聊天中输入任何需求/任务描述时，优先引导并先执行上述启动入口（两种写法择一，以用户终端能成功为准）。`run --dry-run` 通过后只表示 CLI 预演成功，再进入细化、分解与实现；它本身不构成治理激活证明。

请在修改 `specs/` 与 `.ai-sdlc/` 下文档时遵守上述入口。

（自动安装；不覆盖已有同名自定义文件。）

## GitHub PR / Codex Review 守护规则

当用户要求“push 到远端 / 提 PR / @codex review / 守护到可合入”或表达等价意图时，按以下闭环执行：

- 每完成一个明确阶段（例如 `specs/NNN-*` 阶段落地、阶段验收验证通过并形成提交）后，默认立即将阶段分支 push 到远端、创建 PR、评论 `@codex review` 并启动每 5 分钟一次的 PR 守护 heartbeat；不得停在本地提交状态等待用户再次要求。
- 推送前先确认工作区状态、变更范围与必要本地验证结果；不得回滚用户未授权的既有改动。
- 将当前工作分支 push 到远端，并基于目标分支创建 PR；除非用户明确要求 ready 状态，否则优先创建 draft PR。
- PR 创建后评论 `@codex review` 触发 Codex Review。
- 为当前线程创建每 5 分钟一次的 heartbeat 守护任务，检查 PR review 结果与 GitHub checks 状态。
- 若 review 或 checks 发现可执行问题，立即定位、修复、运行相关验证、提交并 push，再次评论 `@codex review`，继续守护。
- 只有当 Codex Review 明确反馈“没有发现问题”（例如 `Didn't find any major issues` / `没有发现问题` 等等价结论）且 GitHub required checks 全部通过时，才可认定“同意合入”。
- PR 守护达到“Codex Review 反馈没有发现问题 + GitHub required checks 全部通过”状态后，默认自动 merge 到目标分支；若 PR 仍为 draft，先标记 ready，再执行 merge。
- 只有当用户明确要求“不自动合入 / 仅报告 / 等我确认”时，才在达到可合入状态后停止并向用户报告 PR、review 与 checks 的最终状态。

<!-- AI-SDLC managed shell guidance -->
Project preferred shell: zsh.
Use zsh POSIX shell syntax for commands and environment variables. Do not start with PowerShell or cmd.exe syntax.
