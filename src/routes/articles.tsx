import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/shell";
import { listArticles } from "@/lib/cms.functions";
import { faNum } from "@/lib/format";

export const Route = createFileRoute("/articles")({
  head: () => ({ meta: [{ title: "مقالات | ارتباطات گستر ایمن حور" }] }),
  loader: () => listArticles(),
  component: ArticlesPage,
});

function ArticlesPage() {
  const items = Route.useLoaderData();
  return (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="font-mono text-xs text-primary" dir="ltr">
          GUIDES
        </p>
        <h1 className="mt-2 text-3xl font-extrabold">مقالات ایمنی و فناوری</h1>
        <p className="mt-3 text-sm text-muted">
          راهنماهای فنی و ایمنی بر پایه تجربه اجرایی در پروژه‌های مخابراتی، شبکه و نظارت تصویری.
        </p>
        <ul className="mt-6 grid gap-3">
          {items.map((item) => (
            <li key={item.slug}>
              <Link
                to="/articles/$slug"
                params={{ slug: item.slug }}
                className="tap block rounded-card border border-line bg-surface p-4 hover:border-primary"
              >
                <span className="text-xs text-primary">{item.topic === "it" ? "فناوری" : "ایمنی"}</span>
                <span className="mt-1 block font-semibold">{item.title}</span>
                <span className="mt-1 block text-sm text-muted">{item.summary}</span>
                <span className="mt-2 block text-xs text-muted">{faNum(item.downloads)} دانلود</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </SiteShell>
  );
}
