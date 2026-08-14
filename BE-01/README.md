# Task API — CRUD To-Do List (W2.A1)

A minimal to-do list API built with Express and TypeScript — full CRUD, in-memory storage, and interactive docs via Swagger UI. Built for the FlyRank Backend Internship, Week 2, Assignment A1.

## What this is

A small REST API that manages a list of tasks. Supports the four CRUD operations:

- **Create** a task
- **Read** all tasks or a single task
- **Update** a task
- **Delete** a task

Data lives in memory only — it resets when the server restarts. No database, no files. That's intentional (see Notes below).

## How to run it

```bash
git clone https://github.com/RonydaEssam/FlyRank-Assignments.git
cd flyrank-assignments/BE-01

npm install
npm run dev
```

The server starts on `http://localhost:3000`.

## Endpoints

| Method | Route | Description | Success | Errors |
|--------|-------|-------------|---------|--------|
| GET | `/` | API description | 200 | — |
| GET | `/health` | Health check | 200 | — |
| GET | `/tasks` | List all tasks | 200 | — |
| GET | `/tasks/:id` | Get a single task | 200 | 404 if not found |
| POST | `/tasks` | Create a task | 201 | 400 if title missing/empty |
| PUT | `/tasks/:id` | Update a task | 200 | 400 invalid body, 404 not found |
| DELETE | `/tasks/:id` | Delete a task | 204 | 404 if not found |

Each error returns a JSON body, e.g. `{ "error": "Task 99 not found" }`.

## Example request

```bash
curl -i http://localhost:3000/tasks/1
```

```
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 67
ETag: W/"43-BXKZmZoUZGORYrNa2GIdk5m8uSE"
Date: Fri, 14 Aug 2026 10:41:33 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"task":{"id":1,"title":"Prepare working environment","done":true}}
```

## Swagger UI

Interactive docs are served at `/docs`. Full CRUD cycle (create, list, update, delete) was tested there via "Try it out", not just curl.

![alt text](image.png)

## Tech stack

- TypeScript
- Express
- swagger-ui-express + a hand-written OpenAPI (YAML) spec
- tsx + nodemon for local dev

## Notes

**The mortality experiment:** since tasks are stored in memory only, restarting the server wipes all data back to the 3 seed tasks.
