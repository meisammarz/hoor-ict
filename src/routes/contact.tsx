import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteShell } from "@/components/shell";
import { getSettings } from "@/lib/cms.functions";
import { channels, phones, services, site } from "@/lib/content";

function toTel(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return phones[0].tel;
  if (digits.startsWith("98")) return `+${digits}`;
  if (digits.startsWith("0")) return `+98${digits.slice(1)}`;
  return `+${digits}`;
}

export const Route = createFileRoute("/contact")({
  loader: () => getSettings(),
  head: () => ({
    meta: [{ title: "تماس | ارتباطات گستر ایمن حور" }],
  }),
  component: ContactPage,
});

type Inquiry = {
  id: string;
  name: string;
  org: string;
  phone: string;
  area: string;
  message: string;
  createdAt: string;
};

const STORAGE_KEY = "faz-hoor-inquiries";

const empty = { name: "", org: "", phone: "", area: services[0]?.title ?? "", message: "" };

function ContactPage() {
  const settings = Route.useLoaderData();
  const listed = [
    settings.phone1 ? { display: settings.phone1, tel: toTel(settings.phone1) } : phones[0],
    settings.phone2 ? { display: settings.phone2, tel: toTel(settings.phone2) } : phones[1],
  ];
  const address = settings.address || site.address;
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<Inquiry | null>(null);
  const [list, setList] = useState<Inquiry[]>([]);

  useEffect(() => {
    setList(readInquiries());
  }, []);

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (form.name.trim().length < 2) next.name = "نام را کامل‌تر بنویسید.";
    if (!/^09\d{9}$/.test(normalizeMobile(form.phone))) {
      next.phone = "شماره موبایل ۱۱ رقمی لازم است.";
    }
    if (form.message.trim().length < 12) next.message = "شرح نیاز را کمی دقیق‌تر بنویسید.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const inquiry: Inquiry = {
      id: `HZ-${Date.now().toString(36).slice(-4).toUpperCase()}`,
      name: form.name.trim(),
      org: form.org.trim(),
      phone: form.phone.trim(),
      area: form.area,
      message: form.message.trim(),
      createdAt: new Date().toISOString(),
    };
    const all = [inquiry, ...readInquiries()].slice(0, 12);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    setList(all);
    setSaved(inquiry);
    setForm(empty);
  }

  function remove(id: string) {
    const all = readInquiries().filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    setList(all);
    if (saved?.id === id) setSaved(null);
  }

  return (
    <SiteShell>
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <h1 className="text-3xl font-extrabold">درخواست بررسی</h1>
          <p className="mt-3 text-sm text-muted">
            برای بررسی مسیر، برآورد یا هماهنگی بازدید، با شماره‌های زیر تماس بگیرید یا پیام بگذارید.
          </p>
          <ul className="mt-6 space-y-3">
            {listed.map((phone) => (
              <li key={phone.tel} className="rounded-card border border-line bg-surface p-4">
                <a className="text-lg font-semibold text-fg" href={`tel:${phone.tel}`} dir="ltr">
                  {phone.display}
                </a>
                <a
                  className="mt-1 block text-sm text-primary"
                  href={`https://wa.me/${phone.tel.replace("+", "")}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  واتساپ همین شماره
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted">{address}</p>
          <p className="mt-1 text-sm text-muted">{site.coverage}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {channels.map((channel) =>
              channel.href ? (
                <a
                  key={channel.name}
                  href={channel.href}
                  target="_blank"
                  rel="noreferrer"
                  className="tap min-h-11 rounded-full border border-line px-3 py-2 text-sm text-fg"
                >
                  {channel.name}
                </a>
              ) : (
                <span
                  key={channel.name}
                  className="inline-flex min-h-11 items-center rounded-full border border-line px-3 text-sm text-muted"
                >
                  {channel.name}: {site.socialHandle}
                </span>
              ),
            )}
          </div>
        </div>

        <div className="lg:col-span-7">
          <form onSubmit={onSubmit} className="rounded-card border border-line bg-surface p-5" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="نام" error={errors.name}>
                <input
                  className={inputClass}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  name="name"
                  autoComplete="name"
                />
              </Field>
              <Field label="سازمان" error="">
                <input
                  className={inputClass}
                  value={form.org}
                  onChange={(e) => setForm({ ...form, org: e.target.value })}
                  name="organization"
                  autoComplete="organization"
                />
              </Field>
              <Field label="موبایل" error={errors.phone}>
                <input
                  className={inputClass}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  name="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  dir="ltr"
                />
              </Field>
              <Field label="حوزه" error="">
                <select
                  className={inputClass}
                  value={form.area}
                  onChange={(e) => setForm({ ...form, area: e.target.value })}
                  name="area"
                >
                  {services.map((item) => (
                    <option key={item.id} value={item.title}>
                      {item.title}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="شرح نیاز" error={errors.message}>
              <textarea
                className={inputClass + " min-h-32"}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                name="message"
              />
            </Field>
            <button
              type="submit"
              className="tap mt-4 inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-ink"
            >
              ثبت روی این مرورگر
            </button>
          </form>

          {saved ? (
            <p className="mt-4 rounded-card border border-primary bg-raised p-4 text-sm" role="status">
              درخواست با شناسه <span className="font-mono text-primary">{saved.id}</span> ذخیره شد. هنوز برای
              مجموعه ارسال نشده است.
            </p>
          ) : null}

          <section className="mt-6">
            <h2 className="text-sm font-semibold">درخواست‌های همین دستگاه</h2>
            {list.length === 0 ? (
              <p className="mt-2 text-sm text-muted">هنوز موردی نیست.</p>
            ) : (
              <ul className="mt-3 grid gap-2">
                {list.map((item) => (
                  <li key={item.id} className="rounded-xl border border-line bg-raised p-3 text-sm">
                    <div className="flex items-start justify-between gap-3">
                      <p>
                        <span className="font-mono text-primary">{item.id}</span>
                        <span className="mx-2 text-muted">·</span>
                        {item.name}
                        {item.org ? `، ${item.org}` : ""}
                      </p>
                      <button
                        type="button"
                        className="tap text-xs text-muted hover:text-fg"
                        onClick={() => remove(item.id)}
                      >
                        حذف
                      </button>
                    </div>
                    <p className="mt-1 text-muted">
                      {item.area} — <span dir="ltr">{item.phone}</span>
                    </p>
                    <p className="mt-1">{item.message}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </SiteShell>
  );
}

function normalizeMobile(value: string) {
  const digits = value
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/\D/g, "");
  if (digits.startsWith("98") && digits.length >= 12) return `0${digits.slice(2, 12)}`;
  if (digits.length === 10 && digits.startsWith("9")) return `0${digits}`;
  return digits;
}

function readInquiries(): Inquiry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Inquiry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error: string;
  children: React.ReactNode;
}) {
  return (
    <label className="mt-3 block text-sm">
      <span className="text-muted">{label}</span>
      <span className="mt-1 block">{children}</span>
      {error ? <span className="mt-1 block text-xs text-primary">{error}</span> : null}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-line bg-bg px-3 py-3 text-sm text-fg outline-none";
