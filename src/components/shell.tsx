import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Assistant } from "@/components/assistant";
import { phones, site } from "@/lib/content";
import { getSettings } from "@/lib/cms.functions";

function toTel(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return phones[0].tel;
  if (digits.startsWith("98")) return `+${digits}`;
  if (digits.startsWith("0")) return `+98${digits.slice(1)}`;
  return `+${digits}`;
}

const links = [
  { to: "/", label: "خانه" },
  { to: "/services", label: "خدمات" },
  { to: "/news", label: "اخبار" },
  { to: "/articles", label: "مقالات" },
  { to: "/projects", label: "سوابق" },
  { to: "/about", label: "درباره" },
  { to: "/contact", label: "تماس" },
] as const;

export function SiteShell({ children }: { children: React.ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [banner, setBanner] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [phone, setPhone] = useState(phones[0].tel);
  const [showPrices, setShowPrices] = useState(false);

  useEffect(() => {
    void getSettings()
      .then((settings) => {
        setBanner(settings.banner);
        setWhatsapp(settings.whatsapp);
        setShowPrices(Boolean(settings.show_prices));
        if (settings.phone1) setPhone(toTel(settings.phone1));
      })
      .catch(() => undefined);
  }, []);

  const nav = showPrices ? [...links.slice(0, 2), { to: "/prices", label: "قیمت" }, ...links.slice(2)] : links;

  return (
    <div className="min-h-screen bg-bg text-fg">
      <div className="border-b border-line bg-raised text-muted">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-2 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>{banner || site.staging}</p>
          <p className="shrink-0 font-mono text-xs tracking-wide text-primary" dir="ltr">
            STAGING
          </p>
        </div>
      </div>

      <header className="sticky top-0 z-30 border-b border-line bg-bg/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="min-w-0" onClick={() => setOpen(false)}>
            <span className="block text-sm font-semibold text-fg">{site.title}</span>
            <span className="block font-mono text-xs text-muted" dir="ltr">
              {site.socialHandle}
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="اصلی">
            {nav.map((item) => {
              const active = path === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={
                    "tap rounded-full px-3 py-2 text-sm " +
                    (active ? "bg-surface text-fg" : "text-muted hover:text-fg")
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${phone}`}
              className="tap hidden rounded-full bg-primary px-4 py-2 text-sm font-semibold text-ink sm:inline-flex"
            >
              تماس
            </a>
            <button
              type="button"
              className="tap inline-flex size-11 items-center justify-center rounded-full border border-line bg-surface text-fg md:hidden"
              aria-expanded={open}
              aria-controls="mobile-nav"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
              <span className="sr-only">{open ? "بستن منو" : "باز کردن منو"}</span>
            </button>
          </div>
        </div>

        {open ? (
          <nav id="mobile-nav" className="border-t border-line px-4 py-3 md:hidden" aria-label="موبایل">
            <ul className="grid gap-1">
              {nav.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className={
                      "tap flex min-h-11 items-center rounded-xl px-3 text-sm " +
                      (path === item.to ? "bg-surface text-fg" : "text-muted")
                    }
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </header>

      <main>{children}</main>

      <footer className="mt-16 border-t border-line bg-raised">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <p className="text-sm font-semibold">{site.title}</p>
            <p className="mt-1 text-sm text-muted">مجری پروژه‌های ارتباطی و مخابراتی</p>
            <p className="mt-3 max-w-md text-sm text-muted">{site.coverage}</p>
          </div>
          <div>
            <p className="text-xs text-muted">تلفن</p>
            <ul className="mt-2 space-y-1">
              {phones.map((phone) => (
                <li key={phone.tel}>
                  <a className="text-sm text-fg hover:text-primary" href={`tel:${phone.tel}`} dir="ltr">
                    {phone.display}
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-muted">{site.address}</p>
          </div>
          <div>
            <p className="text-xs text-muted">ایمن حور</p>
            <a
              className="mt-2 block font-mono text-sm text-primary"
              dir="ltr"
              href={site.telegram}
              target="_blank"
              rel="noreferrer"
            >
              {site.socialHandle}
            </a>
            <Link to="/admin" className="mt-2 block text-sm text-primary">
              پنل مدیریت
            </Link>
          </div>
        </div>
        <div className="border-t border-line">
          <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-muted">
            پیش‌نمایش ۱۴۰۵. پس از تأیید شما می‌توان سایت را منتشر کرد؛ تا آن زمان دامنه اصلی دست نمی‌خورد.
          </p>
        </div>
      </footer>
      {path.startsWith("/admin") || path.startsWith("/login") ? null : <Assistant whatsapp={whatsapp} />}
    </div>
  );
}
