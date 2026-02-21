# API Endpoints Reference

Base URL: `http://localhost:3001/api`

## Authentication Endpoints

### 1. User Registration
```
POST /api/auth/register
Content-Type: application/json

Request Body:
{
  "username": "string",
  "password": "string"
}

Response:
Status: 201 Created
{
  "message": "User registered successfully"
}
```

### 2. User Login
```
POST /api/auth/login
Content-Type: application/json

Request Body:
{
  "username": "string",
  "password": "string"
}

Response:
Status: 200 OK
{
  "token": "string"
}
```

### Get Current User (Legacy)
```
GET /api/auth/me
Authorization: Bearer {token}

Response:
{
  "id": "1",
  "username": "admin",
  "email": "admin@company.com",
  "role": "HR",
  "name": "Admin User",
  "country": "US"
}
```

## Employee (User) Endpoints

### 3. Employee Resignation Submission
```
POST /api/user/resign
Authorization: Bearer {employee_token}
Content-Type: application/json

Request Body:
{
  "lwd": "string"  // Last working day in format "YYYY-MM-DD"
}

Response:
Status: 200 OK
{
  "data": {
    "resignation": {
      "_id": "string"
    }
  }
}
```

### 7. Employee Exit Questionnaire Submission
```
POST /api/user/responses
Authorization: Bearer {employee_token}
Content-Type: application/json

Request Body:
{
  "responses": [
    {
      "questionText": "string",
      "response": "string"
    }
  ]
}

Response:
Status: 200 OK
```

## Admin (HR) Endpoints

### 4. Admin Login
```
POST /api/auth/login
Content-Type: application/json

Request Body:
{
  "username": "admin",
  "password": "admin"
}

Response:
Status: 200 OK
{
  "token": "string"
}
```

### 5. View All Resignations (Admin)
```
GET /api/admin/resignations
Authorization: Bearer {admin_token}

Response:
Status: 200 OK
{
  "data": [
    {
      "_id": "string",
      "employeeId": "string",
      "lwd": "string",
      "status": "pending"
    }
  ]
}
```

### 6. Approve or Reject Employee Resignation (Admin)
```
PUT /api/admin/conclude_resignation
Authorization: Bearer {admin_token}
Content-Type: application/json

Request Body:
{
  "resignationId": "string",
  "approved": true,  // Boolean, true for approval, false for rejection
  "lwd": "string"    // Last working day in format "YYYY-MM-DD" (required if approved)
}

Response:
Status: 200 OK
```

### 8. View All Exit Questionnaire Responses (Admin)
```
GET /api/admin/exit_responses
Authorization: Bearer {admin_token}

Response:
Status: 200 OK
{
  "data": [
    {
      "employeeId": "string",
      "responses": [
        {
          "questionText": "string",
          "response": "string"
        }
      ]
    }
  ]
}
```

## Legacy Endpoints (Backward Compatibility)

The following endpoints are maintained for backward compatibility with existing clients:

### Submit Resignation (Legacy)
```
POST /api/resignations
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "lastWorkingDay": "2025-03-15",
  "reason": "Better opportunity elsewhere"
}
```

### Get All Resignations (Legacy)
```
GET /api/resignations
Authorization: Bearer {token}
```

### Approve Resignation (Legacy)
```
PATCH /api/resignations/{id}/approve
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "exitDate": "2025-03-15"
}
```

### Reject Resignation (Legacy)
```
PATCH /api/resignations/{id}/reject
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "rejectionReason": "Notice period not met"
}
```

### Submit Exit Interview (Legacy)
```
POST /api/exit-interviews
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "resignationId": "uuid",
  "answers": {
    "q1": "Answer 1",
    "q2": "Answer 2"
  }
}
```

### Get Exit Interviews (Legacy)
```
GET /api/exit-interviews
Authorization: Bearer {token}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "error": "Access token required"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Testing with cURL

### Register Example
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john.smith","password":"password123"}'
```

### Login Example
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'
```

### Submit Resignation Example
```bash
curl -X POST http://localhost:3001/api/user/resign \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"lwd":"2025-03-15"}'
```

### Approve Resignation Example
```bash
curl -X PUT http://localhost:3001/api/admin/conclude_resignation \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"resignationId":"RESIGNATION_ID","approved":true,"lwd":"2025-03-15"}'
```

### Submit Exit Responses Example
```bash
curl -X POST http://localhost:3001/api/user/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "responses": [
      {"questionText": "What prompted you to leave?", "response": "Better opportunity"},
      {"questionText": "What did you like most?", "response": "Great team"}
    ]
  }'
```

## Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error
