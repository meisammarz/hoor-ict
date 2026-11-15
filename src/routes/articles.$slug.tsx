import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/shell";
import { countDownload, getArticle } from "@/lib/cms.functions";
import { faNum } from "@/lib/format";

export const Route = createFileRoute("/articles/$slug")({
  loader: ({ params }) => getArticle({ data: params.slug }),
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData ? `${loaderData.title} | ارتباطات گستر ایمن حور` : "مقاله" }],
  }),
  component: ArticlePage,
});

function ArticlePage() {
  const article = Route.useLoaderData();
  if (!article) {
    return (
      <SiteShell>
        <p className="mx-auto max-w-3xl px-4 py-16 text-muted">این مقاله نیست یا حذف شده است.</p>
      </SiteShell>
    );
  }

  function download() {
    const blob = new Blob([`${article!.title}\n\n${article!.body}\n`], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${article!.slug}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    void countDownload({ data: article!.slug });
  }

  return (
    <SiteShell>
      <article className="mx-auto max-w-3xl px-4 py-10">
        <Link to="/articles" className="text-sm text-primary">
          بازگشت به مقالات
        </Link>
        <p className="mt-4 text-xs text-primary">{article.topic === "it" ? "فناوری" : "ایمنی"}</p>
        <h1 className="mt-2 text-3xl font-extrabold">{article.title}</h1>
        <p className="mt-3 text-muted">{article.summary}</p>
        <p className="mt-2 text-xs text-muted">{faNum(article.downloads)} دانلود در همین سایت</p>
        <button
          type="button"
          onClick={download}
          className="tap mt-4 inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-ink"
        >
          دانلود متن
        </button>
        <div className="mt-8 space-y-4 text-sm leading-8">
          {article.body.split(/\n\n+/).map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
        </div>
      </article>
    </SiteShell>
  );
}
