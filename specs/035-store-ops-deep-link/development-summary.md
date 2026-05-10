# Development Summary: Store Ops Deep Link

035 implements PRD `AS-CT-011 Store -> Ops Deep Link` as a Store projection over AgentOps summary facts. Store can now return sanitized AgentOps Run Detail navigation with run/session binding while preserving the boundary that Trace and Evidence raw content live outside Store.

## Changed

- Added `app/agent_store/domain/store_ops_deep_link.py`.
- Added `app/agent_store/api/store_ops_deep_link.py`.
- Added `store-ops-deep-link.openapi.yaml`.
- Added unit/API contract tests and OpenAPI parser assertions.
- Updated Contract Registry traceability and `docs/cross-project-contract-appendix.md` with CCT-020.

## Verification

- `uv run pytest tests/unit/test_store_ops_deep_link.py tests/contract/test_store_ops_deep_link_api.py tests/unit/test_contract_registry_traceability.py tests/contract/test_contract_registry_traceability_api.py tests/contract/test_contract_files_parse.py -q`：35 passed。
- `uv run ruff check app tests`：All checks passed。
- `uv run pytest -q`：416 passed。
- `uv run ruff format --check app tests`：134 files already formatted。
- `ai-sdlc verify constraints`：no BLOCKERs。
- `ai-sdlc program truth audit`：fresh / ready，source inventory 178/178 mapped。

## Boundaries

- No real AgentOps HTTP call, Evidence Vault workflow, permission service, raw Trace display, or Evidence raw display was added.
