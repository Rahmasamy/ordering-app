# 02 — Service Boundaries

## Why Two Services?

The platform splits **catalog/read plane** (Core) from **transaction/write plane** (Order). This is a classic distributed systems decomposition driven by **different non-functional requirements**.

| Dimension | Core Service | Order Service |
|-----------|-------------|---------------|
| **Read/write ratio** | Read-heavy (browse menus, search) | Write-heavy (checkout, status updates) |
| **Data sensitivity** | Public catalog + user profiles | Money, payments, commissions |
| **Scaling driver** | Global product catalog | Per-country order volume |
| **Failure impact** | Menu unavailable | Checkout broken = revenue loss |
| **Consistency needs** | Eventual OK for cache | Strong for money + inventory |
| **Real-time** | Not required | WebSocket for live order tracking |

---

## Ownership Matrix

### Core Service Owns (`coring-services`)

| Domain | Tables / Modules | Why Here |
|--------|------------------|----------|
| Users & authentication | `users`, auth module | Single identity provider |
| JWT issuance | Auth service | All services verify same secret |
| Restaurants & branches | `restaurants`, `restaurant_branches` | Global catalog, geospatial index |
| Products & categories | `products`, `product_categories`, `product_branch_details` | Source of truth for menu + stock |
| Cart | `carts`, `cart_items` | Pre-checkout state (customer session) |
| RBAC catalog | `roles`, `permissions`, `restaurant_members` | Permission definitions |
| Customer addresses | `customer_addresses` | Shared across services |
| Offers & content | `offers`, `product_stories`, `ingredients`, `testimonials` | Marketing/catalog enrichment |
| Analytics (stub) | `activity_logs` | Read-side metrics (partial) |

### Order Service Owns (`ordering-service`)

| Domain | Tables / Modules | Why Here |
|--------|------------------|----------|
| Orders | `orders` (partitioned), `order_items` | High-write, region-local |
| Payments | `payment_sessions`, `transactions`, `payment_webhook_events` | Money isolation |
| Restaurant finance | `restaurant_balances`, payouts | Ledger per region |
| Agent earnings | `agent_earnings`, settlement | Delivery money flow |
| Delivery state | Columns on `orders` (no separate deliveries table) | Simpler state machine |
| Event outbox | `events_outbox` | Reliable outbound messaging |
| Agent presence | Redis geo sets | Real-time, ephemeral |
| WebSocket | Socket.IO server | Push to all client apps |

### Frontend Owns

| Concern | Location |
|---------|----------|
| UI/UX | `ordering-app-frontend/src/modules/` |
| Client-side auth state | Zustand `auth.store.ts` |
| API integration | `shared/api/*.service.ts` |
| Region header injection | `order-client.ts` → `X-Region` |

---

## Integration Patterns

### 1. Synchronous HTTP (Implemented)

Order calls Core on the **critical path** for data it does not own:

```
Order Service                          Core Service
     │                                      │
     │  GET /api/internal/branches/:id      │
     │ ────────────────────────────────────►│
     │  { id, lat, lng, restaurantId, ... } │
     │ ◄────────────────────────────────────│
     │                                      │
     │  POST .../reserve-stock              │
     │  { items, idempotencyKey: publicId } │
     │ ────────────────────────────────────►│
     │  { reserved: true }                  │
     │ ◄────────────────────────────────────│
```

**Auth:** `api-key` header must match `INTERNAL_API_KEY` on both sides.

**Files:**
- Core internal routes: `coring-services/src/app/*/routes.internal.ts`
- Order clients: `ordering-service/src/lib/core-client/*.client.ts`

### 2. Asynchronous Events (Partial)

```
Core Service                    RabbitMQ                 Order Service
     │                     core.events                      │
     │  (NOT YET) ────────► exchange ────────────────────►│ consumer
     │  product.stock.changed                              │ → invalidate Redis cache
     │  branch.updated                                     │
     │  rbac.permissions_changed                           │
     │                                                       │
     │                     order.events                      │
     │ ◄──────────────────── exchange ◄── outbox drain ─────│
     │  (future analytics consumer)                        │
```

**Status:** Order side is **fully implemented** (consumer + outbox publisher). Core side **does not publish yet** — this is the main integration gap.

### 3. Shared Authentication

- Core **issues** JWT access + refresh tokens (httpOnly cookies)
- Order **verifies** tokens using the same `ACCESS_SECRET`
- JWT payload includes: `userId`, `role`, `restaurantId`, `restaurantRole`, `branchIds`
- Frontend sends cookies to both services (`withCredentials: true`)

### 4. Region Routing

- Order DB shard selected by **`X-Region` HTTP header** (`eg`, `ksa`)
- Not embedded in JWT (allows admin cross-region reads with `X-Region: all`)
- Frontend order client sets region from user preference or geo

---

## Multi-Tenancy Model

**Tenant = Restaurant.** Enforced at multiple layers:

| Layer | Mechanism |
|-------|-----------|
| Database | `restaurant_id` FK on most Core tables |
| JWT | `restaurantId`, `restaurantRole`, `branchIds` claims |
| Middleware | `requireRestaurantMember('restaurantId')` |
| RBAC | Permission strings like `core:product:update` |
| Order | `restaurant_id` on every order row (snapshot) |

This is **application-level multi-tenancy** (shared schema, row-level isolation) — not schema-per-tenant or database-per-tenant.

---

## Data That Crosses Boundaries

At order placement, Order **snapshots** Core data into its own DB:

| Core Field | Order Snapshot Column | Why Snapshot |
|------------|----------------------|--------------|
| Branch lat/lng | `branch_lat`, `branch_lng` | Assignment worker never calls Core on hot path |
| Address text | `delivery_address_text_snapshot` | Address may be edited later |
| Product name/price | `order_items.name`, `order_items.unit_price` | Price changes don't affect past orders |
| Restaurant owner | `restaurant_owner_id` | Finance ledger needs stable owner ref |

This is the **Snapshot / Event Carried State Transfer** pattern — Order becomes autonomous after placement.

---

## Failure Domain Isolation

| Failure | Core Down | Order Down | Redis Down | RabbitMQ Down |
|---------|-----------|------------|------------|---------------|
| Browse menu | ❌ Broken | ✅ OK | ⚠️ Slower (no cache) | ✅ OK |
| Place order | ⚠️ Degraded (cache hit only) | ❌ Broken | ⚠️ No idempotency/WS fan-out | ✅ OK (sync path works) |
| Track order (WS) | ✅ OK | ❌ Broken | ❌ WS multi-instance breaks | ✅ OK |
| Cache invalidation | N/A | ⚠️ Stale cache until TTL | N/A | ❌ Events queue up |

---

## Presentation Talking Point

> "We decomposed by **business capability** and **consistency boundary**, not by CRUD entity. Stock reservation must be synchronous because we need immediate feedback at checkout. Cache invalidation can be asynchronous because stale menu data for 60 seconds is acceptable. Money movements must be transactional within the Order shard."
