# 021 Plan

1. Archive the latest Agent Store roadmap phases in `docs/agent-store-roadmap-phase-archive.zh-CN.md`.
2. Map each phase to AI-SDLC constraints: decision persistence, contract-first verification, traceability, source-of-truth ownership, and close-gate verification.
3. Split the post-PRD roadmap into follow-up work packages, prioritizing Runtime-layered P0 Store contracts before broader UI expansion.
4. Record non-goals so future work does not expand Store into Runtime, AgentOps, or Ai_AutoSDLC standalone responsibilities.
5. Verify the planning artifact with AI-SDLC dry-run and repository status checks.

## Risks

- Risk: Treating phase archive as implementation completion.
  Control: archive matrix separates `已归档为基线`, `已归档为本地可验证闭环`, `进行中`, and `待启动`.

- Risk: Continuing phase 2 UI before Runtime-facing Store contracts are ready.
  Control: P0-A through P0-E are marked as priority adjustments after Runtime separation.

- Risk: Store scope creeps into quality scoring, Grant issuance, execution, or Trace display.
  Control: non-goals and AI-SDLC constraints explicitly freeze those as out of scope.

