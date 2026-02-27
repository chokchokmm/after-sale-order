# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an after-sales ticket management system (售后工单管理系统) designed as a data foundation for future AI integration. It consists of a FastAPI backend with MongoDB and a React frontend with Ant Design.

## Development Commands

### Backend (from `/backend`)

```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment configuration
cp .env.example .env

# Run development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run tests
pytest
```

API documentation available at http://localhost:8000/docs when server is running.

### Frontend (from `/frontend`)

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint
```

Frontend available at http://localhost:5173 when server is running.

### Infrastructure

```bash
# Start all services (MongoDB, Milvus, MinIO, etcd)
docker-compose up -d

# Stop all services
docker-compose down
```

## Architecture

### Backend Structure

- `app/main.py` - FastAPI application entry point, CORS config, router registration
- `app/config.py` - Pydantic Settings for environment configuration (MongoDB, Zhipu AI, Milvus)
- `app/database.py` - Motor (async MongoDB) connection management
- `app/models/` - Pydantic models for domain entities (Ticket, User)
- `app/schemas/` - Request/Response schemas for API layer
- `app/api/` - FastAPI routers (tickets, users)
- `app/services/` - Business logic layer:
  - `ticket_service.py` - Ticket CRUD, statistics, ID generation (format: AS-YYYYMMDD-XX)
  - `ai_service.py` - Zhipu AI integration for embeddings, similar ticket search (via Milvus), tag generation, handling recommendations

### Frontend Structure

- React 19 + Vite + TypeScript + Ant Design + ECharts
- `src/api/client.ts` - Axios instance with base URL from `VITE_API_BASE_URL` env var
- `src/api/tickets.ts` - Ticket API calls
- `src/pages/` - Route pages (Dashboard, TicketList, TicketForm, TicketDetail)
- `src/types/ticket.ts` - TypeScript interfaces matching backend models

### Key Domain Concepts

**Ticket System:**
- System sources: TMS, OMS, WMS
- Categories: TICKET_PROCESS, SYSTEM_FAILURE, COST_OPTIMIZATION
- Handle types: PRODUCT, DEV, PRODUCT_DEV
- Priorities: P0 (系统崩溃，功能失效), P1 (阻塞型BUG), P2 (非主流程BUG), P3 (优化问题)
- Statuses: OPEN, PROCESSING, COMPLETED
- Custom ID format: `AS-YYYYMMDD-XX` (auto-generated daily sequence)

**AI Features:**
- Embeddings stored in Milvus vector database using Zhipu AI's embedding-3 model
- Similar ticket search via cosine similarity in Milvus
- Tag generation and handling recommendations via Zhipu AI's GLM-4-flash model

### Infrastructure Dependencies

- MongoDB 7.0 - Primary database
- Milvus - Vector database for ticket embeddings (depends on etcd + MinIO)
- All configured via docker-compose.yml

## Active Technologies
- TypeScript 5.x + React 19 + React Router v6, Ant Design 5.x (001-simple-login)
- localStorage (浏览器本地存储) (001-simple-login)
- TypeScript 5.x / React 19 + Ant Design 5.x, ECharts, Vite (002-tech-dashboard)
- N/A (frontend-only styling changes) (002-tech-dashboard)

## Recent Changes
- 001-simple-login: Added TypeScript 5.x + React 19 + React Router v6, Ant Design 5.x
