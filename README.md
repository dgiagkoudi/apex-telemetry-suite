# APEX Telemetry Suite

A full-stack, end-to-end telemetry and observability platform designed for real-time race car data tracking, safety threshold monitoring, and QA automation.

## Repository Structure (Monorepo)

This repository is structured as a monorepo containing the following components:

- `backend/`: Robust Spring Boot Java API featuring a Docker configuration. It processes live telemetry data, evaluates vehicle parameters against safety limits, and generates real-time violations.
- `frontend/`: Live telemetry dashboard built with React, Vite, Tailwind CSS, and Recharts, optimized for sub-second visual performance.
- `qa-testing-suite/`: Automated QA suite containing Postman environment configurations and integration tests to validate API schema integrity, business logic, and error boundaries.

## Live Deployments

- Frontend Dashboard: Deployed on Vercel
- Core Backend API: Deployed on Render (via Docker container)

## Local Development Setup

To spin up the entire suite locally, clone the repository and follow the setup guides inside each respective folder:

1. Backend: Navigate to `/backend`, configure your local database settings, and run `./mvnw spring-boot:run`.
2. Frontend: Navigate to `/frontend`, install dependencies via `npm install`, add a local `.env` pointing to your localhost API, and start with `npm run dev`.
3. QA Automation: Import the Postman collection and environment files located inside `/qa-testing-suite` to execute automated validation tests.