# 018 执行日志

## Batch A - Package Validation Report

- **验证画像**：code-change
- **改动范围**：`app/agent_store/domain/package_validation.py`, `app/agent_store/api/package_validation.py`, `tests/unit/test_package_validation.py`, `tests/contract/test_package_validation_api.py`, `tests/contract/test_contract_files_parse.py`, `specs/001-agent-store-phase1-trusted-min-loop/contracts/package-validation.openapi.yaml`, `program-manifest.yaml`, `specs/018-package-validation-report/*`
- **PRD 追踪**：阶段 2 上架向导、包校验、修复 Prompt、Skill Registry、校验报告的第一片可验收实现。
- **边界**：不执行真实包上传、真实静态扫描、SBOM 生成、Skill 发布、IAM/AgentOps 调用或完整上架向导 UI。

### 已完成

- 新增 Package Validation 领域模型，输出字段级 issue、impact、fix action 与修复 Prompt。
- 新增 `PackageValidationAPI.validate_package`，支持 Idempotency-Key、稳定 envelope 与冲突错误。
- 新增 Package Validation OpenAPI contract，并纳入 contract parse gate。
- 新增单元与合同测试，覆盖 review-ready、blocked、fixable、AI source 和 idempotency conflict。

### 双专家对抗评审

**专家 A（PRD / 产品流程视角）**

- 发现：Package Validation 的目标是接收不完整候选包并返回字段级校验报告，但 OpenAPI `PackageManifestCandidate` / `SkillCandidate` 把字段声明为 required，容易让客户端或网关在报告生成前直接拒绝请求。
- 发现：候选 Skill 缺少 `skill_version` / `risk_level` 时没有专门 issue，不利于后续 Skill Registry 形成稳定身份和风险审查。
- 结论：018 应保留“候选态宽输入、报告态严输出”的边界，把缺字段表达为 validation issue，而不是请求 schema 阻断。

**专家 B（治理 / 契约兼容视角）**

- 发现：若请求 schema 过早强制完整字段，会和 PRD “校验报告必须字段级定位影响、原因和修复方式”冲突。
- 发现：`package_id` 在完全缺 `agent_id/version` 的候选包上需要稳定 fallback，避免 response required 字段出现空身份。
- 结论：OpenAPI 应只要求 `package_manifest` 对象存在；候选包内部缺失通过 response envelope、issue 和 fix prompt 统一治理。

**合议优化**

- 移除 OpenAPI `PackageManifestCandidate` / `SkillCandidate` 的内部 required 字段，保留 `package_manifest` 作为请求唯一硬要求。
- 新增 `SKILL_VERSION_REQUIRED`、`SKILL_RISK_LEVEL_REQUIRED` 字段级 issue。
- 新增 `candidate-package` fallback，保证完全不完整候选包仍返回稳定 report shape。
- 增加测试锁定不完整 manifest / skill 也必须进入 validation report，而不是被 contract 层提前拒绝。

### 本地验证

- `uv run pytest tests/unit/test_package_validation.py tests/contract/test_package_validation_api.py tests/contract/test_contract_files_parse.py -q`：15 passed。
- `uv run pytest -q`：192 passed。
- `uv run ruff check app tests`：All checks passed。
- `uv run ruff format --check app tests`：首次发现 `tests/unit/test_package_validation.py` 需要格式化；执行 `uv run ruff format tests/unit/test_package_validation.py` 后复跑 PASS，76 files already formatted。
- `python -m ai_sdlc program validate`：PASS。
- `python -m ai_sdlc program truth sync --execute --yes`：ready，source inventory 92/92 mapped。
- `python -m ai_sdlc program truth audit`：ready / fresh。
- `python -m ai_sdlc run --dry-run`：PASS。
- `python -m ai_sdlc run`：PASS，Stage close。
- 对抗评审合议优化后专项验证：`uv run pytest tests/unit/test_package_validation.py tests/contract/test_package_validation_api.py tests/contract/test_contract_files_parse.py -q`：17 passed；`uv run ruff check app tests`：All checks passed；`uv run ruff format --check app tests`：76 files already formatted。
