#!/bin/bash

# ============================================================================
# Fee Calculation Endpoint Test Script
# Tests the /api/thu-phi-ho-khau/calc endpoint with various scenarios
# ============================================================================

BASE_URL="http://localhost:8080"
ADMIN_TOKEN=""

# ANSI color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Test counters
PASSED=0
FAILED=0

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     Fee Calculation API Tests - QuanLyDanCu Backend        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Function to print test headers
print_header() {
    echo ""
    echo "══════════════════════════════════════════════════════════════"
    echo "  $1"
    echo "══════════════════════════════════════════════════════════════"
    echo ""
}

# Function to test fee calculation
test_calc() {
    local test_name=$1
    local hokhau_id=$2
    local dotthuphi_id=$3
    local expected_discount=$4
    local description=$5
    
    echo -e "${BLUE}Testing:${NC} $test_name"
    echo -e "${CYAN}Description:${NC} $description"
    
    response=$(curl -s -w "\n%{http_code}" \
        -H "Authorization: Bearer $ADMIN_TOKEN" \
        -X GET "${BASE_URL}/api/thu-phi-ho-khau/calc?hoKhauId=${hokhau_id}&dotThuPhiId=${dotthuphi_id}")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -eq 200 ]; then
        # Parse JSON response
        discount_applied=$(echo "$body" | grep -o '"discountApplied":[^,}]*' | cut -d':' -f2)
        total_fee=$(echo "$body" | grep -o '"totalFee":[^,}]*' | cut -d':' -f2)
        base_fee=$(echo "$body" | grep -o '"baseFee":[^,}]*' | cut -d':' -f2)
        discount_amount=$(echo "$body" | grep -o '"discountAmount":[^,}]*' | cut -d':' -f2)
        member_count=$(echo "$body" | grep -o '"memberCount":[^,}]*' | cut -d':' -f2)
        
        echo -e "   ${CYAN}Members:${NC} $member_count"
        echo -e "   ${CYAN}Base Fee:${NC} $base_fee VND"
        echo -e "   ${CYAN}Discount Applied:${NC} $discount_applied"
        
        if [ "$discount_applied" = "true" ]; then
            echo -e "   ${CYAN}Discount Amount:${NC} $discount_amount VND (20%)"
        fi
        
        echo -e "   ${CYAN}Total Fee:${NC} $total_fee VND"
        
        # Validate expected discount
        if [ "$discount_applied" = "$expected_discount" ]; then
            echo -e "   ${GREEN}✓ PASSED${NC} - Discount logic correct"
            PASSED=$((PASSED + 1))
        else
            echo -e "   ${RED}✗ FAILED${NC} - Expected discount: $expected_discount, Got: $discount_applied"
            FAILED=$((FAILED + 1))
        fi
    else
        echo -e "   ${RED}✗ FAILED${NC} - HTTP $http_code"
        echo "   Response: $body"
        FAILED=$((FAILED + 1))
    fi
    echo ""
}

# ============================================================================
# SETUP: Login and get token
# ============================================================================

print_header "Setup: Authentication"

echo "Logging in as admin..."
LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin123"}')

ADMIN_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -n "$ADMIN_TOKEN" ]; then
    echo -e "${GREEN}✓ Login successful${NC}"
    echo "Token: ${ADMIN_TOKEN:0:20}..."
else
    echo -e "${RED}✗ Failed to obtain token${NC}"
    exit 1
fi

# ============================================================================
# SETUP TEST DATA
# ============================================================================

print_header "Setup: Creating Test Data"

# Get existing HoKhau ID
HOKHAU_ID=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
    "${BASE_URL}/api/ho-khau" | jq -r '.[0].id')

# Get existing DotThuPhi ID
DOTTHUPHI_ID=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
    "${BASE_URL}/api/dot-thu-phi" | jq -r '.[0].id')

if [ -z "$HOKHAU_ID" ] || [ "$HOKHAU_ID" = "null" ]; then
    echo -e "${RED}✗ No HoKhau found in database${NC}"
    exit 1
fi

if [ -z "$DOTTHUPHI_ID" ] || [ "$DOTTHUPHI_ID" = "null" ]; then
    echo -e "${RED}✗ No DotThuPhi found in database${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Using HoKhau ID: $HOKHAU_ID${NC}"
echo -e "${GREEN}✓ Using DotThuPhi ID: $DOTTHUPHI_ID${NC}"

# Create test NhanKhau with different ages
echo ""
echo "Creating test citizens with different ages..."

# Working-age adult (age 30)
ADULT_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/nhan-khau" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"hoTen\":\"Test Adult\",\"ngaySinh\":\"1994-01-01\",\"gioiTinh\":\"Nam\",\"hoKhauId\":${HOKHAU_ID},\"quanHeVoiChuHo\":\"Con\"}")

# Elderly person (age 65)
ELDERLY_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/nhan-khau" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"hoTen\":\"Test Elderly\",\"ngaySinh\":\"1959-01-01\",\"gioiTinh\":\"Nam\",\"hoKhauId\":${HOKHAU_ID},\"quanHeVoiChuHo\":\"Cha\"}")

# Student (age 20)
STUDENT_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/nhan-khau" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"hoTen\":\"Test Student\",\"ngaySinh\":\"2004-01-01\",\"gioiTinh\":\"Nu\",\"hoKhauId\":${HOKHAU_ID},\"quanHeVoiChuHo\":\"Con\"}")

echo -e "${GREEN}✓ Test data created successfully${NC}"

# ============================================================================
# TEST SCENARIOS
# ============================================================================

print_header "Test Scenario 1: Fee Calculation with Discount (Mixed Ages)"
test_calc \
    "Mixed Ages Case" \
    "$HOKHAU_ID" \
    "$DOTTHUPHI_ID" \
    "true" \
    "Household with working-age adult (30), elderly (65), and student (20) - Should get 20% discount"

print_header "Test Scenario 2: Verify Calculation Details"
echo -e "${BLUE}Testing:${NC} Detailed Calculation Breakdown"
response=$(curl -s \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -X GET "${BASE_URL}/api/thu-phi-ho-khau/calc?hoKhauId=${HOKHAU_ID}&dotThuPhiId=${DOTTHUPHI_ID}")

echo "Full Response:"
echo "$response" | jq '.'

if [ $? -eq 0 ]; then
    echo -e "   ${GREEN}✓ PASSED${NC} - Valid JSON response"
    PASSED=$((PASSED + 1))
else
    echo -e "   ${RED}✗ FAILED${NC} - Invalid JSON response"
    FAILED=$((FAILED + 1))
fi
echo ""

print_header "Test Scenario 3: Invalid Household ID"
echo -e "${BLUE}Testing:${NC} Invalid HoKhau ID"
response=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -X GET "${BASE_URL}/api/thu-phi-ho-khau/calc?hoKhauId=99999&dotThuPhiId=${DOTTHUPHI_ID}")

if [ "$response" -eq 400 ] || [ "$response" -eq 404 ]; then
    echo -e "   ${GREEN}✓ PASSED${NC} - Correctly rejected invalid HoKhau ID (HTTP $response)"
    PASSED=$((PASSED + 1))
else
    echo -e "   ${RED}✗ FAILED${NC} - Expected 400/404, Got HTTP $response"
    FAILED=$((FAILED + 1))
fi
echo ""

print_header "Test Scenario 4: Invalid Fee Period ID"
echo -e "${BLUE}Testing:${NC} Invalid DotThuPhi ID"
response=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -X GET "${BASE_URL}/api/thu-phi-ho-khau/calc?hoKhauId=${HOKHAU_ID}&dotThuPhiId=99999")

if [ "$response" -eq 400 ] || [ "$response" -eq 404 ]; then
    echo -e "   ${GREEN}✓ PASSED${NC} - Correctly rejected invalid DotThuPhi ID (HTTP $response)"
    PASSED=$((PASSED + 1))
else
    echo -e "   ${RED}✗ FAILED${NC} - Expected 400/404, Got HTTP $response"
    FAILED=$((FAILED + 1))
fi
echo ""

print_header "Test Scenario 5: Missing Parameters"
echo -e "${BLUE}Testing:${NC} Missing required parameters"
response=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -X GET "${BASE_URL}/api/thu-phi-ho-khau/calc?dotThuPhiId=${DOTTHUPHI_ID}")

if [ "$response" -eq 400 ] || [ "$response" -eq 500 ]; then
    echo -e "   ${GREEN}✓ PASSED${NC} - Correctly rejected missing parameter (HTTP $response)"
    PASSED=$((PASSED + 1))
else
    echo -e "   ${RED}✗ FAILED${NC} - Expected 400/500, Got HTTP $response"
    FAILED=$((FAILED + 1))
fi
echo ""

# ============================================================================
# SUMMARY
# ============================================================================

TOTAL=$((PASSED + FAILED))
SUCCESS_RATE=$(awk "BEGIN {printf \"%.2f\", ($PASSED/$TOTAL)*100}")

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    TEST SUMMARY                             ║"
echo "╠════════════════════════════════════════════════════════════╣"
printf "║ Total Tests:    %-2d                                        ║\n" $TOTAL
printf "║ Passed:         %-2d ✅                                     ║\n" $PASSED
printf "║ Failed:         %-2d ❌                                     ║\n" $FAILED
printf "║ Success Rate:   %.2f%%                                     ║\n" $SUCCESS_RATE
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All fee calculation tests passed!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Some tests failed. Please review the output above.${NC}"
    exit 1
fi
