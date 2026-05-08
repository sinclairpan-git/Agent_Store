# Release Gate Evidence: Agent Installation Workflow Preview

**功能编号**：`003-agent-installation-workflow-preview`
**执行日期**：2026-05-08
**结论**：本工作项 release gate 证据已补齐；项目级 release docs consistency blocker 为既有框架发布文档缺口，不属于本阶段实现范围。

## Gate Inputs

- Work item docs: `spec.md`、`plan.md`、`tasks.md`、`task-execution-log.md`、`development-summary.md`
- Runtime scope: installation workflow preview view model、API handler、frontend workflow panel、workflow verification script
- Non-goals: no real installer execution, no credential issuance, no live AgentOps integration

## Gate Checks

```json
{
  "release_gate_evidence": {
    "overall_verdict": "WARN",
    "checks": [
      {
        "name": "recoverability",
        "verdict": "PASS",
        "evidence_source": "uv run pytest tests/unit/test_installation_workflow_preview.py tests/contract/test_installation_workflow_api.py -q",
        "reason": "Workflow preview covers installable, activation_required, standalone_only, blocked, and not-found recovery envelopes without executing real installer commands."
      },
      {
        "name": "portability",
        "verdict": "PASS",
        "evidence_source": "GitHub compatibility gate plus local uv/npm validation",
        "reason": "The work item uses Python typed handlers and static frontend verification; no platform-specific runtime path was introduced."
      },
      {
        "name": "multi_ide",
        "verdict": "PASS",
        "evidence_source": "ai-sdlc run --dry-run and OPENAI_CODEX=1 ai-sdlc run",
        "reason": "AI-SDLC adapter status remains host-verifiable through the Codex canonical AGENTS.md path, and no IDE-specific workflow assumption was added."
      },
      {
        "name": "stability",
        "verdict": "PASS",
        "evidence_source": "npm --prefix frontend run verify; uv run pytest -q; uv run ruff check app tests; uv run ruff format --check app tests",
        "reason": "Frontend workflow assertions, full backend tests, lint, and format checks all passed."
      },
      {
        "name": "release_docs_consistency",
        "verdict": "WARN",
        "evidence_source": "uv run ai-sdlc verify constraints",
        "reason": "Existing framework release docs consistency blockers remain outside this work item and were not fabricated by this close evidence."
      }
    ]
  }
}
```

| Gate | Result | Evidence |
| --- | --- | --- |
| AI-SDLC dry-run | PASS | `ai-sdlc run --dry-run` returned Stage close PASS. |
| AI-SDLC formal run | PASS | `OPENAI_CODEX=1 ai-sdlc run` returned Stage close PASS. |
| Frontend workflow verification | PASS | `npm --prefix frontend run verify` returned frontend verification passed. |
| Targeted workflow tests | PASS | `uv run pytest tests/unit/test_installation_workflow_preview.py tests/contract/test_installation_workflow_api.py -q` returned 7 passed. |
| Full tests | PASS | `uv run pytest -q` returned 170 passed. |
| Lint | PASS | `uv run ruff check app tests` returned All checks passed. |
| Format | PASS | `uv run ruff format --check app tests` returned 68 files already formatted. |
| Constraints | KNOWN-BLOCKED | `uv run ai-sdlc verify constraints` reported existing release docs consistency blockers unrelated to this work item. |

## Constraint Exception

`uv run ai-sdlc verify constraints` reports missing Ai-AutoSDLC v0.7.9 release documentation, README current-flow markers, USER_GUIDE, offline packaging docs, and PR checklist docs. Those release documentation artifacts are not produced by `003-agent-installation-workflow-preview`, and this close evidence does not fabricate them.

## Decision

The workflow preview implementation is release-gate ready for this work item. The known project-level release docs blocker remains tracked outside this phase and should be remediated by the framework release documentation workstream.
