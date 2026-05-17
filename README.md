# Sizzling Hot Products

Full-stack submission for the Bunnings code challenge, built with React/Next.js on the frontend and ASP.NET Core 8 on the backend, then packaged and deployed with Docker and Azure Container Apps.

- Repository: <https://github.com/WeitaoJiang85/tht-sizzling-hot-products>
- Live application: <https://ca-frontend-tht-hot.calmcoast-c13c0505.australiaeast.azurecontainerapps.io/>
- Primary frontend stack: React, Next.js, TypeScript
- Primary backend stack: .NET 8, ASP.NET Core Web API, C#

## Screenshots

<table>
   <tr>
      <td align="center" valign="top">
         <strong>Desktop</strong><br />
         <img src="./desktop%20version.png" alt="Desktop view" height="360" />
      </td>
      <td align="center" valign="top">
         <strong>Mobile</strong><br />
         <img src="./mobile%20version.jpg" alt="Mobile view" height="360" />
      </td>
   </tr>
</table>

## Executive Summary

This solution was approached as a small but realistic product delivery rather than as a one-off coding exercise. The goal was not only to produce the correct output for the supplied JSON data, but also to keep the implementation maintainable, well-tested, and straightforward to deploy and operate.

The application exposes a clean analytics API over product and order data, and presents it through a retail-oriented interface that highlights:

1. The top-selling product for a chosen day.
2. The top-selling product across the latest rolling 3-day window.
3. A continuously visible all-products summary for the latest window.

The implementation also keeps several practical engineering concerns in view:

1. Environment-driven configuration.
2. Defensive handling of invalid or out-of-range inputs.
3. Clear separation between API, business rules, and data access.
4. Frontend caching for responsiveness and stability.
5. Containerized deployment to Azure.
6. Logging and monitoring support for hosted environments.

## Architecture Overview

```text
Browser
   |
   v
Next.js Frontend
   |
   | HTTPS / JSON
   v
ASP.NET Core Web API
   |
   +--> Controllers
   +--> Services
   +--> Repositories
   +--> Policies / Configuration
   |
   v
JSON Input Files

Supporting layers:
- React Query / persisted client cache
- Zustand client store
- Serilog logging
- Docker images
- Azure Container Apps
- Azure Log Analytics
```

## Repository Structure

```text
frontend/
  app/                 Next.js app entry, metadata, providers
  components/          Presentation and interaction components
  hooks/               Reusable frontend data hooks
  services/            Axios API client and service wrappers
  store/               Client-side state
  __tests__/           Frontend tests

backend/
  SizzlingHotProducts.Api/
    Controllers/       HTTP endpoints
    Services/          Business logic orchestration
    Services/Policies/ Aggregation strategy selection
    Repositories/      JSON data access
    Configuration/     Strongly typed options
    Models/            Domain models and converters
    DTOs/              API contracts
    inputs/            Source data files
    wwwroot/           Static branding assets
  SizzlingHotProducts.Tests/
    ...                xUnit test suites for backend layers

scripts/azure/
  bootstrap-container-apps.ps1   Azure resource bootstrap script

start-dev.ps1 / start-dev.bat    Convenience scripts for local development
```

## Technical Stack

### Frontend

- Next.js 14
- React 18
- TypeScript
- TanStack React Query
- Zustand
- Axios
- Tailwind CSS
- Vitest and Testing Library

### Backend

- .NET 8
- ASP.NET Core Web API
- C#
- Options pattern for configuration
- Serilog for structured logging
- xUnit, FluentAssertions, Moq, ASP.NET Core testing utilities

### Deployment and Operations

- Docker multi-stage builds for frontend and backend
- Azure Container Apps
- Azure Container Registry
- GitHub Actions CI/CD
- Azure Log Analytics

## API Design

The API surface is intentionally small and focused:

1. `GET /api/products`
   Returns ranked products for a supplied date range, or the latest rolling 3-day window when no range is provided.
2. `GET /api/products/daily-top?date=YYYY-MM-DD`
   Returns the top product for a single day.
3. `GET /api/products/top-latest-window?days=3`
   Returns the top product for the latest window.
4. `GET /api/products/data-range`
   Returns min and max available dates for safe UI interaction.
5. `GET /api/health`
   Returns a health payload for smoke checks and deployment validation.

## Deployment Decisions

1. Docker multi-stage builds are used to keep runtime images cleaner and more repeatable across local and CI builds.
2. Azure Container Apps hosts the frontend and backend as separate services with simple ingress and environment-based configuration.
3. GitHub Actions automates image build and rollout so deployment steps remain repeatable.
4. The Azure bootstrap script provisions the main cloud resources and applies CORS-related environment settings.
5. Azure Log Analytics and health checks make the hosted version easier to verify and monitor.

## Local Development and Usage

## Prerequisites

Install the following before starting:

1. Node.js 20 or later.
2. npm.
3. .NET SDK 8.0 or later.
4. Docker Desktop if you want to run the containerized build locally.
5. PowerShell on Windows for the provided startup scripts.

## Clone the Repository

```bash
git clone https://github.com/WeitaoJiang85/tht-sizzling-hot-products.git
cd tht-sizzling-hot-products
```

## Quick Start Using the Convenience Script

### Windows PowerShell

```powershell
./start-dev.ps1
```

This script:

1. Frees the frontend port 3000 if already in use.
2. Frees the backend port 5000 if already in use.
3. Starts the backend with `dotnet watch run`.
4. Starts the frontend with `next dev`.

Use this variant if the backend is already running and you only want to restart the frontend:

```powershell
./start-dev.ps1 -FrontendOnly
```

### Windows Batch

```bat
start-dev.bat
```

### Local URLs

- Frontend: <http://localhost:3000>
- Backend: <http://localhost:5000>
- Backend health: <http://localhost:5000/api/health>
- Swagger UI in development: <http://localhost:5000/swagger>

## Manual Local Run: Backend

If you want to build and run the backend directly without the helper script:

```bash
dotnet restore backend/SizzlingHotProducts.Api/SizzlingHotProducts.Api.csproj
dotnet build backend/SizzlingHotProducts.Api/SizzlingHotProducts.Api.csproj
dotnet run --project backend/SizzlingHotProducts.Api/SizzlingHotProducts.Api.csproj
```

Notes:

1. The API reads its sample data from `backend/SizzlingHotProducts.Api/inputs`.
2. In development, Swagger is enabled automatically.
3. Default CORS includes localhost frontend origins and can be extended through environment variables.

## Manual Local Run: Frontend

If you want to build and run the frontend directly without the helper script:

```bash
cd frontend
npm install
npm run dev
```

For a production-style local build:

```bash
cd frontend
npm install
npm run build
npm run start
```

The frontend expects the backend API base URL through environment configuration. If no environment variable is supplied, it defaults to `http://localhost:5000`.

The primary frontend environment variables are:

1. `NEXT_PUBLIC_API_BASE_URL`
2. `NEXT_PUBLIC_API_TIMEOUT`

Example:

```bash
cd frontend
set NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
set NEXT_PUBLIC_API_TIMEOUT=30000
npm run dev
```

## Cloud Access

The public Azure-hosted frontend is available at:

<https://ca-frontend-tht-hot.calmcoast-c13c0505.australiaeast.azurecontainerapps.io/>

The deployment model is:

1. Frontend and backend run as separate Azure Container Apps.
2. Docker images are stored in Azure Container Registry.
3. The frontend receives the backend base URL via environment/build configuration.
4. Logs flow into Azure Log Analytics through the Container Apps environment.

If you need to resolve the current backend ingress URL from Azure, use the configured Container App name and resource group:

```bash
az containerapp show --name ca-backend-tht-hot --resource-group rg-tht-sizzling-hot-products --query properties.configuration.ingress.fqdn --output tsv
```

Once resolved, the backend can be checked with:

```text
https://<backend-fqdn>/api/health
https://<backend-fqdn>/swagger
```

## Build, Quality, and Test Commands

### Frontend

```bash
cd frontend
npm install
npm run lint
npm run type-check
npm run test
npm run test:coverage
npm run build
```

### Backend

```bash
dotnet restore backend/SizzlingHotProducts.Tests/SizzlingHotProducts.Tests.csproj
dotnet test backend/SizzlingHotProducts.Tests/SizzlingHotProducts.Tests.csproj
dotnet test backend/SizzlingHotProducts.Tests/SizzlingHotProducts.Tests.csproj --collect:"XPlat Code Coverage"
```

## Current Verification Results

The latest local validation run produced the following results:

### Frontend

1. 15 test files passed.
2. 140 tests passed.
3. Overall V8 coverage: 82.63% statements, 68.62% branches, 76.66% functions, 82.63% lines.

Coverage highlights:

1. `app/` is very strong, including 100% coverage for `layout.tsx` and `page.tsx`.
2. `store/productStore.ts` is fully covered.
3. Reusable components are heavily tested.
4. The biggest remaining frontend gap is `services/api.ts`, which currently has lower functional coverage than the UI and store layers.

Observed warning notes during test execution:

1. One React `act(...)` warning in `page.test.tsx`.
2. One DOM nesting warning in `layout.test.tsx` because `html` is rendered inside the test container.

These warnings do not fail the suite, but they are worth tidying up in a follow-up pass.

### Backend

1. 95 tests passed.
2. 0 failed.
3. Current Cobertura coverage: 85.95% line coverage and 78.70% branch coverage.

Coverage interpretation:

1. Core service and controller logic are well covered.
2. Program startup wiring has low coverage, which is common because integration coverage is usually focused more heavily on business behaviour than bootstrapping code.

## Design Highlights

## Frontend Highlights

### 1. Responsiveness and perceived speed

The frontend is optimized for perceived responsiveness, not only raw correctness.

Examples:

1. Cached queries reduce repeated waits.
2. Persisted query data improves revisit performance.
Browser
   |
   v
Next.js Frontend
   |
   | HTTPS / JSON
   v
ASP.NET Core Web API
   |
   +--> Controllers
   +--> Services
   +--> Repositories
   +--> Policies / Configuration
   |
   v
JSON Input Files

Supporting layers:

- React Query / persisted client cache
- Zustand client store
- Serilog logging
- Docker images
- Azure Container Apps
- Azure Log Analytics

The UI is intentionally retail-oriented and product-led, using:

1. Strong branding colours.
2. Promotional-card hierarchy.
3. Visual emphasis on featured products.
4. A mobile-friendly layout that remains readable and touch-friendly.

### 5. Accessibility and usability

The app aims to be understandable and operable without depending on purely visual cues.

Current design choices include:

1. Clear labels.
2. Meaningful sectioning.
3. Focus treatment.
4. Loading and empty-state communication.

### 6. Edge-case handling

Examples of explicit edge-case handling:

1. Date input outside the available data window is corrected to a valid date.
2. Missing images do not break cards or lists.
3. Empty datasets show explicit fallback messaging.
4. Browser storage failures do not crash the page.

## Backend Highlights

### 1. Thin controllers, richer services

This is a deliberate maintainability choice. HTTP concerns stay close to controllers, while business logic remains testable and reusable in the service layer.

### 2. Business rule flexibility through options and policies

This shows design for change. Aggregation rules are made configurable so that future stakeholder changes do not require ripping through endpoint logic.

### 3. Production-aware configuration

The API is written to be configured through environment values, especially around CORS and aggregation settings. That is important when the same container image is promoted between environments.

### 4. Logging and diagnostics

The solution includes:

1. Structured application logs via Serilog.
2. Rolling file logs locally.
3. Container-friendly console logs.
4. Azure Log Analytics integration at the hosting environment level.

### 5. Deployment-friendly behaviour

The API includes a health endpoint, uses container-compatible configuration, and separates static assets and input data in a way that works inside published containers.

## Azure and Containerization Approach

The deployment strategy was designed to show pragmatic cloud engineering rather than only local development success.

What is included:

1. Multi-stage Dockerfiles for both frontend and backend.
2. Azure Container Registry image publishing.
3. GitHub Actions CD workflow for image build and deployment.
4. Bootstrap scripting for Azure resource creation.
5. Log Analytics wiring for runtime monitoring.
6. Runtime CORS injection so the backend can trust the deployed frontend origin.

Why this matters in practice:

1. It extends the solution beyond code compilation alone.
2. It includes deployment automation and environment management concerns.
3. It keeps development and operational responsibilities connected.

## Detailed Design Decisions

### Frontend

1. Next.js was used to keep the React application structured, support metadata cleanly, and leave room for future SSR or route-level growth.
2. React Query was used for API-backed state so loading, caching, retries, and stale-data behaviour stay predictable without spreading request logic across components.
3. A small Zustand store was included for persisted client-side selections and filters, keeping UI state separate from server data.
4. The dashboard layout prioritizes rendering stability through isolated queries, skeleton states, and controlled refresh behaviour.
5. The visual treatment follows a retail-oriented style so the interface feels closer to a customer-facing product than a generic admin page.

### Backend

1. ASP.NET Core Web API was used to align with the target stack and provide clean support for DI, middleware, configuration binding, and testable services.
2. Controllers, services, repositories, DTOs, and policies are separated so HTTP concerns, business rules, and data access stay easy to reason about.
3. Sales aggregation rules are option-driven to keep business logic configurable and easier to evolve.
4. JSON repositories were sufficient for the supplied dataset while still preserving a replaceable data-access boundary.
5. Centralized error handling and structured logging were added to keep API behaviour consistent and easier to diagnose in local and cloud environments.

### Deployment

1. Docker multi-stage builds were used to keep runtime images cleaner and more repeatable across local and CI builds.
2. Azure Container Apps was used to deploy the frontend and backend as separate services with simple ingress and environment-based configuration.
3. GitHub Actions automates image build and rollout so deployment steps remain repeatable.
4. Azure Log Analytics and health checks were included to make the hosted version easier to verify and monitor.

## Limitations and Trade-offs

This was built to reflect production-style concerns where practical, but it is still a time-bounded challenge submission. The main limitations are documented explicitly below.

### 1. No database

Trade-off:

1. JSON files are sufficient and fast for the provided dataset.
2. A proper relational or document database would be the next step for larger data volumes, indexing, auditability, and concurrent writes.

Why it was not added now:

1. It would increase setup, migration, and hosting complexity.
2. It would not materially improve the correctness of the challenge outcome for the provided data size.

### 2. No Redis or shared distributed cache

Trade-off:

1. The solution uses client-side persistence and query caching instead.
2. That is enough for a small read-heavy demo but would not be sufficient for large-scale multi-instance analytics traffic.

Why it was not added now:

1. There is no database or expensive upstream dependency yet to justify the extra operational layer.
2. The time budget was better spent on core correctness, architecture, deployment, and testing.

### 3. Limited data volume and no write workflows

Trade-off:

1. The system is optimized for reading and computing analytics over a supplied static dataset.
2. It does not model order ingestion, mutations, background jobs, or reconciliation workflows.

### 4. No authentication or authorization

Trade-off:

1. This keeps the challenge focused on analytics delivery.
2. A production system would likely require Azure AD, JWT-based auth, or another identity integration.

### 5. No end-to-end browser automation or load testing

Trade-off:

1. Unit and component tests provide strong confidence in the main behaviours.
2. Full E2E and performance testing would be the next quality layer for production hardening.

### 6. Not every production concern is fully matured

Examples of future hardening work:

1. More explicit API versioning policy.
2. Stronger exception taxonomy and mapping.
3. Tighter security headers and CSP review.
4. Performance profiling under larger datasets.
5. Expanded deployment health gates and rollback strategy.

## If This Were Continued Toward Production

The next sensible evolution steps would be:

1. Replace JSON repositories with a database-backed persistence layer.
2. Add a backend cache or pre-aggregated analytics model if data volume grows.
3. Add E2E tests for the most important user journeys.
4. Add authentication and role-aware access control.
5. Expand telemetry with dashboards and alerting.
6. Add more formal API contract validation and versioning.
7. Revisit SSR or hybrid rendering if SEO-driven landing pages become more important.
