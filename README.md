# FloraLite

Private Cloudflare Worker for Baidu plant recognition.

## Local Development

```bash
npm install
cp .dev.vars.example .dev.vars
npm run dev
```

The local page uses `WEB_PATH_SECRET` from `.dev.vars`.

## Cloudflare Setup

Create a KV namespace and paste the returned IDs into `wrangler.toml`:

```bash
npx wrangler kv namespace create TOKEN_KV
npx wrangler kv namespace create TOKEN_KV --preview
```

Set production secrets:

```bash
npx wrangler secret put BAIDU_API_KEY
npx wrangler secret put BAIDU_SECRET_KEY
npx wrangler secret put API_AUTH_KEY
npx wrangler secret put WEB_PATH_SECRET
```

Deploy:

```bash
npm run deploy
```

## API

`POST /api/identify` defaults to the official Baidu-style response.

```bash
curl -X POST "https://your-worker.example/api/identify" \
  -H "Authorization: Bearer <API_AUTH_KEY>" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "image=<base64>"
```

Shortcut format returns the top three names and display-ready confidence values:

```bash
curl -X POST "https://your-worker.example/api/identify?format=shortcut" \
  -H "Authorization: Bearer <API_AUTH_KEY>" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "image=<base64>"
```

The private web page is available at:

```text
https://your-worker.example/<WEB_PATH_SECRET>
```
