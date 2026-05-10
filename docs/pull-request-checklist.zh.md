# Pull Request Checklist

## 发布文档一致性

- [ ] `README.md`
- [ ] `docs/releases/v0.7.9.md`
- [ ] `USER_GUIDE.zh-CN.md`
- [ ] `packaging/offline/README.md`

## 当前发布口径

- [ ] `v0.7.9`
- [ ] 普通用户主路径清晰。
- [ ] 不把 materialized only 写成 verified loaded。
- [ ] 记录离线包名：
  - `ai-sdlc-offline-0.7.9-windows-amd64.zip`
  - `ai-sdlc-offline-0.7.9-macos-arm64.tar.gz`
  - `ai-sdlc-offline-0.7.9-linux-amd64.tar.gz`

## Verification Profiles

- docs-only
- rules-only
- truth-only
- code-change
- `uv run ai-sdlc verify constraints`
- `python -m ai_sdlc program truth sync --dry-run`
- `uv run pytest`
- `uv run ruff check`
