import { toBool, toInt, toList, toText } from "@/lib/utils";

export type ParseResult = { values: Record<string, unknown>; errors: string[] };

function required(errors: string[], field: string, label: string, value: string) {
  if (!value) errors.push(`${label} is required`);
  return value;
}

export function parseService(body: Record<string, unknown>): ParseResult {
  const errors: string[] = [];
  const title = toText(body.title);
  required(errors, "title", "Title", title);
  const description = toText(body.description);
  required(errors, "description", "Description", description);
  return {
    errors,
    values: {
      title,
      slug: toText(body.slug) || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      description,
      deliverables: toList(body.deliverables),
      priceFrom: toInt(body.priceFrom, 0),
      accent: toText(body.accent) || "#FF4A1C",
      icon: toText(body.icon) || "layers",
      sortOrder: toInt(body.sortOrder, 0),
      published: toBool(body.published, true),
    },
  };
}

export function parseTestimonial(body: Record<string, unknown>): ParseResult {
  const errors: string[] = [];
  const name = toText(body.name);
  required(errors, "name", "Name", name);
  const quote = toText(body.quote);
  required(errors, "quote", "Quote", quote);
  return {
    errors,
    values: {
      name,
      role: toText(body.role),
      company: toText(body.company),
      quote,
      avatar: toText(body.avatar),
      rating: Math.min(5, Math.max(1, toInt(body.rating, 5))),
      published: toBool(body.published, true),
      sortOrder: toInt(body.sortOrder, 0),
    },
  };
}

export function parseExperience(body: Record<string, unknown>): ParseResult {
  const errors: string[] = [];
  const role = toText(body.role);
  required(errors, "role", "Role", role);
  return {
    errors,
    values: {
      role,
      company: toText(body.company),
      period: toText(body.period),
      location: toText(body.location),
      description: toText(body.description),
      sortOrder: toInt(body.sortOrder, 0),
    },
  };
}

export function parseTag(body: Record<string, unknown>): ParseResult {
  const errors: string[] = [];
  const name = toText(body.name);
  required(errors, "name", "Name", name);
  return {
    errors,
    values: {
      name,
      slug: toText(body.slug) || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    },
  };
}

export function parseCategory(body: Record<string, unknown>): ParseResult {
  const errors: string[] = [];
  const name = toText(body.name);
  required(errors, "name", "Name", name);
  return {
    errors,
    values: {
      name,
      slug: toText(body.slug) || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      description: toText(body.description),
      color: toText(body.color) || "#FF4A1C",
      sortOrder: toInt(body.sortOrder, 0),
    },
  };
}

export function parseProject(body: Record<string, unknown>): ParseResult {
  const errors: string[] = [];
  const title = toText(body.title);
  required(errors, "title", "Title", title);
  const slug =
    toText(body.slug) || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const year = toInt(body.year, new Date().getFullYear());
  if (year < 1990 || year > 2100) errors.push("Year must be a valid year");
  const status = toText(body.status) === "draft" ? "draft" : "published";
  return {
    errors,
    values: {
      title,
      slug,
      client: toText(body.client),
      year,
      categoryId: body.categoryId ? toInt(body.categoryId, 0) : null,
      summary: toText(body.summary),
      description: toText(body.description),
      coverImage: toText(body.coverImage),
      gallery: toList(body.gallery),
      credits: toList(body.credits),
      featured: toBool(body.featured, false),
      status,
      order: toInt(body.order, 0),
    },
  };
}

export function parseMessage(body: Record<string, unknown>): ParseResult {
  const errors: string[] = [];
  const name = toText(body.name);
  required(errors, "name", "Name", name);
  const email = toText(body.email);
  if (!email) errors.push("Email is required");
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("Email must be valid");
  const message = toText(body.message);
  required(errors, "message", "Message", message);
  return {
    errors,
    values: {
      name,
      email,
      company: toText(body.company),
      subject: toText(body.subject),
      budget: toText(body.budget),
      message,
    },
  };
}
