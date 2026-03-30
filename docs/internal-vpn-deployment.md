# Internal VPN Deployment with Tailscale

This runbook deploys Excalibur ERP as a private same-origin application on an always-on office host. The host runs Docker locally and is reachable only through Tailscale.

## Target topology
- Host OS: Linux on a dedicated office PC, mini PC, or stable VM host
- Private access only: Tailscale tailnet
- App topology:
  - `db`: PostgreSQL in Docker
  - `app`: Django + built frontend from the root `Dockerfile`
- Public exposure: none
- Private URL: `https://erp-host.<tailnet>.ts.net`

## Files used
- `docker-compose.internal.yml`
- `backend/.env.internal`
- `scripts/backup_postgres_internal.sh`
- `scripts/restore_postgres_internal.sh`
- `docs/tailscale-grants.example.hujson`

## 1. Prepare the office host
Install these prerequisites on the Linux host:
- Docker Engine
- Docker Compose plugin
- Tailscale

The host must stay powered on and have stable local storage for the Postgres volume.

## 2. Prepare the internal environment file
Copy the template and replace all placeholder values:

```bash
cp backend/.env.internal.example backend/.env.internal
```

Minimum values to replace:
- `POSTGRES_PASSWORD`
- `DJANGO_SECRET_KEY`
- `DJANGO_ALLOWED_HOSTS`
- `CSRF_TRUSTED_ORIGINS`
- `DJANGO_ADMIN_URL`

Keep these values aligned:
- `POSTGRES_DB` <-> `DB_NAME`
- `POSTGRES_USER` <-> `DB_USER`
- `POSTGRES_PASSWORD` <-> `DB_PASSWORD`

For the first deployment, keep:
- `DB_HOST=db`
- `DB_PORT=5432`
- `DJANGO_SERVE_FRONTEND=1`
- `CORS_ALLOWED_ORIGINS=` empty

## 3. Start the private same-origin stack
From the repo root:

```bash
docker compose -f docker-compose.internal.yml up -d --build
```

This stack:
- keeps Postgres private inside Docker
- binds the ERP app only to `127.0.0.1:10000` on the host
- does not expose the database on any host port

Verify containers:

```bash
docker compose -f docker-compose.internal.yml ps
```

Verify the app locally on the host:

```bash
curl http://127.0.0.1:10000/api/auth/csrf/
```

## 4. Join the host to Tailscale
Install and sign in the host to the company tailnet.

Recommended host naming:
- `erp-host`

Recommended policy model:
- create a group for approved ERP users
- tag the host as `tag:erp-host`
- grant only `group:erp-users` access to TCP 443 on the ERP host

Use `docs/tailscale-grants.example.hujson` as the starting point for the tailnet policy.

Enable these features in Tailscale admin:
- MagicDNS
- HTTPS certificates / Serve support for the tailnet

## 5. Publish the ERP privately inside the tailnet
Once the stack is healthy, publish the localhost app privately to the tailnet:

```bash
sudo tailscale serve --bg 10000
```

This publishes the local app on the host's tailnet HTTPS URL.

Expected URL shape:
- `https://erp-host.<tailnet>.ts.net`

Do not enable Funnel. Funnel would expose the service publicly, which is explicitly out of scope for this deployment.

## 6. First-time bootstrap
Create the first Django superuser inside the app container:

```bash
docker compose -f docker-compose.internal.yml exec app python manage.py createsuperuser
```

Then bootstrap initial business data from the Django admin:
- countries
- product `Espuelas plasticas`
- product variants
- initial production stock movements

## 7. Backup and restore
Create a compressed Postgres backup:

```bash
./scripts/backup_postgres_internal.sh
```

Restore a backup into the running internal database:

```bash
./scripts/restore_postgres_internal.sh backups/<file>.dump --yes
```

Recommended backup policy:
- daily scheduled backup on the host
- retain at least 7 daily copies and 4 weekly copies
- copy backups off the host periodically

## 8. Cutover checklist
Before pilot rollout, verify:
- host reboots and Docker comes back automatically
- Tailscale reconnects after reboot
- `https://erp-host.<tailnet>.ts.net` works from an approved device
- the ERP is not reachable from public internet
- login, admin, customer/order/inventory/expense flows all work end to end

## 9. Rollback position
Keep the current Render deployment alive only as a temporary fallback while validating the private host.

Once the private deployment is stable:
- stop using the public Render deployment for daily work
- keep only the private Tailscale path as the primary environment
