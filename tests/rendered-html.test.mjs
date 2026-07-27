import assert from "node:assert/strict";
import test from "node:test";

async function loadWorker() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${Math.random()}`);
  return (await import(workerUrl.href)).default;
}

const context = {
  waitUntil() {},
  passThroughOnException() {},
};

const assets = {
  fetch: async () => new Response("Not found", { status: 404 }),
};

test("renders the accessible on-site contact form", async () => {
  const worker = await loadWorker();
  const response = await worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: assets },
    context,
  );
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /id="contact"/);
  assert.match(html, /Start a conversation/);
  assert.match(html, /name="name"/);
  assert.match(html, /name="email"/);
  assert.match(html, /name="phone"/);
  assert.match(html, /name="projectType"/);
  assert.match(html, /name="message"/);
  assert.match(html, /name="consent"/);
  assert.match(html, /mailto:hello@everpoint\.tech/);
});

test("serves the runtime Turnstile site key without caching", async () => {
  const worker = await loadWorker();
  const response = await worker.fetch(
    new Request("http://localhost/api/contact-config"),
    { ASSETS: assets, TURNSTILE_SITE_KEY: "site-key" },
    context,
  );
  assert.deepEqual(await response.json(), { siteKey: "site-key" });
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("verifies Turnstile and sends a valid inquiry through Resend", async () => {
  const worker = await loadWorker();
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push([String(url), options]);
    if (String(url).includes("siteverify")) {
      return Response.json({ success: true });
    }
    if (String(url).includes("api.resend.com")) {
      return Response.json({ id: "email_123" });
    }
    throw new Error(`Unexpected request: ${url}`);
  };

  try {
    const response = await worker.fetch(
      new Request("http://localhost/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: "Alex Morgan",
          email: "alex@example.com",
          phone: "",
          projectType: "Home networking & Wi-Fi",
          message: "We need reliable Wi-Fi throughout our two-story home.",
          consent: "yes",
          website: "",
          turnstileToken: "valid-token",
          startedAt: Date.now() - 3000,
        }),
      }),
      {
        ASSETS: assets,
        TURNSTILE_SECRET_KEY: "secret",
        RESEND_API_KEY: "re_test",
      },
      context,
    );
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true });
    assert.equal(calls.length, 2);
    const resendPayload = JSON.parse(calls[1][1].body);
    assert.deepEqual(resendPayload.to, ["hello@everpoint.tech"]);
    assert.equal(resendPayload.reply_to, "alex@example.com");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("rejects incomplete submissions before calling external services", async () => {
  const worker = await loadWorker();
  const response = await worker.fetch(
    new Request("http://localhost/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: "A",
        email: "invalid",
        projectType: "",
        message: "Too short",
        consent: "",
        turnstileToken: "token",
        startedAt: Date.now() - 3000,
      }),
    }),
    {
      ASSETS: assets,
      TURNSTILE_SECRET_KEY: "secret",
      RESEND_API_KEY: "re_test",
    },
    context,
  );
  assert.equal(response.status, 400);
});
