import { beforeEach, describe, expect, it, vi } from "vitest";

class MemoryKV {
  store = new Map<string, string>();

  async get<T = unknown>(key: string, type?: "json"): Promise<T | string | null> {
    const value = this.store.get(key);
    if (value === undefined) return null;
    return type === "json" ? JSON.parse(value) as T : value;
  }

  async put(key: string, value: string): Promise<void> {
    this.store.set(key, value);
  }
}

interface TestEnv {
  BAIDU_API_KEY: string;
  BAIDU_SECRET_KEY: string;
  API_AUTH_KEY: string;
  WEB_PATH_SECRET: string;
  TOKEN_KV: MemoryKV;
}

function makeEnv(): TestEnv {
  return {
    BAIDU_API_KEY: "baidu-api-key",
    BAIDU_SECRET_KEY: "baidu-secret-key",
    API_AUTH_KEY: "api-key",
    WEB_PATH_SECRET: "secret-path",
    TOKEN_KV: new MemoryKV()
  };
}

async function loadWorker() {
  vi.resetModules();
  const mod = await import("../src/index");
  return mod.default as any;
}

function request(path: string, init: RequestInit = {}): Request {
  return new Request(`https://example.test${path}`, init);
}

describe("FloraLite Worker", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("requires bearer auth for API requests", async () => {
    const worker = await loadWorker();
    const env = makeEnv();
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await worker.fetch!(request("/api/identify", { method: "POST" }), env, {} as ExecutionContext);

    expect(response.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects non form-urlencoded API requests", async () => {
    const worker = await loadWorker();
    const env = makeEnv();

    const response = await worker.fetch!(
      request("/api/identify", {
        method: "POST",
        headers: {
          authorization: "Bearer api-key",
          "content-type": "application/json"
        },
        body: JSON.stringify({ image: "abc" })
      }),
      env,
      {} as ExecutionContext
    );

    expect(response.status).toBe(415);
  });

  it("defaults API format to official and returns Baidu JSON unchanged", async () => {
    const worker = await loadWorker();
    const env = makeEnv();
    const plantCalls: RequestInit[] = [];

    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/oauth/2.0/token")) {
        return Response.json({ access_token: "token-1", expires_in: 2_592_000 });
      }

      plantCalls.push(init || {});
      return Response.json({ log_id: 1, result: [{ name: "莲", score: 0.99 }] }, { status: 200 });
    }));

    const response = await worker.fetch!(
      request("/api/identify", {
        method: "POST",
        headers: {
          authorization: "Bearer api-key",
          "content-type": "application/x-www-form-urlencoded"
        },
        body: "image=abc"
      }),
      env,
      {} as ExecutionContext
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ log_id: 1, result: [{ name: "莲", score: 0.99 }] });
    expect(plantCalls).toHaveLength(1);
    expect(plantCalls[0].body).toBe("image=abc&baike_num=0");
  });

  it("sends missing-image official requests to Baidu instead of local validation", async () => {
    const worker = await loadWorker();
    const env = makeEnv();
    const plantBodies: unknown[] = [];

    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/oauth/2.0/token")) {
        return Response.json({ access_token: "token-1", expires_in: 2_592_000 });
      }

      plantBodies.push(init?.body);
      return Response.json({ error_code: 216201, error_msg: "image is required" }, { status: 200 });
    }));

    const response = await worker.fetch!(
      request("/api/identify?format=official", {
        method: "POST",
        headers: {
          authorization: "Bearer api-key",
          "content-type": "application/x-www-form-urlencoded"
        },
        body: ""
      }),
      env,
      {} as ExecutionContext
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ error_code: 216201, error_msg: "image is required" });
    expect(plantBodies).toEqual(["baike_num=0"]);
  });

  it("returns only the top three shortcut results", async () => {
    const worker = await loadWorker();
    const env = makeEnv();

    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/oauth/2.0/token")) {
        return Response.json({ access_token: "token-1", expires_in: 2_592_000 });
      }

      return Response.json({
        result: [
          { name: "莲", score: 0.9998 },
          { name: "睡莲", score: 0.1234 },
          { name: "荷花", score: 0.02 },
          { name: "芋", score: 0.01 }
        ]
      });
    }));

    const response = await worker.fetch!(
      request("/api/identify?format=shortcut", {
        method: "POST",
        headers: {
          authorization: "Bearer api-key",
          "content-type": "application/x-www-form-urlencoded"
        },
        body: "image=abc"
      }),
      env,
      {} as ExecutionContext
    );

    expect(await response.json()).toEqual({
      ok: true,
      results: [
        { name: "莲", confidence_text: "99.98%" },
        { name: "睡莲", confidence_text: "12.34%" },
        { name: "荷花", confidence_text: "2.00%" }
      ]
    });
  });

  it("refreshes token and retries once when Baidu reports token invalid", async () => {
    const worker = await loadWorker();
    const env = makeEnv();
    let tokenCalls = 0;
    let plantCalls = 0;

    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/oauth/2.0/token")) {
        tokenCalls += 1;
        return Response.json({ access_token: `token-${tokenCalls}`, expires_in: 2_592_000 });
      }

      plantCalls += 1;
      if (plantCalls === 1) return Response.json({ error_code: 110, error_msg: "Access token invalid" });
      return Response.json({ result: [{ name: "莲", score: 1 }] });
    }));

    const response = await worker.fetch!(
      request("/api/identify?format=shortcut", {
        method: "POST",
        headers: {
          authorization: "Bearer api-key",
          "content-type": "application/x-www-form-urlencoded"
        },
        body: "image=abc"
      }),
      env,
      {} as ExecutionContext
    );

    expect(tokenCalls).toBe(2);
    expect(plantCalls).toBe(2);
    expect(await response.json()).toEqual({
      ok: true,
      results: [{ name: "莲", confidence_text: "100.00%" }]
    });
  });

  it("refreshes and stores a token from the scheduled handler", async () => {
    const worker = await loadWorker();
    const env = makeEnv();

    vi.stubGlobal("fetch", vi.fn(async () => {
      return Response.json({ access_token: "scheduled-token", expires_in: 2_592_000 });
    }));

    await worker.scheduled!({} as ScheduledController, env, {} as ExecutionContext);

    const stored = JSON.parse(env.TOKEN_KV.store.get("baidu-access-token") || "{}");
    expect(stored.access_token).toBe("scheduled-token");
    expect(typeof stored.expires_at).toBe("number");
  });

  it("serves the private page and uses shortcut shape for page submissions", async () => {
    const worker = await loadWorker();
    const env = makeEnv();

    const page = await worker.fetch!(request("/secret-path"), env, {} as ExecutionContext);
    expect(page.status).toBe(200);
    expect(await page.text()).toContain("FloraLite");

    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/oauth/2.0/token")) {
        return Response.json({ access_token: "token-1", expires_in: 2_592_000 });
      }

      return Response.json({ result: [{ name: "莲", score: 0.5 }] });
    }));

    const submit = await worker.fetch!(
      request("/secret-path/identify", {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: "image=abc"
      }),
      env,
      {} as ExecutionContext
    );

    expect(await submit.json()).toEqual({
      ok: true,
      results: [{ name: "莲", confidence_text: "50.00%" }]
    });
  });
});
