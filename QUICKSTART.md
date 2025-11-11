# 🚀 Quick Start Guide

## ⚡ Fast Setup (3 Steps)

### Step 1: Setup Environment
```bash
# Copy environment file
cp .env.example .env

# Edit .env and change JWT_SECRET and JWT_REFRESH_SECRET to secure random strings
```

### Step 2: Run Everything
```bash
# Windows
docker-manager.bat setup

# Linux/Mac
./docker-manager.sh setup
```

### Step 3: Test
Open in browser or use curl:
```bash
curl http://localhost:8080/health
```

✅ **Done!** All services are running.

---

## 🎯 Common Commands

### Using Helper Scripts (Recommended)

**Windows:**
```batch
docker-manager.bat setup       # Full setup
docker-manager.bat start       # Start all services
docker-manager.bat stop        # Stop all services
docker-manager.bat logs        # View all logs
docker-manager.bat status      # Check status
```

**Linux/Mac:**
```bash
./docker-manager.sh setup      # Full setup
./docker-manager.sh start      # Start all services
./docker-manager.sh stop       # Stop all services
./docker-manager.sh logs       # View all logs
./docker-manager.sh status     # Check status
```

### Using Docker Compose Directly

```bash
# Build and start all services
docker compose up --build -d

# Stop all services
docker compose down

# View logs
docker compose logs -f

# Check status
docker compose ps

# Rebuild specific service
docker compose up --build -d auth-service

# View specific service logs
docker compose logs -f auth-service

# Run migrations
docker compose exec auth-service npx prisma migrate deploy
```

---

## 🔍 Service URLs

| Service | URL | Health Check |
|---------|-----|--------------|
| **API Gateway** | http://localhost:8080 | http://localhost:8080/health |
| **Auth Service** | http://localhost:3001 | http://localhost:3001/health |
| **User Service** | http://localhost:3002 | http://localhost:3002/health |
| **Note Service** | http://localhost:3003 | http://localhost:3003/health |
| **Tag Service** | http://localhost:3004 | http://localhost:3004/health |
| **PostgreSQL** | localhost:5432 | - |
| **Redis** | localhost:6379 | - |

---

## 🐛 Quick Troubleshooting

### Build Fails with "@shared" Error
**Solution:** Build from root directory (where docker-compose.yml is)
```bash
cd d:/Githup\ Reps/Per.\ Projects/notesverb-microservice
docker compose build
```

### Port Already in Use
**Solution:** Stop conflicting service or change port in docker-compose.yml
```bash
# Find what's using the port (Windows)
netstat -ano | findstr :8080

# Find what's using the port (Linux/Mac)
lsof -i :8080
```

### Service Won't Start
**Solution:** Check logs
```bash
docker compose logs service-name
```

### Database Connection Error
**Solution:** Wait for postgres to be healthy
```bash
docker compose ps
# Wait until postgres shows "healthy" status
```

---

## 📝 API Testing Examples

### Register User
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

### Create Note (with auth token)
```bash
curl -X POST http://localhost:8080/api/notes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "My First Note",
    "content": "This is a test note"
  }'
```

---

## 🧹 Cleanup

### Remove Everything
```bash
# Windows
docker-manager.bat clean

# Linux/Mac
./docker-manager.sh clean

# Or manually
docker compose down -v --rmi all
```

---

## 📚 More Information

- Full Docker setup guide: See `DOCKER_SETUP.md`
- Architecture review: See feedback in chat
- API documentation: Use `api.http` file with REST Client extension

---

## ⚠️ Important Notes

1. **Security:** Change JWT secrets in `.env` before production
2. **Database:** Data persists in Docker volumes
3. **Ports:** Ensure ports 5432, 6379, 8080, 3001-3004 are available
4. **Build Context:** Always build from root directory
5. **Shared Folder:** Now properly included in Docker builds ✅

---

## 🆘 Still Having Issues?

1. Check Docker is running
2. Verify all ports are available
3. Check `.env` file exists
4. Read full logs: `docker compose logs -f`
5. Review `DOCKER_SETUP.md` for detailed troubleshooting
