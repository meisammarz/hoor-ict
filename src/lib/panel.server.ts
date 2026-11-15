import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { getCookie, getRequest, setCookie } from "@tanstack/react-start/server";
import { getSql } from "@/lib/db";

const COOKIE = "hoor_panel";
const SEED_USER = "admin";
const SEED_HASH =
  "9f0d1ad837cbd892f0ec9d319c493835:ad6d806285af394a5b1ec3f3d9adaac48f4217ff0c2d4da69963f6e694dc4bfa";

function secret() {
  return process.env.BETTER_AUTH_SECRET || process.env.PANEL_SECRET || "hoor-panel-preview-secret";
}

export function hashPassword(password: string, salt = randomBytes(16).toString("hex")) {
  const hash = scryptSync(password, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const next = scryptSync(password, salt, 32);
  const prev = Buffer.from(hash, "hex");
  if (next.length !== prev.length) return false;
  return timingSafeEqual(next, prev);
}

function sign(username: string) {
  const exp = Date.now() + 1000 * 60 * 60 * 24 * 14;
  const body = Buffer.from(JSON.stringify({ u: username, e: exp })).toString("base64url");
  const mac = createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${mac}`;
}

function read(token: string | undefined) {
  if (!token) return null;
  const [body, mac] = token.split(".");
  if (!body || !mac) return null;
  const expected = createHmac("sha256", secret()).update(body).digest("base64url");
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(body, "base64url").toString()) as { u?: string; e?: number };
    if (!data.u || !data.e || data.e < Date.now()) return null;
    return data.u;
  } catch {
    return null;
  }
}

function cookieOptions(maxAge: number) {
  const request = getRequest();
  const secure = request.url.startsWith("https");
  return {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export function setPanelCookie(username: string) {
  setCookie(COOKIE, sign(username), cookieOptions(60 * 60 * 24 * 14));
}

export function clearPanelCookie() {
  setCookie(COOKIE, "", cookieOptions(0));
}

export function panelUser() {
  return read(getCookie(COOKIE));
}

export async function ensurePanel() {
  const sql = await getSql();
  await sql`
    create table if not exists panel_users (
      username text primary key,
      pass_hash text not null,
      primary_admin boolean not null default false,
      created_at timestamptz not null default now()
    )
  `;
  await sql`
    insert into panel_users (username, pass_hash, primary_admin)
    values (${SEED_USER}, ${SEED_HASH}, true)
    on conflict (username) do nothing
  `;
}
