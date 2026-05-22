# VPS Deployment

Docker Compose runs four services:

- `web`: public Next.js app on internal port `3000`
- `admin`: admin Next.js app on internal port `3001`
- `mongo`: private MongoDB service
- `nginx`: reverse proxy on host port `80`

## Prepare Ubuntu

```bash
sudo apt update
sudo apt install -y ca-certificates curl git ufw
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
```

Log out and back in so the Docker group is active.

## Configure Env

```bash
cp .env.example .env
nano .env
```

Set strong values for:

- `ADMIN_JWT_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `MONGO_ROOT_PASSWORD`
- `MONGO_APP_PASSWORD`
- all `R2_*` keys

Use URL-safe characters for `MONGO_APP_PASSWORD` because Docker Compose injects it into `MONGODB_URI`.

For Docker Compose, keep `MONGODB_URI` as a local/dev value or set it to:

```env
MONGODB_URI=mongodb://99billiards:change-this-app-password@mongo:27017/99billiards
```

The compose file overrides `MONGODB_URI` for `web` and `admin` using `MONGO_APP_USERNAME` and `MONGO_APP_PASSWORD`.

## Run

```bash
docker compose up -d --build
docker compose logs -f web admin nginx
```

Seed only once, before real content exists:

```bash
docker compose exec web npm run seed
```

Do not run seed again after adding real CMS data.

## Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

MongoDB is only on the Docker internal network and is not published to the host.

## HTTPS

Terminate TLS on the VPS with Certbot or another reverse proxy in front of this Nginx container. Once HTTPS is active, make sure public DNS points:

- `www.99billiards.vn` to the VPS
- `admin.99billiards.vn` to the VPS

## Backup MongoDB

Example manual backup:

```bash
docker compose exec mongo mongodump \
  --username "$MONGO_ROOT_USERNAME" \
  --password "$MONGO_ROOT_PASSWORD" \
  --authenticationDatabase admin \
  --db 99billiards \
  --archive=/tmp/99billiards.archive \
  --gzip

docker compose cp mongo:/tmp/99billiards.archive ./backups/99billiards-$(date +%F).archive.gz
```
