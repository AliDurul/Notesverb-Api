#!/bin/bash

# NotesVerb Microservices Docker Management Script
# Usage: ./docker-manager.sh [command]

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Helper functions
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${NC}ℹ $1${NC}"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker Desktop."
        exit 1
    fi
    print_success "Docker is running"
}

# Check if .env file exists
check_env() {
    if [ ! -f .env ]; then
        print_warning ".env file not found. Creating from .env.example..."
        cp .env.example .env
        print_warning "⚠️  IMPORTANT: Edit .env file and change JWT secrets before running in production!"
        echo ""
    else
        print_success ".env file exists"
    fi
}

# Build all services
build_all() {
    print_info "Building all services..."
    docker compose build
    print_success "All services built successfully"
}

# Build specific service
build_service() {
    if [ -z "$1" ]; then
        print_error "Service name required. Usage: ./docker-manager.sh build [service-name]"
        exit 1
    fi
    print_info "Building $1..."
    docker compose build "$1"
    print_success "$1 built successfully"
}

# Start all services
start_all() {
    print_info "Starting all services..."
    docker compose up -d
    print_success "All services started"
    echo ""
    print_info "Waiting for services to be healthy..."
    sleep 10
    show_status
}

# Start specific service
start_service() {
    if [ -z "$1" ]; then
        print_error "Service name required. Usage: ./docker-manager.sh start [service-name]"
        exit 1
    fi
    print_info "Starting $1..."
    docker compose up -d "$1"
    print_success "$1 started"
}

# Stop all services
stop_all() {
    print_info "Stopping all services..."
    docker compose down
    print_success "All services stopped"
}

# Stop specific service
stop_service() {
    if [ -z "$1" ]; then
        print_error "Service name required. Usage: ./docker-manager.sh stop [service-name]"
        exit 1
    fi
    print_info "Stopping $1..."
    docker compose stop "$1"
    print_success "$1 stopped"
}

# Restart all services
restart_all() {
    print_info "Restarting all services..."
    docker compose restart
    print_success "All services restarted"
}

# Restart specific service
restart_service() {
    if [ -z "$1" ]; then
        print_error "Service name required. Usage: ./docker-manager.sh restart [service-name]"
        exit 1
    fi
    print_info "Restarting $1..."
    docker compose restart "$1"
    print_success "$1 restarted"
}

# Show logs
show_logs() {
    if [ -z "$1" ]; then
        docker compose logs -f
    else
        docker compose logs -f "$1"
    fi
}

# Show status
show_status() {
    print_info "Service Status:"
    docker compose ps
    echo ""
    print_info "Health Checks:"
    echo "API Gateway: http://localhost:8080/health"
    echo "Auth Service: http://localhost:3001/health"
    echo "User Service: http://localhost:3002/health"
    echo "Note Service: http://localhost:3003/health"
    echo "Tag Service: http://localhost:3004/health"
}

# Run migrations
run_migrations() {
    print_info "Running Prisma migrations..."
    
    print_info "Auth Service migrations..."
    docker compose exec auth-service npx prisma migrate deploy || print_warning "Auth service not running or migration failed"
    
    print_info "User Service migrations..."
    docker compose exec user-service npx prisma migrate deploy || print_warning "User service not running or migration failed"
    
    print_info "Note Service migrations..."
    docker compose exec note-service npx prisma migrate deploy || print_warning "Note service not running or migration failed"
    
    print_info "Tag Service migrations..."
    docker compose exec tag-service npx prisma migrate deploy || print_warning "Tag service not running or migration failed"
    
    print_success "Migrations completed"
}

# Clean everything
clean() {
    print_warning "This will remove all containers, volumes, and images. Are you sure? (y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_info "Cleaning up..."
        docker compose down -v --rmi all
        print_success "Cleanup completed"
    else
        print_info "Cleanup cancelled"
    fi
}

# Full setup (build + start + migrate)
full_setup() {
    check_docker
    check_env
    print_info "Running full setup: build → start → migrate"
    build_all
    start_all
    sleep 15
    run_migrations
    print_success "Full setup completed!"
    echo ""
    show_status
}

# Show help
show_help() {
    cat << EOF
NotesVerb Microservices Docker Manager

Usage: ./docker-manager.sh [command] [options]

Commands:
  setup              Full setup: build, start, and run migrations
  build [service]    Build all services or specific service
  start [service]    Start all services or specific service
  stop [service]     Stop all services or specific service
  restart [service]  Restart all services or specific service
  logs [service]     Show logs (all services or specific service)
  status             Show status of all services
  migrate            Run database migrations for all services
  clean              Remove all containers, volumes, and images
  help               Show this help message

Services:
  - api-gateway
  - auth-service
  - user-service
  - note-service
  - tag-service
  - postgres
  - redis

Examples:
  ./docker-manager.sh setup                  # Full setup
  ./docker-manager.sh build auth-service     # Build auth service only
  ./docker-manager.sh start                  # Start all services
  ./docker-manager.sh logs api-gateway       # View API Gateway logs
  ./docker-manager.sh restart postgres       # Restart database

EOF
}

# Main script logic
case "$1" in
    setup)
        full_setup
        ;;
    build)
        check_docker
        if [ -z "$2" ]; then
            build_all
        else
            build_service "$2"
        fi
        ;;
    start)
        check_docker
        check_env
        if [ -z "$2" ]; then
            start_all
        else
            start_service "$2"
        fi
        ;;
    stop)
        if [ -z "$2" ]; then
            stop_all
        else
            stop_service "$2"
        fi
        ;;
    restart)
        if [ -z "$2" ]; then
            restart_all
        else
            restart_service "$2"
        fi
        ;;
    logs)
        show_logs "$2"
        ;;
    status)
        show_status
        ;;
    migrate)
        run_migrations
        ;;
    clean)
        clean
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
