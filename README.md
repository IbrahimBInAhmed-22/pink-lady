# pink-lady

Express API with Prisma (PostgreSQL), JWT auth, and Socket.IO.

## Environment

Copy `.env.example` to `.env` and set values:

| Variable       | Description |
|----------------|-------------|
| `DATABASE_URL` | PostgreSQL connection URL |
| `JWT_SECRET`   | Secret used to sign login tokens |
| `PORT`         | HTTP port (default `8080`; Railway injects `PORT`) |

## Local development

```bash
npm install
cp .env.example .env
# Edit .env — point DATABASE_URL at your Postgres
npm run migrate
npm start
```

## Deploy with Docker Compose (app + Postgres)

The image does **not** run migrations on every container start (avoids hangs when the DB is slow). The Postgres hostname `db` is only available **after** the stack is running, so build-time migrate is skipped for this compose file.

```bash
export JWT_SECRET="$(openssl rand -hex 32)"
docker compose up -d --build
docker compose exec app npx prisma migrate deploy
```

The API listens on port **8080** (host `localhost:8080`). Change Postgres passwords before production use.

## Docker image (VPS / registry)

Build with a database URL so migrations apply in the image:

```bash
docker build --build-arg DATABASE_URL="postgresql://..." -t pink-lady .
docker run -d -p 8080:8080 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="your-secret" \
  -e PORT=8080 \
  pink-lady
```

If you build **without** `--build-arg DATABASE_URL`, the image still builds but migrations are skipped — run `npm run migrate` against that database before traffic, or rebuild with the build-arg.

## Railway

1. Set **`DATABASE_URL`** and **`JWT_SECRET`** on the service.
2. **`railway.toml`** runs `npx prisma migrate deploy` as a **release command** (before the new revision goes live), so the DB is reachable and migrations are not part of `CMD`.
3. Optionally add **`DATABASE_URL`** as a **Docker build argument** in Railway if you also want migrations applied during `docker build` (redundant if release command runs).

The app listens on **`PORT`** (Railway sets this; the Docker image defaults to **8080**).

## Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USER/pink-lady.git
git branch -M main
git push -u origin main
```
