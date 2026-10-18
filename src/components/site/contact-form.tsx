"use client";

import { useState } from "react";
import { Button, Field, Input, Select, Textarea } from "@/components/ui/kit";
import { Icon } from "@/components/ui/icons";

const budgets = [
  "Single project",
  "Campaign rollout",
  "Retainer / ongoing",
  "Not sure yet",
];

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    subject: "",
    budget: budgets[0],
    message: "",
    website: "",
  });

  const update = (key: keyof typeof form) => (event: { target: { value: string } }) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setError("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setStatus("error");
        setError(payload.error ?? "Something went wrong. Please try again.");
        return;
      }
      setStatus("success");
    } catch {
      setStatus("error");
      setError("We could not reach the studio. Please email us directly.");
    }
  }

  if (status === "success") {
    return (
      <div className="relative flex h-full flex-col items-center justify-center overflow-hidden rounded-[36px] border border-white/10 bg-[#101012] p-10 text-center text-white">
        <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-acid/20 blur-[80px] animate-aurora-2" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-black">
          <Icon name="check" className="h-7 w-7" />
        </div>
        <h2 className="relative mt-7 text-4xl font-semibold tracking-tight">Message received</h2>
        <p className="relative mt-3 max-w-md text-[15px] leading-relaxed text-white/60">
          Thank you, {form.name.split(" ")[0] || "there"}. Your brief is in the studio inbox and you
          will hear back within one working day.
        </p>
        <Button
          variant="primary"
          className="relative mt-8"
          onClick={() => {
            setForm({
              name: "",
              email: "",
              company: "",
              subject: "",
              budget: budgets[0],
              message: "",
              website: "",
            });
            setStatus("idle");
          }}
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[#101012] p-7 md:p-10"
    >
      <p className="micro text-[9px] text-white/35">Project enquiry</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white md:text-4xl">Tell me about the project</h2>
      <p className="mt-3 text-sm text-ink/55">
        A few details are enough. The more you share, the more useful my first reply will be.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <Field label="Your name" required>
          <Input
            required
            value={form.name}
            onChange={update("name")}
            placeholder="Jordan Blake"
            autoComplete="name"
          />
        </Field>
        <Field label="Email" required>
          <Input
            required
            type="email"
            value={form.email}
            onChange={update("email")}
            placeholder="jordan@studio.com"
            autoComplete="email"
          />
        </Field>
        <Field label="Company">
          <Input
            value={form.company}
            onChange={update("company")}
            placeholder="Studio or brand name"
            autoComplete="organization"
          />
        </Field>
        <Field label="Engagement type">
          <Select value={form.budget} onChange={update("budget")}>
            {budgets.map((budget) => (
              <option key={budget} value={budget}>
                {budget}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="What are we making?" className="sm:col-span-2">
          <Input
            value={form.subject}
            onChange={update("subject")}
            placeholder="Packaging rollout for a new range"
          />
        </Field>
        <Field
          label="Project details"
          className="sm:col-span-2"
          error={status === "error" ? error : undefined}
        >
          <Textarea
            required
            value={form.message}
            onChange={update("message")}
            placeholder="What is the project, when does it need to launch, and who are you designing for?"
            rows={6}
          />
        </Field>
      </div>

      <input
        type="text"
        name="website"
        value={form.website}
        onChange={update("website")}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="pointer-events-none absolute h-0 w-0 opacity-0"
      />

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Button type="submit" loading={status === "submitting"} icon="arrow-up-right" size="lg">
          {status === "submitting" ? "Sending…" : "Send enquiry"}
        </Button>
        <p className="text-xs text-ink/45">Replies within one working day.</p>
      </div>
    </form>
  );
}
