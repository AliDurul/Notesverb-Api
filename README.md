# NotesVerb API

NotesVerb API with microservice architecture

[![Language: TypeScript](https://img.shields.io/badge/language-TypeScript-blue)]()
[![License: UNLICENSED](https://img.shields.io/badge/license-UNLICENSED-lightgrey)]()

Table of contents
- Project overview
- Repository layout
- Architecture & design documents
- Quickstart (local & Docker)
- Services (what's in this repo)
- Configuration & environment variables
- Running & debugging
- Testing
- Observability & monitoring
- Security
- CI / CD (notes)
- Contributing
- Troubleshooting
- License & contact

Project overview
NotesVerb is a microservice-based backend API for a note-taking platform. The repo is implemented primarily in TypeScript and organized by service so each bounded context (auth, users, notes, tags, etc.) can be developed and deployed independently.

Repository layout (top-level items)
- .dockerignore
- .env.example
- .gitignore
- ARCHITECTURE.md
- DOCKER_SETUP.md
- QUICKSTART.md
- api.http
- docker-compose.yml
- docker-manager.sh / docker-manager.bat
- init-database.sql
- api-gateway/ (API gateway service)
- services/
  - auth-service/
  - user-service/
  - note-service/
  - tag-service/
- shared/ (shared libraries / types)

Important docs
- ARCHITECTURE.md — high-level architecture decisions and diagrams (see repository root)
- DOCKER_SETUP.md — instructions for building and running containers with Docker (see repository root)
- QUICKSTART.md — quickstart guide for getting the system up locally (see repository root)
- .env.example — example environment variables for services (see repository root)
- docker-compose.yml — single-file local orchestration for services + infra (see repository root)

Architecture (summary)
This repository follows a microservice pattern with a clear separation of concerns:
- api-gateway: single entry point handling routing, request validation, authentication middleware and aggregation endpoints.
- auth-service: user registration, login, JWT/refresh token handling, password reset flows.
- user-service: user profile and preferences.
- note-service: note CRUD, versioning, sharing, and search.
- tag-service: tag management and tag-based queries.
- shared: shared code (types, DTOs, utilities) used by services.
- Infra (local via docker-compose): Postgres (or other), Redis, message broker (when enabled).

Services and endpoints (common expectations)
- Auth
  - POST /auth/register
  - POST /auth/login
  - POST /auth/refresh
  - POST /auth/logout
- Users
  - GET /users/:id
  - PUT /users/:id
  - GET /users?query=
- Notes
  - GET /notes
  - POST /notes
  - GET /notes/:id
  - PUT /notes/:id
  - DELETE /notes/:id
- Tags
  - GET /tags
  - POST /tags
  - GET /tags/:id

Getting started (high-level)
1. Clone the repo
   git clone https://github.com/AliDurul/Notesverb-Api.git
   cd Notesverb-Api

2. Read:
   - ARCHITECTURE.md for architecture rationale
   - QUICKSTART.md for the quickest local setup flow
   - DOCKER_SETUP.md for Docker-specific environment and images

3. Copy/update environment files:
   cp .env.example .env
   Edit the .env files for each service (or each service's .env) with real credentials and secrets.

Local development (Node / per service)
- Each service lives in services/<service-name>. Typically:
  cd services/<service>
  npm install
  npm run dev    # or the repository's dev script for that service

If you use a monorepo workspace tool, follow the monorepo workflow (workspace install then per-service starts). If package.json scripts are required, inspect each service's package.json to confirm exact script names.

Using Docker & docker-compose (recommended for consistent local infra)
- Start entire stack:
  docker-compose up --build
- Stop stack:
  docker-compose down
- Follow logs:
  docker-compose logs -f

Refer to DOCKER_SETUP.md in the repository root for detailed environment values, volumes, and how services are wired in docker-compose.yml.

Configuration & environment variables
- Copy .env.example to .env and fill values appropriately.
- Typical variables:
  NODE_ENV=development
  PORT=4002
  DATABASE_URL=postgres://user:pass@db:5432/notes_db
  REDIS_URL=redis://redis:6379
  JWT_SECRET=replace_with_secure_secret
  JWT_EXPIRES_IN=1h
- Keep secrets in a secrets manager (Vault / cloud provider secret store / GitHub Secrets) in production. Do not commit .env with real secrets.

Running & debugging
- Use service-level dev scripts (e.g., npm run dev) with nodemon/ts-node for TypeScript hot reloading.
- Use the gateway to exercise multi-service flows and composition endpoints.
- Use api.http (root) for example HTTP requests (can be opened in REST client extensions like VS Code REST Client or Thunder Client).

Testing
- Unit tests: run each service's test script (e.g., npm run test).
- Integration / E2E tests: run against a test stack (use docker-compose.testing or a test database). Confirm test commands in each service's package.json.
- Use testcontainers/local test DB instances where appropriate.

Observability & monitoring
- Use structured logging (pino/winston) and include trace/request IDs.
- Expose Prometheus metrics (/metrics) where possible.
- Use distributed tracing (OpenTelemetry) to trace requests across services.
- Centralize errors to a service like Sentry for production.

Security considerations
- Hash and salt passwords (bcrypt/argon2).
- Use HTTPS in production and terminate TLS at the gateway or load balancer.
- Use short-lived access tokens and refresh tokens; rotate secrets and revoke refresh tokens as needed.
- Validate and sanitize user input at the gateway and service layer.
- Enforce CORS, CSP, and other HTTP security headers at the gateway.

CI / CD notes
- Add CI checks for TypeScript types, linting, unit tests, and coverage.
- Build and publish Docker images in CI pipelines and deploy via CD (Kubernetes/Helm, or other orchestrators).
- Protect main branches and require passing status checks for merges.

Contributing
- Fork the repo and create a feature branch: feature/short-description
- Open a PR with a clear description and changelog.
- Run tests, linting, and ensure type checks pass.
- Keep changes small and well-documented.

Troubleshooting (common problems)
- DB connection errors: ensure DATABASE_URL points to running DB instance (see docker-compose).
- Missing environment variables: check .env or environment injection for each service.
- Token validation errors: ensure JWT_SECRET is consistent where tokens are validated.

Useful files in this repo
- ARCHITECTURE.md — architecture decisions and diagrams
- DOCKER_SETUP.md — Docker-specific instructions
- QUICKSTART.md — quick local setup
- docker-compose.yml — local stack composition
- api.http — example API requests for local testing
- init-database.sql — initial DB schema seed script
- services/* — individual service implementations (auth-service, user-service, note-service, tag-service)
- api-gateway/ — gateway implementation
- shared/ — shared libraries/types

Example curl (notes-service)
```bash
curl -X POST "http://localhost:4002/notes" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Shopping","content":"Milk, Bread, Eggs"}'
```

License
- This repository currently indicates UNLICENSED. Add a LICENSE file and select a license (MIT / Apache-2.0 / etc.) if you intend to open-source.

Maintainers / contact
- Repository: https://github.com/AliDurul/Notesverb-Api
- Owner: AliDurul

Appendix — notes about scripts and structure
- I referenced the services and top-level files found in the repository root. Per-service script names (e.g., `dev`, `start`, `test`) should be verified by inspecting each `services/<service>/package.json` and adjusting any commands in this README to match exact script names used by each service.
