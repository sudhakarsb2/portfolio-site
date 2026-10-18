import Link from "next/link";
import { Artwork } from "@/components/artwork";
import { Icon, type IconName } from "@/components/ui/icons";
import { Counter } from "@/components/ui/reveal";
import { getCurrentUser } from "@/lib/auth";
import { getAllProjects, getCategories, getMessages, getServices, getTestimonials } from "@/lib/data";
import { relativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardOverview() {
  const [projects, categories, messages, services, testimonials, user] = await Promise.all([
    getAllProjects(),
    getCategories(),
    getMessages(),
    getServices(),
    getTestimonials(),
    getCurrentUser(),
  ]);

  const firstName = (user?.name ?? "there").split(" ")[0];
  const published = projects.filter((project) => project.status === "published").length;
  const drafts = projects.length - published;
  const unread = messages.filter((message) => message.status === "new").length;

  const stats: Array<{
    label: string;
    value: number;
    caption: string;
    icon: IconName;
    gradient: string;
    href: string;
  }> = [
    {
      label: "Projects",
      value: projects.length,
      caption: `${published} published · ${drafts} in draft`,
      icon: "folder",
      gradient: "from-vermilion to-acid",
      href: "/dashboard/projects",
    },
    {
      label: "Unread messages",
      value: unread,
      caption: `${messages.length} total enquiries`,
      icon: "mail",
      gradient: "from-violet to-azure",
      href: "/dashboard/messages",
    },
    {
      label: "Services",
      value: services.length,
      caption: "Listed on the services page",
      icon: "layers",
      gradient: "from-azure to-acid",
      href: "/dashboard/services",
    },
    {
      label: "Testimonials",
      value: testimonials.length,
      caption: "Published client quotes",
      icon: "quote",
      gradient: "from-ink to-ink-3",
      href: "/dashboard/testimonials",
    },
  ];

  const maxCategory = Math.max(
    1,
    ...categories.map((category) => projects.filter((p) => p.categoryId === category.id).length),
  );

  return (
    <div className="space-y-7">
      <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="micro text-[10px] text-ink/40">{greeting()}, {firstName}</p>
          <h2 className="display mt-2 text-[clamp(2rem,4vw,3rem)] text-ink">
            Your studio at a glance
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/projects/new"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-ink px-4 text-[13px] font-semibold text-bone transition-all hover:bg-vermilion hover:text-white"
          >
            <Icon name="plus" className="h-4 w-4" />
            New project
          </Link>
          <Link
            href="/dashboard/messages"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-paper px-4 text-[13px] font-semibold text-ink/70 transition-all hover:border-ink hover:text-ink"
          >
            <Icon name="inbox" className="h-4 w-4" />
            Inbox
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group relative overflow-hidden rounded-2xl border border-line bg-paper p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
          >
            <div className="flex items-start justify-between">
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} text-white shadow-soft`}
              >
                <Icon name={stat.icon} className="h-4.5 w-4.5" />
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink/25 transition-all group-hover:rotate-45 group-hover:border-vermilion group-hover:bg-vermilion group-hover:text-white">
                <Icon name="arrow-up-right" className="h-3.5 w-3.5" />
              </span>
            </div>
            <p className="display mt-6 text-4xl leading-none text-ink">
              <Counter value={stat.value} />
            </p>
            <p className="mt-2.5 text-[13px] font-semibold text-ink/80">{stat.label}</p>
            <p className="micro mt-1 text-[8px] text-ink/35">{stat.caption}</p>
          </Link>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.45fr_0.55fr]">
        <div className="overflow-hidden rounded-2xl border border-line bg-paper">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h3 className="font-display text-xl text-ink">Recent projects</h3>
            <Link
              href="/dashboard/projects"
              className="micro text-[9px] text-ink/45 transition-colors hover:text-vermilion"
            >
              View all
            </Link>
          </div>
          <ul className="divide-y divide-line-soft">
            {projects.slice(0, 5).map((project) => (
              <li
                key={project.id}
                className="group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-bone/50"
              >
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-bone-2">
                  <Artwork
                    seed={project.title}
                    title={project.title}
                    className="h-full w-full"
                    showMeta={false}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{project.title}</p>
                  <p className="mt-0.5 truncate text-xs text-ink/45">
                    {project.client} · {project.category?.name ?? "Uncategorised"}
                  </p>
                </div>
                <span
                  className={
                    project.status === "published"
                      ? "rounded-full bg-[#dff0e6] px-2.5 py-1 text-[11px] font-semibold text-[#1c6b3f]"
                      : "rounded-full bg-bone-2 px-2.5 py-1 text-[11px] font-semibold text-ink/50"
                  }
                >
                  {project.status}
                </span>
                <Link
                  href={`/dashboard/projects/${project.id}`}
                  aria-label={`Edit ${project.title}`}
                  className="rounded-lg p-2 text-ink/40 transition-colors hover:bg-bone-2 hover:text-ink"
                >
                  <Icon name="pencil" className="h-4 w-4" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-5">
          <div className="overflow-hidden rounded-2xl border border-line bg-paper">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h3 className="font-display text-xl text-ink">Latest enquiries</h3>
              <Link
                href="/dashboard/messages"
                className="micro text-[9px] text-ink/45 transition-colors hover:text-vermilion"
              >
                Inbox
              </Link>
            </div>
            <ul className="divide-y divide-line-soft">
              {messages.slice(0, 4).map((message) => (
                <li key={message.id} className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    {message.status === "new" ? (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-vermilion" aria-hidden="true" />
                    ) : null}
                    <p className="truncate text-[13px] font-semibold text-ink">{message.name}</p>
                    <span className="ml-auto shrink-0 text-[11px] text-ink/35">
                      {relativeTime(message.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs text-ink/50">
                    {message.subject || message.message}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-line bg-paper p-5">
            <h3 className="font-display text-xl text-ink">Projects by discipline</h3>
            <ul className="mt-5 space-y-4">
              {categories.map((category) => {
                const total = projects.filter((project) => project.categoryId === category.id).length;
                return (
                  <li key={category.id}>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-2 text-xs font-medium text-ink/70">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: category.color }}
                          aria-hidden="true"
                        />
                        {category.name}
                      </span>
                      <span className="micro text-[9px] text-ink/35">{total}</span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-bone-2">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${(total / maxCategory) * 100}%`,
                          backgroundColor: category.color,
                        }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
