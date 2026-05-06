#!/usr/bin/env python3
"""Cross-platform repository contract checks for Agent Store."""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path


REQUIRED_FILES = [
    "AGENTS.md",
    "README.md",
    "program-manifest.yaml",
    ".ai-sdlc/memory/constitution.md",
    ".ai-sdlc/profiles/tech-stack.yml",
    ".ai-sdlc/profiles/decisions.yml",
    ".ai-sdlc/state/checkpoint.yml",
    "docs/framework-defect-backlog.zh-CN.md",
    "specs/001-agent-store-phase1-trusted-min-loop/spec.md",
    "specs/001-agent-store-phase1-trusted-min-loop/plan.md",
    "specs/001-agent-store-phase1-trusted-min-loop/research.md",
    "specs/001-agent-store-phase1-trusted-min-loop/data-model.md",
    "specs/001-agent-store-phase1-trusted-min-loop/tasks.md",
    "specs/001-agent-store-phase1-trusted-min-loop/task-execution-log.md",
]

REQUIRED_CONTRACTS = [
    "specs/001-agent-store-phase1-trusted-min-loop/contracts/agent-registry.openapi.yaml",
    "specs/001-agent-store-phase1-trusted-min-loop/contracts/agentops-summary.openapi.yaml",
    "specs/001-agent-store-phase1-trusted-min-loop/contracts/installation-bootstrap.openapi.yaml",
    "specs/001-agent-store-phase1-trusted-min-loop/contracts/trusted-evidence-loop.openapi.yaml",
]

TEXT_SUFFIXES = {
    ".bat",
    ".cmd",
    ".json",
    ".md",
    ".ps1",
    ".py",
    ".sh",
    ".toml",
    ".txt",
    ".yaml",
    ".yml",
}

SKIP_PARTS = {
    ".git",
    "__pycache__",
    ".pytest_cache",
    ".ruff_cache",
    "dist",
    "dist-agent-store",
    "node_modules",
}

WINDOWS_RESERVED_NAMES = {
    "CON",
    "PRN",
    "AUX",
    "NUL",
    *(f"COM{i}" for i in range(1, 10)),
    *(f"LPT{i}" for i in range(1, 10)),
}

WINDOWS_FORBIDDEN = set('<>:"\\|?*')
CONFLICT_MARKER = re.compile(rb"^(<<<<<<<|=======|>>>>>>>)", re.MULTILINE)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", default=".", help="Repository root or extracted bundle root.")
    parser.add_argument("--report", help="Optional JSON report path.")
    return parser.parse_args()


def should_skip(path: Path) -> bool:
    parts = set(path.parts)
    if parts & SKIP_PARTS:
        return True
    return any(part.startswith("ai-sdlc-offline-") for part in path.parts)


def iter_files(root: Path) -> list[Path]:
    return sorted(
        path
        for path in root.rglob("*")
        if path.is_file() and not should_skip(path.relative_to(root))
    )


def check_required(root: Path, errors: list[str]) -> None:
    for rel in [*REQUIRED_FILES, *REQUIRED_CONTRACTS]:
        if not (root / rel).is_file():
            errors.append(f"missing required file: {rel}")


def check_path_portability(files: list[Path], root: Path, errors: list[str]) -> None:
    seen_lower: dict[str, str] = {}
    for path in files:
        rel = path.relative_to(root).as_posix()
        lowered = rel.lower()
        if lowered in seen_lower and seen_lower[lowered] != rel:
            errors.append(f"case-insensitive path collision: {seen_lower[lowered]} <-> {rel}")
        seen_lower[lowered] = rel

        for part in path.relative_to(root).parts:
            if part.endswith(" ") or part.endswith("."):
                errors.append(f"windows-incompatible trailing character in path: {rel}")
            if any(char in WINDOWS_FORBIDDEN for char in part):
                errors.append(f"windows-incompatible character in path: {rel}")
            stem = part.split(".", 1)[0].upper()
            if stem in WINDOWS_RESERVED_NAMES:
                errors.append(f"windows-reserved path component: {rel}")


def check_text_file(path: Path, root: Path, errors: list[str]) -> None:
    rel = path.relative_to(root).as_posix()
    data = path.read_bytes()
    if b"\x00" in data:
        errors.append(f"nul byte in text candidate: {rel}")
        return

    try:
        text = data.decode("utf-8")
    except UnicodeDecodeError as exc:
        errors.append(f"not valid utf-8: {rel}: {exc}")
        return

    if CONFLICT_MARKER.search(data):
        errors.append(f"merge conflict marker found: {rel}")
    if "\r" in text.replace("\r\n", ""):
        errors.append(f"mixed or bare carriage return line endings: {rel}")


def check_text_integrity(files: list[Path], root: Path, errors: list[str]) -> None:
    for path in files:
        if path.suffix.lower() in TEXT_SUFFIXES:
            check_text_file(path, root, errors)


def require_text(path: Path, root: Path, errors: list[str]) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except FileNotFoundError:
        errors.append(f"missing required file: {path.relative_to(root).as_posix()}")
    except UnicodeDecodeError as exc:
        errors.append(f"not valid utf-8: {path.relative_to(root).as_posix()}: {exc}")
    return ""


def check_ai_sdlc_contract(root: Path, errors: list[str]) -> None:
    agents = require_text(root / "AGENTS.md", root, errors)
    constitution = require_text(root / ".ai-sdlc/memory/constitution.md", root, errors)
    checkpoint = require_text(root / ".ai-sdlc/state/checkpoint.yml", root, errors)

    for needle in ("AI-SDLC", "ai-sdlc run --dry-run", "AGENTS.md"):
        if needle not in agents:
            errors.append(f"AGENTS.md does not mention required AI-SDLC entry: {needle}")

    for needle in ("Persist decisions", "contract-level verification", "traceable"):
        if needle not in constitution:
            errors.append(f"constitution.md does not mention governance principle: {needle}")

    for needle in ("current_stage:", "feature:", "completed_stages:"):
        if needle not in checkpoint:
            errors.append(f"checkpoint.yml does not include expected field: {needle}")


def check_openapi_contracts(root: Path, errors: list[str]) -> None:
    for rel in REQUIRED_CONTRACTS:
        text = require_text(root / rel, root, errors)
        for needle in ("openapi:", "info:", "paths:"):
            if needle not in text:
                errors.append(f"{rel} does not look like an OpenAPI contract; missing {needle}")


def main() -> int:
    args = parse_args()
    root = Path(args.root).resolve()
    errors: list[str] = []

    if not root.is_dir():
        errors.append(f"root is not a directory: {root}")
        files: list[Path] = []
    else:
        files = iter_files(root)
        check_required(root, errors)
        check_path_portability(files, root, errors)
        check_text_integrity(files, root, errors)
        check_ai_sdlc_contract(root, errors)
        check_openapi_contracts(root, errors)

    report = {
        "root": str(root),
        "file_count": len(files),
        "required_file_count": len(REQUIRED_FILES) + len(REQUIRED_CONTRACTS),
        "error_count": len(errors),
        "errors": errors,
    }

    if args.report:
        Path(args.report).write_text(json.dumps(report, indent=2, sort_keys=True), encoding="utf-8")

    if errors:
        print(json.dumps(report, indent=2, sort_keys=True), file=sys.stderr)
        return 1

    print(json.dumps(report, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
