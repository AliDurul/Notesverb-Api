@echo off
REM NotesVerb Microservices Docker Management Script for Windows
REM Usage: docker-manager.bat [command]

setlocal enabledelayedexpansion

if "%1"=="" (
    call :show_help
    exit /b 0
)

if "%1"=="help" call :show_help
if "%1"=="setup" call :full_setup
if "%1"=="build" call :build %2
if "%1"=="start" call :start %2
if "%1"=="stop" call :stop %2
if "%1"=="restart" call :restart %2
if "%1"=="logs" call :logs %2
if "%1"=="status" call :status
if "%1"=="migrate" call :migrate
if "%1"=="clean" call :clean

exit /b 0

:show_help
echo NotesVerb Microservices Docker Manager
echo.
echo Usage: docker-manager.bat [command] [options]
echo.
echo Commands:
echo   setup              Full setup: build, start, and run migrations
echo   build [service]    Build all services or specific service
echo   start [service]    Start all services or specific service
echo   stop [service]     Stop all services or specific service
echo   restart [service]  Restart all services or specific service
echo   logs [service]     Show logs (all services or specific service)
echo   status             Show status of all services
echo   migrate            Run database migrations for all services
echo   clean              Remove all containers, volumes, and images
echo   help               Show this help message
echo.
echo Services:
echo   - api-gateway
echo   - auth-service
echo   - user-service
echo   - note-service
echo   - tag-service
echo   - postgres
echo   - redis
echo.
echo Examples:
echo   docker-manager.bat setup                  # Full setup
echo   docker-manager.bat build auth-service     # Build auth service only
echo   docker-manager.bat start                  # Start all services
echo   docker-manager.bat logs api-gateway       # View API Gateway logs
echo   docker-manager.bat restart postgres       # Restart database
echo.
exit /b 0

:check_docker
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running. Please start Docker Desktop.
    exit /b 1
)
echo [OK] Docker is running
exit /b 0

:check_env
if not exist .env (
    echo [WARNING] .env file not found. Creating from .env.example...
    copy .env.example .env >nul
    echo [WARNING] IMPORTANT: Edit .env file and change JWT secrets!
    echo.
) else (
    echo [OK] .env file exists
)
exit /b 0

:full_setup
echo [INFO] Running full setup: build, start, migrate...
call :check_docker
if errorlevel 1 exit /b 1
call :check_env
echo.
echo [INFO] Building all services...
docker compose build
if errorlevel 1 (
    echo [ERROR] Build failed
    exit /b 1
)
echo [OK] Build completed
echo.
echo [INFO] Starting all services...
docker compose up -d
if errorlevel 1 (
    echo [ERROR] Failed to start services
    exit /b 1
)
echo [OK] Services started
echo.
echo [INFO] Waiting for services to be ready...
timeout /t 15 /nobreak >nul
echo.
call :migrate
echo.
call :status
echo.
echo [OK] Full setup completed!
exit /b 0

:build
call :check_docker
if errorlevel 1 exit /b 1
if "%~1"=="" (
    echo [INFO] Building all services...
    docker compose build
) else (
    echo [INFO] Building %~1...
    docker compose build %~1
)
if errorlevel 1 (
    echo [ERROR] Build failed
    exit /b 1
)
echo [OK] Build completed
exit /b 0

:start
call :check_docker
if errorlevel 1 exit /b 1
call :check_env
if "%~1"=="" (
    echo [INFO] Starting all services...
    docker compose up -d
) else (
    echo [INFO] Starting %~1...
    docker compose up -d %~1
)
if errorlevel 1 (
    echo [ERROR] Failed to start
    exit /b 1
)
echo [OK] Started successfully
timeout /t 5 /nobreak >nul
call :status
exit /b 0

:stop
if "%~1"=="" (
    echo [INFO] Stopping all services...
    docker compose down
) else (
    echo [INFO] Stopping %~1...
    docker compose stop %~1
)
if errorlevel 1 (
    echo [ERROR] Failed to stop
    exit /b 1
)
echo [OK] Stopped successfully
exit /b 0

:restart
if "%~1"=="" (
    echo [INFO] Restarting all services...
    docker compose restart
) else (
    echo [INFO] Restarting %~1...
    docker compose restart %~1
)
if errorlevel 1 (
    echo [ERROR] Failed to restart
    exit /b 1
)
echo [OK] Restarted successfully
exit /b 0

:logs
if "%~1"=="" (
    docker compose logs -f
) else (
    docker compose logs -f %~1
)
exit /b 0

:status
echo [INFO] Service Status:
docker compose ps
echo.
echo [INFO] Health Check URLs:
echo   API Gateway:  http://localhost:8080/health
echo   Auth Service: http://localhost:3001/health
echo   User Service: http://localhost:3002/health
echo   Note Service: http://localhost:3003/health
echo   Tag Service:  http://localhost:3004/health
exit /b 0

:migrate
echo [INFO] Running Prisma migrations...
echo.
echo [INFO] Auth Service migrations...
docker compose exec auth-service npx prisma migrate deploy 2>nul || echo [WARNING] Auth service migration failed or not running
echo.
echo [INFO] User Service migrations...
docker compose exec user-service npx prisma migrate deploy 2>nul || echo [WARNING] User service migration failed or not running
echo.
echo [INFO] Note Service migrations...
docker compose exec note-service npx prisma migrate deploy 2>nul || echo [WARNING] Note service migration failed or not running
echo.
echo [INFO] Tag Service migrations...
docker compose exec tag-service npx prisma migrate deploy 2>nul || echo [WARNING] Tag service migration failed or not running
echo.
echo [OK] Migrations completed
exit /b 0

:clean
echo [WARNING] This will remove all containers, volumes, and images.
set /p confirm="Are you sure? (y/n): "
if /i "!confirm!"=="y" (
    echo [INFO] Cleaning up...
    docker compose down -v --rmi all
    echo [OK] Cleanup completed
) else (
    echo [INFO] Cleanup cancelled
)
exit /b 0
