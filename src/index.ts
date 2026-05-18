import { renderPage } from "./page";

interface Env {
  BAIDU_API_KEY: string;
  BAIDU_SECRET_KEY: string;
  API_AUTH_KEY: string;
  WEB_PATH_SECRET: string;
  BAIDU_TOKEN_KV: KVNamespace;
}

interface StoredToken {
  access_token: string;
  expires_at: number;
}

interface ShortcutResult {
  name: string;
  confidence_text: string;
}

const TOKEN_KEY = "baidu-access-token";
const TOKEN_REQUEST_MIN_TTL_MS = 5 * 60 * 1000;
const TOKEN_CRON_REFRESH_WINDOW_MS = 3 * 24 * 60 * 60 * 1000;
const TOKEN_EXPIRY_SKEW_MS = 5 * 60 * 1000;
const MAX_FORM_BODY_BYTES = 8 * 1024 * 1024;

let memoryToken: StoredToken | null = null;

class ProxyFailure extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    readonly reason: string
  ) {
    super(reason);
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const webPath = getWebPath(env);

    if (request.method === "GET" && url.pathname === webPath) {
      return html(renderPage());
    }

    if (request.method === "POST" && url.pathname === `${webPath}/identify`) {
      return identify(request, env, ctx, "shortcut");
    }

    if (url.pathname === "/api/identify") {
      if (request.method !== "POST") return serviceError(405, "method_not_allowed", "只支持 POST");
      if (!isAuthorized(request, env)) return serviceError(401, "unauthorized", "缺少或错误的 API key");

      const format = url.searchParams.get("format") || "official";
      if (format !== "official" && format !== "shortcut") {
        return serviceError(400, "bad_format", "format 仅支持 official 或 shortcut");
      }

      return identify(request, env, ctx, format);
    }

    return new Response("Not Found", { status: 404 });
  },

  async scheduled(_controller: ScheduledController, env: Env, _ctx: ExecutionContext): Promise<void> {
    await ensureToken(env, TOKEN_CRON_REFRESH_WINDOW_MS);
  }
} satisfies ExportedHandler<Env>;

async function identify(
  request: Request,
  env: Env,
  _ctx: ExecutionContext,
  format: "official" | "shortcut"
): Promise<Response> {
  const formResult = await readOfficialFormBody(request);
  if (!formResult.ok) return formResult.response;

  try {
    const first = await callBaiduPlant(env, formResult.body, false);
    if (first.tokenInvalid) {
      const second = await callBaiduPlant(env, formResult.body, true);
      return format === "official" ? officialResponse(second) : shortcutResponse(second);
    }

    return format === "official" ? officialResponse(first) : shortcutResponse(first);
  } catch (error) {
    return proxyFailureResponse(error, format);
  }
}

async function readOfficialFormBody(request: Request): Promise<{ ok: true; body: string } | { ok: false; response: Response }> {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/x-www-form-urlencoded")) {
    return { ok: false, response: serviceError(415, "unsupported_media_type", "仅支持 application/x-www-form-urlencoded") };
  }

  const length = request.headers.get("content-length");
  if (length && Number(length) > MAX_FORM_BODY_BYTES) {
    return { ok: false, response: serviceError(413, "request_too_large", "请求体过大") };
  }

  const body = await request.text();
  if (body.length > MAX_FORM_BODY_BYTES) {
    return { ok: false, response: serviceError(413, "request_too_large", "请求体过大") };
  }

  return { ok: true, body: withDefaultBaikeNum(body) };
}

function withDefaultBaikeNum(body: string): string {
  if (/(^|&)baike_num=/.test(body)) return body;
  return body ? `${body}&baike_num=0` : "baike_num=0";
}

async function callBaiduPlant(
  env: Env,
  body: string,
  forceRefreshToken: boolean
): Promise<{ status: number; text: string; contentType: string; tokenInvalid: boolean }> {
  const token = forceRefreshToken ? await refreshToken(env) : await ensureToken(env, TOKEN_REQUEST_MIN_TTL_MS);
  const url = `https://aip.baidubce.com/rest/2.0/image-classify/v1/plant?access_token=${encodeURIComponent(token.access_token)}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body
  });
  const text = await response.text();

  return {
    status: response.status,
    text,
    contentType: response.headers.get("content-type") || "application/json;charset=UTF-8",
    tokenInvalid: isTokenInvalid(text)
  };
}

async function ensureToken(env: Env, minTtlMs: number): Promise<StoredToken> {
  const now = Date.now();
  if (memoryToken && memoryToken.expires_at - now > minTtlMs) return memoryToken;

  const stored = await env.BAIDU_TOKEN_KV.get<StoredToken>(TOKEN_KEY, "json");
  if (stored && stored.access_token && stored.expires_at - now > minTtlMs) {
    memoryToken = stored;
    return stored;
  }

  return refreshToken(env);
}

async function refreshToken(env: Env): Promise<StoredToken> {
  const url =
    "https://aip.baidubce.com/oauth/2.0/token" +
    `?grant_type=client_credentials&client_id=${encodeURIComponent(env.BAIDU_API_KEY)}` +
    `&client_secret=${encodeURIComponent(env.BAIDU_SECRET_KEY)}`;

  const response = await fetch(url, { method: "POST" });
  const data = await response.json() as Record<string, unknown>;

  if (!response.ok || typeof data.access_token !== "string" || typeof data.expires_in !== "number") {
    throw new ProxyFailure(502, "baidu_token_error", "获取百度 access_token 失败");
  }

  const token: StoredToken = {
    access_token: data.access_token,
    expires_at: Date.now() + data.expires_in * 1000 - TOKEN_EXPIRY_SKEW_MS
  };

  memoryToken = token;
  await env.BAIDU_TOKEN_KV.put(TOKEN_KEY, JSON.stringify(token));
  return token;
}

function officialResponse(result: { status: number; text: string; contentType: string }): Response {
  return new Response(result.text, {
    status: result.status,
    headers: { "content-type": result.contentType }
  });
}

function shortcutResponse(result: { status: number; text: string }): Response {
  const parsed = parseJson(result.text);

  if (!parsed) {
    return json({ ok: false, reason: "百度接口返回非 JSON 响应" }, 502);
  }

  if (typeof parsed.error_code === "number" || result.status >= 400) {
    const message = typeof parsed.error_msg === "string" ? parsed.error_msg : `HTTP ${result.status}`;
    return json({ ok: false, reason: `百度接口返回错误：${message}` }, result.status >= 400 ? result.status : 502);
  }

  const sourceResults = Array.isArray(parsed.result) ? parsed.result : [];
  const results: ShortcutResult[] = sourceResults
    .slice(0, 3)
    .map(toShortcutResult)
    .filter((item): item is ShortcutResult => item !== null);

  if (!results.length) return json({ ok: false, reason: "未识别到植物结果" }, 502);
  return json({ ok: true, results });
}

function toShortcutResult(item: unknown): ShortcutResult | null {
  if (!item || typeof item !== "object") return null;
  const record = item as Record<string, unknown>;
  if (typeof record.name !== "string" || !record.name) return null;

  return {
    name: record.name,
    confidence_text: formatConfidence(record.score)
  };
}

function formatConfidence(score: unknown): string {
  const value = typeof score === "number" ? score : Number(score);
  if (!Number.isFinite(value)) return "-";
  const percent = value <= 1 ? value * 100 : value;
  return `${Math.max(0, percent).toFixed(2)}%`;
}

function isTokenInvalid(text: string): boolean {
  const parsed = parseJson(text);
  return parsed?.error_code === 110 || parsed?.error_code === 111;
}

function parseJson(text: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === "object" ? parsed as Record<string, unknown> : null;
  } catch {
    return null;
  }
}

function isAuthorized(request: Request, env: Env): boolean {
  const header = request.headers.get("authorization") || "";
  return header === `Bearer ${env.API_AUTH_KEY}`;
}

function getWebPath(env: Env): string {
  const secret = env.WEB_PATH_SECRET.replace(/^\/+|\/+$/g, "");
  return `/${secret}`;
}

function html(body: string): Response {
  return new Response(body, {
    headers: {
      "content-type": "text/html;charset=UTF-8",
      "cache-control": "no-store"
    }
  });
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json;charset=UTF-8",
      "cache-control": "no-store"
    }
  });
}

function serviceError(status: number, code: string, reason: string): Response {
  return json({ error: { code, reason } }, status);
}

function proxyFailureResponse(error: unknown, format: "official" | "shortcut"): Response {
  const failure = error instanceof ProxyFailure
    ? error
    : new ProxyFailure(502, "proxy_error", "代理请求失败");

  if (format === "shortcut") {
    return json({ ok: false, reason: failure.reason }, failure.status);
  }

  return serviceError(failure.status, failure.code, failure.reason);
}
