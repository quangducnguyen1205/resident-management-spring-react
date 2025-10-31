#!/bin/bash

# Manual test script to verify fee recalculation persistence
# This script tests that database updates persist after household/citizen CRUD operations

set -e

BASE_URL="http://localhost:8080/api"

# Color output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                                      ║${NC}"
echo -e "${BLUE}║     Manual Fee Recalculation Persistence Test                      ║${NC}"
echo -e "${BLUE}║                                                                      ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Step 1: Login as admin
echo -e "${YELLOW}Step 1: Logging in as admin...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | sed 's/"token":"//')

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Login failed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Login successful${NC}"
echo ""

# Step 2: Create a new household
echo -e "${YELLOW}Step 2: Creating a new household...${NC}"
HH_RESPONSE=$(curl -s -X POST "$BASE_URL/ho-khau" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "soHoKhau": "TEST-HH-001",
    "tenChuHo": "Test Household Head",
    "diaChi": "123 Test Street"
  }')

HH_ID=$(echo $HH_RESPONSE | grep -o '"id":[0-9]*' | head -1 | sed 's/"id"://')

if [ -z "$HH_ID" ]; then
    echo -e "${RED}❌ Failed to create household${NC}"
    echo "$HH_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✓ Household created with ID: $HH_ID${NC}"
sleep 2  # Wait for event processing

# Step 3: Check initial fee record
echo ""
echo -e "${YELLOW}Step 3: Checking initial fee record for household $HH_ID...${NC}"
INITIAL_FEES=$(docker exec -i quanlydancu-postgres psql -U postgres -d quanlydancu -t -c \
  "SELECT id, so_nguoi, tong_phi, trang_thai FROM thu_phi_ho_khau WHERE ho_khau_id = $HH_ID;")

echo -e "${BLUE}Initial fee record:${NC}"
echo "$INITIAL_FEES"
echo ""

# Step 4: Add first citizen to household
echo -e "${YELLOW}Step 4: Adding first citizen to household...${NC}"
CITIZEN1_RESPONSE=$(curl -s -X POST "$BASE_URL/nhan-khau" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"hoTen\": \"Citizen One\",
    \"ngaySinh\": \"1990-01-01\",
    \"gioiTinh\": \"NAM\",
    \"danToc\": \"Kinh\",
    \"quocTich\": \"Việt Nam\",
    \"ngheNghiep\": \"Engineer\",
    \"cmndCccd\": \"001234567890\",
    \"ngayCap\": \"2020-01-01\",
    \"noiCap\": \"CA TP HCM\",
    \"quanHeChuHo\": \"Chủ hộ\",
    \"hoKhauId\": $HH_ID
  }")

CITIZEN1_ID=$(echo $CITIZEN1_RESPONSE | grep -o '"id":[0-9]*' | head -1 | sed 's/"id"://')

if [ -z "$CITIZEN1_ID" ]; then
    echo -e "${RED}❌ Failed to create citizen 1${NC}"
    echo "$CITIZEN1_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✓ Citizen 1 created with ID: $CITIZEN1_ID${NC}"
sleep 2  # Wait for event processing

# Step 5: Check fee after adding first citizen
echo ""
echo -e "${YELLOW}Step 5: Checking fee record after adding first citizen...${NC}"
AFTER_CITIZEN1=$(docker exec -i quanlydancu-postgres psql -U postgres -d quanlydancu -t -c \
  "SELECT id, so_nguoi, tong_phi, trang_thai FROM thu_phi_ho_khau WHERE ho_khau_id = $HH_ID;")

echo -e "${BLUE}Fee record after citizen 1:${NC}"
echo "$AFTER_CITIZEN1"
echo ""

# Step 6: Add second citizen
echo -e "${YELLOW}Step 6: Adding second citizen to household...${NC}"
CITIZEN2_RESPONSE=$(curl -s -X POST "$BASE_URL/nhan-khau" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"hoTen\": \"Citizen Two\",
    \"ngaySinh\": \"1992-05-15\",
    \"gioiTinh\": \"NU\",
    \"danToc\": \"Kinh\",
    \"quocTich\": \"Việt Nam\",
    \"ngheNghiep\": \"Teacher\",
    \"cmndCccd\": \"001234567891\",
    \"ngayCap\": \"2020-01-01\",
    \"noiCap\": \"CA TP HCM\",
    \"quanHeChuHo\": \"Vợ/Chồng\",
    \"hoKhauId\": $HH_ID
  }")

CITIZEN2_ID=$(echo $CITIZEN2_RESPONSE | grep -o '"id":[0-9]*' | head -1 | sed 's/"id"://')

if [ -z "$CITIZEN2_ID" ]; then
    echo -e "${RED}❌ Failed to create citizen 2${NC}"
    echo "$CITIZEN2_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✓ Citizen 2 created with ID: $CITIZEN2_ID${NC}"
sleep 2  # Wait for event processing

# Step 7: Check fee after adding second citizen
echo ""
echo -e "${YELLOW}Step 7: Checking fee record after adding second citizen...${NC}"
AFTER_CITIZEN2=$(docker exec -i quanlydancu-postgres psql -U postgres -d quanlydancu -t -c \
  "SELECT id, so_nguoi, tong_phi, trang_thai FROM thu_phi_ho_khau WHERE ho_khau_id = $HH_ID;")

echo -e "${BLUE}Fee record after citizen 2:${NC}"
echo "$AFTER_CITIZEN2"
echo ""

# Step 8: Delete first citizen (simulate someone moving out)
echo -e "${YELLOW}Step 8: Deleting citizen 1 (simulating someone moving out)...${NC}"
DELETE_RESPONSE=$(curl -s -X DELETE "$BASE_URL/nhan-khau/$CITIZEN1_ID" \
  -H "Authorization: Bearer $TOKEN")

echo -e "${GREEN}✓ Citizen 1 deleted${NC}"
sleep 2  # Wait for event processing

# Step 9: Check fee after deleting citizen
echo ""
echo -e "${YELLOW}Step 9: Checking fee record after deleting citizen 1...${NC}"
AFTER_DELETE=$(docker exec -i quanlydancu-postgres psql -U postgres -d quanlydancu -t -c \
  "SELECT id, so_nguoi, tong_phi, trang_thai FROM thu_phi_ho_khau WHERE ho_khau_id = $HH_ID;")

echo -e "${BLUE}Fee record after deletion:${NC}"
echo "$AFTER_DELETE"
echo ""

# Step 10: Verification summary
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                     VERIFICATION SUMMARY                            ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${YELLOW}Expected behavior:${NC}"
echo "1. Initial: so_nguoi = 0, tong_phi = 0 (new household, no members yet)"
echo "2. After citizen 1: so_nguoi = 1, tong_phi = calculated (1 person)"
echo "3. After citizen 2: so_nguoi = 2, tong_phi = calculated (2 people)"
echo "4. After deletion: so_nguoi = 1, tong_phi = calculated (back to 1 person)"
echo ""

echo -e "${GREEN}✅ Manual test completed!${NC}"
echo -e "${YELLOW}Please review the database output above to verify:${NC}"
echo "  - so_nguoi incremented from 0 → 1 → 2 → 1"
echo "  - tong_phi was recalculated each time"
echo "  - Changes persisted to database (not just in logs)"
echo ""

# Step 11: Check backend logs
echo -e "${YELLOW}Step 10: Checking backend logs for event processing...${NC}"
echo ""
docker logs quanlydancu-backend 2>&1 | grep -E "(🔄|💾|✅|🆕|📊|===)" | tail -30
echo ""

echo -e "${GREEN}✅ Test script completed successfully!${NC}"
