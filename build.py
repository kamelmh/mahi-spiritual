#!/usr/bin/env python3
"""
MAHI Spiritual System — One-command build script.

Checks environment, installs dependencies, generates JSON data,
validates outputs, and reports results.

Usage:
    python build.py
"""

import subprocess
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent
BACKEND_DIR = PROJECT_ROOT / "backend"
FRONTEND_DIR = PROJECT_ROOT / "frontend"
FRONTEND_DATA_DIR = FRONTEND_DIR / "data"
SPIRITUAL_DIR = PROJECT_ROOT / "spiritual"
REQUIREMENTS = BACKEND_DIR / "requirements.txt"
FRONTEND_INDEX = FRONTEND_DIR / "index.html"

EXPECTED_JSON = ["chart.json", "family.json", "dasha.json", "transits.json"]

RED = "\033[91m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
CYAN = "\033[96m"
BOLD = "\033[1m"
RESET = "\033[0m"


def log(msg: str, color: str = "") -> None:
    print(f"{color}{msg}{RESET}")


def banner() -> None:
    log(f"\n{'=' * 50}", CYAN)
    log("  MAHI Spiritual System — Build", BOLD)
    log(f"{'=' * 50}\n", CYAN)


def check_python_version() -> bool:
    log("[1/6] Checking Python version...", CYAN)
    v = sys.version_info
    if v.major < 3 or (v.major == 3 and v.minor < 10):
        log(f"  FAIL: Python {v.major}.{v.minor} found (need >=3.10)", RED)
        return False
    log(f"  OK: Python {v.major}.{v.minor}.{v.micro}", GREEN)
    return True


def install_deps() -> bool:
    log("[2/6] Installing dependencies...", CYAN)
    # Try uv first (handles managed envs), then pip, then pip --break-system-packages
    commands = [
        ["uv", "pip", "install", "-q", "-r", str(REQUIREMENTS)],
        [sys.executable, "-m", "pip", "install", "-q", "-r", str(REQUIREMENTS)],
        [sys.executable, "-m", "pip", "install", "-q", "--break-system-packages", "-r", str(REQUIREMENTS)],
    ]
    for cmd in commands:
        try:
            result = subprocess.run(cmd, capture_output=True, text=True)
            if result.returncode == 0:
                tool = cmd[0] if cmd[0] != str(sys.executable) else "pip"
                log(f"  OK: Dependencies installed ({tool})", GREEN)
                return True
        except FileNotFoundError:
            continue
    log("  FAIL: No package manager could install dependencies", RED)
    return False


def run_generate() -> bool:
    log("[3/6] Running backend.generate...", CYAN)
    try:
        result = subprocess.run(
            [sys.executable, "-m", "backend.generate"],
            capture_output=True,
            text=True,
            cwd=str(PROJECT_ROOT),
        )
        # Print generate output for visibility
        if result.stdout:
            for line in result.stdout.strip().split("\n"):
                log(f"  {line}")
        if result.returncode != 0:
            log(f"  FAIL: {result.stderr.strip()}", RED)
            return False
        return True
    except Exception as e:
        log(f"  FAIL: {e}", RED)
        return False


def verify_outputs() -> bool:
    log("[4/6] Verifying output files...", CYAN)
    all_ok = True
    for name in EXPECTED_JSON:
        path = FRONTEND_DATA_DIR / name
        if not path.exists():
            log(f"  MISSING: {name}", RED)
            all_ok = False
        else:
            size = path.stat().st_size
            if size < 100:
                log(f"  WARNING: {name} is suspiciously small ({size} bytes)", YELLOW)
            else:
                log(f"  OK: {name} ({_human_size(size)})", GREEN)
    return all_ok


def copy_spiritual_assets() -> bool:
    log("[5/6] Copying spiritual assets...", CYAN)
    if not SPIRITUAL_DIR.exists():
        log("  SKIP: spiritual/ directory not found", YELLOW)
        return True

    # Copy spiritual-content.json to frontend/data if present
    src = SPIRITUAL_DIR / "spiritual-content.json"
    if src.exists():
        dest = FRONTEND_DATA_DIR / "spiritual-content.json"
        dest.write_text(src.read_text(encoding="utf-8"), encoding="utf-8")
        log(f"  Copied: spiritual-content.json ({_human_size(src.stat().st_size)})", GREEN)
    else:
        log("  SKIP: spiritual-content.json not in spiritual/", YELLOW)

    # Copy MDs to frontend/docs/spiritual/ if they don't exist there
    docs_dir = FRONTEND_DIR / "docs" / "spiritual"
    docs_dir.mkdir(parents=True, exist_ok=True)
    md_count = 0
    for md_file in SPIRITUAL_DIR.glob("*.md"):
        dest = docs_dir / md_file.name
        if not dest.exists() or md_file.stat().st_mtime > dest.stat().st_mtime:
            dest.write_text(md_file.read_text(encoding="utf-8"), encoding="utf-8")
            md_count += 1
    if md_count:
        log(f"  Copied: {md_count} MD files to frontend/docs/spiritual/", GREEN)
    else:
        log("  OK: MD files up to date", GREEN)
    return True


def validate_frontend() -> bool:
    log("[6/6] Validating frontend...", CYAN)
    if not FRONTEND_INDEX.exists():
        log(f"  FAIL: {FRONTEND_INDEX} not found", RED)
        return False
    size = FRONTEND_INDEX.stat().st_size
    log(f"  OK: index.html ({_human_size(size)})", GREEN)

    # List data files with sizes
    log("\n  Data files:", CYAN)
    if FRONTEND_DATA_DIR.exists():
        for f in sorted(FRONTEND_DATA_DIR.iterdir()):
            if f.suffix == ".json":
                log(f"    {f.name}: {_human_size(f.stat().st_size)}", GREEN)
    return True


def _human_size(n: int) -> str:
    for unit in ("B", "KB", "MB"):
        if n < 1024:
            return f"{n:.0f}{unit}" if unit == "B" else f"{n:.1f}{unit}"
        n /= 1024
    return f"{n:.1f}GB"


def report(ok: bool) -> None:
    log(f"\n{'=' * 50}", CYAN)
    if ok:
        log("  BUILD SUCCEEDED", GREEN + BOLD)
        log("  Run: cd frontend && python -m http.server 8000", CYAN)
    else:
        log("  BUILD FAILED", RED + BOLD)
        log("  Check errors above", RED)
    log(f"{'=' * 50}\n", CYAN)


def main() -> int:
    banner()
    steps = [
        check_python_version,
        install_deps,
        run_generate,
        verify_outputs,
        copy_spiritual_assets,
        validate_frontend,
    ]
    for step in steps:
        if not step():
            report(False)
            return 1
    report(True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
