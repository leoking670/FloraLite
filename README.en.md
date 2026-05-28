# FloraLite

[简体中文](README.md) | English

FloraLite is a private plant recognition web page and API deployed on Cloudflare Workers. It calls the Baidu plant recognition API and is intended for personal private use.

## Local Development

```bash
npm install
cp .dev.vars.example .dev.vars
npm run dev
```

The local page uses `WEB_PATH_SECRET` from `.dev.vars`.

## Cloudflare Setup

Keep only the KV binding name `FLORALITE_BAIDU_TOKEN_KV` in `wrangler.toml`. With Cloudflare automatic provisioning, deployment creates and binds the required KV namespace automatically, so there is no need to commit production or preview namespace IDs.

If you already have an existing KV namespace, you can still add its `id` manually in `wrangler.toml`. For this project, automatic creation is the cleaner default and works better with GitHub one-click deployment.

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

## AI-Assisted Generation Notice

Parts of this project's code, documentation, and tests were generated with assistance from an AI coding assistant, then reviewed, modified, and verified by the project maintainer. The project maintainer is responsible for the final committed content.

## License

This project is licensed under the GNU General Public License v3.0. See [LICENSE](LICENSE).
