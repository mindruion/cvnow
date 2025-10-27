#!/usr/bin/env bash
set -Eeuo pipefail

trap 'echo -e "\n\033[1;31m[✗] Error: command failed — ${BASH_COMMAND}\033[0m"; exit 1' ERR

REMOTE="${REMOTE_OVERRIDE:-ion@ion.local}"
REMOTE_PATH="${REMOTE_PATH_OVERRIDE:-/home/ion/awesome}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOCAL_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

log()  { echo -e "\033[1;32m[+] $*\033[0m"; }
warn() { echo -e "\033[1;33m[!] $*\033[0m"; }
need_cmd() { command -v "$1" >/dev/null 2>&1; }

usage() {
  cat <<'USAGE'
Deploy the current project to the remote server.

Usage:
  ./deploy_project.sh [--dry-run]

Environment overrides:
  REMOTE_OVERRIDE         Override remote user@host (default: ion@ion.local)
  REMOTE_PATH_OVERRIDE    Override remote target path (default: /home/ion/awesome)

Options:
  --dry-run               Run rsync in dry-run mode (no changes applied)
USAGE
}

while (($#)); do
  case "$1" in
    --dry-run)
      DRY_RUN=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      warn "Unknown argument: $1"
      usage
      exit 1
      ;;
  esac
done

need_cmd rsync || { warn "rsync is required"; exit 1; }
need_cmd ssh   || { warn "ssh is required"; exit 1; }

if [[ ! -d "${LOCAL_ROOT}" ]]; then
  warn "Local project directory not found: ${LOCAL_ROOT}"
  exit 1
fi

log "Deploying ${LOCAL_ROOT} -> ${REMOTE}:${REMOTE_PATH}"

RSYNC_FLAGS=(
  --archive
  --compress
  --delete
  --human-readable
  --prune-empty-dirs
  --exclude='.git/'
  --exclude='.venv/'
  --exclude='node_modules/'
  --exclude='bostami/build/'
  --exclude='bostomi/build/'
  --exclude='tovo-node-16/build/'
  --exclude='__pycache__/'
  --exclude='*.pyc'
)

if [[ -n "${DRY_RUN:-}" ]]; then
  RSYNC_FLAGS+=(--dry-run)
  log "Dry run enabled; no remote changes will be made."
fi

if [[ -t 1 ]]; then
  RSYNC_FLAGS+=(--info=progress2)
fi

ssh "${REMOTE}" "mkdir -p '${REMOTE_PATH}'"

rsync "${RSYNC_FLAGS[@]}" "${LOCAL_ROOT}/" "${REMOTE}:${REMOTE_PATH}/"

log "Deployment complete."

if [[ -z "${DRY_RUN:-}" ]]; then
  log "Restarting services on ${REMOTE}"
  ssh -t "$REMOTE" "cd '$REMOTE_PATH/scripts' && sudo ./setup_server.sh"
fi