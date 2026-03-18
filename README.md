<a id="readme-top"></a>

<div align="center">
  <img src="frontend/public/logo_web.png" alt="Excalibur ERP V2 logo" width="96" height="96">

  <h3 align="center">Excalibur ERP</h3>

  <p align="center">
    What started as a family business running on paper ledgers is now evolving into a modern ERP built for real operational control.
    <br /><br />
    Excalibur ERP is a full-stack internal system for managing customers, orders, inventory, dashboards, and expenses with a Django REST backend and a React frontend.
    <br /><br />
    Built as both a practical business tool and a portfolio-quality engineering project.
    <br />
    <br />
    <a href="#getting-started"><strong>Get started locally</strong></a>
    <br />
    <br />
    <a href="#usage">Usage</a>
    &middot;
    <a href="#deployment">Deployment</a>
    &middot;
    <a href="#contact">Contact</a>
  </p>
</div>

<div align="center">

![Django](https://img.shields.io/badge/Django-6.0-092E20?style=for-the-badge&logo=django&logoColor=white)
![DRF](https://img.shields.io/badge/DRF-3.16-A30000?style=for-the-badge&logo=django&logoColor=white)
![React](https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![Render](https://img.shields.io/badge/Deploy-Render-4E5EE4?style=for-the-badge&logo=render&logoColor=white)

</div>

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
        <li><a href="#create-the-first-user">Create The First User</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#deployment">Deployment</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

## About The Project

Excalibur ERP V2 was born from a real business need.

For years, my family business operated with handwritten ledgers, manual calculations, and disconnected processes. That worked for a while, but it also created friction: low visibility, repetitive work, and a hard ceiling on operational clarity.

This project is my attempt to turn that reality into a structured internal system.

At its core, Excalibur ERP V2 is:

- A practical ERP for managing customers, orders, and inventory in one place
- A dashboard-oriented internal tool for day-to-day visibility
- A foundation for a live internal deployment on Render
- A portfolio project grounded in a real operational workflow, not just a demo idea

Current business capabilities include:

- Customer management with addresses and soft delete
- Order creation, detail views, dispatch, and cancellation
- Inventory stock visibility by variant and movement-ledger tracking
- Dashboard metrics for pending orders, sales, and stock
- Expense registration and listing workflows
- Session-authenticated internal access with CSRF protection

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

- Django 6
- Django REST Framework
- React 19
- TypeScript
- Vite
- Tailwind CSS
- PostgreSQL 16
- Docker Compose
- Render

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Getting Started

The project runs locally as a Django backend, a React frontend, and a PostgreSQL database via Docker.

### Prerequisites

- Python 3.12
- Node.js 22+
- npm
- Docker Desktop or Docker Engine

### Installation

1. Clone the repository.
   ```sh
   git clone https://github.com/SaulDaSilva/excalibur-erp.git
   cd excalibur-erp
   ```
2. Create the backend environment file.
   ```sh
   copy backend\.env.example backend\.env
   ```
3. Create the local Postgres env file.
   ```sh
   copy docker\postgres\.env.db.example docker\postgres\.env.db
   ```
4. Start PostgreSQL.
   ```sh
   docker compose up -d db
   ```
5. Install backend dependencies and run migrations.
   ```sh
   cd backend
   python -m venv .venv
   .venv\Scripts\activate
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py runserver
   ```
6. Install frontend dependencies and run the Vite dev server in a second terminal.
   ```sh
   cd frontend
   npm install
   npm run dev
   ```

Notes:

- The frontend uses a Vite proxy locally so session cookies work cleanly with Django.
- Local database defaults are documented in `backend/.env.example` and `docker/postgres/.env.db.example`.
- Shared-cache login hardening can be enabled in deployed environments with `DJANGO_CACHE_URL`.

### Create The First User

To log in for the first time, create a Django superuser from the backend directory:

```sh
python manage.py createsuperuser
```

Then use those credentials in the login screen at the frontend app.

If you want to verify admin access too, the Django admin path is controlled by `DJANGO_ADMIN_URL` in your environment.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Usage

Typical usage flows for the current version:

1. Sign in with an internal user created through Django.
2. Review the dashboard for pending orders, recent sales, and stock by variant.
3. Create or update customer records and shipping addresses.
4. Register orders and inspect order detail pages.
5. Dispatch orders and verify that inventory decreases through the movement ledger.
6. Track operational expenses from the expenses module.


<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Deployment

The current public deployment path for this repository is the split-origin Render setup:

- [render.yaml](render.yaml) deploys the Django backend
- [render.frontend.yaml](render.frontend.yaml) deploys the static frontend

In this setup:

- the frontend uses `VITE_API_BASE_URL` to point to the deployed backend
- the backend uses PostgreSQL plus Render Key Value for shared login throttling and lockout state
- session authentication remains in place, so CORS and CSRF environment values must match the deployed frontend origin

`render.same-origin.yaml` stays in the repo only as a secondary dev/internal reference and is not part of the primary public deployment path right now.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Roadmap

- [x] Session auth with CSRF protection
- [x] Dashboard metrics and stock visibility
- [x] Customers, orders, inventory, and expenses modules
- [x] Render-ready login hardening with shared cache support
- [ ] Seed/demo data command for faster portfolio setup
- [ ] Expanded automated coverage across services and API workflows
- [ ] Public screenshots or a short demo GIF set in the README
- [ ] First live public demo deployment for portfolio presentation

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contributing

This project is being shaped as both an internal tool and a portfolio project. Suggestions and scoped improvements are welcome, especially around:

- test coverage
- deployment polish
- UX refinement for internal workflows
- maintainability and code organization

Suggested flow:

1. Fork the project
2. Create a feature branch
3. Make scoped, reviewable changes
4. Run the relevant checks
5. Open a pull request with context and screenshots when UI is affected

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## License

No public license has been selected yet.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contact

Saul Enrique Martinez Da Silva  
Email: saul.martinez.da.silva@gmail.com  
Project Link: https://github.com/SaulDaSilva/excalibur-erp

<p align="right">(<a href="#readme-top">back to top</a>)</p>
