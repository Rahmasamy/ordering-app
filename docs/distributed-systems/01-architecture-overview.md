# 01 — Architecture Overview

## System Context

QuickBite is a **distributed food ordering platform** with four client personas and two backend microservices.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CLIENT APPLICATIONS                                │
│  Customer App │ Restaurant Dashboard │ Delivery App │ Admin Dashboard       │
└───────┬───────────────┬────────────────────┬───────────────┬─────────────────┘
        │               │                    │               │
        │  REST + JWT   │  REST + JWT        │  REST + WS    │  REST + WS
        │  (Core :5000) │  (Core + Order)    │  (Order :4000)│  (Order)
        ▼               ▼                    ▼               ▼
┌───────────────────┐              ┌──────────────────────────────────────────┐
│   CORE-SERVICE    │  sync HTTP   │           ORDER-SERVICE                   │
│  (coring-services)│◄────────────►│         (ordering-service)                │
│                   │  api-key     │                                           │
│  • Auth / Users   │              │  • Orders lifecycle                       │
│  • Restaurants    │              │  • Payments (Kashier)                     │
│  • Branches       │              │  • Delivery assignment                    │
│  • Products/Stock │              │  • Restaurant finance ledger              │
│  • Cart           │              │  • Real-time WebSocket                    │
│  • RBAC           │              │  • Agent presence (geo)                   │
│  • Offers/Content │              │                                           │
└─────────┬─────────┘              └───────┬──────────────┬──────────┬─────────┘
          │                                │              │          │
          ▼                                ▼              ▼          ▼
   ┌─────────────┐              ┌──────────────┐  ┌──────────┐  ┌─────────┐
   │  Postgres   │              │ Postgres EG  │  │ Postgres │  │ RabbitMQ│
   │  (single)   │              │ Postgres KSA │  │ Archive  │  │         │
   └─────────────┘              └──────────────┘  └──────────┘  └─────────┘
          │                                │              │
          └──────────── Redis ─────────────┴──────────────┘
                    (cache, idempotency, WS fan-out, geo, presence)
```

---

## Technology Stack

| Layer | Core Service | Order Service | Frontend |
|-------|-------------|---------------|----------|
| Runtime | Node.js + TypeScript | Node.js + TypeScript | React 19 + Vite |
| HTTP | Express 5 | Express 5 | react-router-dom v7 |
| Database | PostgreSQL (Knex) | PostgreSQL sharded (Knex) | — |
| Cache | Redis (ioredis) | Redis (ioredis) | — |
| Messaging | — | RabbitMQ (amqp) | — |
| Real-time | — | Socket.IO + Redis adapter | Socket.IO client |
| DI | tsyringe | tsyringe | Zustand (auth only) |
| Auth | JWT in httpOnly cookies | Shared JWT verification | Cookie credentials |

---

## Deployment Topology (Logical)

```
                    ┌─────────────────┐
                    │  Load Balancer  │
                    └────────┬────────┘
           ┌─────────────────┼─────────────────┐
           ▼                 ▼                 ▼
    ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
    │ Core API #1 │   │ Core API #2 │   │ Core API #N │   ← stateless, horizontal scale
    └──────┬──────┘   └──────┬──────┘   └──────┬──────┘
           │                 │                 │
           └─────────────────┼─────────────────┘
                             ▼
                    ┌─────────────────┐
                    │  Postgres Core  │   ← single cluster (global catalog)
                    └─────────────────┘

    ┌─────────────┐   ┌─────────────┐         ┌──────────────┐
    │ Order API   │   │ Order API   │         │ Order Worker │   ← separate process
    │  (region EG)│   │  (region KSA)│         │ (cron jobs)  │
    └──────┬──────┘   └──────┬──────┘         └──────┬───────┘
           │                 │                       │
           ▼                 ▼                       ▼
    ┌─────────────┐   ┌─────────────┐         RabbitMQ + Redis
    │ Postgres EG │   │ Postgres KSA│
    │ (partitioned)│  │ (partitioned)│
    └─────────────┘   └─────────────┘
```

**Key insight:** Core is a **modular monolith** (one DB, many domains). Order is a **region-sharded microservice** (one DB cluster per country, partitioned tables).

---

## Request Flow: Place Order (End-to-End)

```
Customer App
    │
    │ POST /api/orders  (X-Region: eg, JWT cookie)
    ▼
Order Service
    │
    ├─► [1] Resolve region → db("eg") shard router
    │
    ├─► [2] GET branch metadata
    │       └─► Redis cache miss → Core GET /api/internal/branches/:id
    │
    ├─► [3] GET customer address snapshot
    │       └─► Core GET /api/customer/addresses/internal/:id
    │
    ├─► [4] GET product prices/stock
    │       └─► Redis cache → Core GET /api/internal/branches/:id/products?ids=
    │
    ├─► [5] RESERVE STOCK (sync, critical path)
    │       └─► Core POST /api/internal/branches/:id/reserve-stock
    │           └─► Postgres FOR UPDATE on product_branch_details
    │
    ├─► [6] DB TRANSACTION (orders shard eg)
    │       ├─ INSERT orders (monthly partition)
    │       ├─ INSERT order_items
    │       └─ INSERT events_outbox (same trx)
    │
    ├─► [7] Init payment (online) → Kashier API
    │
    └─► [8] WebSocket emit order.created → Redis pub/sub → all Order API instances

Worker (async, every 2s)
    └─► Drain events_outbox → RabbitMQ order.events

Worker (async, every 10s)
    └─► Assignment tick → geo-match agents → task.offered via WebSocket
```

---

## Layered Architecture (Both Services)

Both services follow the same **clean layered pattern**:

```
routes.ts          → HTTP routing + middleware (auth, cache, RBAC)
    ↓
controller/        → Request validation, response formatting (@injectable)
    ↓
service/           → Business logic, orchestration
    ↓
repository/        → Knex queries, row → entity mapping
    ↓
entity/ + dto/     → Domain models + class-validator DTOs
```

Dependency injection via **tsyringe** (`src/lib/di/container.ts`).

---

## DS Concepts Mapped to Code

| Concept | Implementation |
|---------|----------------|
| **Microservices** | `coring-services` + `ordering-service` separate deployables |
| **API Gateway pattern** | Frontend talks to two base URLs; future gateway can unify |
| **BFF / Internal API** | Core `/api/internal/*` for service-to-service only |
| **Shared-nothing** | Stateless API instances; state in Postgres + Redis |
| **Data denormalization** | Order snapshots branch/address/product at placement time |
| **Eventual consistency** | Cache invalidation via RabbitMQ (when Core publishes) |
| **Strong consistency** | Stock reserve in same transaction as inventory check |
| **CQRS-lite** | Core = read-heavy catalog; Order = write-heavy transactions |

---

## File References

| Component | Path |
|-----------|------|
| Core route aggregator | `coring-services/src/routes.ts` |
| Order route aggregator | `ordering-service/src/routes.ts` |
| Core server bootstrap | `coring-services/src/server.ts` |
| Order server + WS + AMQP consumer | `ordering-service/src/server.ts` |
| Order worker process | `ordering-service/src/worker.ts` |
| Region shard router | `ordering-service/src/lib/knex/shards.ts` |
| Core HTTP client (Order → Core) | `ordering-service/src/lib/core-client/core-client.ts` |
| Frontend dual API clients | `ordering-app-frontend/src/shared/api/api-client.ts`, `order-client.ts` |
