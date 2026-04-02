# 🎬 VOD Platform - Video on Demand


## 📁 Cấu trúc dự án

```
├── apps/
│   ├── web-client/       # Frontend (Next.js)
│   ├── api-server/       # Backend API (NestJS)
│   └── media-worker/     # FFmpeg Transcoder
├── packages/
│   ├── database/         # Prisma Schema & Migrations
│   ├── shared-types/     # TypeScript Interfaces/DTOs
│   └── ui-kit/           # Design System (tùy chọn)
├── infrastructure/       # Docker, Terraform, Scripts
└── .github/workflows/    # CI/CD Pipelines
```

## 👥 Phân chia công việc

| Vai trò           | Phụ trách                          | Thư mục chính                 |
| ----------------- | ---------------------------------- | ----------------------------- |
| PM/DevOps         | Docker, CI/CD, Infrastructure      | `infrastructure/`, `.github/` |
| Backend Lead      | API Design, Auth, Business Logic   | `apps/api-server/`            |
| Media Engineer    | FFmpeg, HLS Transcoding            | `apps/media-worker/`          |
| Frontend Lead     | UI/UX, State Management            | `apps/web-client/`            |
| Data/Fullstack    | Database, Migrations, Analytics    | `packages/database/`          |

## 🔗 Endpoints mặc định

| Service        | URL                          |
| -------------- | ---------------------------- |
| Web Client     | http://localhost:3000        |
| API Server     | http://localhost:4000        |
| MinIO Console  | http://localhost:9001        |
| PostgreSQL     | localhost:5432               |
| Redis          | localhost:6379               |

## 📝 Quy ước Git

- **Branch naming**: `feature/<tên-tính-năng>`, `fix/<tên-bug>`, `hotfix/<tên-hotfix>`
- **Commit message**: Sử dụng [Conventional Commits](https://www.conventionalcommits.org/)
  - `feat:` Tính năng mới
  - `fix:` Sửa lỗi
  - `docs:` Tài liệu
  - `refactor:` Tái cấu trúc code
  - `chore:` Công việc bảo trì
