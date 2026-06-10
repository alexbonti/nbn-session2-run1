# NBN Fault Reporting API — Claude Code Guide

## Project
This is a Node.js + Express REST API for an Australian telecommunications company (NBN Co).
It allows residential customers to report broadband faults and check the status of their reports.

This is a **workshop environment**. The codebase is intentionally minimal — participants
use Claude Code to build out the missing endpoints during the session.

## Commands
- Start server: `npm start`
- Dev mode (auto-restart): `npm run dev`
- Run tests: `npm test`
- Run tests in watch mode: `npm run test:watch`
- Run with coverage: `npm run test:coverage`

## Architecture
- **Framework:** Express 4.x
- **Storage:** In-memory only (Map in `src/store.js`) — no database
- **Test runner:** Jest + Supertest
- **Entry point:** `src/server.js` → loads `src/app.js`

## File Structure
```
src/
  app.js          Express app setup, middleware, error handlers
  server.js       Server entry point (port binding)
  store.js        In-memory fault report store
  faultId.js      Fault ID generation and validation
data/
  mockData.json   Realistic mock customers, fault types, service types
tests/
  health.test.js  Health endpoint and 404 tests (passing on day one)
  faultId.test.js Fault ID utility tests (passing on day one)
```

## Data Model
A fault report has this shape:

```json
{
  "faultId":     "NBN-2026-A3F8K2",
  "customerId":  "CUS-001-NSW",
  "faultType":   "NO_CONNECTION",
  "address":     "14 Banksia Grove, Cherrybrook NSW 2126",
  "description": "No internet since 6am. Power light is red.",
  "status":      "SUBMITTED",
  "createdAt":   "2026-04-15T09:30:00.000Z",
  "updatedAt":   "2026-04-15T09:30:00.000Z"
}
```

## Fault ID Format
Format: `NBN-YYYY-XXXXXX`
- `NBN` — fixed prefix
- `YYYY` — 4-digit year
- `XXXXXX` — 6-character uppercase alphanumeric sequence

Use `faultId.generate()` to create new IDs.
Use `faultId.isValid(id)` to validate incoming IDs.
Regex: `/^NBN-\d{4}-[A-Z0-9]{6}$/`

## Valid Fault Types
From `data/mockData.json`:
- `NO_CONNECTION` — Service completely offline
- `SLOW_SPEED` — Speeds below plan speeds
- `INTERMITTENT` — Connection dropping and restoring
- `PHONE_LINE` — VoIP service fault
- `EQUIPMENT_FAULT` — NBN connection box or router issue
- `PLANNED_OUTAGE` — Suspected scheduled maintenance

## Error Response Format
All errors must follow this consistent format:

```json
{
  "error":     "ERROR_CODE",
  "message":   "Human readable description",
  "timestamp": "2026-04-15T09:30:00.000Z"
}
```

Common error codes used in this project:
- `VALIDATION_ERROR` — Missing or invalid request fields
- `INVALID_FAULT_ID` — fault_id does not match NBN-YYYY-XXXXXX format
- `NOT_FOUND` — Resource does not exist
- `INTERNAL_SERVER_ERROR` — Unexpected server error

## Key Constraints
- **No PII beyond customerId** — do not store names, emails, or phone numbers
- **No external dependencies** — do not install new npm packages without asking
- **No authentication** — out of scope for the workshop
- **No real-time updates** — out of scope for the workshop
- **No database** — in-memory store only

## Testing Conventions
- Test files live in `tests/`
- Name pattern: `<feature>.test.js`
- Use `supertest` for HTTP endpoint tests
- Use `store.clear()` in `beforeEach()` to reset state between tests
- Test at minimum: happy path, missing fields, invalid formats, not found

## Workshop Build Sequence

Endpoints are built in this order across the two workshop sessions:

### Module 1B Demo — POST /report-fault
Built live by the facilitator using the Explore → Plan → Code → Commit workflow.
Accepts a fault report from a residential customer.
Required fields: `customerId`, `faultType`, `address`, `description`
Returns: `{ faultId, status, message, createdAt }`

After this demo, `POST /report-fault` exists in the codebase.

### Module 1C GitHub Arc — GET /fault-status/:fault_id
Built live using the full GitHub workflow: BA writes an Issue → Claude Code
picks it up, creates a branch, builds to spec, opens a PR → Claude reviews
the PR → human approves the merge.
Validates `fault_id` against the NBN format before querying the store.
Returns: full fault report object or 404/400 error.

After this demo, both endpoints exist. Day 2 teams start from this state.
