# QuickBite Ordering Platform — Distributed Systems Documentation

> **Purpose:** Academic / technical presentation material for a distributed systems course.  
> **Projects covered:** `coring-services` (Core) + `ordering-service` (Order) + `ordering-app-frontend`  
> **Last updated:** July 2026

---

## What This Platform Demonstrates

QuickBite is a multi-tenant food ordering platform split into **microservices** with shared infrastructure. It implements real distributed-systems patterns — not only in theory, but in runnable code.

| DS Concept | Where It Lives | Status |
|------------|----------------|--------|
| **Service decomposition** | Core vs Order split | ✅ Implemented |
| **Sync inter-service HTTP** | Internal API + API key | ✅ Implemented |
| **Event-driven architecture** | RabbitMQ + transactional outbox | ⚡ Partial (Order side ready; Core publisher missing) |
| **Geographic sharding** | Order DB per country (`eg`, `ksa`) | ✅ Implemented |
| **Table partitioning** | `orders` partitioned by month | ✅ Implemented |
| **Distributed caching** | Redis (HTTP cache, read-through, presence, WS fan-out) | ✅ Implemented |
| **Idempotency** | Redis-backed dedup keys | ✅ Implemented |
| **Pessimistic concurrency** | Stock `SELECT FOR UPDATE` | ✅ Implemented |
| **Cursor pagination** | Scalable list APIs | ✅ Implemented |
| **Multi-tenant RBAC** | Restaurant-scoped permissions | ✅ Implemented |
| **Real-time push** | Socket.IO + Redis adapter | ✅ Implemented (Order) |
| **Read replicas** | Postgres replica routing | 📋 Planned |
| **Cold archival cluster** | Archive shards + worker | 📋 Scaffold only |
| **Core event publisher** | `core.events` exchange | 📋 Planned |

---

## Documentation Index

| # | Document | Use For |
|---|----------|---------|
| 1 | [Architecture Overview](./01-architecture-overview.md) | System context diagram, tech stack, request flows |
| 2 | [Service Boundaries](./02-service-boundaries.md) | Why two services, ownership matrix, integration model |
| 3 | [API Endpoints Catalog](./03-api-endpoints-catalog.md) | Full REST surface — public, internal, WebSocket |
| 4 | [Caching Strategy](./04-caching-strategy.md) | Redis layers, cache keys, invalidation, trade-offs |
| 5 | [Database: Sharding, Partitioning, Replication](./05-database-sharding-partitioning-replication.md) | Country shards, monthly partitions, archive cluster |
| 6 | [Message Broker & Event-Driven Design](./06-message-broker-event-driven.md) | RabbitMQ, outbox pattern, inbound/outbound events |
| 7 | [Async Processing & Consistency](./07-async-processing-consistency.md) | Workers, stock reserve, assignment, failure modes |
| 8 | [Observability & Fault Tolerance](./08-observability-fault-tolerance.md) | Health checks, correlation IDs, degradation |
| 9 | [Presentation Slides Outline](./09-presentation-slides-outline.md) | Ready-to-convert slide deck with talking points |

---

## Repository Layout

```
ordering-app/
├── coring-services/          # Core Service  — port 5000 (catalog, auth, cart, RBAC)
├── ordering-service/         # Order Service  — port 4000 (orders, payments, delivery)
├── ordering-app-frontend/    # React SPA      — port 3000
└── docs/
    └── distributed-systems/  # ← this documentation set
```

---

## Quick Demo Flow (For Live Presentation)

1. **Customer browses menu** → Frontend → Core `/api/products`, `/api/restaurants/nearby`
2. **Nearby branches cached** → Core Redis `GET:/api/branches/nearby?...` → `X-Cache: HIT`
3. **Customer places order** → Frontend → Order `POST /api/orders` with `X-Region: eg`
4. **Stock reserved synchronously** → Order → Core `POST /api/internal/branches/:id/reserve-stock`
5. **Order persisted** → Order Postgres shard `eg`, partitioned `orders` table
6. **Outbox event written** → Same DB transaction as order insert
7. **Worker drains outbox** → RabbitMQ `order.events` exchange
8. **Restaurant sees order** → WebSocket `order.created` via Redis pub/sub adapter
9. **Agent assigned** → Assignment worker tick → geo match in Redis → `task.offered`
10. **Payment webhook** → Kashier async callback → idempotent DB update

---

## Honest Gaps (Important for Academic Integrity)

Present these as **roadmap items**, not as implemented features:

- Core service does **not yet publish** to `core.events` (Order consumer is ready and waiting)
- Read replicas are **designed but not wired**
- Archive worker for cold storage is **commented out**
- Idempotency is **Redis-only** (no Postgres durability fallback)
- Permission cache on Core is **in-process** (not shared across replicas)
- Analytics on Core returns **stub/mock metrics**

---

## Recommended Presentation Structure (45–60 min)

1. **Problem & domain** (5 min) — multi-restaurant ordering at scale
2. **Architecture** (10 min) — two services, shared infra diagram
3. **Sharding & partitioning** (10 min) — why country shard + monthly partitions
4. **Caching & performance** (8 min) — Redis multi-role usage
5. **Events & async** (10 min) — outbox, RabbitMQ, workers
6. **Consistency & failure** (7 min) — stock lock, idempotency, degradation
7. **Demo + Q&A** (10 min) — live API calls with `X-Cache` and `X-Region` headers

See [09-presentation-slides-outline.md](./09-presentation-slides-outline.md) for slide-by-slide content.
