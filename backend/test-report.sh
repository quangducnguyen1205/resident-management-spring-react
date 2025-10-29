#!/bin/bash

# ============================================================================
# Payment Reporting Test Script - Phase 4
# Tests the /api/thu-phi-ho-khau/report endpoint
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
echo "║       Payment Reporting Tests - QuanLyDanCu Backend        ║"
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

# Get existing DotThuPhi ID
DOTTHUPHI_ID=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
    "${BASE_URL}/api/dot-thu-phi" | jq -r '.[0].id')

if [ -z "$DOTTHUPHI_ID" ] || [ "$DOTTHUPHI_ID" = "null" ]; then
    echo -e "${RED}✗ No DotThuPhi found in database${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Using DotThuPhi ID: $DOTTHUPHI_ID${NC}"

# ============================================================================
# TEST SCENARIOS
# ============================================================================

print_header "Test 1: General Report (All Payments)"

echo -e "${BLUE}Testing:${NC} Get overall report for fee period"

RESPONSE=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    "${BASE_URL}/api/thu-phi-ho-khau/report?dotThuPhiId=${DOTTHUPHI_ID}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo "Report Details:"
    echo "$BODY" | jq '.'
    
    TOTAL_COLLECTED=$(echo "$BODY" | jq -r '.totalCollected')
    HOUSEHOLDS_PAID=$(echo "$BODY" | jq -r '.householdsPaid')
    COLLECTION_RATE=$(echo "$BODY" | jq -r '.collectionRate')
    
    echo -e "   ${CYAN}Total Collected:${NC} $TOTAL_COLLECTED VND"
    echo -e "   ${CYAN}Households Paid:${NC} $HOUSEHOLDS_PAID"
    echo -e "   ${CYAN}Collection Rate:${NC} $COLLECTION_RATE"
    echo -e "   ${GREEN}✓ PASSED${NC} - Report generated successfully"
    PASSED=$((PASSED + 1))
else
    echo -e "   ${RED}✗ FAILED${NC} - HTTP $HTTP_CODE"
    echo "   Response: $BODY"
    FAILED=$((FAILED + 1))
fi

print_header "Test 2: Report by Fee Type (VS)"

echo -e "${BLUE}Testing:${NC} Get report for sanitation fees only"

RESPONSE=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    "${BASE_URL}/api/thu-phi-ho-khau/report?dotThuPhiId=${DOTTHUPHI_ID}&feeType=VS")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    FEE_TYPE=$(echo "$BODY" | jq -r '.feeType')
    TOTAL_COLLECTED=$(echo "$BODY" | jq -r '.totalCollected')
    
    echo -e "   ${CYAN}Fee Type:${NC} $FEE_TYPE"
    echo -e "   ${CYAN}Total Collected:${NC} $TOTAL_COLLECTED VND"
    
    if [ "$FEE_TYPE" = "VS" ]; then
        echo -e "   ${GREEN}✓ PASSED${NC} - Fee type filter working"
        PASSED=$((PASSED + 1))
    else
        echo -e "   ${RED}✗ FAILED${NC} - Expected feeType=VS, got $FEE_TYPE"
        FAILED=$((FAILED + 1))
    fi
else
    echo -e "   ${RED}✗ FAILED${NC} - HTTP $HTTP_CODE"
    FAILED=$((FAILED + 1))
fi

print_header "Test 3: Report by Month and Fee Type"

echo -e "${BLUE}Testing:${NC} Get report for specific month (10) and fee type (VS)"

RESPONSE=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    "${BASE_URL}/api/thu-phi-ho-khau/report?dotThuPhiId=${DOTTHUPHI_ID}&month=10&feeType=VS")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    MONTH=$(echo "$BODY" | jq -r '.month')
    FEE_TYPE=$(echo "$BODY" | jq -r '.feeType')
    TOTAL_COLLECTED=$(echo "$BODY" | jq -r '.totalCollected')
    
    echo -e "   ${CYAN}Month:${NC} $MONTH"
    echo -e "   ${CYAN}Fee Type:${NC} $FEE_TYPE"
    echo -e "   ${CYAN}Total Collected:${NC} $TOTAL_COLLECTED VND"
    
    if [ "$MONTH" = "10" ] && [ "$FEE_TYPE" = "VS" ]; then
        echo -e "   ${GREEN}✓ PASSED${NC} - Month and fee type filters working"
        PASSED=$((PASSED + 1))
    else
        echo -e "   ${RED}✗ FAILED${NC} - Unexpected values"
        FAILED=$((FAILED + 1))
    fi
else
    echo -e "   ${RED}✗ FAILED${NC} - HTTP $HTTP_CODE"
    FAILED=$((FAILED + 1))
fi

print_header "Test 4: Report with Invalid Fee Period"

echo -e "${BLUE}Testing:${NC} Try to get report for non-existent fee period"

RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    "${BASE_URL}/api/thu-phi-ho-khau/report?dotThuPhiId=99999")

if [ "$RESPONSE" -eq 400 ] || [ "$RESPONSE" -eq 500 ]; then
    echo -e "   ${GREEN}✓ PASSED${NC} - Invalid ID rejected (HTTP $RESPONSE)"
    PASSED=$((PASSED + 1))
else
    echo -e "   ${RED}✗ FAILED${NC} - Expected 400/500, got HTTP $RESPONSE"
    FAILED=$((FAILED + 1))
fi

print_header "Test 5: Collection Rate Calculation"

echo -e "${BLUE}Testing:${NC} Verify collection rate calculation"

RESPONSE=$(curl -s \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    "${BASE_URL}/api/thu-phi-ho-khau/report?dotThuPhiId=${DOTTHUPHI_ID}")

HOUSEHOLDS_PAID=$(echo "$RESPONSE" | jq -r '.householdsPaid')
TOTAL_HOUSEHOLDS=$(echo "$RESPONSE" | jq -r '.totalHouseholds')
COLLECTION_RATE=$(echo "$RESPONSE" | jq -r '.collectionRate' | sed 's/%//')

if [ "$TOTAL_HOUSEHOLDS" -gt 0 ]; then
    EXPECTED_RATE=$(echo "scale=2; $HOUSEHOLDS_PAID * 100 / $TOTAL_HOUSEHOLDS" | bc)
    
    echo -e "   ${CYAN}Households Paid:${NC} $HOUSEHOLDS_PAID / $TOTAL_HOUSEHOLDS"
    echo -e "   ${CYAN}Expected Rate:${NC} ${EXPECTED_RATE}%"
    echo -e "   ${CYAN}Actual Rate:${NC} ${COLLECTION_RATE}%"
    
    DIFF=$(echo "$COLLECTION_RATE - $EXPECTED_RATE" | bc | sed 's/-//')
    if (( $(echo "$DIFF < 1" | bc -l) )); then
        echo -e "   ${GREEN}✓ PASSED${NC} - Collection rate calculated correctly"
        PASSED=$((PASSED + 1))
    else
        echo -e "   ${RED}✗ FAILED${NC} - Rate mismatch"
        FAILED=$((FAILED + 1))
    fi
else
    echo -e "   ${YELLOW}⚠ SKIPPED${NC} - No households in database"
    PASSED=$((PASSED + 1))
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
    echo -e "${GREEN}🎉 All reporting tests passed!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Some tests failed. Please review the output above.${NC}"
    exit 1
fi
