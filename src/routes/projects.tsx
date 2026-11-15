import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteShell } from "@/components/shell";
import { areas, projects, type Area } from "@/lib/content";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [{ title: "سوابق اجرایی | ارتباطات گستر ایمن حور" }],
  }),
  component: ProjectsPage,
});

const filters = areas.filter((item) => item.id === "all" || item.id === "telecom" || item.id === "network" || item.id === "safety");

function ProjectsPage() {
  const [area, setArea] = useState<Area | "all">("all");
  const list = useMemo(
    () => projects.filter((item) => area === "all" || item.area === area),
    [area],
  );

  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <p className="font-mono text-xs text-primary" dir="ltr">
          FIELD RECORD
        </p>
        <h1 className="mt-2 text-3xl font-extrabold">سوابق و تجربه‌های اجرایی</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted">
          نمونه‌ای از پروژه‌های اجراشده در حوزه‌های مخابرات، شبکه، ایمنی، برق و نگهداری — در تهران و سایر نقاط کشور.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setArea(item.id)}
              className={
                "tap min-h-11 rounded-full border px-3 text-sm " +
                (area === item.id
                  ? "border-primary bg-primary text-ink"
                  : "border-line bg-surface text-muted")
              }
            >
              {item.label}
            </button>
          ))}
        </div>

        <ol className="mt-6 grid gap-3">
          {list.map((project, index) => (
            <li
              key={project.id}
              id={project.id}
              className="scroll-mt-28 grid gap-3 rounded-card border border-line bg-surface p-5 sm:grid-cols-[5rem_1fr]"
            >
              <p className="font-mono text-sm text-primary" dir="ltr">
                {String(index + 1).padStart(2, "0")}
              </p>
              <div>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-lg font-bold">{project.client}</h2>
                  <span className="text-xs text-muted">{project.when}</span>
                </div>
                <p className="mt-1 text-sm font-medium text-primary">{project.title}</p>
                <p className="mt-2 text-sm text-muted">{project.summary}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </SiteShell>
  );
}
