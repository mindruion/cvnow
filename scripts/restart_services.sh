#!/usr/bin/env bash
set -Eeuo pipefail

trap 'echo -e "\n\033[1;31m[✗] Error: command failed — ${BASH_COMMAND}\033[0m"; exit 1' ERR

APP_ROOT="${APP_ROOT_OVERRIDE:-/home/ion/awesome}"
DJANGO_DIR="${DJANGO_DIR_OVERRIDE:-${APP_ROOT}/django-admin}"

if [[ -n "${REACT_DIR_OVERRIDE:-}" ]]; then
  REACT_DIR="${REACT_DIR_OVERRIDE}"
elif [[ -d "${APP_ROOT}/bostami" ]]; then
  REACT_DIR="${APP_ROOT}/bostami"
else
  REACT_DIR="${APP_ROOT}/bostomi"
fi

if [[ -n "${TOVO_DIR_OVERRIDE:-}" ]]; then
  TOVO_DIR="${TOVO_DIR_OVERRIDE}"
else
  TOVO_DIR="${APP_ROOT}/tovo-node-16"
fi

DJANGO_SVC="awesome-django.service"
REACT_SVC="awesome-$(basename "${REACT_DIR}").service"
TOVO_SVC="awesome-$(basename "${TOVO_DIR}").service"

log()  { echo -e "\033[1;32m[+] $*\033[0m"; }
warn() { echo -e "\033[1;33m[!] $*\033[0m"; }
err()  { echo -e "\033[1;31m[✗] $*\033[0m"; }

usage() {
  cat <<'USAGE'
Restart the Awesome project services.

Usage:
  sudo ./restart_services.sh [options]

Environment overrides:
  APP_ROOT_OVERRIDE    Override root directory (default: /home/ion/awesome)
  DJANGO_DIR_OVERRIDE  Override Django project directory
  REACT_DIR_OVERRIDE   Override React project directory
  TOVO_DIR_OVERRIDE    Override tovo-node-16 project directory

Options:
  --django-only        Restart only the Django service
  --react-only         Restart only the primary React service
  --tovo-only          Restart only the tovo-node-16 service
  --frontend-only      Restart both frontend services
  --status             Show systemd status after restart
  -h, --help           Show this help message
USAGE
}

require_root() { [[ ${EUID} -eq 0 ]] || { err "Please run with sudo."; exit 1; }; }

require_root

ONLY_DJANGO=0
ONLY_REACT=0
ONLY_TOVO=0
FRONTEND_ONLY=0
SHOW_STATUS=0

while (($#)); do
  case "$1" in
    --django-only)
      ONLY_DJANGO=1
      shift
      ;;
    --react-only)
      ONLY_REACT=1
      shift
      ;;
    --tovo-only)
      ONLY_TOVO=1
      shift
      ;;
    --frontend-only)
      FRONTEND_ONLY=1
      shift
      ;;
    --status)
      SHOW_STATUS=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      usage
      err "Unknown argument: $1"
      exit 1
      ;;
  esac
done

selection_count=$((ONLY_DJANGO + ONLY_REACT + ONLY_TOVO + FRONTEND_ONLY))
if (( selection_count > 1 )); then
  err "Use only one of --django-only, --react-only, --tovo-only, or --frontend-only."
  exit 1
fi

restart_service() {
  local service="$1"
  log "Restarting ${service}"
  systemctl restart "${service}"
}

show_status() {
  local service="$1"
  log "Status for ${service}"
  systemctl status "${service}" --no-pager
}

SERVICES=()

if (( ONLY_DJANGO )); then
  SERVICES=("${DJANGO_SVC}")
elif (( ONLY_REACT )); then
  SERVICES=("${REACT_SVC}")
elif (( ONLY_TOVO )); then
  SERVICES=("${TOVO_SVC}")
elif (( FRONTEND_ONLY )); then
  SERVICES=("${REACT_SVC}" "${TOVO_SVC}")
else
  SERVICES=("${DJANGO_SVC}" "${REACT_SVC}" "${TOVO_SVC}")
fi

for svc in "${SERVICES[@]}"; do
  restart_service "${svc}"
  if (( SHOW_STATUS )); then
    show_status "${svc}"
  fi
done

log "Service restart complete."
