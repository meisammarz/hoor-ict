import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ServiceIcon } from "@/components/service-icon";
import { SiteShell } from "@/components/shell";
import { getGallery } from "@/lib/cms.functions";
import { areas, owners, services, type Area } from "@/lib/content";
import { specialtyShots } from "@/lib/shots";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [{ title: "خدمات | ارتباطات گستر ایمن حور" }],
  }),
  loader: () => getGallery(),
  component: ServicesPage,
});

function ServicesPage() {
  const gallery = Route.useLoaderData();
  const [area, setArea] = useState<Area | "all">("all");
  const [owner, setOwner] = useState<"all" | "faz" | "hoor" | "both">("all");

  const list = useMemo(
    () =>
      services.filter((item) => {
        const areaOk = area === "all" || item.area === area;
        const ownerOk = owner === "all" || item.owner === owner;
        return areaOk && ownerOk;
      }),
    [area, owner],
  );

  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <p className="font-mono text-xs text-primary" dir="ltr">
          CATALOG
        </p>
        <h1 className="mt-2 text-3xl font-extrabold">خدمات تخصصی</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted">
          هر کارت مشخص می‌کند کار از کاتالوگ فاز الکترونیک است، از معرفی ایمن حور، یا در هر دو مجموعه آمده
          است. فیلتر را عوض کنید تا هم‌پوشانی را ببینید.
        </p>

        <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="حوزه">
          {areas.map((item) => (
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
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="مجموعه">
          {(
            [
              ["all", "هر دو برند"],
              ["faz", "فقط فاز"],
              ["hoor", "فقط ایمن حور"],
              ["both", "خدمات مشترک"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setOwner(id)}
              className={
                "tap min-h-11 rounded-full border px-3 text-sm " +
                (owner === id ? "border-primary text-fg" : "border-line text-muted")
              }
            >
              {label}
            </button>
          ))}
        </div>

        <p className="mt-4 text-sm text-muted">{list.length} مورد</p>

        {list.length === 0 ? (
          <p className="mt-6 rounded-card border border-line bg-surface p-6 text-sm text-muted">
            با این ترکیب فیلتر موردی نیست. حوزه یا مجموعه را عوض کنید.
          </p>
        ) : (
          <ul className="mt-4 grid gap-4">
            {list.map((item) => {
              const photos = [
                ...specialtyShots.filter(
                  (shot) => shot.id === item.id || (item.id === "power" && shot.id === "ups"),
                ),
                ...gallery.filter((shot) => shot.refId === item.id),
              ];
              return (
              <li
                key={item.id}
                id={item.id}
                className="scroll-mt-28 overflow-hidden rounded-card border border-line bg-surface"
              >
                {photos.length > 0 ? (
                  <div className="grid gap-px bg-line sm:grid-cols-2">
                    {photos.map((photo) => (
                      <img
                        key={photo.src}
                        src={photo.src}
                        alt={photo.title}
                        className="aspect-[16/9] w-full object-cover"
                      />
                    ))}
                  </div>
                ) : null}
                <div className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex gap-3">
                    <span className="inline-flex size-11 items-center justify-center rounded-xl bg-raised text-primary">
                      <ServiceIcon name={item.icon} className="size-5" />
                    </span>
                    <div>
                      <p className="font-mono text-xs text-primary">{item.index}</p>
                      <h2 className="text-lg font-bold">{item.title}</h2>
                    </div>
                  </div>
                  <span className="rounded-full bg-raised px-3 py-1 text-xs text-muted">
                    {owners[item.owner]}
                  </span>
                </div>
                <p className="mt-3 text-sm text-muted">{item.summary}</p>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {item.points.map((point) => (
                    <li key={point} className="rounded-xl bg-raised px-3 py-2 text-sm text-fg">
                      {point}
                    </li>
                  ))}
                </ul>
                </div>
              </li>
              );
            })}
          </ul>
        )}
      </div>
    </SiteShell>
  );
}
