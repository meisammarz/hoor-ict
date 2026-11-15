import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/shell";
import { getGallery, getSettings, getTeam } from "@/lib/cms.functions";
import { crew, principles, site, tools } from "@/lib/content";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [{ title: "درباره | ارتباطات گستر ایمن حور" }],
  }),
  loader: async () => {
    const [team, gallery, settings] = await Promise.all([getTeam(), getGallery(), getSettings()]);
    return { team, groups: gallery.filter((item) => item.kind === "group"), settings };
  },
  component: AboutPage,
});

function AboutPage() {
  const { team, groups, settings } = Route.useLoaderData();
  const title = settings.title || site.title;
  const since = settings.since || site.since;
  const address = settings.address || site.address;
  const eyebrow = settings.eyebrow || site.eyebrow;
  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <p className="font-mono text-xs text-primary" dir="ltr">
          HOOR ICT
        </p>
        <h1 className="mt-2 text-3xl font-extrabold">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted">
          معرفی خود مجموعه، و کنار آن سوابق فاز الکترونیک که در کاتالوگ اجرایی آمده است. این دو نام ادغام حقوقی
          نشده‌اند.
        </p>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <article className="rounded-card border border-line bg-surface p-5">
            <p className="font-mono text-xs text-primary" dir="ltr">
              HOOR ICT
            </p>
            <h2 className="mt-2 text-xl font-bold">{title}</h2>
            <p className="mt-1 text-sm text-muted">{eyebrow}</p>
            <p className="mt-4 text-sm text-fg">
              مجری پروژه‌های ارتباطی و مخابراتی با تمرکز بر دکل و تجهیزات رادیویی، ارت و صاعقه‌گیر، برق
              اضطراری، دوربین و کنترل تردد، تعمیر برد مخابراتی و بازیابی اطلاعات. شناسه شبکه‌های اجتماعی{" "}
              <span dir="ltr" className="font-mono text-primary">
                {site.socialHandle}
              </span>{" "}
              است؛ در تلگرام، اینستاگرام، واتساپ، بله، روبیکا و ایتا.
            </p>
            <p className="mt-4 text-sm text-muted">
              شعار عملیاتی: همراه مطمئن در مسیر ارتباطات پایدار و هوشمند، با پایش برای کاهش اختلال.
            </p>
          </article>

          <article className="rounded-card border border-line bg-surface p-5">
            <p className="font-mono text-xs text-primary" dir="ltr">
              FAZ ELECTRONIC
            </p>
            <h2 className="mt-2 text-xl font-bold">فاز الکترونیک</h2>
            <p className="mt-1 text-sm text-muted">نام در جریان ثبت: فناوران امن زیرساخت</p>
            <p className="mt-4 text-sm text-fg">
              از سال {since} در اجرای پروژه‌های فنی زیرساختی، مخابراتی، شبکه، برق و سیستم‌های نظارتی کار
              کرده است. تا تکمیل ثبت، فعالیت با نام تجاری فاز الکترونیک معرفی می‌شود. رویکرد مجموعه، اجرای
              قابل اتکا، رعایت اصول فنی، عیب‌یابی دقیق، راه‌اندازی صحیح و تحویل منظم است.
            </p>
            <dl className="mt-4 grid gap-2 text-sm">
              <div className="flex justify-between gap-3 border-t border-line pt-2">
                <dt className="text-muted">پایگاه</dt>
                <dd>{address}</dd>
              </div>
              <div className="flex justify-between gap-3 border-t border-line pt-2">
                <dt className="text-muted">گستره</dt>
                <dd>سراسر کشور</dd>
              </div>
              <div className="flex justify-between gap-3 border-t border-line pt-2">
                <dt className="text-muted">چشم‌انداز</dt>
                <dd className="max-w-xs">اتکا در پروژه‌های چندرشته‌ای</dd>
              </div>
            </dl>
          </article>
        </div>

        <section className="mt-10">
          <h2 className="text-2xl font-bold">اعضا و عکس جمعی</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            چهره و تخصص را فقط از پنل می‌گذارید. تا قبل از بارگذاری، سایت عکس ساختگی از افراد نشان نمی‌دهد.
          </p>
          {groups.length > 0 ? (
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {groups.map((photo) => (
                <li key={photo.id} className="overflow-hidden rounded-card border border-line bg-surface">
                  <img src={photo.src} alt={photo.title || "عکس جمعی"} className="aspect-[16/10] w-full object-cover" />
                  <p className="px-3 py-2 text-sm">{photo.title || photo.caption}</p>
                </li>
              ))}
            </ul>
          ) : null}
          {team.length === 0 ? (
            <p className="mt-4 rounded-card border border-dashed border-line p-4 text-sm text-muted">
              هنوز عضوی ثبت نشده. از پایین سایت، پنل مدیریت، بخش تیم.
            </p>
          ) : (
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {team.map((member) => (
                <li key={member.id} className="rounded-card border border-line bg-surface p-4">
                  {member.photo ? (
                    <img src={member.photo} alt="" className="mb-3 aspect-square w-full rounded-xl object-cover" />
                  ) : (
                    <div className="mb-3 grid aspect-square place-items-center rounded-xl bg-raised text-2xl font-bold text-primary">
                      {member.name.slice(0, 1)}
                    </div>
                  )}
                  <p className="font-semibold">{member.name}</p>
                  <p className="text-sm text-primary">{member.role}</p>
                  {member.specialty ? <p className="mt-1 text-sm text-muted">{member.specialty}</p> : null}
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <section className="rounded-card border border-line bg-raised p-5">
            <h2 className="font-bold">اصول کار</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              {principles.map((item) => (
                <li key={item} className="border-t border-line pt-2">
                  {item}
                </li>
              ))}
            </ul>
          </section>
          <section className="rounded-card border border-line bg-raised p-5">
            <h2 className="font-bold">نیروی اجرا</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              {crew.map((item) => (
                <li key={item} className="border-t border-line pt-2">
                  {item}
                </li>
              ))}
            </ul>
          </section>
          <section className="rounded-card border border-line bg-raised p-5">
            <h2 className="font-bold">ابزار تخصصی</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              {tools.map((item) => (
                <li key={item} className="border-t border-line pt-2">
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </SiteShell>
  );
}
