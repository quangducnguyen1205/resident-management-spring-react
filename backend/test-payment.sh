#!/bin/bash

# ============================================================================
# Payment Recording Test Script - Phase 4
# Tests the /api/thu-phi-ho-khau/pay endpoint
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
echo "║       Payment Recording Tests - QuanLyDanCu Backend        ║"
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

# Clean up previous test data for this ho_khau and dot_thu_phi combination
echo "Cleaning up previous test data..."
docker exec -i quanlydancu-postgres psql -U postgres -d QuanLyDanCu -c \
    "DELETE FROM thu_phi_record WHERE ho_khau_id = ${HOKHAU_ID} AND dot_thu_phi_id = ${DOTTHUPHI_ID} AND notes LIKE '%Test%';" > /dev/null 2>&1
echo -e "${GREEN}✓ Test data cleaned${NC}"

# Create test NhanKhau if needed
NHANKHAU_COUNT=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
    "${BASE_URL}/api/nhan-khau?page=0&size=1" | jq -r 'length')

if [ "$NHANKHAU_COUNT" = "0" ]; then
    echo "Creating test citizens..."
    # Create 3 test citizens
    for i in 1 2 3; do
        curl -s -X POST "${BASE_URL}/api/nhan-khau" \
            -H "Authorization: Bearer $ADMIN_TOKEN" \
            -H "Content-Type: application/json" \
            -d "{\"hoTen\":\"Test Citizen $i\",\"ngaySinh\":\"1990-01-0$i\",\"gioiTinh\":\"Nam\",\"hoKhauId\":${HOKHAU_ID},\"quanHeVoiChuHo\":\"Con\"}" > /dev/null
    done
    echo -e "${GREEN}✓ Created 3 test citizens${NC}"
fi

# ============================================================================
# TEST SCENARIOS
# ============================================================================

print_header "Test 1: Payment for Sanitation Fee (VS)"

echo -e "${BLUE}Testing:${NC} Record sanitation fee payment"
echo -e "${CYAN}Details:${NC} 3 months (4, 5, 6), fee type VS"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/api/thu-phi-ho-khau/pay" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"hoKhauId\": ${HOKHAU_ID},
        \"dotThuPhiId\": ${DOTTHUPHI_ID},
        \"months\": [4, 5, 6],
        \"feeType\": \"VS\",
        \"collectorId\": \"admin\",
        \"notes\": \"Test payment sanitation fee\"
    }")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 201 ]; then
    PAYMENT_ID=$(echo "$BODY" | jq -r '.paymentId')
    AMOUNT=$(echo "$BODY" | jq -r '.amount')
    NUM_PEOPLE=$(echo "$BODY" | jq -r '.numOfPeople')
    
    echo -e "   ${CYAN}Payment ID:${NC} $PAYMENT_ID"
    echo -e "   ${CYAN}Number of People:${NC} $NUM_PEOPLE"
    echo -e "   ${CYAN}Amount:${NC} $AMOUNT VND"
    echo -e "   ${CYAN}Formula:${NC} $NUM_PEOPLE people × 6000 VND × 3 months"
    
    EXPECTED_AMOUNT=$(echo "$NUM_PEOPLE * 6000 * 3" | bc)
    if [ "$(echo "$AMOUNT" | cut -d'.' -f1)" = "$EXPECTED_AMOUNT" ]; then
        echo -e "   ${GREEN}✓ PASSED${NC} - Amount calculated correctly"
        PASSED=$((PASSED + 1))
    else
        echo -e "   ${RED}✗ FAILED${NC} - Expected $EXPECTED_AMOUNT, got $AMOUNT"
        FAILED=$((FAILED + 1))
    fi
else
    echo -e "   ${RED}✗ FAILED${NC} - HTTP $HTTP_CODE"
    echo "   Response: $BODY"
    FAILED=$((FAILED + 1))
fi

print_header "Test 2: Payment for Voluntary Contribution (DG)"

echo -e "${BLUE}Testing:${NC} Record voluntary contribution"
echo -e "${CYAN}Details:${NC} Custom amount 100,000 VND"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/api/thu-phi-ho-khau/pay" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"hoKhauId\": ${HOKHAU_ID},
        \"dotThuPhiId\": ${DOTTHUPHI_ID},
        \"months\": [8],
        \"feeType\": \"DG\",
        \"collectorId\": \"admin\",
        \"amount\": 100000,
        \"notes\": \"Voluntary contribution for community\"
    }")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 201 ]; then
    AMOUNT=$(echo "$BODY" | jq -r '.amount')
    echo -e "   ${CYAN}Amount:${NC} $AMOUNT VND"
    
    if [ "$(echo "$AMOUNT" | cut -d'.' -f1)" = "100000" ]; then
        echo -e "   ${GREEN}✓ PASSED${NC} - Custom amount accepted"
        PASSED=$((PASSED + 1))
    else
        echo -e "   ${RED}✗ FAILED${NC} - Expected 100000, got $AMOUNT"
        FAILED=$((FAILED + 1))
    fi
else
    echo -e "   ${RED}✗ FAILED${NC} - HTTP $HTTP_CODE"
    echo "   Response: $BODY"
    FAILED=$((FAILED + 1))
fi

print_header "Test 3: Duplicate Month Detection"

echo -e "${BLUE}Testing:${NC} Try to pay for already-paid month"
echo -e "${CYAN}Details:${NC} Month 4 already paid in Test 1"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/api/thu-phi-ho-khau/pay" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"hoKhauId\": ${HOKHAU_ID},
        \"dotThuPhiId\": ${DOTTHUPHI_ID},
        \"months\": [4],
        \"feeType\": \"VS\",
        \"collectorId\": \"admin\"
    }")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 400 ] || [ "$HTTP_CODE" -eq 500 ]; then
    echo -e "   ${GREEN}✓ PASSED${NC} - Duplicate month rejected (HTTP $HTTP_CODE)"
    PASSED=$((PASSED + 1))
else
    echo -e "   ${RED}✗ FAILED${NC} - Expected 400/500, got HTTP $HTTP_CODE"
    FAILED=$((FAILED + 1))
fi

print_header "Test 4: Invalid HoKhau ID"

echo -e "${BLUE}Testing:${NC} Invalid household ID"

RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${BASE_URL}/api/thu-phi-ho-khau/pay" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"hoKhauId\": 99999,
        \"dotThuPhiId\": ${DOTTHUPHI_ID},
        \"months\": [5],
        \"feeType\": \"VS\",
        \"collectorId\": \"admin\"
    }")

if [ "$RESPONSE" -eq 400 ] || [ "$RESPONSE" -eq 500 ]; then
    echo -e "   ${GREEN}✓ PASSED${NC} - Invalid ID rejected (HTTP $RESPONSE)"
    PASSED=$((PASSED + 1))
else
    echo -e "   ${RED}✗ FAILED${NC} - Expected 400/500, got HTTP $RESPONSE"
    FAILED=$((FAILED + 1))
fi

print_header "Test 5: Missing Required Fields"

echo -e "${BLUE}Testing:${NC} Missing feeType field"

RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${BASE_URL}/api/thu-phi-ho-khau/pay" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"hoKhauId\": ${HOKHAU_ID},
        \"dotThuPhiId\": ${DOTTHUPHI_ID},
        \"months\": [6],
        \"collectorId\": \"admin\"
    }")

if [ "$RESPONSE" -eq 400 ]; then
    echo -e "   ${GREEN}✓ PASSED${NC} - Missing field rejected (HTTP $RESPONSE)"
    PASSED=$((PASSED + 1))
else
    echo -e "   ${RED}✗ FAILED${NC} - Expected 400, got HTTP $RESPONSE"
    FAILED=$((FAILED + 1))
fi

print_header "Test 6: Test calc-v2 Endpoint"

echo -e "${BLUE}Testing:${NC} New calculation endpoint with months"

RESPONSE=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    "${BASE_URL}/api/thu-phi-ho-khau/calc-v2?hoKhauId=${HOKHAU_ID}&dotThuPhiId=${DOTTHUPHI_ID}&months=7,8,9&feeType=VS")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    NUM_PEOPLE=$(echo "$BODY" | jq -r '.numOfPeople')
    TOTAL_AMOUNT=$(echo "$BODY" | jq -r '.totalAmount')
    MONTHS_COUNT=$(echo "$BODY" | jq -r '.monthsCount')
    
    echo -e "   ${CYAN}Num of People:${NC} $NUM_PEOPLE"
    echo -e "   ${CYAN}Months Count:${NC} $MONTHS_COUNT"
    echo -e "   ${CYAN}Total Amount:${NC} $TOTAL_AMOUNT VND"
    
    EXPECTED=$(echo "$NUM_PEOPLE * 6000 * $MONTHS_COUNT" | bc)
    if [ "$(echo "$TOTAL_AMOUNT" | cut -d'.' -f1)" = "$EXPECTED" ]; then
        echo -e "   ${GREEN}✓ PASSED${NC} - Calculation correct"
        PASSED=$((PASSED + 1))
    else
        echo -e "   ${RED}✗ FAILED${NC} - Expected $EXPECTED, got $TOTAL_AMOUNT"
        FAILED=$((FAILED + 1))
    fi
else
    echo -e "   ${RED}✗ FAILED${NC} - HTTP $HTTP_CODE"
    FAILED=$((FAILED + 1))
fi

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
    echo -e "${GREEN}🎉 All payment tests passed!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Some tests failed. Please review the output above.${NC}"
    exit 1
fi
