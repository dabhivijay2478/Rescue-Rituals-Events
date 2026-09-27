#!/usr/bin/env bash
# Deploy Rescue Rituals API + frontend to Vercel (requires: vercel login)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TEAM="vijay-dabhis-projects"

if ! npx vercel whoami &>/dev/null; then
  echo "Run: npx vercel login"
  exit 1
fi

echo "==> Deploying API (rescue-rituals-api)..."
cd "$ROOT/apps/backend"
npx vercel link --project rescue-rituals-api --scope "$TEAM" --yes
npx vercel --prod --yes

echo "==> Deploying frontend (rescue-rituals)..."
cd "$ROOT/apps/frontend"
npx vercel link --project rescue-rituals --scope "$TEAM" --yes
npx vercel --prod --yes

echo ""
echo "Live URLs (after DNS alias):"
echo "  API:      https://rescue-rituals-api.vercel.app"
echo "  Frontend: https://rescue-rituals.vercel.app"
