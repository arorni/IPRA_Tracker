# IPRA Tracker — API Contract

Base URL: `http://localhost:8000`

## Authentication

All routes are currently open in Phase 1.
TODO Phase 2: Add `Authorization: Bearer <jwt>` to all protected routes.

### POST /auth/signup
```json
Request:  { "email": "string", "password": "string", "full_name": "string" }
Response: { "access_token": "string", "token_type": "bearer", "user": { "id", "email", "full_name" } }
```

### POST /auth/login
```json
Request:  { "email": "string", "password": "string" }
Response: { "access_token": "string", "token_type": "bearer", "user": { ... } }
```

### GET /auth/me
```json
Response: { "id": "string", "email": "string", "full_name": "string" }
```

---

## Requests

### GET /requests
Returns all requests for the current user.

### POST /requests
```json
Request: {
  "title": "string",
  "agency_name": "string",
  "agency_email": "string|null",
  "description": "string",
  "request_text": "string",
  "notes": "string|null"
}
Response: IPRARequest (status 201)
```

### GET /requests/{id}
Returns a single request.

### PUT /requests/{id}
Update request fields. Previous state is saved to `request_versions` (Phase 2).
Cannot edit a submitted request directly.

### DELETE /requests/{id}
Permanently deletes the request.

### POST /requests/{id}/mark-submitted
```json
Request: {
  "submission_method": "email|online_portal|mail|phone|other",
  "submitted_date": "YYYY-MM-DD",
  "submission_notes": "string|null"
}
```
Sets status to `submitted`, calculates and stores deadlines.

---

## Deadlines

### GET /requests/{id}/deadlines
Returns DeadlineInfo for a request.

### POST /requests/{id}/calculate-deadlines
Recalculates deadlines from submitted_date.

---

## Documents (Phase 4)

### GET /requests/{id}/documents
Lists uploaded documents for a request.

### POST /requests/{id}/documents/upload
501 Not Implemented — Phase 4.

---

## AI (Phase 3)

### POST /ai/improve-request
```json
Request:  { "request_text": "string", "agency_name": "string" }
Response: { "improved_text": "string", "suggestions": ["string"], "is_demo": bool }
```

### POST /ai/summarize-document
```json
Request:  { "document_text": "string" }
Response: { "summary": "string", "key_dates": [], "key_entities": [], "major_topics": [], "is_demo": bool }
```

### POST /ai/suggest-followups
```json
Request:  { "original_request": "string", "document_summary": "string|null" }
Response: { "suggestions": ["string"], "is_demo": bool }
```

---

## IPRARequest Schema

```json
{
  "id": "string",
  "user_id": "string",
  "title": "string",
  "agency_name": "string",
  "agency_email": "string|null",
  "description": "string",
  "request_text": "string",
  "status": "draft|ready_to_submit|submitted|records_received|closed",
  // NOTE: "overdue" is NOT a status value. Overdue is calculated from deadline dates
  // and returned as the is_overdue boolean flag. "awaiting_response" is also not a
  // status — it is a descriptive sub-label shown when status === "submitted".
  "notes": "string|null",
  "created_at": "datetime",
  "updated_at": "datetime",
  "submitted_date": "date|null",
  "submission_method": "string|null",
  "submission_notes": "string|null",
  "three_day_deadline": "date|null",
  "fifteen_day_deadline": "date|null",
  "is_overdue": "boolean"
}
```
