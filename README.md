# VOD Platform

A monorepo‑based Video on Demand (VOD) platform featuring HLS transcoding, JWT authentication, real‑time telemetry via WebSockets, and an integrated admin dashboard.

---

## Project Structure

```
├── apps/
│   ├── web-client/       # Frontend (Next.js, Axios, Zustand)
│   ├── api-server/       # Backend API (Express.js, TypeScript, Prisma, Socket.io)
│   └── media-worker/     # Media Transcoder (Go, FFmpeg)
├── packages/
│   ├── database/         # Prisma schema and migrations
│   └── shared-types/     # Shared TypeScript interfaces and DTOs
├── infrastructure/       # Terraform, AWS EC2 deploy keys, and scripts
└── .github/workflows/    # CI/CD pipelines (GitHub Actions)
```

---

## Prerequisites

- Node.js v20+ 
- npm v10+ 
- Docker and Docker Desktop 
- Go 1.20+ (optional – only for local media‑worker) 
- FFmpeg (optional – only for local media‑worker)

---

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
Create a `.env` file in the repository root. See `readme.txt` for a full list of required variables. The essential ones are:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_SECRET` | Secret for signing JWT access tokens |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens |
| `S3_ENDPOINT` | MinIO/S3 endpoint URL |
| `S3_ACCESS_KEY` | Access key for MinIO/S3 |
| `S3_SECRET_KEY` | Secret key for MinIO/S3 |
| `S3_BUCKET_NAME` | Bucket name for video storage |
| `NEXT_PUBLIC_API_URL` | Base URL of the API server (used by the frontend) |
| `CORS_ORIGIN` | Front‑end origin allowed by the API CORS policy |

### 3. Start infrastructure services
```bash
docker compose up -d postgres redis minio
```

### 4. Set up the database
```bash
npm run generate --workspace=packages/database
npm run db:push --workspace=packages/database
```

### 5. Run services (development)
```bash
# API Server
npm run dev:api

# Web Client
npm run dev:web

# Media Worker (Go)
cd apps/media-worker
go run src/main.go
```

Or run the whole stack with Docker:
```bash
docker compose up --build
```

---

## Deployment to AWS EC2

The repository includes a GitHub Actions workflow (`.github/workflows/deploy.yaml`) that builds Docker images, pushes them to Docker Hub, and deploys the stack on an EC2 instance.

### 1️⃣ Prepare GitHub Secrets
In **GitHub → Settings → Secrets & variables → Actions** create the following secrets (values must match your EC2 environment):

| Secret | Value |
|--------|-------|
| `SERVER_HOST` | Public IP or DNS of the EC2 instance |
| `SERVER_USER` | SSH user on the EC2 instance (e.g., `ubuntu`) |
| `SERVER_SSH_KEY` | Full private PEM key (including `BEGIN`/`END` lines) |
| `DOCKER_USERNAME` | Your Docker Hub username |
| `DOCKER_PASSWORD` | Your Docker Hub password/token |
| *(optional)* `CORS_ORIGIN`, `JWT_SECRET`, … | Any secret you prefer not to store in the EC2 `.env` |

### 2️⃣ Trigger a Deploy
Push a commit to `main` (or create a tag). The workflow will:
1. Build Docker images for `api-server`, `web-client`, and `media-worker`.
2. Push the images to Docker Hub.
3. SSH into the EC2 host using the supplied key.
4. Merge a generated `.env.docker` (with `DOCKER_USERNAME`) with the host’s existing `.env`.
5. Run `docker compose pull && docker compose up -d --remove-orphans`.
6. Wait a few seconds for PostgreSQL to become ready.
7. Execute `npx prisma db push` inside the `api-server` container to create any missing tables.

### 3️⃣ Verify the Deployment
After the workflow succeeds, the services are reachable at the EC2 public IP:

| Service | URL |
|---------|-----|
| Web client (UI) | `http://<SERVER_HOST>:3000` |
| API server | `http://<SERVER_HOST>:4000/api/v1/...` |
| MinIO console | `http://<SERVER_HOST>:9001` (default creds `minioadmin` / `minioadmin`) |

### 4️⃣ Debug / Logs (if needed)
```bash
ssh -i path/to/key.pem ${SERVER_USER}@${SERVER_HOST}
cd /home/ubuntu/vod-app
docker compose logs -f          # tail all container logs
docker compose ps                # view container status
docker exec -it <container> sh  # open a shell inside a container
```

### 5️⃣ Data Persistence
The `docker-compose.yml` defines **named volumes** (`postgres_data`, `redis_data`, `minio_data`). They reside on the EC2 host under `/var/lib/docker/volumes/` and survive container recreation. **Do not** run `docker compose down -v` unless you intentionally want to wipe the database, Redis cache, or uploaded videos.

### 6️⃣ Updating Environment Variables
Edit `/home/ubuntu/vod-app/.env` on the EC2 host and then either re‑run the Deploy workflow or simply restart the stack:
```bash
docker compose up -d --remove-orphans
```
The containers will pick up the new values without rebuilding images.

---

## Service Endpoints

| Service | URL | Notes |
|---------|-----|-------|
| Web Client | `http://localhost:3000` (dev) / `http://<SERVER_HOST>:3000` (prod) | Main UI and admin dashboard |
| API Server | `http://localhost:4000` (dev) / `http://<SERVER_HOST>:4000` (prod) | REST API + WebSocket |
| MinIO console | `http://localhost:9001` (dev) / `http://<SERVER_HOST>:9001` (prod) | Default credentials `minioadmin/minioadmin` |
| PostgreSQL | `localhost:5432` | DB name `vod_db`, user/password `postgres` |
| Redis | `localhost:6379` | Queue & pub/sub broker |

> The MinIO bucket and its CORS policy are automatically initialized by the API server on startup.


*End of README*
