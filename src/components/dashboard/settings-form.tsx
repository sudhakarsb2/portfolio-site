"use client";

import { useState } from "react";
import { Button, Field, Input, Textarea, useToast } from "@/components/ui/kit";
import { Icon } from "@/components/ui/icons";

type Profile = {
  name: string;
  email: string;
  title: string;
  bio: string;
  avatarUrl: string;
};

type SiteField = { key: string; label: string; value: string; multiline?: boolean; group: string };

export function SettingsForm({
  profile,
  siteFields,
}: {
  profile: Profile;
  siteFields: SiteField[];
}) {
  const { push } = useToast();
  const [profileValues, setProfileValues] = useState(profile);
  const [siteValues, setSiteValues] = useState<Record<string, string>>(
    Object.fromEntries(siteFields.map((field) => [field.key, field.value])),
  );
  const [passwords, setPasswords] = useState({ currentPassword: "", password: "" });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingSite, setSavingSite] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [siteError, setSiteError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingProfile(true);
    setProfileError("");
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileValues),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setProfileError(payload.error ?? "We could not save your profile.");
        return;
      }
      push("Profile updated");
    } catch {
      setProfileError("We could not reach the server. Please try again.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function saveSite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingSite(true);
    setSiteError("");
    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(siteValues),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setSiteError(payload.error ?? "We could not save the site content.");
        return;
      }
      push("Site content published");
    } catch {
      setSiteError("We could not reach the server. Please try again.");
    } finally {
      setSavingSite(false);
    }
  }

  async function changePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingPassword(true);
    setPasswordError("");
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwords),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setPasswordError(payload.error ?? "We could not change your password.");
        return;
      }
      setPasswords({ currentPassword: "", password: "" });
      push("Password updated");
    } catch {
      setPasswordError("We could not reach the server. Please try again.");
    } finally {
      setSavingPassword(false);
    }
  }

  const groups = Array.from(new Set(siteFields.map((field) => field.group)));

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
      <form onSubmit={saveProfile} className="space-y-6 rounded-2xl border border-line bg-paper p-6">
        <div>
          <h3 className="font-display text-xl text-ink">Your profile</h3>
          <p className="mt-1 text-sm text-ink/50">
            How the studio appears in the dashboard sidebar.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Full name" required>
            <Input
              value={profileValues.name}
              onChange={(event) => setProfileValues({ ...profileValues, name: event.target.value })}
            />
          </Field>
          <Field label="Email" required>
            <Input
              type="email"
              value={profileValues.email}
              onChange={(event) => setProfileValues({ ...profileValues, email: event.target.value })}
            />
          </Field>
          <Field label="Role" className="sm:col-span-2">
            <Input
              value={profileValues.title}
              onChange={(event) => setProfileValues({ ...profileValues, title: event.target.value })}
              placeholder="Founder & Art Director"
            />
          </Field>
          <Field label="Bio" className="sm:col-span-2">
            <Textarea
              rows={3}
              value={profileValues.bio}
              onChange={(event) => setProfileValues({ ...profileValues, bio: event.target.value })}
            />
          </Field>
          <Field label="Avatar URL" className="sm:col-span-2">
            <Input
              value={profileValues.avatarUrl}
              onChange={(event) =>
                setProfileValues({ ...profileValues, avatarUrl: event.target.value })
              }
              placeholder="https://…/avatar.jpg"
            />
          </Field>
        </div>

        {profileError ? <ErrorNote message={profileError} /> : null}

        <Button type="submit" loading={savingProfile}>
          {savingProfile ? "Saving…" : "Save profile"}
        </Button>
      </form>

      <div className="space-y-6">
        <form onSubmit={saveSite} className="space-y-6 rounded-2xl border border-line bg-paper p-6">
          <div>
            <h3 className="font-display text-xl text-ink">Site content</h3>
            <p className="mt-1 text-sm text-ink/50">
              The words shown across the public portfolio. Saved instantly to the database.
            </p>
          </div>

          {groups.map((group) => (
            <div key={group} className="space-y-5">
              {groups.length > 1 ? (
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/35">
                  {group}
                </p>
              ) : null}
              {siteFields
                .filter((field) => field.group === group)
                .map((field) => (
                  <Field key={field.key} label={field.label}>
                    {field.multiline ? (
                      <Textarea
                        rows={4}
                        value={siteValues[field.key] ?? ""}
                        onChange={(event) =>
                          setSiteValues({ ...siteValues, [field.key]: event.target.value })
                        }
                      />
                    ) : (
                      <Input
                        value={siteValues[field.key] ?? ""}
                        onChange={(event) =>
                          setSiteValues({ ...siteValues, [field.key]: event.target.value })
                        }
                      />
                    )}
                  </Field>
                ))}
            </div>
          ))}

          {siteError ? <ErrorNote message={siteError} /> : null}

          <Button type="submit" loading={savingSite}>
            {savingSite ? "Publishing…" : "Publish site content"}
          </Button>
        </form>

        <form
          onSubmit={changePassword}
          className="space-y-5 rounded-2xl border border-line bg-paper p-6"
        >
          <div>
            <h3 className="font-display text-xl text-ink">Password</h3>
            <p className="mt-1 text-sm text-ink/50">Keep the studio locked down.</p>
          </div>
          <Field label="Current password" required>
            <Input
              type="password"
              required
              value={passwords.currentPassword}
              onChange={(event) =>
                setPasswords({ ...passwords, currentPassword: event.target.value })
              }
            />
          </Field>
          <Field label="New password" hint="At least 8 characters." required>
            <Input
              type="password"
              required
              minLength={8}
              value={passwords.password}
              onChange={(event) => setPasswords({ ...passwords, password: event.target.value })}
            />
          </Field>

          {passwordError ? <ErrorNote message={passwordError} /> : null}

          <Button type="submit" variant="outline" loading={savingPassword}>
            {savingPassword ? "Updating…" : "Update password"}
          </Button>
        </form>
      </div>
    </div>
  );
}

function ErrorNote({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-crimson/25 bg-[#fff3f3] px-4 py-3 text-sm text-crimson">
      <Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0" />
      {message}
    </div>
  );
}
