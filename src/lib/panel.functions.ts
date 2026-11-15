import { createServerFn } from "@tanstack/react-start";
import { createMiddleware } from "@tanstack/react-start";

const attempts = new Map<string, { n: number; at: number }>();

function tooMany(key: string) {
  const now = Date.now();
  const row = attempts.get(key);
  if (!row || now - row.at > 15 * 60 * 1000) {
    attempts.set(key, { n: 1, at: now });
    return false;
  }
  row.n += 1;
  return row.n > 8;
}

export const panelMiddleware = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const { assertSameSiteRequest } = await import("./auth/isolation.server");
  const { panelUser, ensurePanel } = await import("./panel.server");
  assertSameSiteRequest();
  await ensurePanel();
  const userId = panelUser();
  if (!userId) throw new Error("وارد نشده‌اید. دوباره از صفحه ورود بروید.");
  return next({ context: { userId } });
});

export const panelMe = createServerFn({ method: "GET" }).handler(async () => {
  const { panelUser } = await import("./panel.server");
  return { username: panelUser() };
});

export const panelLogin = createServerFn({ method: "POST" })
  .validator((input: { username: string; password: string }) => input)
  .handler(async ({ data }) => {
    const username = String(data.username || "").trim().toLowerCase();
    const password = String(data.password || "");
    if (username.length < 3 || password.length < 8) {
      throw new Error("نام کاربری یا رمز درست نیست.");
    }
    if (tooMany(username)) throw new Error("چند بار رمز اشتباه زده شد. ۱۵ دقیقه بعد دوباره تلاش کنید.");
    const { ensurePanel, verifyPassword, setPanelCookie } = await import("./panel.server");
    const { getSql } = await import("./db");
    await ensurePanel();
    const sql = await getSql();
    const rows = await sql<{ username: string; pass_hash: string }>`
      select username, pass_hash from panel_users where username = ${username}
    `;
    const row = rows[0];
    if (!row || !verifyPassword(password, row.pass_hash)) {
      throw new Error("نام کاربری یا رمز درست نیست.");
    }
    attempts.delete(username);
    setPanelCookie(row.username);
    return { ok: true, username: row.username };
  });

export const panelLogout = createServerFn({ method: "POST" }).handler(async () => {
  const { clearPanelCookie } = await import("./panel.server");
  clearPanelCookie();
  return { ok: true };
});

export const listPanelUsers = createServerFn({ method: "GET" })
  .middleware([panelMiddleware])
  .handler(async () => {
    const { getSql } = await import("./db");
    const sql = await getSql();
    return sql<{ username: string; primary_admin: boolean }>`
      select username, primary_admin from panel_users order by primary_admin desc, username asc
    `;
  });

export const createPanelUser = createServerFn({ method: "POST" })
  .middleware([panelMiddleware])
  .validator((input: { username: string; password: string }) => input)
  .handler(async ({ data }) => {
    const username = String(data.username || "").trim().toLowerCase();
    const password = String(data.password || "");
    if (!/^[a-z0-9._-]{3,24}$/.test(username)) {
      throw new Error("نام کاربری فقط حرف انگلیسی، عدد، نقطه و خط تیره، از ۳ تا ۲۴ نویسه.");
    }
    if (password.length < 8) throw new Error("رمز باید حداقل ۸ نویسه باشد.");
    const { hashPassword } = await import("./panel.server");
    const { getSql } = await import("./db");
    const sql = await getSql();
    const exists = await sql<{ username: string }>`select username from panel_users where username = ${username}`;
    if (exists[0]) throw new Error("این نام کاربری قبلاً ساخته شده.");
    await sql`
      insert into panel_users (username, pass_hash, primary_admin)
      values (${username}, ${hashPassword(password)}, false)
    `;
    return { ok: true };
  });

export const deletePanelUser = createServerFn({ method: "POST" })
  .middleware([panelMiddleware])
  .validator((username: string) => username)
  .handler(async ({ data, context }) => {
    const username = String(data || "").trim().toLowerCase();
    if (username === "admin") throw new Error("حساب اصلی admin حذف نمی‌شود.");
    if (username === context.userId) throw new Error("نمی‌توانید حساب خودتان را حذف کنید.");
    const { getSql } = await import("./db");
    const sql = await getSql();
    await sql`delete from panel_users where username = ${username} and primary_admin = false`;
    return { ok: true };
  });

export const changePanelPassword = createServerFn({ method: "POST" })
  .middleware([panelMiddleware])
  .validator((input: { current: string; next: string }) => input)
  .handler(async ({ data, context }) => {
    const next = String(data.next || "");
    if (next.length < 8) throw new Error("رمز جدید باید حداقل ۸ نویسه باشد.");
    const { verifyPassword, hashPassword } = await import("./panel.server");
    const { getSql } = await import("./db");
    const sql = await getSql();
    const rows = await sql<{ pass_hash: string }>`
      select pass_hash from panel_users where username = ${context.userId}
    `;
    if (!rows[0] || !verifyPassword(String(data.current || ""), rows[0].pass_hash)) {
      throw new Error("رمز فعلی درست نیست.");
    }
    await sql`update panel_users set pass_hash = ${hashPassword(next)} where username = ${context.userId}`;
    return { ok: true };
  });
