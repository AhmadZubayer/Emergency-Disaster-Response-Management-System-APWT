#!/usr/bin/env bash
# ============================================================
# Admin API Curl Test Suite
# EDRMS – Emergency Disaster Response Management System
# ============================================================

BASE_URL="http://localhost:3000"
PASS=0
FAIL=0
ERRORS=()

GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[1;33m"
CYAN="\033[0;36m"
BOLD="\033[1m"
RESET="\033[0m"

divider() { echo -e "${CYAN}──────────────────────────────────────────────────────${RESET}"; }

echo ""
echo -e "${BOLD}${CYAN}╔══════════════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}${CYAN}║       EDRMS Admin API Curl Test Suite                ║${RESET}"
echo -e "${BOLD}${CYAN}╚══════════════════════════════════════════════════════╝${RESET}"
echo ""

divider
echo -e "${BOLD}[AUTH] Signing in as Admin...${RESET}"
LOGIN_RESP=$(curl -s -X POST "$BASE_URL/auth/sign-in" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@edrms.com","password":"Admin@1234"}')

ADMIN_TOKEN=$(echo "$LOGIN_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data']['access_token'])" 2>/dev/null)

if [ -z "$ADMIN_TOKEN" ]; then
  echo -e "${RED}FAILED to get admin token. Aborting.${RESET}"
  echo "Response: $LOGIN_RESP"
  exit 1
fi
echo -e "${GREEN}Admin token obtained${RESET}"
echo ""

AUTH_HEADER="Authorization: Bearer $ADMIN_TOKEN"

run_test() {
  local TEST_NAME="$1"
  local EXPECTED="$2"
  shift 2

  HTTP_CODE=$(curl -s -o /tmp/edrms_resp.json -w "%{http_code}" "$@")
  BODY=$(cat /tmp/edrms_resp.json)

  if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
    echo -e "  ${GREEN}PASS${RESET} [$HTTP_CODE] $TEST_NAME"
    PASS=$((PASS + 1))
  else
    echo -e "  ${RED}FAIL${RESET} [$HTTP_CODE] $TEST_NAME"
    MSG=$(echo "$BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('message',''))" 2>/dev/null || echo "$BODY")
    echo -e "    ${YELLOW}→ $MSG${RESET}"
    FAIL=$((FAIL + 1))
    ERRORS+=("[$HTTP_CODE] $TEST_NAME")
  fi
}

run_negative_test() {
  local TEST_NAME="$1"
  local EXPECTED="$2"
  shift 2

  HTTP_CODE=$(curl -s -o /tmp/edrms_resp.json -w "%{http_code}" "$@")

  if [ "$HTTP_CODE" -eq "$EXPECTED" ]; then
    echo -e "  ${GREEN}PASS${RESET} [$HTTP_CODE] $TEST_NAME"
    PASS=$((PASS + 1))
  else
    echo -e "  ${RED}FAIL${RESET} [$HTTP_CODE] $TEST_NAME (expected $EXPECTED)"
    FAIL=$((FAIL + 1))
    ERRORS+=("[$HTTP_CODE] $TEST_NAME (expected $EXPECTED)")
  fi
}

# ── 1. ACCOUNTS ─────────────────────────────────────────
divider
echo -e "${BOLD}[1] ACCOUNTS${RESET}"

run_test "GET /admin/accounts (all)" 200 \
  -X GET "$BASE_URL/admin/accounts" -H "$AUTH_HEADER"

run_test "GET /admin/accounts?page=1&limit=5" 200 \
  -X GET "$BASE_URL/admin/accounts?page=1&limit=5" -H "$AUTH_HEADER"

run_test "GET /admin/accounts?role=user" 200 \
  -X GET "$BASE_URL/admin/accounts?role=user" -H "$AUTH_HEADER"

run_test "GET /admin/accounts?includeDeleted=true" 200 \
  -X GET "$BASE_URL/admin/accounts?includeDeleted=true" -H "$AUTH_HEADER"

ACCOUNT_RESP=$(curl -s -X GET "$BASE_URL/admin/accounts?limit=2" -H "$AUTH_HEADER")
TARGET_USER_ID=$(echo "$ACCOUNT_RESP" | python3 -c "
import sys, json
d = json.load(sys.stdin)
items = d.get('data', {}).get('data', [])
for item in items:
    uid = item.get('user_id', '')
    if uid and uid != '9d58df58-1457-4cd0-a689-ea7fe96c9514':
        print(uid)
        break
" 2>/dev/null)

echo -e "  ${YELLOW}Target user for mutations: ${TARGET_USER_ID:-none found}${RESET}"

if [ -n "$TARGET_USER_ID" ]; then
  run_test "PATCH /admin/accounts/:id/role → USER" 200 \
    -X PATCH "$BASE_URL/admin/accounts/$TARGET_USER_ID/role" \
    -H "$AUTH_HEADER" -H "Content-Type: application/json" \
    -d '{"role":"USER"}'

  run_test "DELETE /admin/accounts/:id (soft delete)" 200 \
    -X DELETE "$BASE_URL/admin/accounts/$TARGET_USER_ID" \
    -H "$AUTH_HEADER"

  run_test "PATCH /admin/accounts/:id/restore" 200 \
    -X PATCH "$BASE_URL/admin/accounts/$TARGET_USER_ID/restore" \
    -H "$AUTH_HEADER"
else
  echo -e "  ${YELLOW}Skipping account mutations – no non-admin user found${RESET}"
fi

# ── 2. VOLUNTEERS ────────────────────────────────────────
divider
echo -e "${BOLD}[2] VOLUNTEERS${RESET}"

run_test "GET /admin/volunteers (all)" 200 \
  -X GET "$BASE_URL/admin/volunteers" -H "$AUTH_HEADER"

run_test "GET /admin/volunteers?page=1&limit=5" 200 \
  -X GET "$BASE_URL/admin/volunteers?page=1&limit=5" -H "$AUTH_HEADER"

run_test "GET /admin/volunteers?status=pending" 200 \
  -X GET "$BASE_URL/admin/volunteers?status=pending" -H "$AUTH_HEADER"

run_test "GET /admin/volunteers?status=verified" 200 \
  -X GET "$BASE_URL/admin/volunteers?status=verified" -H "$AUTH_HEADER"

VOL_RESP=$(curl -s -X GET "$BASE_URL/admin/volunteers?limit=1&status=pending" -H "$AUTH_HEADER")
VOL_ID=$(echo "$VOL_RESP" | python3 -c "
import sys, json
d = json.load(sys.stdin)
items = d.get('data', {}).get('data', [])
if items: print(items[0].get('id', ''))
" 2>/dev/null)

if [ -n "$VOL_ID" ]; then
  run_test "PATCH /admin/volunteers/:id/verify → verified" 200 \
    -X PATCH "$BASE_URL/admin/volunteers/$VOL_ID/verify" \
    -H "$AUTH_HEADER" -H "Content-Type: application/json" \
    -d '{"status":"verified"}'
else
  echo -e "  ${YELLOW}Skipping volunteer verify – no pending volunteer${RESET}"
fi

# ── 3. RELIEF ORGANIZATIONS ─────────────────────────────
divider
echo -e "${BOLD}[3] RELIEF ORGANIZATIONS${RESET}"

run_test "GET /admin/relief-orgs (all)" 200 \
  -X GET "$BASE_URL/admin/relief-orgs" -H "$AUTH_HEADER"

run_test "GET /admin/relief-orgs?page=1&limit=5" 200 \
  -X GET "$BASE_URL/admin/relief-orgs?page=1&limit=5" -H "$AUTH_HEADER"

run_test "GET /admin/relief-orgs?status=pending" 200 \
  -X GET "$BASE_URL/admin/relief-orgs?status=pending" -H "$AUTH_HEADER"

ORG_RESP=$(curl -s -X GET "$BASE_URL/admin/relief-orgs?limit=1&status=pending" -H "$AUTH_HEADER")
ORG_ID=$(echo "$ORG_RESP" | python3 -c "
import sys, json
d = json.load(sys.stdin)
items = d.get('data', {}).get('data', [])
if items: print(items[0].get('id', ''))
" 2>/dev/null)

if [ -n "$ORG_ID" ]; then
  run_test "PATCH /admin/relief-orgs/:id/verify → verified" 200 \
    -X PATCH "$BASE_URL/admin/relief-orgs/$ORG_ID/verify" \
    -H "$AUTH_HEADER" -H "Content-Type: application/json" \
    -d '{"status":"verified"}'
else
  echo -e "  ${YELLOW}Skipping relief org verify – no pending org${RESET}"
fi

# ── 4. DISASTERS ─────────────────────────────────────────
divider
echo -e "${BOLD}[4] DISASTERS${RESET}"

run_test "GET /admin/disasters (all)" 200 \
  -X GET "$BASE_URL/admin/disasters" -H "$AUTH_HEADER"

run_test "GET /admin/disasters?page=1&limit=5" 200 \
  -X GET "$BASE_URL/admin/disasters?page=1&limit=5" -H "$AUTH_HEADER"

run_test "GET /admin/disasters?verified=true" 200 \
  -X GET "$BASE_URL/admin/disasters?verified=true" -H "$AUTH_HEADER"

run_test "GET /admin/disasters?verified=false" 200 \
  -X GET "$BASE_URL/admin/disasters?verified=false" -H "$AUTH_HEADER"

DISASTER_RESP=$(curl -s -X GET "$BASE_URL/admin/disasters?limit=1" -H "$AUTH_HEADER")
DISASTER_ID=$(echo "$DISASTER_RESP" | python3 -c "
import sys, json
d = json.load(sys.stdin)
items = d.get('data', {}).get('data', [])
if items: print(items[0].get('id', ''))
" 2>/dev/null)

if [ -n "$DISASTER_ID" ]; then
  run_test "PATCH /admin/disasters/:id/verify → true" 200 \
    -X PATCH "$BASE_URL/admin/disasters/$DISASTER_ID/verify" \
    -H "$AUTH_HEADER" -H "Content-Type: application/json" \
    -d '{"verified":true}'
else
  echo -e "  ${YELLOW}Skipping disaster verify – no disaster found${RESET}"
fi

# ── 5. RESCUE REQUESTS ───────────────────────────────────
divider
echo -e "${BOLD}[5] RESCUE REQUESTS${RESET}"

run_test "GET /admin/rescue-requests (all)" 200 \
  -X GET "$BASE_URL/admin/rescue-requests" -H "$AUTH_HEADER"

run_test "GET /admin/rescue-requests?page=1&limit=5" 200 \
  -X GET "$BASE_URL/admin/rescue-requests?page=1&limit=5" -H "$AUTH_HEADER"

run_test "GET /admin/rescue-requests?status=pending" 200 \
  -X GET "$BASE_URL/admin/rescue-requests?status=pending" -H "$AUTH_HEADER"

# ── 6. COMMUNITY POSTS ───────────────────────────────────
divider
echo -e "${BOLD}[6] COMMUNITY POSTS${RESET}"

run_test "GET /admin/community-posts (all)" 200 \
  -X GET "$BASE_URL/admin/community-posts" -H "$AUTH_HEADER"

run_test "GET /admin/community-posts?page=1&limit=5" 200 \
  -X GET "$BASE_URL/admin/community-posts?page=1&limit=5" -H "$AUTH_HEADER"

run_test "GET /admin/community-posts?status=posted" 200 \
  -X GET "$BASE_URL/admin/community-posts?status=posted" -H "$AUTH_HEADER"

run_test "GET /admin/community-posts?includeDeleted=true" 200 \
  -X GET "$BASE_URL/admin/community-posts?includeDeleted=true" -H "$AUTH_HEADER"

POST_RESP=$(curl -s -X GET "$BASE_URL/admin/community-posts?limit=1&status=posted" -H "$AUTH_HEADER")
POST_ID=$(echo "$POST_RESP" | python3 -c "
import sys, json
d = json.load(sys.stdin)
items = d.get('data', {}).get('data', [])
if items: print(items[0].get('id', ''))
" 2>/dev/null)

if [ -n "$POST_ID" ]; then
  run_test "PATCH /admin/community-posts/:id/status → archived" 200 \
    -X PATCH "$BASE_URL/admin/community-posts/$POST_ID/status" \
    -H "$AUTH_HEADER" -H "Content-Type: application/json" \
    -d '{"status":"archived"}'

  run_test "DELETE /admin/community-posts/:id (soft delete)" 200 \
    -X DELETE "$BASE_URL/admin/community-posts/$POST_ID" \
    -H "$AUTH_HEADER"

  run_test "PATCH /admin/community-posts/:id/restore" 200 \
    -X PATCH "$BASE_URL/admin/community-posts/$POST_ID/restore" \
    -H "$AUTH_HEADER"
else
  echo -e "  ${YELLOW}Skipping post mutations – no posted community post found${RESET}"
fi

# ── 7. REPORTS ───────────────────────────────────────────
divider
echo -e "${BOLD}[7] ADMIN REPORTS${RESET}"

run_test "GET /admin/reports (summary)" 200 \
  -X GET "$BASE_URL/admin/reports" -H "$AUTH_HEADER"

# ── 8. AUTH GUARD (negative tests) ──────────────────────
divider
echo -e "${BOLD}[8] AUTH GUARD TESTS (negative)${RESET}"

run_negative_test "GET /admin/accounts without token → 401" 401 \
  -X GET "$BASE_URL/admin/accounts"

run_negative_test "GET /admin/accounts with invalid JWT → 401" 401 \
  -X GET "$BASE_URL/admin/accounts" \
  -H "Authorization: Bearer invalid.token.here"

# ── SUMMARY ──────────────────────────────────────────────
divider
echo ""
echo -e "${BOLD}${CYAN}╔══════════════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}${CYAN}║                  TEST SUMMARY                       ║${RESET}"
echo -e "${BOLD}${CYAN}╚══════════════════════════════════════════════════════╝${RESET}"
TOTAL=$((PASS + FAIL))
echo -e "  Total:  ${BOLD}$TOTAL${RESET}"
echo -e "  ${GREEN}Passed: $PASS${RESET}"
echo -e "  ${RED}Failed: $FAIL${RESET}"

if [ ${#ERRORS[@]} -gt 0 ]; then
  echo ""
  echo -e "${RED}Failed Tests:${RESET}"
  for ERR in "${ERRORS[@]}"; do
    echo -e "  ${RED}x $ERR${RESET}"
  done
fi

echo ""
if [ $FAIL -eq 0 ]; then
  echo -e "${GREEN}${BOLD}All tests passed!${RESET}"
else
  echo -e "${YELLOW}${BOLD}Some tests failed – check output above.${RESET}"
fi
echo ""
