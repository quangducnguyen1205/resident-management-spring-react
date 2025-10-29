#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="http://localhost:8080"
REPORT_FILE="docs/API_TEST_REPORT.md"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Test results array
declare -a TEST_RESULTS

# JWT Token (will be set after login)
TOKEN=""

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     API Integration Test Suite - QuanLyDanCu Backend       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to wait for backend to be ready
wait_for_backend() {
    echo -e "${YELLOW}⏳ Waiting for backend to be ready...${NC}"
    MAX_ATTEMPTS=30
    ATTEMPT=0
    
    while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/swagger-ui/index.html" 2>/dev/null)
        if [ "$HTTP_CODE" = "200" ]; then
            echo -e "${GREEN}✓ Backend is ready!${NC}"
            sleep 2
            return 0
        fi
        ATTEMPT=$((ATTEMPT + 1))
        echo -n "."
        sleep 2
    done
    
    echo -e "${RED}✗ Backend failed to start within timeout${NC}"
    exit 1
}

# Function to test an endpoint
test_endpoint() {
    local MODULE=$1
    local METHOD=$2
    local ENDPOINT=$3
    local EXPECTED_CODE=$4
    local DATA=$5
    local DESCRIPTION=$6
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    # Build curl command
    if [ "$METHOD" = "GET" ]; then
        if [ -z "$TOKEN" ]; then
            RESPONSE=$(curl -s -w "\n%{http_code}" -X "$METHOD" "${BASE_URL}${ENDPOINT}")
        else
            RESPONSE=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $TOKEN" -X "$METHOD" "${BASE_URL}${ENDPOINT}")
        fi
    elif [ "$METHOD" = "DELETE" ]; then
        RESPONSE=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $TOKEN" -X "$METHOD" "${BASE_URL}${ENDPOINT}")
    else
        if [ -z "$TOKEN" ]; then
            RESPONSE=$(curl -s -w "\n%{http_code}" -H "Content-Type: application/json" -X "$METHOD" -d "$DATA" "${BASE_URL}${ENDPOINT}")
        else
            RESPONSE=$(curl -s -w "\n%{http_code}" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -X "$METHOD" -d "$DATA" "${BASE_URL}${ENDPOINT}")
        fi
    fi
    
    # Extract HTTP code (last line)
    HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    # Check result
    if [ "$HTTP_CODE" = "$EXPECTED_CODE" ]; then
        echo -e "${GREEN}✓${NC} $MODULE | $METHOD $ENDPOINT | Expected: $EXPECTED_CODE | Got: $HTTP_CODE"
        TEST_RESULTS+=("| $MODULE | \`$METHOD $ENDPOINT\` | $EXPECTED_CODE | $HTTP_CODE | ✅ |")
        PASSED_TESTS=$((PASSED_TESTS + 1))
        
        # Extract and store token for login
        if [[ "$ENDPOINT" == *"/login"* ]] && [ "$HTTP_CODE" = "200" ]; then
            TOKEN=$(echo "$BODY" | grep -o '"token":"[^"]*"' | sed 's/"token":"//;s/"$//')
            if [ -n "$TOKEN" ]; then
                echo -e "${BLUE}   → JWT Token obtained${NC}"
            fi
        fi
        
        # Store ID for further tests
        if [[ "$ENDPOINT" == *"/register"* ]] || [[ "$METHOD" == "POST" ]] && [ "$HTTP_CODE" = "201" ]; then
            CREATED_ID=$(echo "$BODY" | grep -o '"id":[0-9]*' | head -1 | sed 's/"id"://')
            if [ -n "$CREATED_ID" ]; then
                echo -e "${BLUE}   → Created resource with ID: $CREATED_ID${NC}"
            fi
        fi
        
        return 0
    else
        echo -e "${RED}✗${NC} $MODULE | $METHOD $ENDPOINT | Expected: $EXPECTED_CODE | Got: $HTTP_CODE"
        TEST_RESULTS+=("| $MODULE | \`$METHOD $ENDPOINT\` | $EXPECTED_CODE | $HTTP_CODE | ❌ |")
        FAILED_TESTS=$((FAILED_TESTS + 1))
        echo -e "${RED}   Response: $BODY${NC}"
        return 1
    fi
}

# Start Docker containers
echo -e "\n${YELLOW}🐳 Starting Docker containers...${NC}"
cd /Users/nqd2005/Documents/Project_CNPM/cnpm-spring-react
docker-compose up -d

wait_for_backend

# Generate unique identifiers using timestamp to avoid duplicates
TIMESTAMP=$(date +%s)
UNIQUE_USERNAME="admin${TIMESTAMP}"
UNIQUE_HOKHAU="HK${TIMESTAMP}"

echo -e "\n${BLUE}══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Testing Module 1: Authentication${NC}"
echo -e "${BLUE}══════════════════════════════════════════════════════════════${NC}\n"

# Test Auth - Register with unique username
test_endpoint "Auth" "POST" "/api/auth/register" "201" \
    "{\"username\":\"${UNIQUE_USERNAME}\",\"password\":\"admin123\",\"role\":\"ROLE_ADMIN\",\"hoTen\":\"Administrator\"}" \
    "Register admin user"

# Test Auth - Login with the unique username
test_endpoint "Auth" "POST" "/api/auth/login" "200" \
    "{\"username\":\"${UNIQUE_USERNAME}\",\"password\":\"admin123\"}" \
    "Login with admin credentials"

# Verify we have a token
if [ -z "$TOKEN" ]; then
    echo -e "${RED}✗ Failed to obtain JWT token. Cannot continue with authenticated tests.${NC}"
    exit 1
fi

echo -e "\n${BLUE}══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Testing Module 2: Hộ Khẩu (Household)${NC}"
echo -e "${BLUE}══════════════════════════════════════════════════════════════${NC}\n"

# Test HoKhau - Create with unique code
test_endpoint "HoKhau" "POST" "/api/ho-khau" "201" \
    "{\"soHoKhau\":\"${UNIQUE_HOKHAU}\",\"tenChuHo\":\"Nguyen Van A\",\"diaChi\":\"123 Test Street\"}" \
    "Create new household"

# Store the created HoKhau ID
HOKHAU_ID=$CREATED_ID

# Test HoKhau - Get All
test_endpoint "HoKhau" "GET" "/api/ho-khau" "200" "" "Get all households"

# Test HoKhau - Get By ID
if [ -n "$HOKHAU_ID" ]; then
    test_endpoint "HoKhau" "GET" "/api/ho-khau/$HOKHAU_ID" "200" "" "Get household by ID"
    
    # Test HoKhau - Update (use same unique code to avoid constraint violation)
    test_endpoint "HoKhau" "PUT" "/api/ho-khau/$HOKHAU_ID" "200" \
        "{\"soHoKhau\":\"${UNIQUE_HOKHAU}\",\"tenChuHo\":\"Nguyen Van B\",\"diaChi\":\"456 New Street\",\"noiDungThayDoiChuHo\":\"Change of head\"}" \
        "Update household"
fi

echo -e "\n${BLUE}══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Testing Module 3: Nhân Khẩu (Citizen)${NC}"
echo -e "${BLUE}══════════════════════════════════════════════════════════════${NC}\n"

# Test NhanKhau - Get All
test_endpoint "NhanKhau" "GET" "/api/nhan-khau" "200" "" "Get all citizens"

# Test NhanKhau - Search
test_endpoint "NhanKhau" "GET" "/api/nhan-khau/search?q=Nguyen" "200" "" "Search citizens by name"

# Test NhanKhau - Get statistics
test_endpoint "NhanKhau" "GET" "/api/nhan-khau/stats/gender" "200" "" "Get gender statistics"
test_endpoint "NhanKhau" "GET" "/api/nhan-khau/stats/age?underAge=18&retireAge=60" "200" "" "Get age statistics"

echo -e "\n${BLUE}══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Testing Module 4: Biến Động (Changes)${NC}"
echo -e "${BLUE}══════════════════════════════════════════════════════════════${NC}\n"

# Test BienDong - Get All
test_endpoint "BienDong" "GET" "/api/bien-dong" "200" "" "Get all changes"

# Test BienDong - Create
if [ -n "$HOKHAU_ID" ]; then
    test_endpoint "BienDong" "POST" "/api/bien-dong" "201" \
        "{\"loai\":\"Tam tru\",\"noiDung\":\"Test change record\",\"hoKhauId\":$HOKHAU_ID}" \
        "Create new change record"
    
    BIENDONG_ID=$CREATED_ID
    
    # Test BienDong - Get By ID
    if [ -n "$BIENDONG_ID" ]; then
        test_endpoint "BienDong" "GET" "/api/bien-dong/$BIENDONG_ID" "200" "" "Get change record by ID"
        
        # Test BienDong - Update
        test_endpoint "BienDong" "PUT" "/api/bien-dong/$BIENDONG_ID" "200" \
            '{"loai":"Tam vang","noiDung":"Updated change record"}' \
            "Update change record"
    fi
fi

echo -e "\n${BLUE}══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Testing Module 5: Đợt Thu Phí (Fee Periods)${NC}"
echo -e "${BLUE}══════════════════════════════════════════════════════════════${NC}\n"

# Test DotThuPhi - Get All
test_endpoint "DotThuPhi" "GET" "/api/dot-thu-phi" "200" "" "Get all fee periods"

# Test DotThuPhi - Create with correct field names
test_endpoint "DotThuPhi" "POST" "/api/dot-thu-phi" "201" \
    '{"tenDot":"Phi Quan Ly 2024","loai":"Phi quan ly","ngayBatDau":"2024-01-01","ngayKetThuc":"2024-12-31","dinhMuc":50000,"moTa":"Annual management fee"}' \
    "Create new fee period"

DOTTHU_ID=$CREATED_ID

# Test DotThuPhi - Get By ID
if [ -n "$DOTTHU_ID" ]; then
    test_endpoint "DotThuPhi" "GET" "/api/dot-thu-phi/$DOTTHU_ID" "200" "" "Get fee period by ID"
    
    # Test DotThuPhi - Update
    test_endpoint "DotThuPhi" "PUT" "/api/dot-thu-phi/$DOTTHU_ID" "200" \
        '{"tenDot":"Phi Quan Ly 2024 Updated","loai":"Phi quan ly","ngayBatDau":"2024-01-01","ngayKetThuc":"2024-12-31","dinhMuc":60000,"moTa":"Updated fee"}' \
        "Update fee period"
fi

echo -e "\n${BLUE}══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Testing Module 6: Thu Phí Hộ Khẩu (Household Fees)${NC}"
echo -e "${BLUE}══════════════════════════════════════════════════════════════${NC}\n"

# Test ThuPhiHoKhau - Get All
test_endpoint "ThuPhiHoKhau" "GET" "/api/thu-phi-ho-khau" "200" "" "Get all household fees"

# Test ThuPhiHoKhau - Get statistics
test_endpoint "ThuPhiHoKhau" "GET" "/api/thu-phi-ho-khau/stats" "200" "" "Get fee collection statistics"

echo -e "\n${BLUE}══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Testing Swagger Documentation${NC}"
echo -e "${BLUE}══════════════════════════════════════════════════════════════${NC}\n"

# Test Swagger UI
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/swagger-ui/index.html")
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓${NC} Swagger UI | GET /swagger-ui/index.html | Expected: 200 | Got: $HTTP_CODE"
    TEST_RESULTS+=("| Swagger | \`GET /swagger-ui/index.html\` | 200 | $HTTP_CODE | ✅ |")
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}✗${NC} Swagger UI | GET /swagger-ui/index.html | Expected: 200 | Got: $HTTP_CODE"
    TEST_RESULTS+=("| Swagger | \`GET /swagger-ui/index.html\` | 200 | $HTTP_CODE | ❌ |")
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Test OpenAPI Docs
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/v3/api-docs")
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓${NC} OpenAPI Docs | GET /v3/api-docs | Expected: 200 | Got: $HTTP_CODE"
    TEST_RESULTS+=("| OpenAPI | \`GET /v3/api-docs\` | 200 | $HTTP_CODE | ✅ |")
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}✗${NC} OpenAPI Docs | GET /v3/api-docs | Expected: 200 | Got: $HTTP_CODE"
    TEST_RESULTS+=("| OpenAPI | \`GET /v3/api-docs\` | 200 | $HTTP_CODE | ❌ |")
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Generate Report
echo -e "\n${YELLOW}📝 Generating test report...${NC}"

cat > "$REPORT_FILE" << EOF
# 🧪 API Integration Test Report

**Test Date:** $TIMESTAMP  
**Base URL:** $BASE_URL  
**Total Tests:** $TOTAL_TESTS  
**Passed:** $PASSED_TESTS ✅  
**Failed:** $FAILED_TESTS ❌  
**Success Rate:** $(awk "BEGIN {printf \"%.2f\", ($PASSED_TESTS/$TOTAL_TESTS)*100}")%

---

## 📊 Test Summary

| Module | Endpoint | Expected | Actual | Status |
|--------|----------|----------|--------|--------|
EOF

# Add all test results
for result in "${TEST_RESULTS[@]}"; do
    echo "$result" >> "$REPORT_FILE"
done

cat >> "$REPORT_FILE" << EOF

---

## 📝 Test Details

### ✅ Passed Tests: $PASSED_TESTS/$TOTAL_TESTS

### ❌ Failed Tests: $FAILED_TESTS/$TOTAL_TESTS

---

## 🔍 Notes

- All tests were executed sequentially
- Authentication token obtained from login endpoint
- Tests include CRUD operations for all main modules
- Swagger UI and OpenAPI documentation verified

---

## 🚀 Modules Tested

1. **Authentication** - Login, Register
2. **Hộ Khẩu** - CRUD operations
3. **Nhân Khẩu** - Get, Search, Statistics
4. **Biến Động** - CRUD operations
5. **Đợt Thu Phí** - CRUD operations
6. **Thu Phí Hộ Khẩu** - Get, Statistics
7. **Documentation** - Swagger UI, OpenAPI Docs

---

**Generated by:** test-api-all.sh  
**Report Location:** \`$REPORT_FILE\`
EOF

echo -e "${GREEN}✓ Test report generated: $REPORT_FILE${NC}"

# Print summary
echo -e "\n${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    TEST SUMMARY                             ║${NC}"
echo -e "${BLUE}╠════════════════════════════════════════════════════════════╣${NC}"
echo -e "${BLUE}║${NC} Total Tests:    $TOTAL_TESTS"
echo -e "${GREEN}║${NC} Passed:         $PASSED_TESTS ✅"
echo -e "${RED}║${NC} Failed:         $FAILED_TESTS ❌"
echo -e "${BLUE}║${NC} Success Rate:   $(awk "BEGIN {printf \"%.2f\", ($PASSED_TESTS/$TOTAL_TESTS)*100}")%"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All tests passed!${NC}\n"
    exit 0
else
    echo -e "\n${YELLOW}⚠️  Some tests failed. Check the report for details.${NC}\n"
    exit 1
fi
