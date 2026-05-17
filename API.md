# Lumina API Reference

Base URL: `https://lumina.app/api`  
Authentication: `Authorization: Bearer <JWT>`  
Content-Type: `application/json`

---

## Authentication

### POST /auth/register
Register a new user.

**Body**
```json
{ "email": "user@example.com", "password": "min8chars", "username": "john" }
```

**Response** `201`
```json
{ "token": "eyJ...", "user": { "id": "...", "email": "...", "role": "user" } }
```

---

### POST /auth/login
Authenticate and receive a JWT.

**Body**
```json
{ "email": "user@example.com", "password": "..." }
```

**Response** `200`
```json
{ "token": "eyJ...", "expires_in": 3600 }
```

---

### POST /auth/logout
Invalidate the current token.

**Headers** — requires auth  
**Response** `204`

---

### POST /auth/reset-password
Request a password reset email.

**Body**
```json
{ "email": "user@example.com" }
```

**Response** `200`
```json
{ "message": "Reset link sent" }
```

---

## Anime

### GET /anime
List anime with optional filters.

**Query params**
| Param | Type | Description |
|-------|------|-------------|
| `page` | int | Page number (default 1) |
| `per_page` | int | Results per page (max 50) |
| `genre` | string | Filter by genre slug |
| `status` | string | `airing`, `completed`, `upcoming` |
| `sort` | string | `rating`, `popularity`, `newest` |

**Response** `200`
```json
{
  "data": [ { "id": 1, "title": "...", "cover": "...", "rating": 8.5 } ],
  "meta": { "total": 500, "page": 1, "per_page": 20 }
}
```

---

### GET /anime/{id}
Get full anime details.

**Response** `200`
```json
{
  "id": 1, "title": "...", "synopsis": "...",
  "genres": ["Action"], "episodes_count": 24,
  "rating": 8.5, "status": "completed"
}
```

---

### GET /anime/{id}/episodes
List episodes for an anime.

**Response** `200`
```json
{
  "data": [ { "id": 1, "number": 1, "title": "...", "duration": 1440 } ]
}
```

---

## Episodes

### GET /episodes/{id}/stream
Get streaming URL for an episode. Requires auth.

**Response** `200`
```json
{ "url": "https://...", "quality": "1080p", "expires_at": "..." }
```

---

## Search

### GET /search
Search anime by title, genre, or tags.

**Query params**: `q` (required), `page`, `per_page`

**Response** `200` — same shape as `/anime`

---

## User

### GET /me
Get the authenticated user's profile.

**Response** `200`
```json
{ "id": "...", "username": "...", "email": "...", "role": "user", "premium": false }
```

---

### PUT /me
Update own profile.

**Body** — any subset of `{ "username", "avatar_url", "bio" }`

**Response** `200` — updated user object

---

## Favorites

### GET /me/favorites
List favorited anime. Requires auth.

### POST /me/favorites/{anime_id}
Add to favorites. **Response** `201`

### DELETE /me/favorites/{anime_id}
Remove from favorites. **Response** `204`

---

## Reviews

### POST /anime/{id}/reviews
Create a review. Requires auth.

**Body**
```json
{ "rating": 9, "body": "Amazing series!" }
```

**Response** `201`

---

## Notifications

### GET /me/notifications
List notifications. Requires auth.

### PUT /me/notifications/{id}/read
Mark as read. **Response** `204`

---

## Error Responses

| Status | Meaning |
|--------|---------|
| 400 | Bad Request — validation failed |
| 401 | Unauthorized — missing or invalid token |
| 403 | Forbidden — insufficient permissions |
| 404 | Not Found |
| 422 | Unprocessable Entity |
| 429 | Too Many Requests — rate limit exceeded |
| 500 | Internal Server Error |

```json
{ "error": "Unauthorized", "message": "Token expired", "code": 401 }
```
