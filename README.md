# pink-lady

Express API with Prisma (PostgreSQL), JWT auth, and Socket.IO.

## Environment

Copy `.env.example` to `.env` and set values:

| Variable       | Description                          |
|----------------|--------------------------------------|
| `DATABASE_URL` | PostgreSQL connection URL            |
| `JWT_SECRET`   | Secret used to sign login tokens     |
| `PORT`         | HTTP port (default `5000`)           |

## Local development

```bash
npm install
cp .env.example .env
# Edit .env — point DATABASE_URL at your Postgres
npx prisma migrate deploy
npm start
```

## Deploy with Docker Compose (app + Postgres)

Set a strong `JWT_SECRET` in your shell or in a `.env` file next to `docker-compose.yml`:

```bash
export JWT_SECRET="$(openssl rand -hex 32)"
docker compose up -d --build
```

The API listens on port **5000**. Change Postgres passwords and exposed ports before production use.

## Deploy on a VPS (build-only image)

Build and run against your managed PostgreSQL:

```bash
docker build -t pink-lady .
docker run -d -p 5000:5000 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="your-secret" \
  -e PORT=5000 \
  pink-lady
```

Migrations run automatically on container start.

## Push to GitHub

Create an empty repository named `pink-lady` on GitHub, then:

```bash
git remote add origin https://github.com/YOUR_USER/pink-lady.git
git branch -M main
git push -u origin main
```

Or with GitHub CLI (after `gh auth login`):

```bash
gh repo create pink-lady --public --source=. --remote=origin --push
```
