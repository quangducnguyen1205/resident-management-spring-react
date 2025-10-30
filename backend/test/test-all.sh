#!/bin/bash

# ============================================================================
# QuanLyDanCu - Unified Integration Test Suite
# Purpose: One-click test execution with Docker, seeding, and cleanup
# Author: Development Team
# Date: October 29, 2025
# Version: 4.0.0
# ============================================================================

set -e  # Exit on error

# ============================================================================
# Configuration
# ============================================================================

BASE_URL="http://localhost:8080"
POSTGRES_CONTAINER="quanlydancu-postgres"
BACKEND_CONTAINER="quanlydancu-backend"
TEST_REPORT_DIR="$(dirname "$0")/../docs"
TEST_REPORT_FILE="${TEST_REPORT_DIR}/API_TEST_REPORT.md"
SEED_DATA_FILE="$(dirname "$0")/seed-data/test-seed.sql"

# ANSI Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Test Counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Test Results Storage
declare -a TEST_RESULTS

# ============================================================================
# Helper Functions
# ============================================================================

print_banner() {
    echo ""
    echo "╔══════════════════════════════════════════════════════════════════════╗"
    echo "║                                                                      ║"
    echo "║       QuanLyDanCu - Unified Integration Test Suite v4.0.0          ║"
    echo "║                                                                      ║"
    echo "╚══════════════════════════════════════════════════════════════════════╝"
    echo ""
}

print_section() {
    echo ""
    echo "══════════════════════════════════════════════════════════════════════"
    echo "  $1"
    echo "══════════════════════════════════════════════════════════════════════"
    echo ""
}

log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Test execution function
test_endpoint() {
    local module=$1
    local method=$2
    local endpoint=$3
    local expected_status=$4
    local data=$5
    local description=$6
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    local curl_opts="-s -w \"\n%{http_code}\" -X $method \"${BASE_URL}${endpoint}\""
    
    if [ -n "$ADMIN_TOKEN" ]; then
        curl_opts="$curl_opts -H \"Authorization: Bearer $ADMIN_TOKEN\""
    fi
    
    if [ -n "$data" ]; then
        curl_opts="$curl_opts -H \"Content-Type: application/json\" -d '$data'"
    fi
    
    local response=$(eval "curl $curl_opts")
    local http_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | sed '$d')
    
    local test_name="$module | $method $endpoint"
    
    if [ "$http_code" -eq "$expected_status" ]; then
        log_success "$test_name | Expected: $expected_status | Got: $http_code"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        TEST_RESULTS+=("PASS|$test_name|$http_code|$description")
        
        # Extract ID from response if creating resource
        if [ "$expected_status" -eq 201 ]; then
            CREATED_ID=$(echo "$body" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
            if [ -n "$CREATED_ID" ]; then
                echo -e "   ${CYAN}→ Created resource with ID: $CREATED_ID${NC}"
            fi
        fi
    else
        log_error "$test_name | Expected: $expected_status | Got: $http_code"
        echo -e "   ${YELLOW}Response: ${body:0:200}${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        TEST_RESULTS+=("FAIL|$test_name|$http_code|$description|${body:0:200}")
    fi
}

# ============================================================================
# Phase 1: Environment Setup
# ============================================================================

print_banner
print_section "Phase 1: Environment Setup"

log_info "Checking Docker containers..."
if ! docker ps | grep -q "$POSTGRES_CONTAINER"; then
    log_warning "PostgreSQL container not running. Starting Docker Compose..."
    docker-compose up -d
    sleep 10
else
    log_success "PostgreSQL container is running"
fi

if ! docker ps | grep -q "$BACKEND_CONTAINER"; then
    log_warning "Backend container not running. Starting Docker Compose..."
    docker-compose up -d
    sleep 15
else
    log_success "Backend container is running"
fi

log_info "Waiting for backend to be ready..."
for i in {1..30}; do
    http_code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/auth/login" 2>/dev/null || echo "000")
    if [ "$http_code" != "000" ]; then
        log_success "Backend is ready! (HTTP $http_code)"
        break
    fi
    if [ $i -eq 30 ]; then
        log_error "Backend failed to start within 30 seconds"
        exit 1
    fi
    sleep 1
    echo -n "."
done
echo ""

# ============================================================================
# Phase 2: Database Seeding
# ============================================================================

print_section "Phase 2: Database Seeding"

log_info "Loading test seed data into PostgreSQL..."
if [ -f "$SEED_DATA_FILE" ]; then
    docker exec -i "$POSTGRES_CONTAINER" psql -U postgres -d quanlydancu < "$SEED_DATA_FILE"
    log_success "Seed data loaded successfully"
else
    log_error "Seed data file not found: $SEED_DATA_FILE"
    exit 1
fi

log_info "Verifying seed data..."
RECORD_COUNT=$(docker exec "$POSTGRES_CONTAINER" psql -U postgres -d quanlydancu -t -c "SELECT COUNT(*) FROM tai_khoan;")
log_success "Database contains $(echo $RECORD_COUNT | xargs) user accounts"

# ============================================================================
# Phase 3: Authentication Tests
# ============================================================================

print_section "Phase 3: Authentication Tests"

log_info "Testing login with admin credentials..."
LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin123"}')

ADMIN_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -n "$ADMIN_TOKEN" ]; then
    log_success "Admin login successful"
    echo -e "   ${CYAN}→ Token: ${ADMIN_TOKEN:0:30}...${NC}"
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    PASSED_TESTS=$((PASSED_TESTS + 1))
    TEST_RESULTS+=("PASS|Auth|POST /api/auth/login|200|Admin login")
else
    log_error "Failed to obtain admin token"
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    FAILED_TESTS=$((FAILED_TESTS + 1))
    TEST_RESULTS+=("FAIL|Auth|POST /api/auth/login|N/A|Admin login")
    exit 1
fi

# Test register (with unique timestamp)
TIMESTAMP=$(date +%s)
test_endpoint "Auth" "POST" "/api/auth/register" "201" \
    "{\"username\":\"testuser${TIMESTAMP}\",\"password\":\"test123\",\"role\":\"ROLE_TOTRUONG\",\"hoTen\":\"Test User\",\"email\":\"test${TIMESTAMP}@test.com\",\"sdt\":\"0900000000\"}" \
    "Register new user"

# ============================================================================
# Phase 4: Module Integration Tests
# ============================================================================

print_section "Phase 4: Module Integration Tests - Hộ Khẩu (Household)"

# Get all households
test_endpoint "HoKhau" "GET" "/api/ho-khau" "200" "" "Get all households"

# Get specific household
test_endpoint "HoKhau" "GET" "/api/ho-khau/1" "200" "" "Get household by ID"

# Create new household
test_endpoint "HoKhau" "POST" "/api/ho-khau" "201" \
    "{\"soHoKhau\":\"HK_TEST_${TIMESTAMP}\",\"tenChuHo\":\"Test Household\",\"diaChi\":\"123 Test Street\"}" \
    "Create new household"

# Update household
if [ -n "$CREATED_ID" ]; then
    test_endpoint "HoKhau" "PUT" "/api/ho-khau/$CREATED_ID" "200" \
        "{\"soHoKhau\":\"HK_TEST_${TIMESTAMP}\",\"tenChuHo\":\"Updated Household\",\"diaChi\":\"456 New Street\",\"noiDungThayDoiChuHo\":\"Change of head\"}" \
        "Update household"
fi

print_section "Phase 5: Module Integration Tests - Nhân Khẩu (Citizen)"

# Get all citizens
test_endpoint "NhanKhau" "GET" "/api/nhan-khau?page=0&size=10" "200" "" "Get all citizens (paginated)"

# Search citizens
test_endpoint "NhanKhau" "GET" "/api/nhan-khau/search?q=Nguyen" "200" "" "Search citizens by name"

# Get gender statistics
test_endpoint "NhanKhau" "GET" "/api/nhan-khau/stats/gender" "200" "" "Get gender statistics"

# Get age statistics
test_endpoint "NhanKhau" "GET" "/api/nhan-khau/stats/age?underAge=18&retireAge=60" "200" "" "Get age statistics"

# Create new citizen
test_endpoint "NhanKhau" "POST" "/api/nhan-khau" "201" \
    "{\"hoTen\":\"Test Citizen\",\"ngaySinh\":\"1990-01-01\",\"gioiTinh\":\"Nam\",\"hoKhauId\":1,\"quanHeVoiChuHo\":\"Con\"}" \
    "Create new citizen"

print_section "Phase 6: Module Integration Tests - Biến Động (Changes)"

# Get all changes
test_endpoint "BienDong" "GET" "/api/bien-dong" "200" "" "Get all population changes"

# Create new change record
test_endpoint "BienDong" "POST" "/api/bien-dong" "201" \
    "{\"nhanKhauId\":1,\"loai\":\"TAM_VANG\",\"noiDung\":\"Test temporary absence\",\"thoiGian\":\"2025-10-29T10:00:00\",\"hoKhauId\":1}" \
    "Create new change record"

# Get change by ID
if [ -n "$CREATED_ID" ]; then
    test_endpoint "BienDong" "GET" "/api/bien-dong/$CREATED_ID" "200" "" "Get change by ID"
fi

print_section "Phase 7: Module Integration Tests - Đợt Thu Phí (Fee Periods)"

# Get all fee periods
test_endpoint "DotThuPhi" "GET" "/api/dot-thu-phi" "200" "" "Get all fee periods"

# Create new fee period
test_endpoint "DotThuPhi" "POST" "/api/dot-thu-phi" "201" \
    "{\"tenDot\":\"Test Fee Period ${TIMESTAMP}\",\"loai\":\"VE_SINH\",\"ngayBatDau\":\"2025-11-01\",\"ngayKetThuc\":\"2025-11-30\",\"dinhMuc\":6000}" \
    "Create new fee period"

# Get fee period by ID
if [ -n "$CREATED_ID" ]; then
    test_endpoint "DotThuPhi" "GET" "/api/dot-thu-phi/$CREATED_ID" "200" "" "Get fee period by ID"
    
    # Update fee period
    test_endpoint "DotThuPhi" "PUT" "/api/dot-thu-phi/$CREATED_ID" "200" \
        "{\"tenDot\":\"Updated Fee Period ${TIMESTAMP}\",\"loai\":\"VE_SINH\",\"ngayBatDau\":\"2025-11-01\",\"ngayKetThuc\":\"2025-11-30\",\"dinhMuc\":7000}" \
        "Update fee period"
fi

print_section "Phase 8: Module Integration Tests - Thu Phí Hộ Khẩu (Household Fees)"

# Get all payments
test_endpoint "ThuPhiHoKhau" "GET" "/api/thu-phi-ho-khau" "200" "" "Get all payments"

# Get payment statistics
test_endpoint "ThuPhiHoKhau" "GET" "/api/thu-phi-ho-khau/stats" "200" "" "Get payment statistics"

# Fetch actual IDs from seeded data
log_info "Fetching seeded data IDs for testing..."
FIRST_HOKHAU_ID=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" "${BASE_URL}/api/ho-khau" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
SECOND_HOKHAU_ID=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" "${BASE_URL}/api/ho-khau" | grep -o '"id":[0-9]*' | head -2 | tail -1 | cut -d':' -f2)
FIRST_DOTTHUPHI_ID=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" "${BASE_URL}/api/dot-thu-phi" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ -n "$FIRST_HOKHAU_ID" ] && [ -n "$SECOND_HOKHAU_ID" ] && [ -n "$FIRST_DOTTHUPHI_ID" ]; then
    log_success "Found HoKhau IDs: $FIRST_HOKHAU_ID, $SECOND_HOKHAU_ID | DotThuPhi ID: $FIRST_DOTTHUPHI_ID"
    
    # Test fee calculation
    test_endpoint "ThuPhiHoKhau" "GET" "/api/thu-phi-ho-khau/calc?hoKhauId=${FIRST_HOKHAU_ID}&dotThuPhiId=${FIRST_DOTTHUPHI_ID}" "200" "" "Calculate fee for household"
    
    # Test calculation with discount (HoKhau ID 2 has elderly members)
    test_endpoint "ThuPhiHoKhau" "GET" "/api/thu-phi-ho-khau/calc?hoKhauId=${SECOND_HOKHAU_ID}&dotThuPhiId=${FIRST_DOTTHUPHI_ID}" "200" "" "Calculate fee with elderly discount"
    
    # Create new payment record
    test_endpoint "ThuPhiHoKhau" "POST" "/api/thu-phi-ho-khau" "201" \
        "{\"hoKhauId\":${FIRST_HOKHAU_ID},\"dotThuPhiId\":${FIRST_DOTTHUPHI_ID},\"soTienDaThu\":18000,\"ngayThu\":\"2025-10-29\",\"months\":\"10\"}" \
        "Create new payment record"
    
    # Get payment by ID
    if [ -n "$CREATED_ID" ]; then
        test_endpoint "ThuPhiHoKhau" "GET" "/api/thu-phi-ho-khau/$CREATED_ID" "200" "" "Get payment by ID"
    fi
else
    log_error "Could not fetch seeded data IDs"
fi

print_section "Phase 9: API Documentation Tests"

# Test Swagger UI
test_endpoint "Swagger" "GET" "/swagger-ui/index.html" "200" "" "Access Swagger UI"

# Test OpenAPI docs
test_endpoint "OpenAPI" "GET" "/v3/api-docs" "200" "" "Access OpenAPI specification"

# ============================================================================
# Phase 10: Test Summary & Reporting
# ============================================================================

print_section "Phase 10: Test Summary & Reporting"

SUCCESS_RATE=0
if [ $TOTAL_TESTS -gt 0 ]; then
    SUCCESS_RATE=$(awk "BEGIN {printf \"%.2f\", ($PASSED_TESTS/$TOTAL_TESTS)*100}")
fi

echo ""
echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║                         TEST SUMMARY                                 ║"
echo "╠══════════════════════════════════════════════════════════════════════╣"
printf "║ Total Tests:    %-2d                                                 ║\n" $TOTAL_TESTS
printf "║ Passed:         %-2d ✅                                              ║\n" $PASSED_TESTS
printf "║ Failed:         %-2d ❌                                              ║\n" $FAILED_TESTS
printf "║ Success Rate:   %-6s%%                                             ║\n" $SUCCESS_RATE
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""

# Generate markdown report
log_info "Generating test report..."

mkdir -p "$TEST_REPORT_DIR"

cat > "$TEST_REPORT_FILE" << EOF
# API Integration Test Report

**Generated:** $(date '+%Y-%m-%d %H:%M:%S')  
**Test Suite Version:** 4.0.0  
**Total Tests:** $TOTAL_TESTS  
**Passed:** $PASSED_TESTS ✅  
**Failed:** $FAILED_TESTS ❌  
**Success Rate:** ${SUCCESS_RATE}%

---

## Test Results

| Status | Module | Endpoint | HTTP Code | Description |
|--------|--------|----------|-----------|-------------|
EOF

for result in "${TEST_RESULTS[@]}"; do
    IFS='|' read -r status module code description error <<< "$result"
    if [ "$status" = "PASS" ]; then
        echo "| ✅ PASS | $module | $code | $description |" >> "$TEST_REPORT_FILE"
    else
        echo "| ❌ FAIL | $module | $code | $description | $error |" >> "$TEST_REPORT_FILE"
    fi
done

cat >> "$TEST_REPORT_FILE" << EOF

---

## Test Environment

- **Backend URL:** $BASE_URL
- **Database:** PostgreSQL 15 (Docker)
- **Seed Data:** Loaded from \`test/seed-data/test-seed.sql\`
- **Docker Containers:** 
  - \`$POSTGRES_CONTAINER\` (PostgreSQL)
  - \`$BACKEND_CONTAINER\` (Spring Boot)

---

## Summary

$(if [ $FAILED_TESTS -eq 0 ]; then
    echo "🎉 **All tests passed!** The system is stable and ready for production."
else
    echo "⚠️ **Some tests failed.** Please review the failed tests above and investigate the issues."
fi)

---

**Report Location:** \`$TEST_REPORT_FILE\`
EOF

log_success "Test report generated: $TEST_REPORT_FILE"

# ============================================================================
# Phase 11: Cleanup (Optional)
# ============================================================================

if [ "${SKIP_CLEANUP:-false}" != "true" ]; then
    print_section "Phase 11: Cleanup"
    log_info "Cleaning up test data..."
    docker exec -i "$POSTGRES_CONTAINER" psql -U postgres -d quanlydancu -c "
        TRUNCATE TABLE thu_phi_ho_khau CASCADE;
        TRUNCATE TABLE bien_dong CASCADE;
        TRUNCATE TABLE nhan_khau CASCADE;
    " > /dev/null 2>&1
    log_success "Test data cleaned up"
fi

# ============================================================================
# Exit
# ============================================================================

echo ""
if [ $FAILED_TESTS -eq 0 ]; then
    log_success "🎉 All tests passed! Success rate: ${SUCCESS_RATE}%"
    exit 0
else
    log_error "⚠️ Some tests failed. Success rate: ${SUCCESS_RATE}%"
    exit 1
fi
