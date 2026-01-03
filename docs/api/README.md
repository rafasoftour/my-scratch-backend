# API contract (Postman)

This folder contains the Postman collection and environment for the current API.

Import:
- Collection: `docs/api/postman_collection.json`
- Environment: `docs/api/postman_environment.dev.json`

Usage:
1) Select environment `dev`.
2) Run `Health`.
3) Run `POST Create user` (stores `userId` automatically).
4) Use `GET`, `PATCH`, and `DELETE` with `{{userId}}`.
5) After DELETE, `GET` returns 404 with code `USER_NOT_FOUND`.

Request ID:
- Optional header `x-request-id: {{requestId}}`.
- If empty, Fastify generates one; `Health` stores the latest in `lastRequestId`.
