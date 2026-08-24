# Containerize the stack (W3.A3)

## Database (Postgres via Docker)

This assignment moves task storage from SQLite to a containerized PostgreSQL database.

Start the database:

```bash
docker run --name taskdb -e POSTGRES_PASSWORD=dev -e POSTGRES_DB=tasks -p 5432:5432 -v taskdata:/var/lib/postgresql/data -d postgres:16
```

Pinned to `postgres:16` — Postgres 18+ changed its internal data directory layout, which breaks the classic `/var/lib/postgresql/data` volume mount used here.

Inspect it directly:

```bash
docker exec -it taskdb psql -U postgres -d tasks
```

> **Note (Windows):** if port 5432 is already in use by a local Postgres install, this project's `taskdb` container maps to host port **5433** instead. Update `DATABASE_URL` in your `.env` accordingly (see `.env.example` for the standard port 5432, used if you have no conflict).