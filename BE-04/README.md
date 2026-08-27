# Auth - Login & protect (W4.A4)

<!-- ## Database (Postgres via Docker)

A to-do list API built with Express and TypeScript — full CRUD, backed by a containerized PostgreSQL database, with interactive docs via Swagger UI. Built for the FlyRank Backend Internship: Week 2 (A1: in-memory CRUD), Week 3 (A2: SQLite), and (A3: Postgres in Docker).

This assignment moves task storage from SQLite to a containerized PostgreSQL database.

## What this is

A REST API that manages a list of tasks. Supports the four CRUD operations:

- **Create** a task
- **Read** all tasks or a single task
- **Update** a task
- **Delete** a task

As of A3, tasks are stored in a PostgreSQL database running in a Docker container. The whole stack, app and database, starts with a single command: `docker compose up`.

## How to run it (one command)

```bash
git clone https://github.com/RonydaEssam/FlyRank-Assignments.git
cd assignments/BE-03

cp .env.example .env
docker compose up
```

The API is available at `http://localhost:3000`. The database, table, and 3 seed tasks are created automatically on first run.

## Environment variables

See `.env.example` for the required keys. `.env` is git-ignored and never committed, copy `.env.example` to `.env` before running.

```
DATABASE_URL=postgres://postgres:dev@localhost:5432/tasks
```

> **Note (Windows):** if you're running the database standalone (outside Compose) and port 5432 is already taken by a local Postgres install, remap the container to a free host port (e.g. `5433`) and update `DATABASE_URL` in `.env` to match. Inside Docker Compose this isn't an issue — containers reach each other by service name (`db`) on their own internal network, regardless of what's running on your host machine.

## Project structure

```
BE-03/
├── src/
│   ├── handlers/        # request handlers (business logic)
│   │   ├── tasks.ts
│   │   └── meta.ts
│   ├── routes/          # route definitions
│   │   ├── tasks.routes.ts
│   │   └── meta.routes.ts
│   ├── middleware/
│   ├── db.ts             # Postgres connection, schema, seeding
│   ├── openapi.yaml
│   └── index.ts           # app entry point
├── Dockerfile
├── compose.yaml
├── .env.example
├── package.json
└── tsconfig.json
```

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

Each error returns a JSON body, e.g. `{ "error": "Task with id (99) not found." }`.

## Example request

```bash
curl -i -X POST http://localhost:3000/tasks -H "Content-Type: application/json" -d "{\"title\":\"Persistence check 3\"}"
```

```
HTTP/1.1 201 Created
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 99
ETag: W/"63-80kObKsTabLgDmVVQaBvzL2YN4A"
Date: Tue, 25 Aug 2026 13:09:56 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"message":"Task created successfully.","task":{"id":5,"title":"Persistence check 3","done":false}}
```

## Swagger UI

Interactive docs are served at `/docs`. Full CRUD cycle (create, list, update, delete) was tested there via "Try it out".

![Swagger UI screenshot](swagger-ui.png)

## Data in the database

A screenshot of the seeded/created data, viewed with `psql` or a GUI tool (DBeaver, pgAdmin, TablePlus):

![Database screenshot](database.png)

## Tech stack

- TypeScript
- Express
- PostgreSQL 16, running in Docker
- `pg` (node-postgres) — Postgres driver
- Docker + Docker Compose
- swagger-ui-express + a hand-written OpenAPI (YAML) spec

## Troubleshooting notes (things that tripped me up building this)

A few real issues hit while building the containerized version, kept here in case they help someone else (or future me):

- **`Dockerfile` is case-sensitive.** Windows Explorer hides this, since it's case-insensitive — a file named `DockerFile` looks identical to `Dockerfile` in the file browser, but Docker's build engine (Linux-based) only recognizes the exact lowercase-`f` spelling and fails with a "no such file or directory" error otherwise.
- **`postgres:18+` changed its internal data directory layout** (`pg_ctlcluster`-compatible, version-specific paths). Mounting a volume the classic way (`/var/lib/postgresql/data`) fails on 18+. Pinned to `postgres:16` to avoid this entirely.
- **A local Postgres install running as a Windows service can silently squat on port 5432**, intercepting connections meant for a Docker container mapped to the same port — even though `docker ps` shows the container as healthy. `netstat -ano | findstr :5432` plus `tasklist /FI "PID eq <pid>"` will reveal a second, non-Docker process on the port if this happens.
- **`dotenv.config()` must run *before* anything reads `process.env`** — an early debug log or Pool initialization placed above the `.config()` call will see `undefined`, even though the `.env` file itself is correct.
- **A missing `volumes:` block on the `db` service in `compose.yaml` means Postgres has nowhere persistent to write** — data survives while the container is running, but is wiped the instant `docker compose down` removes the container. YAML indentation matters here: `volumes:` must sit at the same level as `image:`/`environment:` under the service, and the named-volume declaration (`taskdata:`) must be a top-level key, not nested inside `services:`.

## Notes

**A1 → A2 → A3:** the API's routes, request/response shapes, and status codes stayed unchanged across all three storage swaps, from an in-memory array, to a SQLite file, to a full Postgres server in Docker. This is the core lesson of the series: the API is the promise, the database is where the promise is kept, and clients never notice the difference underneath.

All CRUD operations use parameterized queries (`$1`, `$2`, ...), user input is never glued directly into SQL strings. -->
