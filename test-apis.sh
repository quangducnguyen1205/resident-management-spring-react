#!/bin/bash

# API Testing Script
BASE_URL="http://localhost:8080/api"

# Get token
echo "🔐 Getting authentication token..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Failed to get token"
  exit 1
fi

echo "✅ Token obtained"
echo ""

# Test results array
declare -a results

# Function to test API
test_api() {
  local method=$1
  local endpoint=$2
  local data=$3
  local description=$4
  
  echo "Testing: $description"
  
  if [ -z "$data" ]; then
    RESPONSE=$(curl -s -w "\n%{http_code}|%{time_total}" -X $method "$BASE_URL$endpoint" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json")
  else
    RESPONSE=$(curl -s -w "\n%{http_code}|%{time_total}" -X $method "$BASE_URL$endpoint" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "$data")
  fi
  
  HTTP_CODE=$(echo "$RESPONSE" | tail -1 | cut -d'|' -f1)
  TIME=$(echo "$RESPONSE" | tail -1 | cut -d'|' -f2)
  BODY=$(echo "$RESPONSE" | sed '$d')
  
  # Determine status icon
  if [ $HTTP_CODE -ge 200 ] && [ $HTTP_CODE -lt 300 ]; then
    STATUS="✅"
  elif [ $HTTP_CODE -ge 400 ] && [ $HTTP_CODE -lt 500 ]; then
    STATUS="⚠️"
  else
    STATUS="❌"
  fi
  
  echo "   $STATUS Status: $HTTP_CODE | Time: ${TIME}s"
  
  # Store result
  results+=("$description|$HTTP_CODE|${TIME}s|$STATUS")
  echo ""
}

echo "=== 📋 AUTHENTICATION APIs ==="
echo ""
test_api "POST" "/auth/login" '{"username":"admin","password":"admin123"}' "Login with valid credentials"

echo "=== 🏠 HOUSEHOLD APIs ==="
echo ""
test_api "GET" "/ho-khau" "" "GET all households"
test_api "GET" "/ho-khau/1" "" "GET household by ID"
test_api "POST" "/ho-khau" '{"maHoKhau":"HK999","chuHoTen":"Test House","diaChiThuongTru":"Test Address"}' "CREATE new household"
test_api "PUT" "/ho-khau/1" '{"maHoKhau":"HK001","chuHoTen":"Updated Name","diaChiThuongTru":"123 Test St"}' "UPDATE household"
test_api "DELETE" "/ho-khau/999" "" "DELETE household (non-existent)"

echo "=== 👤 CITIZEN APIs ==="
echo ""
test_api "GET" "/nhan-khau" "" "GET all citizens"
test_api "GET" "/nhan-khau/1" "" "GET citizen by ID"
test_api "GET" "/nhan-khau/stats/age" "" "GET age statistics"
test_api "GET" "/nhan-khau/stats/gender" "" "GET gender statistics"
test_api "POST" "/nhan-khau" '{"hoTen":"Test Person","ngaySinh":"2000-01-01","gioiTinh":"NAM","cccd":"001234567890","hoKhauId":1}' "CREATE new citizen"

echo "=== 💰 FEE PERIOD APIs ==="
echo ""
test_api "GET" "/dot-thu-phi" "" "GET all fee periods"
test_api "POST" "/dot-thu-phi" '{"tenDot":"Test Fee 2025","loaiPhi":"BAT_BUOC","dinhMuc":50000,"batDau":"2025-01-01","ketThuc":"2025-12-31"}' "CREATE fee period"

echo "=== 💵 FEE COLLECTION APIs ==="
echo ""
test_api "GET" "/thu-phi-ho-khau" "" "GET all fee collections"
test_api "GET" "/thu-phi-ho-khau/calc?hoKhauId=1&dotThuPhiId=1" "" "CALCULATE fee for household"

echo ""
echo "================================"
echo "📊 TEST SUMMARY"
echo "================================"
printf "%-50s | %-10s | %-10s | %s\n" "API Endpoint" "Status" "Time" "Result"
echo "--------------------------------"

for result in "${results[@]}"; do
  IFS='|' read -r desc code time status <<< "$result"
  printf "%-50s | %-10s | %-10s | %s\n" "$desc" "$code" "$time" "$status"
done

echo ""
echo "✅ = Success (200-299)"
echo "⚠️  = Client Error (400-499)"
echo "❌ = Server Error (500+)"
