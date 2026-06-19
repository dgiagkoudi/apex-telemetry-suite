# ApexTelemetry - QA & Test Suite Documentation (V2 Enhanced)

This module demonstrates the Quality Assurance, Integration Testing, and Validation strategies applied to the optimized ApexTelemetry Core API. 

## Enhanced Testing Strategy

### 1. Automated Integration Tests (Backend)
Located inside the backend directory: `src/test/java/com/apex/telemetry/TelemetryApiIntegrationTests.java`.
- Frameworks: JUnit 5, MockMvc, Spring Boot Test, H2 Embedded Database.
- Updated Coverage:
  - `POST /api/telemetry` (Happy Path): Validates full vehicle dynamics payload ingestion (12+ parameters including IMU & Pedals).
  - `POST /api/telemetry` (Rule Violation Edge Case): Asserts automatic server-side trigger of CRITICAL severity when calculated power ($V \times I$) exceeds the Formula Student statutory 80.0 kW threshold.
  - `POST /api/telemetry` (Input Validation): Asserts `400 Bad Request` when telemetry fields constraints are breached (e.g., negative throttle position or out-of-bounds SoC).

### 2. API Lifecycle Test Suite (Postman)
An automated collection is located at `/qa-testing-suite/postman/ApexTelemetry Suite.postman_collection.json`.

Executed Test Cases:
1. Submit Valid Telemetry: Sends clean data matching optimal track conditions. Asserts `201 Created`.
2. Trigger Critical Power & Temp Violations: Simulates an endurance stint peak where accumulator temperature hits $78.5^\circ\text{C}$ and power reaches $93.6\text{ kW}$. Asserts business logic rule interception.
3. Get Violations & Assert Severity: Queries `GET /api/telemetry/violations` to verify asynchronous or persistent data integrity. Asserts that the response array confirms the presence of `CRITICAL` safety flags.

## How to Run the Automated Suite via CLI
To execute the QA suite headlessly (e.g., in a CI/CD pipeline environment), install Newman and run:
```bash
npm install -g newman
newman run qa-testing-suite/postman/ApexTelemetry\ Suite.postman_collection.json
```