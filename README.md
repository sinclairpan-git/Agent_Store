# Agent Store

Agent Store is the governance and product-planning repository for the phase 1
trusted minimum loop. It is managed with AI-SDLC and currently contains the
canonical Codex instructions, governance memory, formal specs, OpenAPI
contracts, and cross-platform GitHub automation.

## AI-SDLC Entry

Before changing `specs/` or `.ai-sdlc/` documents, run the safe entry check:

```sh
ai-sdlc adapter status
ai-sdlc run --dry-run
```

If `ai-sdlc` is not on `PATH`, use:

```sh
python -m ai_sdlc adapter status
python -m ai_sdlc run --dry-run
```

## Start The Framework

For AI-SDLC `v0.7.9`, the normal project entry is:

```sh
ai-sdlc init .
```

`ai-sdlc init .` automatically runs the safe startup rehearsal, then tells you
to switch to the AI chat with one next command in Chinese and English.

It is not a beginner-path setup step.

If an older guide mentions `ai-sdlc install`, treat `No such command 'install'`
as expected drift and use the current update path instead:

```sh
ai-sdlc self-update check
ai-sdlc self-update check --upgrade-existing
```

Current release notes and offline assets:

- `docs/releases/v0.7.9.md`
- `releases/download/v0.7.9/ai-sdlc-offline-0.7.9-windows-amd64.zip`
- `releases/download/v0.7.9/ai-sdlc-offline-0.7.9-macos-arm64.tar.gz`
- `releases/download/v0.7.9/ai-sdlc-offline-0.7.9-linux-amd64.tar.gz`

## Compatibility

The protected branch gate is `Compatibility Gate Result`. It aggregates:

- Linux, macOS, and Windows repository contract validation
- Python 3.11 and 3.12 AI-SDLC adapter/dry-run smoke from the required
  `Ai_AutoSDLC` compatibility baseline
- Non-blocking AI-SDLC forward-compatibility smoke against `Ai_AutoSDLC` `main`
- Windows `pwsh` and `cmd` command compatibility
- Cross-platform Agent Store bundle build and extraction smoke

Release bundles are produced by:

```sh
python scripts/build_agent_store_bundle.py
```
