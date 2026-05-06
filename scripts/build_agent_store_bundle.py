#!/usr/bin/env python3
"""Build Agent Store governance/spec bundles with portable stdlib archives."""

from __future__ import annotations

import argparse
import io
import json
import os
import platform
import subprocess
import tarfile
import zipfile
from datetime import datetime, timezone
from pathlib import Path


INCLUDE_ROOT_FILES = [
    "AGENTS.md",
    "README.md",
    "program-manifest.yaml",
]

INCLUDE_DIRS = [
    ".ai-sdlc/memory",
    ".ai-sdlc/profiles",
    ".github/rulesets",
    ".github/scripts",
    ".github/workflows",
    "docs",
    "scripts",
    "specs",
]

INCLUDE_FILES = [
    ".ai-sdlc/state/checkpoint.yml",
    ".ai-sdlc/state/resume-pack.yaml",
]

EXCLUDE_PARTS = {
    ".git",
    "__pycache__",
    ".pytest_cache",
    ".ruff_cache",
    "dist",
    "dist-agent-store",
    "node_modules",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", default=".", help="Repository root.")
    parser.add_argument("--dist", default="dist-agent-store", help="Output directory.")
    parser.add_argument("--version", default=os.environ.get("AGENT_STORE_VERSION", "0.1.0"))
    parser.add_argument("--asset-os", default=os.environ.get("AGENT_STORE_ASSET_OS"))
    parser.add_argument("--asset-arch", default=os.environ.get("AGENT_STORE_ASSET_ARCH"))
    return parser.parse_args()


def normalize_os(value: str | None = None) -> str:
    value = (value or platform.system()).lower()
    if value in {"darwin", "mac"}:
        return "macos"
    if value.startswith("win"):
        return "windows"
    if value.startswith("linux"):
        return "linux"
    return value.replace(" ", "-")


def normalize_arch(value: str | None = None) -> str:
    value = (value or platform.machine()).lower()
    if value in {"x86_64", "x64"}:
        return "amd64"
    if value in {"aarch64", "arm64"}:
        return "arm64"
    return value.replace(" ", "-")


def current_commit(root: Path) -> str:
    env_sha = os.environ.get("GITHUB_SHA")
    if env_sha:
        return env_sha
    try:
        return subprocess.check_output(
            ["git", "rev-parse", "HEAD"],
            cwd=root,
            text=True,
            stderr=subprocess.DEVNULL,
        ).strip()
    except Exception:
        return "unknown"


def should_skip(path: Path) -> bool:
    if set(path.parts) & EXCLUDE_PARTS:
        return True
    return any(part.startswith("ai-sdlc-offline-") for part in path.parts)


def collect_files(root: Path) -> list[Path]:
    files: set[Path] = set()

    for rel in INCLUDE_ROOT_FILES + INCLUDE_FILES:
        path = root / rel
        if path.is_file():
            files.add(path)

    for rel in INCLUDE_DIRS:
        directory = root / rel
        if not directory.is_dir():
            continue
        for path in directory.rglob("*"):
            if path.is_file() and not should_skip(path.relative_to(root)):
                files.add(path)

    return sorted(files, key=lambda path: path.relative_to(root).as_posix())


def build_manifest(root: Path, files: list[Path], version: str, asset_os: str, asset_arch: str) -> dict[str, object]:
    return {
        "schema_version": 1,
        "name": "Agent Store",
        "version": version,
        "asset_os": asset_os,
        "asset_arch": asset_arch,
        "generated_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "source_commit": current_commit(root),
        "included_files": [path.relative_to(root).as_posix() for path in files],
    }


def write_zip(archive_path: Path, root: Path, base_dir: str, files: list[Path], manifest: dict[str, object]) -> None:
    with zipfile.ZipFile(archive_path, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for path in files:
            archive.write(path, f"{base_dir}/{path.relative_to(root).as_posix()}")
        archive.writestr(
            f"{base_dir}/bundle-manifest.json",
            json.dumps(manifest, indent=2, sort_keys=True) + "\n",
        )


def write_tar(archive_path: Path, root: Path, base_dir: str, files: list[Path], manifest: dict[str, object]) -> None:
    with tarfile.open(archive_path, "w:gz", format=tarfile.PAX_FORMAT) as archive:
        for path in files:
            archive.add(path, arcname=f"{base_dir}/{path.relative_to(root).as_posix()}", recursive=False)

        payload = (json.dumps(manifest, indent=2, sort_keys=True) + "\n").encode("utf-8")
        info = tarfile.TarInfo(f"{base_dir}/bundle-manifest.json")
        info.size = len(payload)
        info.mtime = int(datetime.now(timezone.utc).timestamp())
        info.mode = 0o644
        archive.addfile(info, io.BytesIO(payload))


def main() -> int:
    args = parse_args()
    root = Path(args.root).resolve()
    dist = Path(args.dist).resolve()
    asset_os = normalize_os(args.asset_os)
    asset_arch = normalize_arch(args.asset_arch)
    version = args.version.lstrip("v")
    base_dir = f"agent-store-{version}-{asset_os}-{asset_arch}"

    if not root.is_dir():
        raise SystemExit(f"root is not a directory: {root}")

    files = collect_files(root)
    if not files:
        raise SystemExit("no files selected for bundle")

    dist.mkdir(parents=True, exist_ok=True)
    manifest = build_manifest(root, files, version, asset_os, asset_arch)

    zip_path = dist / f"{base_dir}.zip"
    tar_path = dist / f"{base_dir}.tar.gz"
    write_zip(zip_path, root, base_dir, files, manifest)
    write_tar(tar_path, root, base_dir, files, manifest)

    print(json.dumps({"zip": str(zip_path), "tar_gz": str(tar_path), "files": len(files)}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
