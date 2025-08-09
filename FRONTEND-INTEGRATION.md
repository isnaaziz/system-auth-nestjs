# Frontend Integration Guide

Comprehensive guide for integrating the Authentication, User, and Team Invitation features into your frontend application.

## Base URL
```
http://localhost:<PORT>
```
(Adjust to your deployed host. All responses are JSON.)

## Authentication Overview
| Step | Endpoint | Description |
|------|----------|-------------|
| 1 | POST /auth/login | Obtain access & refresh token (single active session policy) |
| 2 | Use access token | Send `Authorization: Bearer <access_token>` header for protected endpoints |
| 3 | POST /auth/refresh | Get new access token when expired (needs refresh_token) |
| 4 | POST /auth/logout | Invalidate current session (need refresh_token) |
| 5 | POST /auth/logout-all | Invalidate all sessions |

Access token expiry configured by env (e.g. `15m`). Refresh token stored in server session store.

## Token Storage Strategy (Recommended)
- access_token: memory (React state / context) OR secure httpOnly cookie (if you adapt backend)
- refresh_token: keep only in memory if possible; if must persist, use secure storage not accessible by XSS.
- On 401 with `message: "Invalid or expired token"` try refresh flow once; if still 401 force re-login.

## Auth Endpoints

### Register
POST /auth/register
Body:
```
{ "username":"john", "email":"john@example.com", "password":"Pass1234" }
```
Response 201:
```
{ "access_token":"...", "refresh_token":"...", "expires_in":900, "user":{...} }
```

### Login
POST /auth/login
Headers (optional): `x-device-info: MacBook Pro`
Body:
```
{ "username":"john" OR "username":"john@example.com", "password":"Pass1234" }
```
Response 200: same shape as register. Single active session policy: logging in elsewhere revokes previous.

### Refresh Token
POST /auth/refresh
```
{ "refresh_token":"<refresh_token>" }
```
Response 200: new pair
```
{ "access_token":"...", "refresh_token":"...", "expires_in":900, "user":{...} }
```
Update both tokens on frontend.

### Logout Current Session
POST /auth/logout
```
{ "refresh_token":"<refresh_token>" }
```
Response 200: `{ message: "Logged out successfully", statusCode: 200 }`

### Logout All Sessions
POST /auth/logout-all (Bearer)
Response 200 similar message.

### Get Profile
GET /auth/profile (Bearer)
Returns user profile (no password fields).

### Update Profile
PUT /auth/profile (Bearer)
```
{ "full_name":"John Doe", "phone":"+621234", "bio":"Hi" }
```

### Upload Avatar
POST /auth/profile/photo (multipart/form-data, field `photo`)
Response 200: `{ success:true, avatar_url:"/uploads/..." }`

### Delete Avatar
DELETE /auth/profile/photo (Bearer)

### Sessions
GET /auth/sessions (Bearer) -> list of active sessions
DELETE /auth/sessions/:sessionId (Bearer) -> revoke one

---
## User Endpoints (Admin Only)
| Endpoint | Method | Notes |
|----------|--------|-------|
| /users | GET | Pagination: `?page=&limit=&search=` |
| /users/:id | GET | Single user (public subset) |
| /users | POST | Create user manually |
| /users/:id | PUT | Update |
| /users/:id | DELETE | Soft delete |
| /users/:id/restore | PUT | Restore |
| /users/:id/sessions | GET | List sessions |
| /users/:id/sessions | DELETE | Revoke all sessions |
| /users/me | GET | Current auth user shortcut |

---
## Team & Invitation Flow
Two scenarios:
1. Invite NEW email (no existing user): creates invite with token. Recipient accepts via frontend screen.
2. Invite EXISTING user email: system directly assigns/updates role (response `{ directAssigned:true, userId }`). No token/accept step.

### Invite Member (Admin)
POST /team/invite (Bearer)
Body:
```
{
  "email":"new.member@example.com",
  "role":"user",            // admin | user | moderator
  "note":"Please join marketing project",
  "expires_in": 86400,        // seconds (optional, default 7 days)
  "redirect_url":"https://app.frontend.local/welcome"
}
```
Responses:
- New invite 201 (example):
```
{
  "id":"uuid-invite",
  "email":"new.member@example.com",
  "role":"user",
  "status":"pending",
  "token":"f0ab3...",
  "expires_at":"2025-08-16T10:11:12.000Z",
  "note":"Please join marketing project",
  "redirect_url":"https://app.frontend.local/welcome",
  "inviter_id":"uuid-admin",
  "created_at":"2025-08-09T10:11:12.000Z"
}
```
- Existing user direct assignment 200:
```
{ "directAssigned": true, "userId":"uuid-existing" }
```

### List Invites (Admin)
GET /team/invites?status=pending
Status values: pending | accepted | revoked | expired
Response:
```
{ "invites":[ { "id":"...", "email":"...", ... }, ... ] }
```

### Accept Invite (Public – no auth header required if route left unguarded, current version requires Bearer unless guard removed)
POST /team/invite/accept
```
// New user must supply username & password
{
  "token":"f0ab3...",
  "username":"newmember",
  "password":"Pass1234",
  "full_name":"New Member"
}
```
Existing user case (role update only):
```
{ "token":"existingToken" }
```
Response 200 (auto-login):
```
{
  "access_token":"...",
  "refresh_token":"...",
  "expires_in":900,
  "user": {"id":"uuid","username":"newmember", "email":"new.member@example.com", "role":"user"},
  "redirect_url":"https://app.frontend.local/welcome"
}
```
Frontend: store tokens then redirect (use `redirect_url` if provided, else fallback).

### Revoke Invite (Admin)
POST /team/invite/revoke
```
{ "inviteId":"uuid-invite" }
```
Response 200: `{ "revoked": true }`

### Purge Expired Invites (Admin)
POST /team/invites/purge-expired
Response 200: `{ "expired_marked": <number> }`

### Update Member Role (Admin)
PUT /team/members/:id/role
```
{ "role":"admin" }
```
Response: `{ "id":"<userId>", "role":"admin" }`

### Remove Member (Admin)
DELETE /team/members/:id
Response: `{ "removed": true }`
(Soft deletes underlying user; future login blocked unless restored.)

### List Members
GET /team/members (Bearer)
Response example:
```
[
  { "id":"uuid1", "full_name":"Alice", "role":"admin", "status":"active" },
  { "id":"uuid2", "full_name":"Bob", "role":"user", "status":"active" }
]
```

## Role Based Access
- Non-admin users can: accept invite (if public), view /team/members (currently protected but not role restricted).
- Admin required: invite, revoke, list invites, update role, remove member, purge expired.

## Error Patterns
| HTTP | Example message | Frontend Handling |
|------|-----------------|-------------------|
| 400 | "username & password required" | Show form validation error |
| 401 | "Invalid credentials" | Show login error |
| 401 | Token expired | Trigger refresh flow |
| 403 | "Forbidden resource" | Hide feature / show not authorized |
| 404 | "Invite not found" | Show invalid/expired invite page |
| 409 | "Username or email already exists" | Show duplication message |

## Frontend Flows
### A. New Invite Acceptance
1. User clicks emailed invite link containing token.
2. Frontend fetches (optional pre-check by calling list invites if admin) or directly shows accept form.
3. Submit POST /team/invite/accept with token + username + password.
4. Store tokens from response, redirect to provided `redirect_url` or dashboard.

### B. Existing User Assignment
1. Admin invites existing email.
2. Response returns `directAssigned:true`.
3. Frontend shows success toast; user keeps current session (if logged in) but may need role refresh: refetch /auth/profile.

### C. Token Refresh Loop
```
if (request 401 && not retried) {
  call /auth/refresh -> update tokens -> retry original
} else { force logout }
```

## Testing With curl
```
# Login
curl -X POST http://localhost:4028/auth/login \
 -H 'Content-Type: application/json' \
 -d '{"username":"admin","password":"AdminPass123"}'

# Invite new member
curl -X POST http://localhost:4028/team/invite \
 -H 'Authorization: Bearer <ACCESS>' -H 'Content-Type: application/json' \
 -d '{"email":"new.user@example.com","role":"user"}'

# Accept invite
curl -X POST http://localhost:4028/team/invite/accept \
 -H 'Content-Type: application/json' \
 -d '{"token":"<TOKEN>","username":"newuser","password":"Pass1234"}'
```

## Notes & Customization
- To make accept invite public, remove global guards for that route or introduce a `@Public()` decorator + custom guard.
- Cron cleanup: you can move `purgeExpiredInvites()` into a scheduled task (e.g. every hour) using `@Cron()` from `@nestjs/schedule`.
- Direct assignment does not notify user; implement email if needed.

## Minimal TypeScript Client Helpers
```ts
async function api(path: string, opts: RequestInit = {}, token?: string) {
  const headers: any = { 'Content-Type': 'application/json', ...(opts.headers||{}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${path}`, { ...opts, headers });
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

export async function login(username: string, password: string) {
  return api('/auth/login', { method:'POST', body: JSON.stringify({ username, password }) });
}
```

---
**End of Guide**
