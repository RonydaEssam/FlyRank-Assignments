# Task Connecting to the database (W2.A1)

A to-do list API built with Express and TypeScript, full CRUD, backed by a real SQLite database, with interactive docs via Swagger UI. Built for the FlyRank Backend Internship: Week 2 (A1: in-memory CRUD) and Week 3 (A2: persistent storage).

## What this is

A REST API that manages a list of tasks. Supports the four CRUD operations:

- **Create** a task
- **Read** all tasks or a single task
- **Update** a task
- **Delete** a task

As of A2, tasks are stored in a SQLite database (`tasks.db`) instead of in memory, data now survives a server restart.

## Why SQLite

SQLite needs no separate server or install, the entire database is a single file. That makes it ideal for a small project like this: zero setup, works the same on any machine that clones the repo, and it's easy to inspect directly (see the DB Browser section below). For a project this size, a heavier database like Postgres would add operational overhead with no real benefit.

## Where the database lives

`tasks.db` is created automatically the first time the server starts, in the project root. It's git-ignored, every fresh clone starts with an empty file that self-creates its schema and seeds 3 example tasks on first run.

## How to run it

```bash
git clone https://github.com/RonydaEssam/FlyRank-Assignments.git
cd flyrank-assignments/BE-02

npm install
npm run dev
```

The server starts on `http://localhost:3000`. `tasks.db` and the `tasks` table are created automatically, seeded with 3 example tasks.

## Project structure

```
BE-02/
├── src/
│   ├── handlers/       # request handlers (business logic)
│   │   ├── tasks.ts
│   │   └── meta.ts
│   ├── routes/         # route definitions
│   │   ├── tasks.routes.ts
│   │   └── meta.routes.ts
│   ├── middleware/
│   ├── db.ts            # SQLite connection, schema, seeding
│   ├── openapi.yaml
│   └── index.ts          # app entry point
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

Interactive docs are served at `/docs`. Full CRUD cycle (create, list, update, delete) was tested there via "Try it out".

![alt text](image.png)

## Exploring the database directly

The database can be opened and queried by hand in [DB Browser for SQLite](https://sqlitebrowser.org/), completely independent of the running API — both read and write the same `tasks.db` file, so changes made in one show up instantly in the other with no restart needed.

![DB Browser screenshot](PASTE_DB_BROWSER_SCREENSHOT_FILENAME_HERE.png)

Example query run directly against the database:

```bash
DELETE FROM tasks WHERE id = 2;
```

```bash
Execution finished without errors.
Result: query executed successfully. Took 0ms, 1 rows affected
At line 1:
DELETE FROM tasks WHERE id = 2;
```

## Tech stack

- TypeScript
- Express
- better-sqlite3 
- swagger-ui-express + a hand-written OpenAPI (YAML) spec
- tsx + nodemon for local dev

## Notes

**A1 → A2:** the API's routes, request/response shapes, and status codes are unchanged from Assignment 1, only the storage layer moved from an in-memory array to SQLite.

All CRUD operations use parameterized queries (`WHERE id = ?`), user input is never glued directly into SQL strings.
