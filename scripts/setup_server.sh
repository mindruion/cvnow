#!/usr/bin/env bash
set -Eeuo pipefail

trap 'echo -e "\n\033[1;31m[✗] Error: command failed — ${BASH_COMMAND}\033[0m"; exit 1' ERR

# You can override APP_ROOT at runtime:
#   sudo APP_ROOT_OVERRIDE=/home/<server-user>/awesome ./setup_server.sh
APP_ROOT="${APP_ROOT_OVERRIDE:-/home/ion/awesome}"

DJANGO_DIR="${DJANGO_DIR_OVERRIDE:-${APP_ROOT}/django-admin}"

# React build-time API endpoints (can be overridden)
REACT_API_URL="${REACT_API_URL_OVERRIDE:-https://api.cvnow.me}"
REACT_API_BASE_URL="${REACT_API_BASE_URL_OVERRIDE:-https://api.cvnow.me}"

# React dir autodetect: prefer 'bostami', fall back to 'bostomi'
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

DJANGO_ENV_FILE="${DJANGO_DIR}/.env"

# Defaults; will be overridden from .env if present (so we don't clobber)
DB_NAME="awesome_db"
DB_USER="awesome_user"
DB_HOST="127.0.0.1"
DB_PORT="5432"

DJANGO_DEFAULT_PORT=8001
REACT_DEFAULT_PORT=3001
TOVO_DEFAULT_PORT=3002

DJANGO_SVC="awesome-django.service"
REACT_SVC="awesome-$(basename "${REACT_DIR}").service"
TOVO_SVC="awesome-$(basename "${TOVO_DIR}").service"

NODE_BUILD_ENV="NODE_OPTIONS=--openssl-legacy-provider"

log()  { echo -e "\033[1;32m[+] $*\033[0m"; }
warn() { echo -e "\033[1;33m[!] $*\033[0m"; }
err()  { echo -e "\033[1;31m[✗] $*\033[0m"; }
need_cmd() { command -v "$1" >/dev/null 2>&1; }
require_root() { [[ ${EUID} -eq 0 ]] || { err "Please run with sudo."; exit 1; }; }
find_free_port() { local port="$1"; while ss -lnt 2>/dev/null | awk '{print $4}' | grep -q ":${port}$"; do port=$((port+1)); done; echo "${port}"; }

rand_hex() {
  if need_cmd openssl; then openssl rand -hex 16; else
python3 - <<'PY'
import secrets; print(secrets.token_hex(16))
PY
  fi
}

rand_secret() {
python3 - <<'PY'
import secrets; print(secrets.token_urlsafe(50))
PY
}

# Read key=value from .env safely; returns 1 if key or file missing.
read_env_kv() {
  local key="$1" file="$2"
  [[ -f "$file" ]] || return 1
  awk -F= -v k="$key" '$1==k{ $1=""; sub(/^=/,""); print; found=1 } END{ if(!found) exit 1 }' "$file"
}

update_env_kvs() {
  local file="$1"; shift
  python3 - "$file" "$@" <<'PY'
import sys
from pathlib import Path

path = Path(sys.argv[1])
pairs = [arg.split("=", 1) for arg in sys.argv[2:]]
updates = {k: v for k, v in pairs}
remaining = set(updates)

lines = []
if path.exists():
    lines = path.read_text().splitlines()

for idx, line in enumerate(lines):
    stripped = line.lstrip()
    if not stripped or stripped.startswith("#") or "=" not in line:
        continue
    key = line.split("=", 1)[0].strip()
    if key in updates:
        lines[idx] = f"{key}={updates[key]}"
        remaining.discard(key)

for key in (k for k, _ in pairs if k in remaining):
    lines.append(f"{key}={updates[key]}")
    remaining.discard(key)

path.write_text("\n".join(lines) + "\n")
PY
}

patch_requirements_light() {
  local base="$1"
  [[ -f "$base/requirements.txt" ]] || return 0
  sed -i 's/\r$//' "$base/requirements.txt"
  sed -i -E 's/^([[:space:]]*[Pp][Yy][Yy][Aa][Mm][Ll][[:space:]]*==[[:space:]]*)6\.0([[:space:];#].*|[[:space:]]*$)/\16.0.2\2/' "$base/requirements.txt" || true
  sed -i -E 's/^([[:space:]]*[Pp][Ss][Yy][Cc][Oo][Pp][Gg]2-[Bb][Ii][Nn][Aa][Rr][Yy][[:space:]]*==[[:space:]]*)2\.9\.3([[:space:];#].*|[[:space:]]*$)/\12.9.10\2/' "$base/requirements.txt" || true
}

pick_yarn_bin() {
  if command -v yarnpkg >/dev/null 2>&1; then echo "yarnpkg"; return 0; fi
  if command -v yarn >/dev/null 2>&1; then
    local ypath; ypath="$(command -v yarn)"
    if head -n1 "$ypath" 2>/dev/null | grep -qi 'python'; then echo ""; return 0; fi
    echo "yarn"; return 0
  fi
  echo ""
}

psql_root() { ( cd / && sudo -u postgres psql -v ON_ERROR_STOP=1 -X "$@" ); }

# -----------------------------
# MAIN
# -----------------------------
require_root

RUN_USER="${SUDO_USER:-$USER}"
RUN_HOME="$(eval echo "~${RUN_USER}")"

[[ -d "${DJANGO_DIR}" ]] || { err "Django dir not found: ${DJANGO_DIR}"; exit 1; }
[[ -d "${REACT_DIR}"  ]] || { err "React dir not found: ${REACT_DIR}"; exit 1; }
[[ -d "${TOVO_DIR}"   ]] || { err "React dir not found: ${TOVO_DIR}"; exit 1; }

log "User=${RUN_USER}, Home=${RUN_HOME}, Arch=$(uname -m), SysPython=$(python3 -V 2>/dev/null || echo missing)"

PYBIN=""
for cand in python3.12 python3; do if command -v "$cand" >/dev/null 2>&1; then PYBIN="$cand"; break; fi; done
[[ -n "$PYBIN" ]] || { err "No suitable python found."; exit 1; }
log "Using interpreter for venv: ${PYBIN}"

# -----------------------------
# OS packages / build deps
# -----------------------------
if need_cmd apt-get; then
  log "Installing OS dependencies…"
  apt-get update -y >/dev/null || warn "apt-get update had issues; using cached indexes"
  if [[ "$PYBIN" == "python3.12" ]]; then
    DEBIAN_FRONTEND=noninteractive apt-get install -y python3.12-venv >/dev/null
  else
    DEBIAN_FRONTEND=noninteractive apt-get install -y python3-venv >/dev/null
  fi
  DEBIAN_FRONTEND=noninteractive apt-get install -y \
    python3-dev build-essential libpq-dev libyaml-dev pkg-config \
    postgresql postgresql-contrib \
    nodejs npm curl git >/dev/null
fi

if ! command -v yarnpkg >/dev/null 2>&1 && ! command -v yarn >/dev/null 2>&1; then
  log "Installing Yarn globally via npm…"
  npm install -g yarn >/dev/null 2>&1 || warn "npm -g yarn failed; will use npm fallback"
fi

# -----------------------------
# PostgreSQL
# -----------------------------
log "Ensuring PostgreSQL is running…"
systemctl enable --now postgresql >/dev/null 2>&1 || {
  err "Failed to enable/start postgresql"; journalctl -u postgresql --no-pager -n 50 || true; exit 1;
}

DB_PASS="$(rand_hex)"

USER_EXISTS=0
if psql_root -tAc "SELECT 1 FROM pg_roles WHERE rolname='${DB_USER}'" | grep -q 1; then
  USER_EXISTS=1
  warn "PG user '${DB_USER}' exists; not changing password."
else
  log "Creating PG user '${DB_USER}'…"
  psql_root -c "CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASS}';" >/dev/null
fi

if psql_root -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1; then
  warn "DB '${DB_NAME}' exists."
else
  log "Creating DB '${DB_NAME}' owned by '${DB_USER}'…"
  psql_root -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};" >/dev/null
fi

# -----------------------------
# .env
# -----------------------------
log "Ensuring .env => ${DJANGO_ENV_FILE}"
install -o "${RUN_USER}" -g "${RUN_USER}" -d "${DJANGO_DIR}"
ENV_EXISTS=0
if [[ -f "${DJANGO_ENV_FILE}" ]]; then
  ENV_EXISTS=1
  cp "${DJANGO_ENV_FILE}" "${DJANGO_ENV_FILE}.bak.$(date +%s)"
fi

if (( ENV_EXISTS )); then
  EXISTING_SECRET="$(read_env_kv DJANGO_SECRET_KEY "${DJANGO_ENV_FILE}" || true)"
  EXISTING_DEBUG="$(read_env_kv DEBUG "${DJANGO_ENV_FILE}" || true)"
  EXISTING_ALLOWED="$(read_env_kv ALLOWED_HOSTS "${DJANGO_ENV_FILE}" || true)"
  EXISTING_DJANGO_PORT="$(read_env_kv DJANGO_PORT "${DJANGO_ENV_FILE}" || true)"
  EXISTING_REACT_PORT="$(read_env_kv REACT_PORT "${DJANGO_ENV_FILE}" || true)"
  EXISTING_TOVO_PORT="$(read_env_kv TOVO_PORT "${DJANGO_ENV_FILE}" || true)"
  EXISTING_PASS="$(read_env_kv DB_PASSWORD "${DJANGO_ENV_FILE}" || true)"
  # DB fields — if present, we will preserve them
  EXISTING_DB_NAME="$(read_env_kv DB_NAME "${DJANGO_ENV_FILE}" || true)"
  EXISTING_DB_USER="$(read_env_kv DB_USER "${DJANGO_ENV_FILE}" || true)"
  EXISTING_DB_HOST="$(read_env_kv DB_HOST "${DJANGO_ENV_FILE}" || true)"
  EXISTING_DB_PORT="$(read_env_kv DB_PORT "${DJANGO_ENV_FILE}" || true)"
  # React build-time vars — preserve if present
  EXISTING_REACT_APP_API_URL="$(read_env_kv REACT_APP_API_URL "${DJANGO_ENV_FILE}" || true)"
  EXISTING_REACT_APP_API_BASE_URL="$(read_env_kv REACT_APP_API_BASE_URL "${DJANGO_ENV_FILE}" || true)"
else
  EXISTING_SECRET=""; EXISTING_DEBUG=""; EXISTING_ALLOWED=""
  EXISTING_DJANGO_PORT=""; EXISTING_REACT_PORT=""; EXISTING_TOVO_PORT=""
  EXISTING_PASS=""
  EXISTING_DB_NAME=""; EXISTING_DB_USER=""; EXISTING_DB_HOST=""; EXISTING_DB_PORT=""
  EXISTING_REACT_APP_API_URL=""; EXISTING_REACT_APP_API_BASE_URL=""
fi

SECRET_KEY="${EXISTING_SECRET:-}"
[[ -z "${SECRET_KEY}" ]] && SECRET_KEY="$(rand_secret)"

# If .env already had DB_* values, use them and avoid overwriting later
DB_NAME="${EXISTING_DB_NAME:-$DB_NAME}"
DB_USER="${EXISTING_DB_USER:-$DB_USER}"
DB_HOST="${EXISTING_DB_HOST:-$DB_HOST}"
DB_PORT="${EXISTING_DB_PORT:-$DB_PORT}"

# Decide whether we actually know the DB password we should write
PASS_KNOWN=0
if (( USER_EXISTS )); then
  if [[ -n "${EXISTING_PASS:-}" ]]; then
    DB_PASS="${EXISTING_PASS}"
    PASS_KNOWN=1
  else
    warn "PG user '${DB_USER}' exists but .env has no DB_PASSWORD; WILL NOT write a new password. Update .env manually."
    PASS_KNOWN=0
  fi
else
  # We just created the user with DB_PASS
  PASS_KNOWN=1
fi

DEBUG_VALUE="${EXISTING_DEBUG:-1}"
ALLOWED_HOSTS_VALUE="${EXISTING_ALLOWED:-*}"

if [[ -n "${EXISTING_DJANGO_PORT}" ]]; then
  DJANGO_PORT="${EXISTING_DJANGO_PORT}"
else
  DJANGO_PORT="$(find_free_port "${DJANGO_DEFAULT_PORT}")"
fi

if [[ -n "${EXISTING_REACT_PORT}" ]]; then
  REACT_PORT="${EXISTING_REACT_PORT}"
else
  REACT_PORT="$(find_free_port "${REACT_DEFAULT_PORT}")"
fi

if [[ -n "${EXISTING_TOVO_PORT}" ]]; then
  TOVO_PORT="${EXISTING_TOVO_PORT}"
else
  TOVO_PORT="$(find_free_port "${TOVO_DEFAULT_PORT}")"
fi

# Build ENV_UPDATES (without DB_PASSWORD/DATABASE_URL first)
ENV_UPDATES=(
  "DJANGO_SECRET_KEY=${SECRET_KEY}"
  "DEBUG=${DEBUG_VALUE}"
  "ALLOWED_HOSTS=${ALLOWED_HOSTS_VALUE}"
  "DJANGO_PORT=${DJANGO_PORT}"
  "REACT_PORT=${REACT_PORT}"
  "TOVO_PORT=${TOVO_PORT}"
)

# Only add DB_* defaults if they're missing (preserve existing)
[[ -z "${EXISTING_DB_NAME}" ]] && ENV_UPDATES+=("DB_NAME=${DB_NAME}")
[[ -z "${EXISTING_DB_USER}" ]] && ENV_UPDATES+=("DB_USER=${DB_USER}")
[[ -z "${EXISTING_DB_HOST}" ]] && ENV_UPDATES+=("DB_HOST=${DB_HOST}")
[[ -z "${EXISTING_DB_PORT}" ]] && ENV_UPDATES+=("DB_PORT=${DB_PORT}")

# Only add React build-time vars if missing (preserve existing)
[[ -z "${EXISTING_REACT_APP_API_URL}" ]] && ENV_UPDATES+=("REACT_APP_API_URL=${REACT_API_URL}")
[[ -z "${EXISTING_REACT_APP_API_BASE_URL}" ]] && ENV_UPDATES+=("REACT_APP_API_BASE_URL=${REACT_API_BASE_URL}")

if (( PASS_KNOWN )); then
  ENV_UPDATES+=("DB_PASSWORD=${DB_PASS}")
  ENV_UPDATES+=("DATABASE_URL=postgres://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}")
fi

if (( ENV_EXISTS )); then
  update_env_kvs "${DJANGO_ENV_FILE}" "${ENV_UPDATES[@]}"
else
  {
    echo "# Generated by setup_server.sh on $(date -Is)"
    echo "DJANGO_SECRET_KEY=${SECRET_KEY}"
    echo "DEBUG=${DEBUG_VALUE}"
    echo "ALLOWED_HOSTS=${ALLOWED_HOSTS_VALUE}"
    echo "REACT_APP_API_URL=${REACT_API_URL}"
    echo "REACT_APP_API_BASE_URL=${REACT_API_BASE_URL}"
    if (( PASS_KNOWN )); then
      echo "DATABASE_URL=postgres://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
      echo "DB_PASSWORD=${DB_PASS}"
    else
      echo "DATABASE_URL=postgres://${DB_USER}:<FILL_ME>@${DB_HOST}:${DB_PORT}/${DB_NAME}"
      echo "DB_PASSWORD=<FILL_ME>"
    fi
    echo "DB_NAME=${DB_NAME}"
    echo "DB_USER=${DB_USER}"
    echo "DB_HOST=${DB_HOST}"
    echo "DB_PORT=${DB_PORT}"
    echo
    echo "DJANGO_PORT=${DJANGO_PORT}"
    echo "REACT_PORT=${REACT_PORT}"
    echo "TOVO_PORT=${TOVO_PORT}"
  } > "${DJANGO_ENV_FILE}"
fi
chown "${RUN_USER}:${RUN_USER}" "${DJANGO_ENV_FILE}"
chmod 600 "${DJANGO_ENV_FILE}"

# -----------------------------
# Python venv + pip tooling
# -----------------------------
log "Creating venv with ${PYBIN} and bootstrapping pip tooling…"
su - "${RUN_USER}" -c "cd '${DJANGO_DIR}' && ${PYBIN} -m venv .venv"
su - "${RUN_USER}" -c "cd '${DJANGO_DIR}' && . .venv/bin/activate && python -V && pip install --upgrade pip wheel setuptools build >/dev/null"

patch_requirements_light "${DJANGO_DIR}"

if [[ -f "${DJANGO_DIR}/requirements.txt" ]]; then
  log "Installing Python dependencies (first attempt)…"
  if ! su - "${RUN_USER}" -c "cd '${DJANGO_DIR}' && . .venv/bin/activate && pip install -r requirements.txt"; then
    warn "First pip install failed. Applying PyYAML/Cython workarounds…"
    su - "${RUN_USER}" -c "cd '${DJANGO_DIR}' && . .venv/bin/activate && pip install 'cython<3.0.0' wheel >/dev/null"
    su - "${RUN_USER}" -c "cd '${DJANGO_DIR}' && . .venv/bin/activate && pip install 'pyyaml==5.4.1' --no-build-isolation || true"
    CONSTRAINT_FILE="/tmp/constraint_pyyaml_cython.txt"
    echo "cython<3" > "${CONSTRAINT_FILE}"
    echo "pyyaml==5.4.1" >> "${CONSTRAINT_FILE}"
    su - "${RUN_USER}" -c "cd '${DJANGO_DIR}' && . .venv/bin/activate && PIP_CONSTRAINT='${CONSTRAINT_FILE}' pip install -r requirements.txt"
  fi
else
  warn "No requirements.txt found — skipping pip install."
fi

# -----------------------------
# Frontend apps: install deps & build (auto-fix react-scripts if missing)
# -----------------------------
FRONTEND_DIRS=("${REACT_DIR}" "${TOVO_DIR}")

# Prefer Node's yarn (not the Python package); empty => use npm
YARN_BIN="$(su - "${RUN_USER}" -c 'bash -lc "
  if command -v yarnpkg >/dev/null 2>&1; then echo yarnpkg;
  elif command -v yarn >/dev/null 2>&1; then
    yp=\$(command -v yarn); head -n1 \"\$yp\" 2>/dev/null | grep -qi python && echo \"\" || echo yarn;
  else echo \"\"; fi"')"

for frontend in "${FRONTEND_DIRS[@]}"; do
  log "Installing frontend deps in ${frontend}…"
  if [[ -n "${YARN_BIN}" ]]; then
    su - "${RUN_USER}" -c "cd '${frontend}' && ${YARN_BIN} install"
  else
    warn "Using npm install fallback (no Node yarn found)"
    su - "${RUN_USER}" -c "cd '${frontend}' && npm install"
  fi

  # If package.json has a build script, prepare to build
  if [[ -f "${frontend}/package.json" ]] && grep -q '"build"' "${frontend}/package.json"; then
    # If CRA is referenced, ensure react-scripts is available
    if grep -Eq 'react-scripts("|'\'')|react-scripts build' "${frontend}/package.json"; then
      if ! su - "${RUN_USER}" -c "test -x '${frontend}/node_modules/.bin/react-scripts'"; then
        log "react-scripts missing in $(basename "${frontend}") — installing react-scripts@5.0.1…"
        if [[ -n "${YARN_BIN}" ]]; then
          su - "${RUN_USER}" -c "cd '${frontend}' && ${YARN_BIN} add -D react-scripts@5.0.1"
        else
          su - "${RUN_USER}" -c "cd '${frontend}' && npm i -D react-scripts@5.0.1"
        fi
      fi
    fi

    log "Building frontend in ${frontend}…"
    BUILD_ENV="REACT_APP_API_URL=${REACT_API_URL} REACT_APP_API_BASE_URL=${REACT_API_BASE_URL}"
    if [[ -n "${YARN_BIN}" ]]; then
      # Try the declared build script first; on failure, try npx react-scripts directly
      su - "${RUN_USER}" -c "cd '${frontend}' && env ${NODE_BUILD_ENV} ${BUILD_ENV} ${YARN_BIN} build" \
      || { warn "yarn build failed; trying npx react-scripts build"; \
           su - "${RUN_USER}" -c "cd '${frontend}' && env ${NODE_BUILD_ENV} ${BUILD_ENV} npx --yes react-scripts@5.0.1 build"; }
    else
      su - "${RUN_USER}" -c "cd '${frontend}' && env ${NODE_BUILD_ENV} ${BUILD_ENV} npm run build" \
      || { warn "npm run build failed; trying npx react-scripts build"; \
           su - "${RUN_USER}" -c "cd '${frontend}' && env ${NODE_BUILD_ENV} ${BUILD_ENV} npx --yes react-scripts@5.0.1 build"; }
    fi
  else
    warn "No 'build' script found in ${frontend}/package.json — skipping build."
  fi
done

# -----------------------------
# systemd services
# -----------------------------
log "Creating systemd units…"

DJANGO_SERVICE_PATH="/etc/systemd/system/${DJANGO_SVC}"
if [[ -f "${DJANGO_SERVICE_PATH}" ]]; then
  warn "Service unit already exists; skipping creation: ${DJANGO_SERVICE_PATH}"
else
cat > "${DJANGO_SERVICE_PATH}" <<EOF
[Unit]
Description=Awesome Django (runserver)
After=network.target postgresql.service

[Service]
Type=simple
User=${RUN_USER}
WorkingDirectory=${DJANGO_DIR}
EnvironmentFile=${DJANGO_ENV_FILE}
Environment=PYTHONUNBUFFERED=1
ExecStart=/bin/bash -lc 'source .venv/bin/activate && python manage.py migrate && python manage.py runserver 0.0.0.0:\${DJANGO_PORT}'
Restart=always
RestartSec=5
ProtectSystem=full
ProtectHome=read-only
NoNewPrivileges=true

[Install]
WantedBy=multi-user.target
EOF
fi

REACT_SERVICE_PATH="/etc/systemd/system/${REACT_SVC}"
if [[ -f "${REACT_SERVICE_PATH}" ]]; then
  warn "Service unit already exists; skipping creation: ${REACT_SERVICE_PATH}"
else
cat > "${REACT_SERVICE_PATH}" <<EOF
[Unit]
Description=Awesome $(basename "${REACT_DIR}") React (serve -s build)
After=network.target

[Service]
Type=simple
User=${RUN_USER}
WorkingDirectory=${REACT_DIR}
EnvironmentFile=${DJANGO_ENV_FILE}
Environment=NODE_ENV=production
Environment=REACT_APP_API_URL=${REACT_API_URL}
Environment=REACT_APP_API_BASE_URL=${REACT_API_BASE_URL}
ExecStart=/bin/bash -lc 'export NODE_OPTIONS=--openssl-legacy-provider; test -d build || ( if command -v yarnpkg >/dev/null 2>&1; then yarnpkg build; elif command -v yarn >/dev/null 2>&1 && ! head -n1 \$(command -v yarn) | grep -qi python; then yarn build; else npm run build; fi ); npx --yes serve -s build -l \${REACT_PORT}'
Restart=always
RestartSec=5
ProtectSystem=full
ProtectHome=read-only
NoNewPrivileges=true

[Install]
WantedBy=multi-user.target
EOF
fi

TOVO_SERVICE_PATH="/etc/systemd/system/${TOVO_SVC}"
if [[ -f "${TOVO_SERVICE_PATH}" ]]; then
  warn "Service unit already exists; skipping creation: ${TOVO_SERVICE_PATH}"
else
cat > "${TOVO_SERVICE_PATH}" <<EOF
[Unit]
Description=Awesome $(basename "${TOVO_DIR}") React (serve -s build)
After=network.target

[Service]
Type=simple
User=${RUN_USER}
WorkingDirectory=${TOVO_DIR}
EnvironmentFile=${DJANGO_ENV_FILE}
Environment=NODE_ENV=production
Environment=REACT_APP_API_URL=${REACT_API_URL}
Environment=REACT_APP_API_BASE_URL=${REACT_API_BASE_URL}
ExecStart=/bin/bash -lc 'export NODE_OPTIONS=--openssl-legacy-provider; test -d build || ( if command -v yarnpkg >/dev/null 2>&1; then yarnpkg build; elif command -v yarn >/dev/null 2>&1 && ! head -n1 \$(command -v yarn) | grep -qi python; then yarn build; else npm run build; fi ); npx --yes serve -s build -l \${TOVO_PORT}'
Restart=always
RestartSec=5
ProtectSystem=full
ProtectHome=read-only
NoNewPrivileges=true

[Install]
WantedBy=multi-user.target
EOF
fi

log "Reloading systemd and enabling services…"
systemctl daemon-reload >/dev/null
systemctl enable --now "${DJANGO_SVC}" >/dev/null 2>&1 || { err "Failed to start ${DJANGO_SVC}"; journalctl -u "${DJANGO_SVC}" --no-pager -n 80 || true; exit 1; }
systemctl enable --now "${REACT_SVC}"  >/dev/null 2>&1 || { err "Failed to start ${REACT_SVC}";  journalctl -u "${REACT_SVC}"  --no-pager -n 80 || true; exit 1; }
systemctl enable --now "${TOVO_SVC}"   >/dev/null 2>&1 || { err "Failed to start ${TOVO_SVC}";   journalctl -u "${TOVO_SVC}"   --no-pager -n 80 || true; exit 1; }

echo
echo "==================== SUMMARY ===================="
echo " Django:"
echo "   Dir:       ${DJANGO_DIR}"
echo "   Env:       ${DJANGO_ENV_FILE}"
echo "   Service:   ${DJANGO_SVC}"
echo "   Port:      ${DJANGO_PORT}"
echo "   Logs:      journalctl -u ${DJANGO_SVC} -f"
echo
echo " React ($(basename "${REACT_DIR}")):"
echo "   Dir:       ${REACT_DIR}"
echo "   Service:   ${REACT_SVC}"
echo "   Port:      ${REACT_PORT}"
echo "   Logs:      journalctl -u ${REACT_SVC} -f"
echo
echo " React ($(basename "${TOVO_DIR}")):"
echo "   Dir:       ${TOVO_DIR}"
echo "   Service:   ${TOVO_SVC}"
echo "   Port:      ${TOVO_PORT}"
echo "   Logs:      journalctl -u ${TOVO_SVC} -f"
echo
echo " PostgreSQL:"
echo "   Host:      ${DB_HOST}"
echo "   Port:      ${DB_PORT}"
echo "   DB:        ${DB_NAME}"
echo "   User:      ${DB_USER}"
if [[ ${PASS_KNOWN} -eq 1 ]]; then
  echo "   Password:  ${DB_PASS}"
else
  echo "   Password:  (unchanged — add to ${DJANGO_ENV_FILE} if missing)"
fi
echo "================================================="
