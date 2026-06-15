# ApexTelemetry - QA & Test Suite Documentation

This module demonstrates the Quality Assurance and Testing strategies applied to the ApexTelemetry Core API, combining automated component testing and API lifecycle validation.

## Testing Strategy

1. Automated Integration Tests (Backend)
Located in `src/test/java/com/apex/telemetry/TelemetryApiIntegrationTests.java`.
- Frameworks: JUnit 5, MockMvc, Spring Boot Test.
- Coverage:
  - `POST /api/telemetry` (Happy Path - 201 Created)
  - `POST /api/telemetry` (Business Logic Edge Case - Critical Battery Threshold Validation)
  - `POST /api/telemetry` (Input Validation - 400 Bad Request on negative RPM)

2. API Testing Suite (Postman)
An automated Postman Collection is located at `/qa-testing-suite/postman/ApexTelemetry_Collection.json`.

## Executed Test Cases:
1. **Submit Valid Telemetry:** Verifies `201 Created` status and structure validation.
2. **Trigger System Violations:** Sends telemetry exceeding safety limits and asserts that the violation payload matches the business specifications.
3. **Data Persistency Check:** Performs a `GET` request to `/api/telemetry/violations` to verify the entry was correctly written to the Database.