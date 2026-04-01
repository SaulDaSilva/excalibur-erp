# Development Workflow with a Private VM Deployment

Use the VM as the private runtime environment, not as your primary development environment.

## Recommended workflow

### 1. Develop on your main machine
Keep feature development on your normal workstation where you already have:
- the repo
- editor/IDE
- Git
- local Docker or local database setup
- faster edit/run/test loops

Do not use the production-like VM as your primary coding box unless you are blocked.

### 2. Use a branch per change
For each new feature or fix:
- create a branch
- make the change locally
- run the relevant checks locally
- commit the change
- push the branch
- merge only when it is stable

### 3. Keep local development simple
Use the current local development flow for actual coding:
- local Postgres via Docker
- Django backend locally
- Vite frontend locally

That gives you much faster iteration than rebuilding the VM deployment on every small change.

### 4. Treat the VM like staging/private production
Use the VM for:
- validating the integrated Docker deployment
- checking login/session behavior over Tailscale
- smoke-testing real business flows
- verifying the private host still comes up cleanly after changes

### 5. Deploy to the VM deliberately
After a feature is merged or ready to validate:

```bash
cd ~/excalibur-erp
git pull
docker compose -f docker-compose.internal.yml up -d --build
```

Then run smoke tests on the private URL.

## Safe deployment sequence
For each deployment to the VM:

1. create a DB backup
2. pull the latest code
3. rebuild the internal stack
4. verify app and DB containers are healthy
5. test login
6. test the affected business flow

Use:

```bash
./scripts/backup_postgres_internal.sh
docker compose -f docker-compose.internal.yml up -d --build
docker compose -f docker-compose.internal.yml ps
```

## What not to do
- do not code directly inside the running production-like container
- do not make ad-hoc hotfixes in the VM without committing them in Git
- do not treat the VM as the only copy of your deployment knowledge
- do not skip backups before risky changes

## Practical rule of thumb
- local machine: build features
- VM: validate and operate the private ERP

## When this should change
If the ERP becomes daily operational infrastructure, the next improvement should be:
- move the private deployment to a dedicated host
- keep the same Docker + Tailscale pattern
- continue using the same development workflow
