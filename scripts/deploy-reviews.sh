#!/usr/bin/env bash
# Deploy reviews SQL (via Management API) + Edge Functions + secrets.
# Requires SUPABASE_ACCESS_TOKEN (never commit). Optional: source .local-secrets/reviews.env
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PROJECT_REF="${SUPABASE_PROJECT_REF:-vxitorpldzfwtexzswde}"
SECRETS_FILE="${REVIEWS_SECRETS_FILE:-$ROOT/.local-secrets/reviews.env}"

if [[ -f "$SECRETS_FILE" ]]; then
  # shellcheck disable=SC1090
  set -a
  source "$SECRETS_FILE"
  set +a
fi

if [[ -z "${SUPABASE_ACCESS_TOKEN:-}" ]]; then
  echo "Missing SUPABASE_ACCESS_TOKEN. Create a PAT at https://supabase.com/dashboard/account/tokens"
  echo "then: export SUPABASE_ACCESS_TOKEN=sbp_… && $0"
  exit 1
fi

SQL_FILE="$ROOT/supabase/reviews.sql"
if [[ ! -f "$SQL_FILE" ]]; then
  echo "Missing $SQL_FILE"
  exit 1
fi

echo "==> Applying reviews.sql via Management API…"
python3 - <<'PY'
import json, os, pathlib, urllib.request
ref = os.environ.get("SUPABASE_PROJECT_REF", "vxitorpldzfwtexzswde")
token = os.environ["SUPABASE_ACCESS_TOKEN"]
sql = pathlib.Path("supabase/reviews.sql").read_text()
req = urllib.request.Request(
    f"https://api.supabase.com/v1/projects/{ref}/database/query",
    data=json.dumps({"query": sql}).encode(),
    headers={
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    },
    method="POST",
)
try:
    with urllib.request.urlopen(req) as res:
        body = res.read().decode()
        print("SQL OK", res.status, body[:400])
except urllib.error.HTTPError as e:
    print("SQL failed", e.code, e.read().decode()[:800])
    raise SystemExit(1)
PY

echo "==> Setting Edge Function secrets…"
npx --yes supabase secrets set \
  --project-ref "$PROJECT_REF" \
  "RESEND_API_KEY=${RESEND_API_KEY:?RESEND_API_KEY required}" \
  "REVIEW_ACTION_SECRET=${REVIEW_ACTION_SECRET:?REVIEW_ACTION_SECRET required}" \
  "REVIEW_NOTIFY_EMAIL=${REVIEW_NOTIFY_EMAIL:-dospreton.stav.cz@gmail.com}" \
  "REVIEW_FROM_EMAIL=${REVIEW_FROM_EMAIL:-DOSPRETON <onboarding@resend.dev>}" \
  "SITE_URL=${SITE_URL:-http://dospreton-stav.cz}"

echo "==> Deploying Edge Functions…"
npx --yes supabase functions deploy submit-review --project-ref "$PROJECT_REF"
npx --yes supabase functions deploy review-action --project-ref "$PROJECT_REF"

echo "Done. Test: open http://dospreton-stav.cz/#recenze → Zanechat recenzi"
