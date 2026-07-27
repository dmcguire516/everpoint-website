/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: Fetcher;
  DB?: D1Database;
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
  CONTACT_TO_EMAIL?: string;
  TURNSTILE_SITE_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/contact-config" && request.method === "GET") {
      return json({ siteKey: env.TURNSTILE_SITE_KEY || "" });
    }

    if (url.pathname === "/api/contact" && request.method === "POST") {
      return handleContactSubmission(request, env);
    }

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }

    return handler.fetch(request, env, ctx);
  },
};

export default worker;

type ContactPayload = {
  name?: string;
  email?: string;
  phone?: string;
  projectType?: string;
  message?: string;
  consent?: string;
  website?: string;
  turnstileToken?: string;
  startedAt?: number;
};

const json = (body: object, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });

const clean = (value: unknown, max: number) =>
  String(value ?? "").trim().replace(/\r\n/g, "\n").slice(0, max);

async function handleContactSubmission(request: Request, env: Env) {
  if (!env.RESEND_API_KEY || !env.TURNSTILE_SECRET_KEY) {
    return json({ error: "The contact form is temporarily unavailable." }, 503);
  }

  let payload: ContactPayload;
  try {
    payload = (await request.json()) as ContactPayload;
  } catch {
    return json({ error: "Invalid request." }, 400);
  }

  const name = clean(payload.name, 100);
  const email = clean(payload.email, 254);
  const phone = clean(payload.phone, 40);
  const projectType = clean(payload.projectType, 100);
  const message = clean(payload.message, 5000);
  const startedAt = Number(payload.startedAt);

  if (clean(payload.website, 200)) return json({ ok: true });
  if (!Number.isFinite(startedAt) || Date.now() - startedAt < 2000) {
    return json({ error: "Please wait a moment and try again." }, 400);
  }
  if (
    name.length < 2 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !projectType ||
    message.length < 20 ||
    payload.consent !== "yes"
  ) {
    return json({ error: "Please check the form and complete every required field." }, 400);
  }

  const turnstileResponse = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      secret: env.TURNSTILE_SECRET_KEY,
      response: clean(payload.turnstileToken, 2048),
      remoteip: request.headers.get("CF-Connecting-IP") || undefined,
    }),
  });
  const verification = (await turnstileResponse.json()) as { success?: boolean };
  if (!verification.success) {
    return json({ error: "Spam protection failed. Please refresh and try again." }, 400);
  }

  const escapeHtml = (value: string) =>
    value.replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    })[character] ?? character);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: env.RESEND_FROM_EMAIL || "Everpoint Website <hello@everpoint.tech>",
      to: [env.CONTACT_TO_EMAIL || "hello@everpoint.tech"],
      reply_to: email,
      subject: `New Everpoint inquiry — ${projectType}`,
      html: `
        <div style="font-family:Arial,sans-serif;color:#101419;line-height:1.6;max-width:640px">
          <p style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#52606d">New website inquiry</p>
          <h1 style="font-size:28px;margin:0 0 24px">A new project inquiry from ${escapeHtml(name)}</h1>
          <p><strong>Project type:</strong> ${escapeHtml(projectType)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Phone:</strong> ${escapeHtml(phone || "Not provided")}</p>
          <hr style="border:0;border-top:1px solid #dce2e7;margin:28px 0">
          <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
        </div>
      `,
      text: [
        "New Everpoint website inquiry",
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone || "Not provided"}`,
        `Project type: ${projectType}`,
        "",
        message,
      ].join("\n"),
    }),
  });

  if (!response.ok) {
    console.error("Resend submission failed", response.status, await response.text());
    return json({ error: "We couldn’t send your message. Please try again shortly." }, 502);
  }

  return json({ ok: true });
}
