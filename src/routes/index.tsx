import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PhotoRail } from "@/components/photo-rail";
import { ServiceIcon } from "@/components/service-icon";
import { SiteShell } from "@/components/shell";
import { getGallery, listArticles, listNews } from "@/lib/cms.functions";
import { markets, owners, phones, projects, services, site, steps } from "@/lib/content";
import { specialtyShots } from "@/lib/shots";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [gallery, news, articles] = await Promise.all([getGallery(), listNews(), listArticles()]);
    return { gallery, news: news.slice(0, 3), articles: articles.slice(0, 3) };
  },
  head: () => ({
    meta: [{ title: "ارتباطات گستر ایمن حور | زیرساخت ارتباطی و ایمنی" }],
  }),
  component: Home,
});

function Home() {
  const preview = services.slice(0, 8);
  const recent = projects.slice(0, 4);
  const data = Route.useLoaderData();
  const shots = [
    ...specialtyShots.map((shot) => ({ ...shot })),
    ...data.gallery
      .filter((item) => item.kind !== "group")
      .map((item) => ({ id: item.id, src: item.src, title: item.title || "پروژه", caption: item.caption })),
  ];

  return (
    <SiteShell>
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-12 lg:items-center lg:py-16">
        <div className="lg:col-span-7">
          <p className="rise font-mono text-xs tracking-widest text-primary" dir="ltr">
            HOOR ICT
          </p>
          <h1 className="rise mt-3 text-3xl font-extrabold leading-tight text-fg sm:text-4xl">
            {site.title}
          </h1>
          <p className="rise mt-3 text-lg font-medium text-fg">{site.headline}</p>
          <p className="rise mt-4 max-w-xl text-base text-muted">{site.lede}</p>
          <div className="rise mt-6 flex flex-wrap gap-2">
            {site.motto.map((word) => (
              <span
                key={word}
                className="rounded-full border border-line bg-surface px-3 py-1 text-sm text-fg"
              >
                {word}
              </span>
            ))}
          </div>
          <div className="rise mt-7 flex flex-wrap gap-3">
            <Link
              to="/contact"
              className="tap inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-ink"
            >
              درخواست بررسی پروژه
            </Link>
            <Link
              to="/services"
              className="tap inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface px-5 text-sm text-fg"
            >
              کاتالوگ خدمات
              <ArrowLeft className="size-4" />
            </Link>
          </div>
        </div>

        <figure className="rise lg:col-span-5">
          <img
            src="/media/noc.jpg"
            alt="اتاق عملیات شبکه ارتباطات گستر ایمن حور"
            className="aspect-[16/10] w-full rounded-card border border-line object-cover"
          />
          <figcaption className="mt-2 text-xs text-muted">
            پایش شبکه، ارتباط پایدار و پشتیبانی — شناسه {site.socialHandle}
          </figcaption>
        </figure>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="font-mono text-xs text-primary" dir="ltr">
              FIELD
            </p>
            <h2 className="mt-2 text-2xl font-bold">تخصص‌ها، در تصویر</h2>
          </div>
          <Link to="/services" className="text-sm text-primary">
            جزئیات خدمات
          </Link>
        </div>
        <PhotoRail shots={shots} />
        <p className="mt-3 text-xs text-muted">نوار عکس آرام حرکت می‌کند. با لمس، مکث می‌کند. عکس تازه را از پنل می‌گذارید.</p>
      </section>

      <section className="border-y border-line bg-raised">
        <div className="mx-auto grid max-w-6xl gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["آغاز فعالیت فاز", site.since],
            ["گستره مخابراتی", "۱۰ استان، ۶۵ شهر"],
            ["پایگاه", "شهرری، فرمانداری"],
            ["پاسخ تلفنی", phones[0].display],
          ].map(([label, value]) => (
            <div key={label} className="bg-raised px-4 py-5">
              <p className="text-xs text-muted">{label}</p>
              <p className="mt-1 text-lg font-semibold text-fg">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-xs text-primary" dir="ltr">
              01 — SERVICES
            </p>
            <h2 className="mt-2 text-2xl font-bold">خدمات در یک نگاه</h2>
          </div>
          <Link to="/services" className="text-sm text-primary">
            هر ۱۲ مورد
          </Link>
        </div>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {preview.map((item) => (
            <li key={item.id}>
              <Link
                to="/services"
                hash={item.id}
                className="tap flex h-full gap-3 rounded-card border border-line bg-surface p-4 hover:border-primary"
              >
                <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-raised text-primary">
                  <ServiceIcon name={item.icon} className="size-5" />
                </span>
                <span>
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{item.title}</span>
                    <span className="rounded-full bg-raised px-2 py-0.5 text-xs text-muted">
                      {owners[item.owner]}
                    </span>
                  </span>
                  <span className="mt-1 block text-sm text-muted">{item.summary}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-raised">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="font-mono text-xs text-primary" dir="ltr">
              02 — RECORD
            </p>
            <h2 className="mt-2 text-2xl font-bold">سوابق اجرایی فاز الکترونیک</h2>
            <p className="mt-3 text-sm text-muted">
              نمونه‌ها از کاتالوگ معرفی مجموعه است؛ جزئیات قراردادی هر پروژه جداگانه ارائه می‌شود.
            </p>
            <Link
              to="/projects"
              className="tap mt-5 inline-flex min-h-11 items-center text-sm text-primary"
            >
              همه سوابق
            </Link>
          </div>
          <ol className="grid gap-3 lg:col-span-8">
            {recent.map((project) => (
              <li key={project.id}>
                <Link
                  to="/projects"
                  hash={project.id}
                  className="tap block rounded-card border border-line bg-bg p-4 hover:border-primary"
                >
                  <span className="text-xs text-muted">{project.when}</span>
                  <span className="mt-1 block font-semibold">{project.client}</span>
                  <span className="mt-1 block text-sm text-muted">{project.title}</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-14 lg:grid-cols-2">
        <div>
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-bold">خبر ایمنی و فناوری</h2>
            <Link to="/news" className="text-sm text-primary">
              همه
            </Link>
          </div>
          <ul className="mt-4 grid gap-3">
            {data.news.length === 0 ? (
              <li className="text-sm text-muted">عنوان تازه‌ای از منابع بیرونی نرسید.</li>
            ) : (
              data.news.map((item) => (
                <li key={item.link} className="rounded-card border border-line bg-surface p-4">
                  <p className="text-xs text-muted">{item.source}</p>
                  <a href={item.link} target="_blank" rel="noreferrer" className="mt-1 block text-sm font-medium">
                    {item.title}
                  </a>
                </li>
              ))
            )}
          </ul>
        </div>
        <div>
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-bold">مقاله‌های پربازدید</h2>
            <Link to="/articles" className="text-sm text-primary">
              همه
            </Link>
          </div>
          <ul className="mt-4 grid gap-3">
            {data.articles.map((item) => (
              <li key={item.slug}>
                <Link
                  to="/articles/$slug"
                  params={{ slug: item.slug }}
                  className="tap block rounded-card border border-line bg-surface p-4"
                >
                  <span className="font-medium">{item.title}</span>
                  <span className="mt-1 block text-sm text-muted">{item.summary}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <p className="font-mono text-xs text-primary" dir="ltr">
          03 — METHOD
        </p>
        <h2 className="mt-2 text-2xl font-bold">نه گام تا تحویل</h2>
        <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step} className="rounded-card border border-line bg-surface p-4">
              <span className="font-mono text-xs text-primary" dir="ltr">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="mt-2 text-sm font-medium">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-2xl font-bold">کجا کار انجام می‌شود</h2>
          <ul className="mt-5 flex flex-wrap gap-2">
            {markets.map((item) => (
              <li
                key={item}
                className="rounded-full border border-line bg-raised px-3 py-2 text-sm text-muted"
              >
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-card border border-line bg-surface p-5">
            <div>
              <p className="font-semibold">برای بازدید فنی همین حالا هماهنگ کنید</p>
              <p className="mt-1 text-sm text-muted">{site.address}</p>
            </div>
            <Link
              to="/contact"
              className="tap inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-ink"
            >
              فرم درخواست
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
