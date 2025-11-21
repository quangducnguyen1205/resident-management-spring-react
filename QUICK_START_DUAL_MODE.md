# 🚀 Quick Start Guide - Dual Mode Setup

## Choose Your Mode

### 🔧 Local Development (Recommended for Active Development)

**Run these commands:**
```bash
# Terminal 1 - Start Backend
cd backend
./mvnw spring-boot:run

# Terminal 2 - Start Frontend
cd frontend
npm install
npm run dev
```

**Access:**
- Frontend: http://localhost:5173
- Backend: http://localhost:8080

**Uses:** `.env.local` → `http://localhost:8080/api`

---

### 🐳 Docker Deployment (Production-like Testing)

**Run this command:**
```bash
docker-compose up --build -d
```

**Load seed data (first time):**
```bash
docker cp backend/test/seed-data/test-seed.sql quanlydancu-postgres:/tmp/
docker-compose exec -T db psql -U postgres -d quanlydancu -f /tmp/test-seed.sql
```

**Access:**
- Frontend: http://localhost
- Backend: http://localhost:8080

**Uses:** `.env.docker` → `http://backend:8080/api`

---

## Common Commands

### Docker Mode
```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# View logs
docker-compose logs -f

# Restart service
docker-compose restart backend

# Clean rebuild
docker-compose down -v && docker-compose up --build -d
```

### Local Mode
```bash
# Backend
cd backend && ./mvnw spring-boot:run

# Frontend
cd frontend && npm run dev

# Run tests
./mvnw test  # Backend
npm test     # Frontend
```

---

## Test Login

**Credentials:**
- Username: `admin`
- Password: `admin123`

**Test API:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

---

## Files Reference

| File | Purpose |
|------|---------|
| `frontend/.env.local` | Local dev API URL |
| `frontend/.env.docker` | Docker build API URL |
| `docker-compose.yml` | Docker orchestration |
| `backend/config/SecurityConfig.java` | CORS configuration |

---

## Need Help?

Read: `DOCKER_LOCAL_DUAL_MODE_REPORT.md` for complete documentation.
