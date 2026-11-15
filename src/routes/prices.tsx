import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/shell";
import { listPrices } from "@/lib/cms.functions";

export const Route = createFileRoute("/prices")({
  loader: () => listPrices(),
  head: () => ({ meta: [{ title: "لیست قیمت | ارتباطات گستر ایمن حور" }] }),
  component: PricesPage,
});

function PricesPage() {
  const data = Route.useLoaderData();
  return (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="font-mono text-xs text-primary" dir="ltr">
          RATES
        </p>
        <h1 className="mt-2 text-3xl font-extrabold">لیست قیمت</h1>
        {!data.open ? (
          <p className="mt-4 text-sm text-muted">
            فهرست قیمت فعلاً نمایش داده نمی‌شود. برای برآورد همان پروژه با ما تماس بگیرید.
          </p>
        ) : data.items.length === 0 ? (
          <p className="mt-4 text-sm text-muted">هنوز ردیفی ثبت نشده است.</p>
        ) : (
          <ul className="mt-6 grid gap-3">
            {data.items.map((item) => (
              <li key={item.id} className="rise rounded-card border border-line bg-surface p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    {item.note ? <p className="mt-1 text-sm text-muted">{item.note}</p> : null}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-primary" dir="ltr">
                      {item.amount}
                    </p>
                    {item.unit ? <p className="text-xs text-muted">{item.unit}</p> : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        <Link to="/contact" className="tap mt-6 inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-ink">
          درخواست برآورد همین پروژه
        </Link>
      </div>
    </SiteShell>
  );
}
