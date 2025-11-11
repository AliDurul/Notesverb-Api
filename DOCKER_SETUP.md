# 🐳 Docker Setup Guide for NotesVerb Microservices

This guide explains how to build and run the NotesVerb microservices architecture using Docker and Docker Compose.

## 📋 Prerequisites

- Docker Desktop installed and running
- Docker Compose V2
- At least 4GB of RAM available for Docker
- Ports 5432, 6379, 8080, 3001-3004 available

## 🏗️ Architecture

The application consists of:
- **API Gateway** (Port 8080) - Entry point for all requests
- **Auth Service** (Port 3001) - Handles authentication
- **User Service** (Port 3002) - Manages user profiles
- **Note Service** (Port 3003) - Manages notes
- **Tag Service** (Port 3004) - Manages tags
- **PostgreSQL** (Port 5432) - Database
- **Redis** (Port 6379) - Cache and sessions

## 🚀 Quick Start

### 1. Environment Setup

Copy the example environment file:
```bash
cp .env.example .env
```

**IMPORTANT:** Edit `.env` and change the JWT secrets to secure random strings (at least 32 characters).

### 2. Build and Run All Services

```bash
# Build and start all services
docker compose up --build

# Or run in detached mode (background)
docker compose up --build -d
```

### 3. View Logs

```bash
# View all logs
docker compose logs -f

# View specific service logs
docker compose logs -f auth-service
docker compose logs -f api-gateway
```

### 4. Check Health

Once all services are running, check health endpoints:
- API Gateway: http://localhost:8080/health
- Auth Service: http://localhost:3001/health
- User Service: http://localhost:3002/health
- Note Service: http://localhost:3003/health
- Tag Service: http://localhost:3004/health

## 🛠️ Individual Service Management

### Build Individual Service

```bash
# Build auth-service only
docker compose build auth-service

# Build with no cache
docker compose build --no-cache auth-service
```

### Start/Stop Services

```bash
# Start specific service
docker compose up auth-service

# Stop all services
docker compose down

# Stop and remove volumes (⚠️ deletes all data)
docker compose down -v
```

### Rebuild After Code Changes

```bash
# Rebuild and restart specific service
docker compose up --build -d auth-service

# Rebuild all services
docker compose up --build -d
```

## 🔍 Troubleshooting

### Issue: "Cannot find module '@shared'"

**Cause:** The Docker build context doesn't include the shared folder.

**Solution:** Make sure you're building from the root directory (where docker-compose.yml is located):
```bash
# ✅ Correct - from root directory
docker compose build

# ❌ Wrong - from service directory
cd services/auth-service
docker build .
```

### Issue: Port Already in Use

**Cause:** Another application is using the required port.

**Solution:** Either stop the conflicting application or change the port mapping in `docker-compose.yml`:
```yaml
ports:
  - "8081:8080"  # Map external port 8081 to internal 8080
```

### Issue: Service Won't Start

**Check logs:**
```bash
docker compose logs service-name
```

**Common causes:**
1. Database not ready - wait for PostgreSQL health check
2. Missing environment variables - check .env file
3. Port conflicts - change port mappings

### Issue: Database Connection Errors

**Solution:** Ensure PostgreSQL is healthy:
```bash
docker compose ps
# Look for "healthy" status on postgres service
```

If unhealthy, restart:
```bash
docker compose restart postgres
```

## 🗄️ Database Management

### Run Prisma Migrations

After starting services, run migrations for each service:

```bash
# Auth Service
docker compose exec auth-service npx prisma migrate deploy

# User Service
docker compose exec user-service npx prisma migrate deploy

# Note Service
docker compose exec note-service npx prisma migrate deploy

# Tag Service
docker compose exec tag-service npx prisma migrate deploy
```

### Access Database

```bash
# Using psql
docker compose exec postgres psql -U notesverb -d notesverb_db

# Or connect from host machine
psql -h localhost -p 5432 -U notesverb -d notesverb_db
```

### Backup Database

```bash
docker compose exec postgres pg_dump -U notesverb notesverb_db > backup.sql
```

### Restore Database

```bash
docker compose exec -T postgres psql -U notesverb notesverb_db < backup.sql
```

## 🧹 Cleanup

### Remove Containers

```bash
# Stop and remove containers
docker compose down
```

### Remove Everything (including data)

```bash
# Remove containers, volumes, and networks
docker compose down -v

# Remove images too
docker compose down -v --rmi all
```

### Clean Docker System

```bash
# Remove unused containers, networks, images
docker system prune -a
```

## 🔐 Security Notes

1. **Change JWT Secrets:** Always use strong, unique secrets in production
2. **Environment Variables:** Never commit `.env` file to git
3. **Database Credentials:** Change default passwords in production
4. **Network Isolation:** Services communicate via internal Docker network
5. **User Permissions:** Containers run as non-root user for security

## 📊 Monitoring

### Check Container Status

```bash
# List running containers
docker compose ps

# Check resource usage
docker stats
```

### Access Container Shell

```bash
# Access service container
docker compose exec auth-service sh

# Run commands inside container
docker compose exec auth-service ls -la
```

## 🔄 Development Workflow

1. Make code changes
2. Rebuild affected service: `docker compose up --build -d service-name`
3. Check logs: `docker compose logs -f service-name`
4. Test endpoints
5. If needed, access container: `docker compose exec service-name sh`

## 📝 API Testing

Use the provided `api.http` file with REST Client extension in VS Code, or use curl:

```bash
# Health check
curl http://localhost:8080/health

# Register user (via API Gateway)
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#"}'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#"}'
```

## 🎯 Production Deployment

For production deployment:
1. Use proper secrets management (AWS Secrets Manager, HashiCorp Vault)
2. Set up SSL/TLS certificates
3. Configure load balancer
4. Set up monitoring (Prometheus, Grafana)
5. Implement log aggregation (ELK Stack)
6. Use orchestration platform (Kubernetes, ECS)
7. Set up CI/CD pipeline
8. Configure auto-scaling
9. Implement backup strategies
10. Set up disaster recovery

## 🆘 Getting Help

If you encounter issues:
1. Check logs: `docker compose logs -f`
2. Verify environment variables in `.env`
3. Ensure all ports are available
4. Check Docker Desktop is running
5. Verify sufficient disk space and memory
