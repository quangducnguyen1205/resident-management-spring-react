#!/bin/sh

# Simplified API Integration Test Script
# QuanLyDanCu Backend - Docker Environment

set +e  # Don't exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

BASE_URL="http://localhost:8080"
PASSED=0
FAILED=0
TOTAL=0

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  📋 API Integration Test Report — QuanLyDanCu${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo "Base URL: $BASE_URL"
echo "Test Date: $(date)"
echo "Spring Boot: 3.3.5"
echo "Java: 17"
echo "Database: PostgreSQL 15 (Docker)"
echo ""

# Test function
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local token=$5
    local expected=$6
    
    TOTAL=$((TOTAL + 1))
    
    local start=$(python3 -c 'import time; print(int(time.time() * 1000))')
    
    if [ -z "$token" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            ${data:+-d "$data"} \
            "$BASE_URL$endpoint" 2>&1)
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $token" \
            ${data:+-d "$data"} \
            "$BASE_URL$endpoint" 2>&1)
    fi
    
    local end=$(python3 -c 'import time; print(int(time.time() * 1000))')
    local duration=$((end - start))
    
    local code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | sed '$d')
    
    if [ "$code" == "$expected" ]; then
        PASSED=$((PASSED + 1))
        echo -e "${GREEN}✅ PASSED${NC} | $name | ${duration}ms | HTTP $code"
        echo "$body"
    else
        FAILED=$((FAILED + 1))
        local error=$(echo "$body" | python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('message', d.get('error', 'Unknown')))" 2>/dev/null || echo "$body")
        echo -e "${RED}❌ FAILED${NC} | $name | ${duration}ms | HTTP $code (expected $expected)"
        echo "Error: $error"
    fi
    echo ""
}

# 1. Swagger UI
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}1️⃣  Swagger UI Health Check${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
test_endpoint "Swagger UI Load" "GET" "/swagger-ui/index.html" "" "" "200"

# 2. OpenAPI Docs
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}2️⃣  OpenAPI Documentation${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
test_endpoint "OpenAPI JSON" "GET" "/v3/api-docs" "" "" "200"

# 3. Authentication
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}3️⃣  Authentication API (/api/auth)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Valid login
login_data='{"username":"admin","password":"admin123"}'
login_response=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d "$login_data" \
    "$BASE_URL/api/auth/login" 2>&1)

login_code=$(echo "$login_response" | tail -n1)
login_body=$(echo "$login_response" | sed '$d')

TOTAL=$((TOTAL + 1))
if [ "$login_code" == "200" ]; then
    PASSED=$((PASSED + 1))
    JWT_TOKEN=$(echo "$login_body" | python3 -c "import sys, json; print(json.load(sys.stdin)['token'])" 2>/dev/null)
    echo -e "${GREEN}✅ PASSED${NC} | POST /api/auth/login (valid) | HTTP 200"
    echo "JWT Token: ${JWT_TOKEN:0:50}..."
else
    FAILED=$((FAILED + 1))
    echo -e "${RED}❌ FAILED${NC} | POST /api/auth/login (valid) | HTTP $login_code (expected 200)"
    echo "$login_body"
fi
echo ""

# Invalid login
test_endpoint "POST /api/auth/login (invalid)" "POST" "/api/auth/login" \
    '{"username":"invalid","password":"wrong"}' "" "401"

# 4. HoKhau API
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}4️⃣  HoKhau API (/api/hokhau)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ ! -z "$JWT_TOKEN" ]; then
    test_endpoint "GET /api/hokhau (authorized)" "GET" "/api/hokhau" "" "$JWT_TOKEN" "200"
else
    echo -e "${YELLOW}⚠️  Skipping (no JWT token)${NC}"
    echo ""
fi

# Unauthorized access
test_endpoint "GET /api/hokhau (unauthorized)" "GET" "/api/hokhau" "" "" "403"

# 5. Đợt Thu Phí API
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}5️⃣  Đợt Thu Phí API (/api/dot-thu-phi)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ ! -z "$JWT_TOKEN" ]; then
    # Create
    create_data='{
        "tenDot": "Đợt thu phí test tháng 10/2025",
        "loaiPhi": "PHI_QUAN_LY",
        "moTa": "Thu phí quản lý khu chung cư",
        "soTien": 100000,
        "batDau": "2025-10-01",
        "ketThuc": "2025-10-31"
    }'
    
    create_response=$(curl -s -w "\n%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $JWT_TOKEN" \
        -d "$create_data" \
        "$BASE_URL/api/dot-thu-phi" 2>&1)
    
    create_code=$(echo "$create_response" | tail -n1)
    create_body=$(echo "$create_response" | sed '$d')
    
    TOTAL=$((TOTAL + 1))
    if [ "$create_code" == "201" ]; then
        PASSED=$((PASSED + 1))
        DOT_ID=$(echo "$create_body" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])" 2>/dev/null)
        echo -e "${GREEN}✅ PASSED${NC} | POST /api/dot-thu-phi (create) | HTTP 201"
        echo "Created Đợt Thu Phí ID: $DOT_ID"
    else
        FAILED=$((FAILED + 1))
        echo -e "${RED}❌ FAILED${NC} | POST /api/dot-thu-phi (create) | HTTP $create_code"
        echo "$create_body"
    fi
    echo ""
    
    # List all
    test_endpoint "GET /api/dot-thu-phi (list)" "GET" "/api/dot-thu-phi" "" "$JWT_TOKEN" "200"
    
    if [ ! -z "$DOT_ID" ]; then
        # Get by ID
        test_endpoint "GET /api/dot-thu-phi/{id}" "GET" "/api/dot-thu-phi/$DOT_ID" "" "$JWT_TOKEN" "200"
        
        # Update
        update_data='{
            "tenDot": "Đợt thu phí test - UPDATED",
            "loaiPhi": "PHI_QUAN_LY",
            "moTa": "Thu phí quản lý - Đã cập nhật",
            "soTien": 150000,
            "batDau": "2025-10-01",
            "ketThuc": "2025-10-31"
        }'
        test_endpoint "PUT /api/dot-thu-phi/{id}" "PUT" "/api/dot-thu-phi/$DOT_ID" "$update_data" "$JWT_TOKEN" "200"
        
        # Get active
        test_endpoint "GET /api/dot-thu-phi/dang-hoat-dong" "GET" "/api/dot-thu-phi/dang-hoat-dong" "" "$JWT_TOKEN" "200"
    fi
else
    echo -e "${YELLOW}⚠️  Skipping (no JWT token)${NC}"
    echo ""
fi

# 6. Thu Phí Hộ Khẩu API
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}6️⃣  Thu Phí Hộ Khẩu API (/api/thu-phi-ho-khau)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ ! -z "$JWT_TOKEN" ] && [ ! -z "$DOT_ID" ]; then
    # Note: Using mock hoKhauId=1 (may fail if HoKhau doesn't exist)
    payment_data="{
        \"dotThuPhiId\": $DOT_ID,
        \"hoKhauId\": 1,
        \"soTienCanNop\": 100000,
        \"soTienDaNop\": 0,
        \"trangThai\": \"CHUA_DONG\",
        \"ghiChu\": \"Test payment\"
    }"
    
    payment_response=$(curl -s -w "\n%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $JWT_TOKEN" \
        -d "$payment_data" \
        "$BASE_URL/api/thu-phi-ho-khau" 2>&1)
    
    payment_code=$(echo "$payment_response" | tail -n1)
    payment_body=$(echo "$payment_response" | sed '$d')
    
    TOTAL=$((TOTAL + 1))
    if [ "$payment_code" == "201" ]; then
        PASSED=$((PASSED + 1))
        PAYMENT_ID=$(echo "$payment_body" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])" 2>/dev/null)
        echo -e "${GREEN}✅ PASSED${NC} | POST /api/thu-phi-ho-khau (create) | HTTP 201"
        echo "Created Thu Phí Hộ Khẩu ID: $PAYMENT_ID"
    else
        FAILED=$((FAILED + 1))
        echo -e "${YELLOW}⚠️  EXPECTED FAILURE${NC} | POST /api/thu-phi-ho-khau (create) | HTTP $payment_code"
        echo "Note: HoKhau ID 1 may not exist (mock ID used for testing)"
        echo "$payment_body"
    fi
    echo ""
    
    # List all
    test_endpoint "GET /api/thu-phi-ho-khau (list)" "GET" "/api/thu-phi-ho-khau" "" "$JWT_TOKEN" "200"
    
    # Get by dot
    test_endpoint "GET /api/thu-phi-ho-khau/dot/{id}" "GET" "/api/thu-phi-ho-khau/dot/$DOT_ID" "" "$JWT_TOKEN" "200"
    
    if [ ! -z "$PAYMENT_ID" ]; then
        # Get by ID
        test_endpoint "GET /api/thu-phi-ho-khau/{id}" "GET" "/api/thu-phi-ho-khau/$PAYMENT_ID" "" "$JWT_TOKEN" "200"
        
        # Make payment
        pay_data='{
            "soTienThanhToan": 50000,
            "phuongThucThanhToan": "TIEN_MAT",
            "ghiChu": "Thanh toán một phần"
        }'
        test_endpoint "PATCH /api/thu-phi-ho-khau/{id}/thanh-toan" "PATCH" "/api/thu-phi-ho-khau/$PAYMENT_ID/thanh-toan" "$pay_data" "$JWT_TOKEN" "200"
    fi
else
    echo -e "${YELLOW}⚠️  Skipping (no JWT token or Đợt ID)${NC}"
    echo ""
fi

# 7. Error Handling
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}7️⃣  Error Handling Tests${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ ! -z "$JWT_TOKEN" ]; then
    test_endpoint "GET /api/dot-thu-phi/{id} (not found)" "GET" "/api/dot-thu-phi/99999" "" "$JWT_TOKEN" "404"
    
    bad_data='{
        "tenDot": "",
        "loaiPhi": "INVALID",
        "soTien": -1000
    }'
    test_endpoint "POST /api/dot-thu-phi (bad request)" "POST" "/api/dot-thu-phi" "$bad_data" "$JWT_TOKEN" "400"
fi

# 8. Cleanup
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}8️⃣  Cleanup Test Data${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ ! -z "$JWT_TOKEN" ]; then
    if [ ! -z "$PAYMENT_ID" ]; then
        test_endpoint "DELETE /api/thu-phi-ho-khau/{id}" "DELETE" "/api/thu-phi-ho-khau/$PAYMENT_ID" "" "$JWT_TOKEN" "204"
    fi
    
    if [ ! -z "$DOT_ID" ]; then
        test_endpoint "DELETE /api/dot-thu-phi/{id}" "DELETE" "/api/dot-thu-phi/$DOT_ID" "" "$JWT_TOKEN" "204"
    fi
fi

# Final Report
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  📊 Test Summary${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo "Total Tests:  $TOTAL"
echo -e "Passed:       ${GREEN}$PASSED${NC}"
echo -e "Failed:       ${RED}$FAILED${NC}"

if [ $TOTAL -gt 0 ]; then
    success_rate=$(python3 -c "print(f'{($PASSED/$TOTAL)*100:.2f}%')")
    echo "Success Rate: $success_rate"
fi

echo ""
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed successfully!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some tests failed or were skipped (see above for details)${NC}"
    exit 1
fi
