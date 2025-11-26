#!/usr/bin/env bash
set -euo pipefail

# -----------------------------------------------------------------------------
# Case-study API test suite for the simplified QuanLyDanCu backend
#
# 1) Start services:     docker compose up -d db backend
# 2) Reseed database:    docker exec -i quanlydancu-postgres \
#                           psql -U postgres -d quanlydancu < backend/test/seed-data/test-seed.sql
# 3) Run this script:    bash backend/test/case-study-api-test.sh
# -----------------------------------------------------------------------------

COLOR_INFO="\033[1;34m"
COLOR_OK="\033[1;32m"
COLOR_FAIL="\033[1;31m"
COLOR_RESET="\033[0m"

log_info() { printf "%b[INFO]%b %s\n" "$COLOR_INFO" "$COLOR_RESET" "$1"; }
log_ok()   { printf "%b[ OK ]%b %s\n" "$COLOR_OK" "$COLOR_RESET" "$1"; }
log_fail() { printf "%b[FAIL]%b %s\n" "$COLOR_FAIL" "$COLOR_RESET" "$1"; }

fail() {
  log_fail "$1"
  if [[ -n "${API_STATUS:-}" ]]; then
    echo "Last HTTP status: ${API_STATUS}"
  fi
  if [[ -n "${API_BODY:-}" ]]; then
    echo "Last HTTP body:"
    echo "$API_BODY"
  fi
  exit 1
}

require_cmd() {
  local cmd="$1"
  command -v "$cmd" >/dev/null 2>&1 || fail "Missing required command: $cmd"
}

BASE_URL=${BASE_URL:-http://localhost:8080}
API_BODY=""
API_STATUS=""
ADMIN_TOKEN=""
TOTRUONG_TOKEN=""
KETOAN_TOKEN=""

api_call() {
  local method="$1"
  local endpoint="$2"
  local token="${3:-}"
  local data="${4:-}"
  local url="${BASE_URL}${endpoint}"
  local headers=(-H "Accept: application/json")

  if [[ -n "$token" ]]; then
    headers+=(-H "Authorization: Bearer $token")
  fi
  if [[ "$method" != "GET" && "$method" != "DELETE" ]]; then
    headers+=(-H "Content-Type: application/json")
  fi

  local curl_cmd=(curl -s -S -X "$method" "${headers[@]}" "$url" -w "\n%{http_code}")
  if [[ -n "$data" ]]; then
    curl_cmd+=(-d "$data")
  fi

  local response
  response=$("${curl_cmd[@]}")
  API_STATUS="${response##*$'\n'}"
  API_BODY="${response%$'\n'*}"
}

assert_equals() {
  local expected="$1"
  local actual="$2"
  local message="$3"
  [[ "$expected" == "$actual" ]] || fail "$message (expected=$expected, actual=$actual)"
}

assert_not_empty() {
  local value="$1"
  local message="$2"
  if [[ -z "$value" || "$value" == "null" ]]; then
    fail "$message"
  fi
}

assert_http_code() {
  local expected="$1"
  local actual="$2"
  local message="$3"
  [[ "$expected" == "$actual" ]] || fail "$message (expected HTTP $expected, got $actual)"
}

login() {
  local username="$1"
  local password="$2"
  local payload
  payload=$(jq -nc --arg u "$username" --arg p "$password" '{username:$u,password:$p}')
  api_call POST "/api/auth/login" "" "$payload"
  assert_http_code "200" "$API_STATUS" "Login for $username should succeed"
  local token
  token=$(echo "$API_BODY" | jq -r '.token')
  assert_not_empty "$token" "Token for $username must not be empty"
  echo "$token"
}

login_admin()    { ADMIN_TOKEN=$(login "admin" "admin123"); }
login_totruong() { TOTRUONG_TOKEN=$(login "totruong01" "admin123"); }
login_ketoan()   { KETOAN_TOKEN=$(login "ketoan01" "admin123"); }

# -----------------------------------------------------------------------------
# Test suites
# -----------------------------------------------------------------------------

test_auth() {
  log_info "Running test_auth"
  local token
  token=$(login "admin" "admin123")
  assert_not_empty "$token" "Admin token from test_auth must exist"
  token=$(login "totruong01" "admin123")
  assert_not_empty "$token" "Tổ trưởng token must exist"
  token=$(login "ketoan01" "admin123")
  assert_not_empty "$token" "Kế toán token must exist"

  local payload
  payload=$(jq -nc '{username:"admin",password:"wrong-pass"}')
  api_call POST "/api/auth/login" "" "$payload"
  # Backend currently returns 400 for bad credentials via GlobalExceptionHandler.
  assert_http_code "400" "$API_STATUS" "Invalid login must fail"
  if echo "$API_BODY" | jq -e '.token' >/dev/null 2>&1; then
    fail "Invalid login response should not contain a token"
  fi
  log_ok "test_auth passed"
}

test_ho_khau() {
  log_info "Running test_ho_khau"
  api_call GET "/api/ho-khau" "$ADMIN_TOKEN"
  assert_http_code "200" "$API_STATUS" "GET /api/ho-khau should succeed"
  local households_json="$API_BODY"
  local count
  count=$(echo "$households_json" | jq 'length')
  assert_equals "8" "$count" "Seed must contain exactly 8 households"

  local hk1
  hk1=$(echo "$households_json" | jq 'map(select(.id==1)) | .[0]')
  local soHoKhau
  soHoKhau=$(echo "$hk1" | jq -r '.soHoKhau')
  assert_equals "HK001" "$soHoKhau" "Household #1 should be HK001"
  local tenChuHo
  tenChuHo=$(echo "$hk1" | jq -r '.tenChuHo')
  assert_equals "Nguyễn Văn An" "$tenChuHo" "Household #1 owner mismatch"
  local members
  members=$(echo "$hk1" | jq '.listNhanKhau | length')
  assert_equals "4" "$members" "Household HK001 should have 4 members"

  log_ok "test_ho_khau passed"
}

test_nhan_khau() {
  log_info "Running test_nhan_khau"
  api_call GET "/api/nhan-khau" "$ADMIN_TOKEN"
  assert_http_code "200" "$API_STATUS" "GET /api/nhan-khau should succeed"
  local all_citizens="$API_BODY"
  local total
  total=$(echo "$all_citizens" | jq 'length')
  assert_equals "30" "$total" "Seed must contain 30 citizens"

  local ho_ten_7
  ho_ten_7=$(echo "$all_citizens" | jq -r 'map(select(.id==7)) | .[0].hoTen')
  assert_equals "Trần Văn Em" "$ho_ten_7" "Citizen #7 hoTen mismatch"
  local tam_vang_tu
  tam_vang_tu=$(echo "$all_citizens" | jq -r 'map(select(.id==7)) | .[0].tamVangTu')
  assert_equals "2025-10-01" "$tam_vang_tu" "Citizen #7 tamVangTu mismatch"
  local tam_vang_den
  tam_vang_den=$(echo "$all_citizens" | jq -r 'map(select(.id==7)) | .[0].tamVangDen')
  assert_equals "2026-01-31" "$tam_vang_den" "Citizen #7 tamVangDen mismatch"

  local tam_tru_tu
  tam_tru_tu=$(echo "$all_citizens" | jq -r 'map(select(.id==8)) | .[0].tamTruTu')
  assert_equals "2025-05-01" "$tam_tru_tu" "Citizen #8 tamTruTu mismatch"
  local tam_tru_den
  tam_tru_den=$(echo "$all_citizens" | jq -r 'map(select(.id==8)) | .[0].tamTruDen')
  assert_equals "2025-12-31" "$tam_tru_den" "Citizen #8 tamTruDen mismatch"

  local new_payload
  new_payload=$(jq -nc '{
    hoTen:"Test Citizen",
    ngaySinh:"1995-05-05",
    gioiTinh:"Nam",
    danToc:"Kinh",
    quocTich:"Việt Nam",
    ngheNghiep:"Tester",
    quanHeChuHo:"Con",
    cmndCccd:"123456789012",
    ngayCap:"2010-06-01",
    noiCap:"CA Hà Nội",
    ghiChu:"Created by script",
    hoKhauId:1
  }')
  api_call POST "/api/nhan-khau" "$ADMIN_TOKEN" "$new_payload"
  assert_http_code "201" "$API_STATUS" "POST /api/nhan-khau should create citizen"
  local new_id
  new_id=$(echo "$API_BODY" | jq -r '.id')
  assert_not_empty "$new_id" "New citizen id must not be empty"

  local update_payload
  update_payload=$(jq -nc '{ngheNghiep:"QA Engineer", ghiChu:"Updated note"}')
  api_call PUT "/api/nhan-khau/${new_id}" "$ADMIN_TOKEN" "$update_payload"
  assert_http_code "200" "$API_STATUS" "PUT /api/nhan-khau/{id} should succeed"
  local updated_note
  updated_note=$(echo "$API_BODY" | jq -r '.ghiChu')
  assert_equals "Updated note" "$updated_note" "Citizen update should change ghiChu"

  api_call GET "/api/nhan-khau/${new_id}" "$ADMIN_TOKEN"
  assert_http_code "200" "$API_STATUS" "GET newly created citizen should work"
  local stored_nghe
  stored_nghe=$(echo "$API_BODY" | jq -r '.ngheNghiep')
  assert_equals "QA Engineer" "$stored_nghe" "Citizen update should persist ngheNghiep"

  api_call DELETE "/api/nhan-khau/${new_id}" "$ADMIN_TOKEN"
  assert_http_code "204" "$API_STATUS" "DELETE /api/nhan-khau/{id} should return 204"
  log_ok "test_nhan_khau passed"
}

test_bien_dong() {
  log_info "Running test_bien_dong"
  api_call GET "/api/bien-dong" "$ADMIN_TOKEN"
  assert_http_code "200" "$API_STATUS" "Initial GET /api/bien-dong should succeed"
  local initial_count
  initial_count=$(echo "$API_BODY" | jq 'length')
  assert_equals "0" "$initial_count" "Seed must have no bien_dong records"

  local create_payload
  create_payload=$(jq -nc '{loai:"chuyen_den",noiDung:"Test log tao moi",hoKhauId:1,nhanKhauId:5}')
  api_call POST "/api/bien-dong" "$ADMIN_TOKEN" "$create_payload"
  assert_http_code "201" "$API_STATUS" "POST /api/bien-dong should create log"
  local bien_dong_id
  bien_dong_id=$(echo "$API_BODY" | jq -r '.id')
  assert_not_empty "$bien_dong_id" "New bien_dong id must not be empty"
  local loai_value
  loai_value=$(echo "$API_BODY" | jq -r '.loai')
  assert_equals "CHUYEN_DEN" "$loai_value" "Loai should be uppercased"

  local update_payload
  update_payload=$(jq -nc '{loai:"chuyen_di",noiDung:"Da cap nhat noi dung",thoiGian:"2025-11-26T16:31:00"}')
  api_call PUT "/api/bien-dong/${bien_dong_id}" "$ADMIN_TOKEN" "$update_payload"
  assert_http_code "200" "$API_STATUS" "PUT /api/bien-dong/{id} should succeed"
  local updated_type
  updated_type=$(echo "$API_BODY" | jq -r '.loai')
  assert_equals "CHUYEN_DI" "$updated_type" "Loai should update"

  local invalid_payload
  invalid_payload=$(jq -nc '{loai:"SAI_TYPE",noiDung:"invalid"}')
  api_call POST "/api/bien-dong" "$ADMIN_TOKEN" "$invalid_payload"
  assert_http_code "400" "$API_STATUS" "Invalid bien_dong type must fail"
  [[ "$API_BODY" == *"CHUYEN_DEN"* ]] || fail "Error message must list allowed types"

  api_call DELETE "/api/bien-dong/${bien_dong_id}" "$ADMIN_TOKEN"
  assert_http_code "204" "$API_STATUS" "DELETE /api/bien-dong/{id} should return 204"
  api_call GET "/api/bien-dong" "$ADMIN_TOKEN"
  local after_delete_count
  after_delete_count=$(echo "$API_BODY" | jq 'length')
  assert_equals "0" "$after_delete_count" "bien_dong list should be empty after cleanup"
  log_ok "test_bien_dong passed"
}

test_dot_thu_phi() {
  log_info "Running test_dot_thu_phi"
  api_call GET "/api/dot-thu-phi" "$ADMIN_TOKEN"
  assert_http_code "200" "$API_STATUS" "GET /api/dot-thu-phi should succeed"
  local periods_json="$API_BODY"
  local total
  total=$(echo "$periods_json" | jq 'length')
  assert_equals "6" "$total" "Seed must include 6 fee periods"

  local dot1
  dot1=$(echo "$periods_json" | jq 'map(select(.id==1)) | .[0]')
  assert_equals "Phí vệ sinh tháng 1/2025" "$(echo "$dot1" | jq -r '.tenDot')" "dot #1 name mismatch"
  assert_equals "BAT_BUOC" "$(echo "$dot1" | jq -r '.loai')" "dot #1 loai mismatch"
  assert_equals "2025-01-01" "$(echo "$dot1" | jq -r '.ngayBatDau')" "dot #1 start mismatch"
  assert_equals "2025-01-31" "$(echo "$dot1" | jq -r '.ngayKetThuc')" "dot #1 end mismatch"
  assert_equals "6000" "$(echo "$dot1" | jq -r '.dinhMuc | tostring | sub("\\.0+$";"")')" "dot #1 dinhMuc mismatch"

  local dot6
  dot6=$(echo "$periods_json" | jq 'map(select(.id==6)) | .[0]')
  assert_equals "Đóng góp xây nhà văn hóa" "$(echo "$dot6" | jq -r '.tenDot')" "dot #6 name mismatch"
  assert_equals "TU_NGUYEN" "$(echo "$dot6" | jq -r '.loai')" "dot #6 loai mismatch"
  log_ok "test_dot_thu_phi passed"
}

test_thu_phi_ho_khau() {
  log_info "Running test_thu_phi_ho_khau"
  api_call GET "/api/thu-phi-ho-khau" "$KETOAN_TOKEN"
  assert_http_code "200" "$API_STATUS" "GET /api/thu-phi-ho-khau should succeed"
  local initial_json="$API_BODY"
  local initial
  initial=$(echo "$initial_json" | jq 'length')
  if [[ "$initial" != "0" ]]; then
    log_info "Cleaning up $initial leftover fee record(s) before running assertions"
    while IFS= read -r fee_id; do
      api_call DELETE "/api/thu-phi-ho-khau/${fee_id}" "$KETOAN_TOKEN"
      assert_http_code "200" "$API_STATUS" "Pre-test fee cleanup should return 200"
    done < <(echo "$initial_json" | jq -r '.[].id')
    api_call GET "/api/thu-phi-ho-khau" "$KETOAN_TOKEN"
    assert_http_code "200" "$API_STATUS" "Re-check fee records after cleanup"
    initial=$(echo "$API_BODY" | jq 'length')
  fi
  assert_equals "0" "$initial" "Seed must not contain thu_phi_ho_khau records"

  api_call GET "/api/thu-phi-ho-khau/calculate?hoKhauId=1&dotThuPhiId=1" "$KETOAN_TOKEN"
  assert_http_code "200" "$API_STATUS" "Calculate mandatory fee should succeed"
  local calc_mandatory="$API_BODY"
  local hk1_member_count
  hk1_member_count=$(echo "$calc_mandatory" | jq '.memberCount')
  assert_equals "4" "$hk1_member_count" "Household 1 should count 4 members"
  local hk1_total_fee
  hk1_total_fee=$(echo "$calc_mandatory" | jq -r '.totalFee | tostring | sub("\\.0+$";"")')
  assert_equals "24000" "$hk1_total_fee" "Household 1 total fee mismatch"
  local mandatory_formula
  mandatory_formula=$(echo "$calc_mandatory" | jq -r '.formula')
  assert_not_empty "$mandatory_formula" "Calculate response must include formula"

  api_call GET "/api/thu-phi-ho-khau/calculate?hoKhauId=2&dotThuPhiId=1" "$KETOAN_TOKEN"
  assert_http_code "200" "$API_STATUS" "Calculate with temporary absence should succeed"
  local calc_tamvang="$API_BODY"
  local hk2_member_count
  hk2_member_count=$(echo "$calc_tamvang" | jq '.memberCount')
  assert_equals "3" "$hk2_member_count" "Household 2 should exclude temporary absence"

  local mandatory_payload
  mandatory_payload=$(jq -nc '{hoKhauId:1,dotThuPhiId:1,ngayThu:"2025-01-15",ghiChu:"Thanh toan du"}')
  api_call POST "/api/thu-phi-ho-khau" "$KETOAN_TOKEN" "$mandatory_payload"
  assert_http_code "201" "$API_STATUS" "Creating mandatory fee record should succeed"
  local mandatory_id
  mandatory_id=$(echo "$API_BODY" | jq -r '.id')
  assert_not_empty "$mandatory_id" "Mandatory fee id must not be empty"
  assert_equals "$hk1_member_count" "$(echo "$API_BODY" | jq -r '.soNguoi')" "soNguoi mismatch"
  assert_equals "$hk1_total_fee" "$(echo "$API_BODY" | jq -r '.tongPhi | tostring | sub("\\.0+$";"")')" "tongPhi mismatch"
  assert_equals "DA_NOP" "$(echo "$API_BODY" | jq -r '.trangThai')" "Mandatory record must be DA_NOP"

  local voluntary_payload
  voluntary_payload=$(jq -nc '{hoKhauId:3,dotThuPhiId:6,ngayThu:"2025-11-20",ghiChu:"Dong gop"}')
  api_call POST "/api/thu-phi-ho-khau" "$KETOAN_TOKEN" "$voluntary_payload"
  assert_http_code "201" "$API_STATUS" "Creating voluntary fee record should succeed"
  local voluntary_id
  voluntary_id=$(echo "$API_BODY" | jq -r '.id')
  assert_not_empty "$voluntary_id" "Voluntary fee id must not be empty"
  assert_equals "0" "$(echo "$API_BODY" | jq -r '.soNguoi')" "Voluntary soNguoi should be 0"
  assert_equals "0" "$(echo "$API_BODY" | jq -r '.tongPhi | tostring | sub("\\.0+$";"")')" "Voluntary tongPhi should be 0"
  assert_equals "KHONG_AP_DUNG" "$(echo "$API_BODY" | jq -r '.trangThai')" "Voluntary status mismatch"

  api_call POST "/api/thu-phi-ho-khau" "$KETOAN_TOKEN" "$mandatory_payload"
  assert_http_code "400" "$API_STATUS" "Creating duplicate (hoKhau,dotThuPhi) must fail"

  local update_payload
  update_payload=$(jq -nc '{hoKhauId:1,dotThuPhiId:1,ngayThu:"2025-01-20",ghiChu:"Bo sung chung chi"}')
  api_call PUT "/api/thu-phi-ho-khau/${mandatory_id}" "$KETOAN_TOKEN" "$update_payload"
  assert_http_code "200" "$API_STATUS" "Updating mandatory fee should succeed"
  assert_equals "2025-01-20" "$(echo "$API_BODY" | jq -r '.ngayThu')" "Updated ngayThu mismatch"
  assert_equals "Bo sung chung chi" "$(echo "$API_BODY" | jq -r '.ghiChu')" "Updated ghiChu mismatch"
  assert_equals "$hk1_member_count" "$(echo "$API_BODY" | jq -r '.soNguoi')" "soNguoi should stay"

  api_call GET "/api/thu-phi-ho-khau" "$KETOAN_TOKEN"
  local after_create
  after_create=$(echo "$API_BODY" | jq 'length')
  assert_equals "2" "$after_create" "There should be exactly 2 fee records before cleanup"

  api_call DELETE "/api/thu-phi-ho-khau/${mandatory_id}" "$KETOAN_TOKEN"
  assert_http_code "200" "$API_STATUS" "Deleting mandatory fee should return 200"
  api_call DELETE "/api/thu-phi-ho-khau/${voluntary_id}" "$KETOAN_TOKEN"
  assert_http_code "200" "$API_STATUS" "Deleting voluntary fee should return 200"

  api_call GET "/api/thu-phi-ho-khau" "$KETOAN_TOKEN"
  local final_count
  final_count=$(echo "$API_BODY" | jq 'length')
  assert_equals "0" "$final_count" "All fee records should be cleaned up"
  log_ok "test_thu_phi_ho_khau passed"
}

test_security() {
  log_info "Running test_security"
  api_call GET "/api/ho-khau"
  if [[ "$API_STATUS" != "401" && "$API_STATUS" != "403" ]]; then
    fail "Missing token must be rejected (expected 401/403, got $API_STATUS)"
  fi

  api_call POST "/api/thu-phi-ho-khau" "$TOTRUONG_TOKEN" '{"hoKhauId":2,"dotThuPhiId":2,"ngayThu":"2025-02-10"}'
  assert_http_code "403" "$API_STATUS" "Tổ trưởng cannot create fee records"

  api_call GET "/api/tai-khoan" "$KETOAN_TOKEN"
  assert_http_code "403" "$API_STATUS" "Kế toán cannot access admin-only APIs"
  log_ok "test_security passed"
}

main() {
  require_cmd curl
  require_cmd jq
  log_info "Using BASE_URL=$BASE_URL"

  login_admin
  login_totruong
  login_ketoan

  test_auth
  test_ho_khau
  test_nhan_khau
  test_bien_dong
  test_dot_thu_phi
  test_thu_phi_ho_khau
  test_security

  log_ok "All case-study API tests passed ✅"
}

main "$@"
