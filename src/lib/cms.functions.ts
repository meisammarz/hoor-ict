import { createServerFn } from "@tanstack/react-start";
import { articleSeed } from "@/lib/articles-seed";
import { getSql } from "@/lib/db";
import { panelMiddleware } from "@/lib/panel.functions";

const FEEDS = [
  { url: "https://www.cisa.gov/cybersecurity-advisories/all.xml", source: "CISA" },
  { url: "https://feeds.feedburner.com/TheHackersNews", source: "The Hacker News" },
];

type ArticleRow = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  body: string;
  topic: string;
  downloads: number;
};

type MediaRow = {
  id: number;
  kind: string;
  ref_id: string;
  title: string;
  caption: string;
  data_url: string;
  sort: number;
};

type TeamRow = {
  id: number;
  name: string;
  role: string;
  specialty: string;
  photo: string;
  sort: number;
};

type HeadlineRow = {
  link: string;
  title: string;
  source: string;
  published_at: string;
  hidden: boolean;
};

type SettingsRow = {
  phone1: string;
  phone2: string;
  address: string;
  whatsapp: string;
  banner: string;
  show_prices: boolean;
};

async function ensureArticles() {
  const sql = await getSql();
  for (const item of articleSeed) {
    await sql`
      insert into articles (slug, title, summary, body, topic, downloads)
      values (${item.slug}, ${item.title}, ${item.summary}, ${item.body}, ${item.topic}, ${item.downloads})
      on conflict (slug) do nothing
    `;
  }
}

async function assertAdmin(userId: string) {
  const sql = await getSql();
  const rows = await sql<{ username: string }>`select username from panel_users where username = ${userId}`;
  if (!rows[0]) throw new Error("این حساب مدیر سایت نیست.");
}

function pickTag(block: string, tag: string) {
  const cdata = block.match(new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>`, "i"));
  if (cdata) return cdata[1].trim();
  const plain = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return plain ? plain[1].replace(/<[^>]+>/g, "").trim() : "";
}

function decode(value: string) {
  return value
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function parseFeed(xml: string) {
  const chunks = xml.match(/<item[\s\S]*?<\/item>|<entry[\s\S]*?<\/entry>/gi) ?? [];
  return chunks.slice(0, 6).flatMap((block) => {
    const title = decode(pickTag(block, "title"));
    let link = decode(pickTag(block, "link"));
    if (!link) {
      const href = block.match(/<link[^>]*href=["']([^"']+)["']/i);
      link = href ? href[1] : "";
    }
    const published = decode(pickTag(block, "pubDate") || pickTag(block, "updated") || pickTag(block, "published"));
    if (!title || !link.startsWith("http")) return [];
    return [{ title: title.slice(0, 220), link, published: published.slice(0, 80) }];
  });
}

async function refreshNews() {
  const sql = await getSql();
  const fresh = await sql<{ n: number }>`
    select count(*)::int as n from headlines
    where fetched_at > now() - interval '6 hours' and hidden = false
  `;
  if ((fresh[0]?.n ?? 0) >= 4) return;
  for (const feed of FEEDS) {
    try {
      const response = await fetch(feed.url, {
        signal: AbortSignal.timeout(8000),
        headers: { accept: "application/rss+xml, application/atom+xml, application/xml, text/xml" },
      });
      if (!response.ok) continue;
      const xml = await response.text();
      for (const item of parseFeed(xml)) {
        await sql`
          insert into headlines (link, title, source, published_at, fetched_at)
          values (${item.link}, ${item.title}, ${feed.source}, ${item.published}, now())
          on conflict (link) do update
            set title = excluded.title,
                published_at = excluded.published_at,
                fetched_at = now()
        `;
      }
    } catch {
      // منبع بیرونی قطع است؛ عنوان‌های قبلی می‌مانند.
    }
  }
}

export const getSettings = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  const rows = await sql<SettingsRow>`
    select phone1, phone2, address, whatsapp, banner, show_prices from site_settings where id = 1
  `;
  return (
    rows[0] ?? {
      phone1: "",
      phone2: "",
      address: "",
      whatsapp: "",
      banner: "",
      show_prices: false,
    }
  );
});

export const getGallery = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  const rows = await sql<MediaRow>`
    select id, kind, ref_id, title, caption, data_url, sort
    from media
    order by sort asc, id desc
    limit 40
  `;
  return rows.map((row) => ({
    id: row.id,
    kind: row.kind,
    refId: row.ref_id,
    title: row.title,
    caption: row.caption,
    src: row.data_url,
  }));
});

export const getTeam = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  const rows = await sql<TeamRow>`
    select id, name, role, specialty, photo, sort from team_members order by sort asc, id asc
  `;
  return rows;
});

export const listArticles = createServerFn({ method: "GET" }).handler(async () => {
  await ensureArticles();
  const sql = await getSql();
  const rows = await sql<ArticleRow>`
    select id, slug, title, summary, body, topic, downloads
    from articles
    order by downloads desc, id desc
  `;
  return rows.map(({ body: _body, ...card }) => card);
});

export const getArticle = createServerFn({ method: "GET" })
  .validator((slug: string) => {
    if (typeof slug !== "string" || slug.length > 80) throw new Error("شناسه مقاله نامعتبر است.");
    return slug;
  })
  .handler(async ({ data }) => {
    await ensureArticles();
    const sql = await getSql();
    const rows = await sql<ArticleRow>`
      select id, slug, title, summary, body, topic, downloads from articles where slug = ${data}
    `;
    return rows[0] ?? null;
  });

export const countDownload = createServerFn({ method: "POST" })
  .validator((slug: string) => {
    if (typeof slug !== "string" || slug.length > 80) throw new Error("شناسه مقاله نامعتبر است.");
    return slug;
  })
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql<{ downloads: number }>`
      update articles set downloads = downloads + 1 where slug = ${data} returning downloads
    `;
    return rows[0]?.downloads ?? 0;
  });

export const listNews = createServerFn({ method: "GET" }).handler(async () => {
  await refreshNews();
  const sql = await getSql();
  const rows = await sql<HeadlineRow>`
    select link, title, source, published_at, hidden
    from headlines
    where hidden = false
    order by fetched_at desc
    limit 16
  `;
  return rows;
});

export const adminState = createServerFn({ method: "GET" })
  .middleware([panelMiddleware])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    await ensureArticles();
    const sql = await getSql();
    const [articles, team, media, news, settings] = await Promise.all([
      sql<ArticleRow>`select id, slug, title, summary, body, topic, downloads from articles order by id desc`,
      sql<TeamRow>`select id, name, role, specialty, photo, sort from team_members order by sort asc, id asc`,
      sql<MediaRow>`select id, kind, ref_id, title, caption, data_url, sort from media order by id desc limit 40`,
      sql<HeadlineRow>`select link, title, source, published_at, hidden from headlines order by fetched_at desc limit 20`,
      sql<SettingsRow>`select phone1, phone2, address, whatsapp, banner, show_prices from site_settings where id = 1`,
    ]);
    return {
      articles,
      team,
      media: media.map((row) => ({
        id: row.id,
        kind: row.kind,
        refId: row.ref_id,
        title: row.title,
        caption: row.caption,
      })),
      news,
      settings: settings[0] ?? {
        phone1: "",
        phone2: "",
        address: "",
        whatsapp: "",
        banner: "",
        show_prices: false,
      },
    };
  });

function cleanText(value: unknown, max: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

export const saveSettings = createServerFn({ method: "POST" })
  .middleware([panelMiddleware])
  .validator((input: SettingsRow) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const sql = await getSql();
    const phone1 = cleanText(data.phone1, 40);
    const phone2 = cleanText(data.phone2, 40);
    const address = cleanText(data.address, 160);
    const whatsapp = cleanText(data.whatsapp, 20).replace(/[^\d+]/g, "");
    const banner = cleanText(data.banner, 280);
    const showPrices = Boolean(data.show_prices);
    await sql`
      insert into site_settings (id, phone1, phone2, address, whatsapp, banner, show_prices)
      values (1, ${phone1}, ${phone2}, ${address}, ${whatsapp}, ${banner}, ${showPrices})
      on conflict (id) do update set
        phone1 = excluded.phone1,
        phone2 = excluded.phone2,
        address = excluded.address,
        whatsapp = excluded.whatsapp,
        banner = excluded.banner,
        show_prices = excluded.show_prices
    `;
    return { ok: true };
  });

export const addMedia = createServerFn({ method: "POST" })
  .middleware([panelMiddleware])
  .validator((input: { kind: string; refId: string; title: string; caption: string; dataUrl: string }) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    if (typeof data.dataUrl !== "string" || !data.dataUrl.startsWith("data:image/")) {
      throw new Error("فقط فایل تصویری پذیرفته می‌شود.");
    }
    if (data.dataUrl.length > 900_000) throw new Error("عکس بزرگ است. عکس را نزدیک‌تر برش دهید یا کیفیت گوشی را کمتر کنید.");
    const kind = data.kind === "group" || data.kind === "service" ? data.kind : "gallery";
    const sql = await getSql();
    await sql`
      insert into media (kind, ref_id, title, caption, data_url)
      values (${kind}, ${cleanText(data.refId, 40)}, ${cleanText(data.title, 80)}, ${cleanText(data.caption, 180)}, ${data.dataUrl})
    `;
    return { ok: true };
  });

export const deleteMedia = createServerFn({ method: "POST" })
  .middleware([panelMiddleware])
  .validator((id: number) => {
    if (!Number.isInteger(id)) throw new Error("شناسه نامعتبر است.");
    return id;
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const sql = await getSql();
    await sql`delete from media where id = ${data}`;
    return { ok: true };
  });

export const saveMember = createServerFn({ method: "POST" })
  .middleware([panelMiddleware])
  .validator(
    (input: { id?: number; name: string; role: string; specialty: string; photo: string }) => input,
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const name = cleanText(data.name, 80);
    const role = cleanText(data.role, 80);
    if (!name || !role) throw new Error("نام و سمت را بنویسید.");
    const specialty = cleanText(data.specialty, 160);
    const photo = typeof data.photo === "string" && data.photo.startsWith("data:image/") ? data.photo : "";
    if (photo.length > 900_000) throw new Error("عکس بزرگ است.");
    const sql = await getSql();
    if (data.id) {
      await sql`
        update team_members
        set name = ${name}, role = ${role}, specialty = ${specialty},
            photo = case when ${photo} = '' then photo else ${photo} end
        where id = ${data.id}
      `;
    } else {
      await sql`
        insert into team_members (name, role, specialty, photo)
        values (${name}, ${role}, ${specialty}, ${photo})
      `;
    }
    return { ok: true };
  });

export const deleteMember = createServerFn({ method: "POST" })
  .middleware([panelMiddleware])
  .validator((id: number) => {
    if (!Number.isInteger(id)) throw new Error("شناسه نامعتبر است.");
    return id;
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const sql = await getSql();
    await sql`delete from team_members where id = ${data}`;
    return { ok: true };
  });

export const saveArticle = createServerFn({ method: "POST" })
  .middleware([panelMiddleware])
  .validator(
    (input: { id?: number; title: string; summary: string; body: string; topic: string }) => input,
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const title = cleanText(data.title, 140);
    const summary = cleanText(data.summary, 280);
    const body = cleanText(data.body, 12000);
    if (!title || !summary || body.length < 40) throw new Error("عنوان، خلاصه و متن مقاله را کامل کنید.");
    const topic = data.topic === "it" ? "it" : "safety";
    const sql = await getSql();
    if (data.id) {
      await sql`
        update articles set title = ${title}, summary = ${summary}, body = ${body}, topic = ${topic}
        where id = ${data.id}
      `;
    } else {
      const slug = `n-${Date.now()}`;
      await sql`
        insert into articles (slug, title, summary, body, topic, downloads)
        values (${slug}, ${title}, ${summary}, ${body}, ${topic}, 0)
      `;
    }
    return { ok: true };
  });

export const deleteArticle = createServerFn({ method: "POST" })
  .middleware([panelMiddleware])
  .validator((id: number) => {
    if (!Number.isInteger(id)) throw new Error("شناسه نامعتبر است.");
    return id;
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const sql = await getSql();
    await sql`delete from articles where id = ${data}`;
    return { ok: true };
  });

export const setHeadlineHidden = createServerFn({ method: "POST" })
  .middleware([panelMiddleware])
  .validator((input: { link: string; hidden: boolean }) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const link = cleanText(data.link, 400);
    const sql = await getSql();
    await sql`update headlines set hidden = ${Boolean(data.hidden)} where link = ${link}`;
    return { ok: true };
  });

export const listPrices = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  const settings = await sql<{ show_prices: boolean }>`select show_prices from site_settings where id = 1`;
  if (!settings[0]?.show_prices) return { open: false, items: [] };
  const items = await sql<{ id: number; title: string; unit: string; amount: string; note: string }>`
    select id, title, unit, amount, note from prices order by sort asc, id asc
  `;
  return { open: true, items };
});

export const savePrice = createServerFn({ method: "POST" })
  .middleware([panelMiddleware])
  .validator((input: { id?: number; title: string; unit: string; amount: string; note: string }) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const title = cleanText(data.title, 80);
    const amount = cleanText(data.amount, 40);
    if (!title || !amount) throw new Error("عنوان و مبلغ را بنویسید.");
    const sql = await getSql();
    if (data.id) {
      await sql`
        update prices
        set title = ${title}, unit = ${cleanText(data.unit, 30)}, amount = ${amount}, note = ${cleanText(data.note, 160)}
        where id = ${data.id}
      `;
    } else {
      await sql`
        insert into prices (title, unit, amount, note)
        values (${title}, ${cleanText(data.unit, 30)}, ${amount}, ${cleanText(data.note, 160)})
      `;
    }
    return { ok: true };
  });

export const deletePrice = createServerFn({ method: "POST" })
  .middleware([panelMiddleware])
  .validator((id: number) => {
    if (!Number.isInteger(id)) throw new Error("شناسه نامعتبر است.");
    return id;
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const sql = await getSql();
    await sql`delete from prices where id = ${data}`;
    return { ok: true };
  });

export const adminPrices = createServerFn({ method: "GET" })
  .middleware([panelMiddleware])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const sql = await getSql();
    return sql<{ id: number; title: string; unit: string; amount: string; note: string }>`
      select id, title, unit, amount, note from prices order by sort asc, id asc
    `;
  });
