<div align="center">

# 🚀 ContentHub CMS

### A Modern, Full-Featured Content Management System

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

<p align="center">
  <strong>A professional-grade CMS with an elegant admin panel, JWT authentication, and complete CRUD operations.</strong>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-api-documentation">API Docs</a> •
  <a href="#-screenshots">Screenshots</a>
</p>

</div>

---

## ✨ Features

### 🔐 Authentication & Security
- JWT-based authentication with refresh tokens
- Role-based access control (Admin, Editor, Author)
- Password hashing with bcrypt
- Rate limiting & helmet security headers
- CORS configuration

### 📝 Content Management
- **Posts** — Create, edit, publish, and archive articles with rich markdown editor
- **Categories** — Organize content with hierarchical categories
- **Media Library** — Upload and manage images and files
- **Users** — Full user management with role assignments

### 📊 Dashboard & Analytics
- Real-time content statistics
- Interactive charts (posts over time, category distribution)
- Recent activity feed
- Quick action shortcuts

### 🎨 Modern UI/UX
- Clean, professional admin interface
- Dark/Light theme toggle
- Fully responsive design
- Smooth animations and transitions
- Toast notifications
- Confirmation dialogs
- Data tables with search, sort, and pagination

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 18** | UI Library |
| **TypeScript** | Type Safety |
| **Vite** | Build Tool |
| **React Router v6** | Client-side Routing |
| **Recharts** | Data Visualization |
| **Axios** | HTTP Client |
| **Lucide React** | Icon Library |
| **Marked** | Markdown Parsing |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Node.js** | Runtime |
| **Express** | Web Framework |
| **TypeScript** | Type Safety |
| **better-sqlite3** | Database |
| **JWT** | Authentication |
| **Multer** | File Uploads |
| **Helmet** | Security |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT (React + TS)                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│  │   Auth   │ │Dashboard │ │  Posts   │ │  Categories  │   │
│  │  Context  │ │  Charts  │ │   CRUD   │ │    CRUD      │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│  │  Media   │ │  Users   │ │ Settings │ │  Components  │   │
│  │ Library  │ │   CRUD   │ │   Page   │ │   Library    │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │
└─────────────────────────┬───────────────────────────────────┘
                          │ REST API (Axios)
┌─────────────────────────┴───────────────────────────────────┐
│                     SERVER (Express + TS)                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│  │  Routes  │ │  Auth    │ │  Error   │ │  Validation  │   │
│  │          │ │Middleware│ │ Handler  │ │  Middleware   │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                    │
│  │Controllers│ │  Utils  │ │  Config  │                    │
│  └──────────┘ └──────────┘ └──────────┘                    │
└─────────────────────────┬───────────────────────────────────┘
                          │ SQL Queries
┌─────────────────────────┴───────────────────────────────────┐
│                    DATABASE (SQLite)                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│  │  Users   │ │  Posts   │ │Categories│ │    Media     │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** >= 18.x
- **npm** >= 9.x

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/contenthub-cms.git
cd contenthub-cms

# Install all dependencies
npm run install:all

# Set up environment variables
cp .env.example .env

# Seed the database with sample data
cd server && npm run seed && cd ..

# Start the development servers
npm run dev
```

### Default Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@contenthub.com | admin123 |
| Editor | editor@contenthub.com | editor123 |

The client runs on `http://localhost:5173` and the API on `http://localhost:3001`.

---

## 📡 API Documentation

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/register` | User registration |
| GET | `/api/auth/me` | Get current user |

### Posts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts` | List all posts |
| GET | `/api/posts/:id` | Get single post |
| POST | `/api/posts` | Create post |
| PUT | `/api/posts/:id` | Update post |
| DELETE | `/api/posts/:id` | Delete post |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | List all categories |
| GET | `/api/categories/:id` | Get single category |
| POST | `/api/categories` | Create category |
| PUT | `/api/categories/:id` | Update category |
| DELETE | `/api/categories/:id` | Delete category |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users |
| GET | `/api/users/:id` | Get single user |
| POST | `/api/users` | Create user |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |

### Media
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/media` | List all media |
| POST | `/api/media/upload` | Upload file |
| DELETE | `/api/media/:id` | Delete media |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Get dashboard statistics |

---

## 📁 Project Structure

```
contenthub-cms/
├── 📁 .github/workflows/    # CI/CD pipeline
├── 📁 server/                # Backend API
│   ├── 📁 src/
│   │   ├── 📁 config/       # Database & seed
│   │   ├── 📁 controllers/  # Request handlers
│   │   ├── 📁 middleware/    # Auth, validation, errors
│   │   ├── 📁 routes/       # API routes
│   │   └── 📁 utils/        # Helpers & JWT
│   └── 📁 uploads/          # Media storage
├── 📁 client/                # Frontend SPA
│   ├── 📁 src/
│   │   ├── 📁 api/          # Axios configuration
│   │   ├── 📁 components/   # Reusable UI components
│   │   ├── 📁 contexts/     # React contexts
│   │   ├── 📁 hooks/        # Custom hooks
│   │   ├── 📁 layouts/      # Page layouts
│   │   ├── 📁 pages/        # Route pages
│   │   └── 📁 styles/       # Global styles
│   └── 📄 index.html
├── 📄 docker-compose.yml
├── 📄 Dockerfile
└── 📄 README.md
```

---

## 🐳 Docker

```bash
# Build and run with Docker Compose
docker-compose up --build

# The app will be available at http://localhost:3001
```

---

## 🧪 Development

```bash
# Run the full stack in development mode
npm run dev

# Run only the backend
npm run dev:server

# Run only the frontend
npm run dev:client

# Build for production
npm run build

# Run linting
npm run lint
```

---

## 📜 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ using React, TypeScript, and Node.js**

</div>
