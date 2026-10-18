"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Artwork } from "@/components/artwork";
import { Button, Field, Input, Select, Switch, Textarea, useToast } from "@/components/ui/kit";
import { Icon } from "@/components/ui/icons";
import { ImageUploader } from "@/components/ui/image-uploader";
import { cn, displayImage, mediaKind, slugify } from "@/lib/utils";

export type ProjectFormValues = {
  id?: number;
  title: string;
  slug: string;
  client: string;
  year: number;
  categoryId: number | null;
  summary: string;
  description: string;
  coverImage: string;
  gallery: string[];
  credits: string[];
  featured: boolean;
  status: "draft" | "published";
  order: number;
  tagIds: number[];
};

export function ProjectForm({
  project,
  categories,
  tags,
}: {
  project?: ProjectFormValues | null;
  categories: Array<{ id: number; name: string; color: string }>;
  tags: Array<{ id: number; name: string }>;
}) {
  const router = useRouter();
  const { push } = useToast();
  const isEdit = Boolean(project?.id);

  const [values, setValues] = useState<ProjectFormValues>(
    project ?? {
      title: "",
      slug: "",
      client: "",
      year: new Date().getFullYear(),
      categoryId: categories[0]?.id ?? null,
      summary: "",
      description: "",
      coverImage: "",
      gallery: [],
      credits: [],
      featured: false,
      status: "draft",
      order: 0,
      tagIds: [],
    },
  );
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const set = <K extends keyof ProjectFormValues>(key: K, value: ProjectFormValues[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  const preview = useMemo(
    () => ({
      title: values.title || "New project",
      client: values.client,
      year: values.year,
    }),
    [values.title, values.client, values.year],
  );

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      ...values,
      slug: values.slug || slugify(values.title),
      gallery: values.gallery,
      credits: values.credits,
    };

    try {
      const response = await fetch(
        isEdit ? `/api/projects/${project!.id}` : "/api/projects",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(result.error ?? "We could not save that project.");
        setSaving(false);
        return;
      }
      push(isEdit ? "Project updated" : "Project created");
      router.push("/dashboard/projects");
      router.refresh();
    } catch {
      setError("We could not reach the server. Please try again.");
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!project?.id) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
      if (!response.ok) {
        push("That project could not be deleted", "error");
        return;
      }
      push("Project deleted");
      router.push("/dashboard/projects");
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <section className="rounded-2xl border border-line bg-paper p-6">
          <h2 className="font-display text-xl text-ink">The basics</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label="Project title" required>
              <Input
                required
                value={values.title}
                onChange={(event) => {
                  set("title", event.target.value);
                  if (!slugTouched) set("slug", slugify(event.target.value));
                }}
                placeholder="Cinder & Co."
              />
            </Field>
            <Field label="URL slug" hint={slugify(values.title) || "cinder-and-co"}>
              <Input
                value={values.slug}
                onChange={(event) => {
                  setSlugTouched(true);
                  set("slug", slugify(event.target.value));
                }}
                placeholder="cinder-and-co"
              />
            </Field>
            <Field label="Client">
              <Input
                value={values.client}
                onChange={(event) => set("client", event.target.value)}
                placeholder="Cinder & Co. Cider House"
              />
            </Field>
            <Field label="Year">
              <Input
                type="number"
                value={String(values.year)}
                onChange={(event) => set("year", Number(event.target.value))}
              />
            </Field>
            <Field label="Discipline">
              <Select
                value={values.categoryId ? String(values.categoryId) : ""}
                onChange={(event) =>
                  set("categoryId", event.target.value ? Number(event.target.value) : null)
                }
              >
                <option value="">Uncategorised</option>
                {categories.map((category) => (
                  <option key={category.id} value={String(category.id)}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Status">
              <Select
                value={values.status}
                onChange={(event) => set("status", event.target.value as "draft" | "published")}
              >
                <option value="draft">Draft — hidden from the site</option>
                <option value="published">Published — live on the site</option>
              </Select>
            </Field>
            <Field label="One-line summary" className="sm:col-span-2" hint="Shown on cards and in search results.">
              <Textarea
                rows={2}
                value={values.summary}
                onChange={(event) => set("summary", event.target.value)}
                placeholder="A smoked-amber identity for a small-batch cider house."
              />
            </Field>
            <Field label="Case study" className="sm:col-span-2" hint="Use a blank line to separate paragraphs.">
              <Textarea
                rows={8}
                value={values.description}
                onChange={(event) => set("description", event.target.value)}
                placeholder="Tell the story of the project…"
              />
            </Field>
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-paper p-6">
          <h2 className="font-display text-xl text-ink">Imagery &amp; credits</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field
              label="Cover image URL"
              className="sm:col-span-2"
              hint="Leave empty for generated poster art. A YouTube link works too — its thumbnail becomes the cover."
            >
              <Input
                value={values.coverImage}
                onChange={(event) => set("coverImage", event.target.value)}
                placeholder="https://…/cover.jpg"
              />
            </Field>
            <div className="-mt-2 flex flex-wrap items-center gap-3 sm:col-span-2">
              <ImageUploader
                label="Upload cover image"
                onUploaded={(url) => {
                  set("coverImage", url);
                  push("Cover image uploaded — save to publish it");
                }}
              />
              {values.coverImage ? (
                <button
                  type="button"
                  onClick={() => set("coverImage", "")}
                  className="text-xs font-medium text-ink/50 underline underline-offset-4 hover:text-crimson"
                >
                  Remove cover
                </button>
              ) : null}
            </div>
            <Field label="Gallery images" hint="Images, PDFs, videos — or paste YouTube links (saves storage; the thumbnail and player come from YouTube).">
              <Textarea
                rows={5}
                value={values.gallery.join("\n")}
                onChange={(event) =>
                  set(
                    "gallery",
                    event.target.value
                      .split("\n")
                      .map((line) => line.trim())
                      .filter(Boolean),
                  )
                }
                placeholder={"https://…/01.jpg\nhttps://…/02.jpg"}
              />
              <div className="mt-3 space-y-3">
                <ImageUploader
                  kind="media"
                  label="Upload image, PDF or video"
                  onUploaded={(url) => {
                    set("gallery", [...values.gallery, url]);
                    push("File added to the gallery — save to publish it");
                  }}
                />
                {values.gallery.length ? (
                  <div className="flex flex-wrap gap-2">
                    {values.gallery.map((url) => (
                      <div key={url} className="group relative h-16 w-16 overflow-hidden rounded-lg border border-line bg-bone-2">
                        {mediaKind(url) === "image" || mediaKind(url) === "youtube" ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={displayImage(url)} alt="Gallery" className="h-full w-full object-cover" />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-[10px] font-bold uppercase text-ink/60">
                            {mediaKind(url) === "video" ? "Video" : "PDF"}
                          </span>
                        )}
                        <button
                          type="button"
                          aria-label="Remove image"
                          onClick={() => set("gallery", values.gallery.filter((item) => item !== url))}
                          className="absolute inset-0 hidden items-center justify-center bg-ink/60 text-[10px] font-semibold text-white group-hover:flex"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </Field>
            <Field label="Credits" hint="One credit per line.">
              <Textarea
                rows={5}
                value={values.credits.join("\n")}
                onChange={(event) =>
                  set(
                    "credits",
                    event.target.value
                      .split("\n")
                      .map((line) => line.trim())
                      .filter(Boolean),
                  )
                }
                placeholder={"Strategy — Sudhakar Bhambade\nPhotography — Inês Duarte"}
              />
            </Field>
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-paper p-6">
          <h2 className="font-display text-xl text-ink">Tags</h2>
          <p className="mt-1 text-sm text-ink/50">Tags power the filters on the public work page.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.length === 0 ? (
              <p className="text-sm text-ink/45">No tags yet — create some from the Tags screen.</p>
            ) : (
              tags.map((tag) => {
                const active = values.tagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() =>
                      set(
                        "tagIds",
                        active
                          ? values.tagIds.filter((id) => id !== tag.id)
                          : [...values.tagIds, tag.id],
                      )
                    }
                    className={cn(
                      "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
                      active
                        ? "bg-ink text-bone"
                        : "bg-bone-2 text-ink/60 hover:text-ink",
                    )}
                  >
                    {tag.name}
                  </button>
                );
              })
            )}
          </div>
        </section>
      </div>

      <aside className="space-y-5">
        <div className="rounded-2xl border border-line bg-paper p-5">
          <p className="eyebrow text-ink/40">Cover preview</p>
          <div className="mt-3 aspect-[4/5] overflow-hidden rounded-xl bg-bone-2">
            {values.coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={displayImage(values.coverImage)} alt="Cover preview" className="h-full w-full object-cover" />
            ) : (
              <Artwork
                seed={preview.title}
                title={preview.title}
                client={preview.client}
                year={preview.year}
                className="h-full w-full"
              />
            )}
          </div>
          <p className="mt-3 text-xs leading-relaxed text-ink/45">
            Poster artwork is generated from the project title, so every case study gets a unique cover
            automatically.
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-paper p-5">
          <p className="eyebrow text-ink/40">Visibility</p>
          <div className="mt-4 space-y-4">
            <Switch
              checked={values.featured}
              onChange={(next) => set("featured", next)}
              label="Featured project"
              description="Pinned to the top of the homepage selection."
            />
            <div className="border-t border-line pt-4">
              <Field label="Sort order" hint="Lower numbers appear first.">
                <Input
                  type="number"
                  value={String(values.order)}
                  onChange={(event) => set("order", Number(event.target.value))}
                />
              </Field>
            </div>
          </div>
        </div>

        {error ? (
          <div className="flex items-start gap-2.5 rounded-xl border border-crimson/25 bg-[#fff3f3] px-4 py-3 text-sm text-crimson">
            <Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        ) : null}

        <div className="space-y-3">
          <Button type="submit" loading={saving} className="w-full" size="lg">
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create project"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => router.push("/dashboard/projects")}
          >
            Cancel
          </Button>
          {isEdit ? (
            <Button
              type="button"
              variant="danger"
              className="w-full"
              loading={deleting}
              onClick={() => void onDelete()}
            >
              Delete project
            </Button>
          ) : null}
        </div>
      </aside>
    </form>
  );
}
