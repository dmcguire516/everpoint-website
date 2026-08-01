"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type Errors = Partial<Record<"name" | "email" | "projectType" | "message" | "consent" | "form", string>>;

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: {
        sitekey: string;
        theme: "light";
        callback: (token: string) => void;
        "expired-callback": () => void;
        "error-callback": () => void;
      }) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

const projectTypes = [
  "Home networking & Wi-Fi",
  "Security cameras",
  "Smart home integration",
  "Small business technology",
  "Ongoing support",
  "Not sure yet",
];

function validate(form: HTMLFormElement) {
  const data = new FormData(form);
  const errors: Errors = {};
  const name = String(data.get("name") ?? "").trim();
  const email = String(data.get("email") ?? "").trim();
  const projectType = String(data.get("projectType") ?? "");
  const message = String(data.get("message") ?? "").trim();
  if (name.length < 2) errors.name = "Please enter your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Please enter a valid email address.";
  if (!projectType) errors.projectType = "Please select a project type.";
  if (message.length < 20) errors.message = "Please share at least a few details about your project.";
  if (!data.get("consent")) errors.consent = "Please confirm that Everpoint may contact you.";
  return errors;
}

export function ContactForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [siteKey, setSiteKey] = useState("");
  const [configLoaded, setConfigLoaded] = useState(false);
  const widgetContainer = useRef<HTMLDivElement>(null);
  const successMessage = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | undefined>(undefined);
  const loadedAt = useRef(0);

  useEffect(() => {
    loadedAt.current = Date.now();
    let active = true;
    fetch("/api/contact-config", { headers: { accept: "application/json" } })
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((config: { siteKey?: string }) => {
        if (active) setSiteKey(config.siteKey ?? "");
      })
      .catch(() => {
        if (active) setErrors({ form: "The contact form is temporarily unavailable." });
      })
      .finally(() => {
        if (active) setConfigLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!siteKey) return;
    const renderWidget = () => {
      if (!window.turnstile || !widgetContainer.current || widgetId.current) return;
      widgetId.current = window.turnstile.render(widgetContainer.current, {
        sitekey: siteKey,
        theme: "light",
        callback: setTurnstileToken,
        "expired-callback": () => setTurnstileToken(""),
        "error-callback": () => setErrors((current) => ({
          ...current,
          form: "Spam protection could not load. Please refresh and try again.",
        })),
      });
    };
    const existing = document.querySelector<HTMLScriptElement>('script[src^="https://challenges.cloudflare.com/turnstile/"]');
    if (existing) {
      existing.addEventListener("load", renderWidget, { once: true });
      renderWidget();
      return () => existing.removeEventListener("load", renderWidget);
    }
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.addEventListener("load", renderWidget, { once: true });
    document.head.appendChild(script);
    return () => script.removeEventListener("load", renderWidget);
  }, [siteKey]);

  useEffect(() => {
    if (status === "success") successMessage.current?.focus();
  }, [status]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const nextErrors = validate(form);
    if (siteKey && !turnstileToken) nextErrors.form = "Please complete the spam-protection check.";
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      requestAnimationFrame(() => form.querySelector<HTMLElement>("[aria-invalid='true']")?.focus());
      return;
    }
    setErrors({});
    setStatus("submitting");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...Object.fromEntries(new FormData(form)),
          turnstileToken,
          startedAt: loadedAt.current,
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Unable to send your message.");
      form.reset();
      setStatus("success");
      setTurnstileToken("");
      window.turnstile?.reset(widgetId.current);
    } catch (error) {
      setStatus("idle");
      setErrors({ form: error instanceof Error ? error.message : "Unable to send your message. Please try again." });
    }
  }

  if (status === "success") {
    return (
      <div className="contact-form__success" role="status" aria-live="polite" tabIndex={-1} ref={successMessage}>
        <span aria-hidden="true">✓</span>
        <p className="eyebrow">Message received</p>
        <h3>Thank you. We’ll be in touch.</h3>
        <p>Your project details are on their way to Everpoint. Expect a personal response within one business day.</p>
        <button type="button" className="contact-form__reset" onClick={() => {
          loadedAt.current = Date.now();
          setStatus("idle");
        }}>Send another message</button>
      </div>
    );
  }

  return (
    <form className="contact-form" noValidate onSubmit={handleSubmit} aria-busy={status === "submitting"}>
      <div className="contact-form__row">
        <Field id="contact-name" name="name" label="Name" autoComplete="name" error={errors.name} />
        <Field id="contact-email" name="email" label="Email" type="email" autoComplete="email" error={errors.email} />
      </div>
      <div className="contact-form__row">
        <Field id="contact-phone" name="phone" label="Phone" optional type="tel" autoComplete="tel" />
        <div className="field">
          <label htmlFor="contact-project-type">Project type</label>
          <select id="contact-project-type" name="projectType" defaultValue="" autoComplete="off" aria-invalid={Boolean(errors.projectType)} aria-describedby={errors.projectType ? "contact-project-type-error" : undefined}>
            <option value="" disabled>Select one</option>
            {projectTypes.map((type) => <option key={type}>{type}</option>)}
          </select>
          {errors.projectType && <p id="contact-project-type-error" className="field__error">{errors.projectType}</p>}
        </div>
      </div>
      <div className="field">
        <label htmlFor="contact-message">How can we help?</label>
        <textarea id="contact-message" name="message" rows={6} placeholder="Tell us what isn’t working, what you’d like to improve, or what you’re planning." aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? "contact-message-error" : "contact-message-help"} />
        <p id="contact-message-help" className="field__help">Please don’t include passwords or other sensitive information.</p>
        {errors.message && <p id="contact-message-error" className="field__error">{errors.message}</p>}
      </div>
      <div className="field field--honeypot" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="field field--consent">
        <label>
          <input type="checkbox" name="consent" value="yes" aria-invalid={Boolean(errors.consent)} aria-describedby={errors.consent ? "contact-consent-error" : undefined} />
          <span>I agree that Everpoint may contact me about this request. Information submitted here will only be used to respond to my inquiry.</span>
        </label>
        {errors.consent && <p id="contact-consent-error" className="field__error">{errors.consent}</p>}
      </div>
      {siteKey ? <div className="contact-form__turnstile" ref={widgetContainer} /> : configLoaded && <p className="contact-form__notice">Spam protection is not configured in this environment.</p>}
      {errors.form && <p className="contact-form__error" role="alert">{errors.form}</p>}
      <div className="contact-form__submit">
        <button type="submit" disabled={status === "submitting"}>
          <span>{status === "submitting" ? "Sending…" : "Send project details"}</span>
          <span aria-hidden="true">↗</span>
        </button>
        <p>We typically reply within one business day.</p>
      </div>
    </form>
  );
}

function Field({ id, name, label, error, optional, ...props }: {
  id: string;
  name: string;
  label: string;
  error?: string;
  optional?: boolean;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}{optional && <span>Optional</span>}</label>
      <input id={id} name={name} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} {...props} />
      {error && <p id={`${id}-error`} className="field__error">{error}</p>}
    </div>
  );
}
