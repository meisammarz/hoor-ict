import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/shell";
import { listNews } from "@/lib/cms.functions";

export const Route = createFileRoute("/news")({
  head: () => ({ meta: [{ title: "اخبار ایمنی و فناوری | ارتباطات گستر ایمن حور" }] }),
  loader: () => listNews(),
  component: NewsPage,
});

function NewsPage() {
  const items = Route.useLoaderData();
  return (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-extrabold">خبر ایمنی و فناوری</h1>
        {items.length === 0 ? (
          <p className="mt-8 rounded-card border border-line bg-surface p-4 text-sm">
            خبر تازه‌ای ثبت نشده است. می‌توانید{" "}
            <Link to="/articles" className="text-primary">
              مقالات
            </Link>{" "}
            را ببینید.
          </p>
        ) : (
          <ul className="mt-6 grid gap-3">
            {items.map((item) => (
              <li key={item.link} className="rounded-card border border-line bg-surface p-4">
                <p className="text-xs text-muted">
                  {item.source}
                  {item.published_at ? ` · ${item.published_at}` : ""}
                </p>
                <a href={item.link} target="_blank" rel="noreferrer" className="mt-1 block font-semibold text-fg">
                  {item.title}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </SiteShell>
  );
}
