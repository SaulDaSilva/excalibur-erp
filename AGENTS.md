# Excalibur ERP V2 — Agent Instructions (Codex + Contributors)

## Project Summary
- Internal ERP (<10 users)
- Backend: Django + DRF
- DB: PostgreSQL via Docker
- Frontend (Phase 6+): React (Vite) — but **no React work until APIs are stable**
- Auth: **Session (cookie-based) + CSRF** (internal app, no JWT)

## Core Rules (Non-Negotiable)
1) **Models first.** No UI templates. No legacy views. No React until Phase 6.
2) Keep business logic in **models/services**, NOT in DRF views.
3) Use Postgres via Docker. Use `.env` files. **Never commit secrets**.
4) **Protect all API endpoints** except:
   - `/api/auth/csrf/`
   - `/api/auth/login/`
5) API structure must remain modular:
   - `/api/auth/*`
   - `/api/dashboard/`
   - `/api/clientes/*`
   - `/api/pedidos/*`
   - `/api/inventario/*`

## Repo Layout (Monorepo)
ERP_V2/
- backend/
  - apps/
    - core/
    - users/
    - api_auth/
    - clientes/
    - catalogo/
    - pedidos/
    - inventario/
  - config/
- frontend/ (Phase 6)

## Django App Import Conventions
- Always import using `apps.*` namespace.
  - ✅ `from apps.clientes.models import Customer`
  - ❌ `from clientes.models import Customer`
- Avoid circular imports across apps.
- Cross-app workflow coordination belongs in `services.py` (not models, not views).

## Domain Boundaries
### Models
- Data structures + constraints + indexes
- `clean()` invariants (e.g., address belongs to customer)
- Simple computed helpers (totals, counts)
- **No** workflow orchestration across apps
- **No** `transaction.atomic` on model methods

### Services (`apps/<app>/services.py`)
- Use cases/workflows (dispatch/cancel order, stock checks, adjustments)
- Own `transaction.atomic` boundaries
- Call other app services (not other app models directly) when possible
- Implement idempotency rules (e.g., prevent double-dispatch)

### DRF Views
- Thin controllers only:
  - parse/validate request
  - call service
  - serialize response
- **No business rules** here

## Auth / Security Conventions
- DRF uses `SessionAuthentication` only.
- CSRF required for unsafe methods.
- Default permission: `IsAuthenticated`.
- Only csrf + login endpoints allow unauthenticated access.
- Never store secrets in repo (Django SECRET_KEY, DB passwords, etc).

## Data Integrity Rules
- Soft delete only for business entities (e.g., Customer/Product).
- Do NOT soft delete Users (use Django’s `is_active`).
- Inventory is a movement ledger (append-only):
  - Stock = SUM(quantity_pairs) per variant
  - Dispatch creates negative SALE/PROMO movements
  - Cancel creates REVERSAL_* movements
- Keep inventory rules in `apps/inventario/services.py`.

## Coding Standards
- Python 3.12
- Keep functions small and explicit.
- Prefer explicit typing where it improves clarity (services, DTOs).
- Don’t use floats for money. Use `Decimal`.
- Avoid premature optimization; optimize when slow.

## Testing Expectations (MVP)
- Manual admin sanity checks are required after model changes:
  - Create customers, addresses
  - Create products/variants
  - Seed production stock
  - Dispatch order → stock decreases
  - Cancel order → stock restored via reversal
- Add automated tests later once APIs are stable.

## When Using Codex
- Always follow this file.
- Keep changes scoped: one phase / one module at a time.
- Do not introduce new libraries without explicit instruction.
- Do not build React UI until Phase 6.
- Prefer making small PR-sized changes:
  - update models
  - run migrations
  - run `python manage.py check`
  - run admin sanity steps

## Current Phase
- Phase 2: DRF session auth endpoints (`csrf`, `login`, `me`, `logout`)