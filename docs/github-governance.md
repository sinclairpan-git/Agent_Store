# GitHub Governance

This repository follows the same default-branch governance shape used by the
local `AgentOps` and `Ai_AutoSDLC` reference repositories.

## Required Ruleset

- Ruleset name: `main-compatibility-gate`
- Target: default branch
- Enforcement: active
- Required check: `Compatibility Gate Result`
- Required flow: pull request before updating the protected branch
- Guardrails: branch deletion blocked, non-fast-forward updates blocked

The reusable ruleset payload is stored at
`.github/rulesets/main-compatibility-gate.json`.

Apply it with:

```sh
gh api repos/OWNER/REPO/rulesets \
  --method POST \
  --input .github/rulesets/main-compatibility-gate.json
```

## Workflow Coverage

`Compatibility Gate` is the protected aggregate check. It verifies repository
contracts on Linux, macOS, and Windows with Python 3.11 and 3.12, runs the
AI-SDLC adapter status and dry-run entry, checks Windows `pwsh` and `cmd`
execution, builds Agent Store bundles, and smoke-tests extracted artifacts on
all supported operating systems.

`PR Checks` is a fast Ubuntu-only contract and bundle smoke for pull requests.

`Release Build` creates platform-named governance/spec bundles for Linux,
macOS, and Windows, then validates each extracted artifact before upload.
