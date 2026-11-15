import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteShell } from "@/components/shell";
import {
  addMedia,
  adminPrices,
  adminState,
  deleteArticle,
  deleteMedia,
  deleteMember,
  deletePrice,
  saveArticle,
  saveMember,
  savePrice,
  saveSettings,
  setHeadlineHidden,
} from "@/lib/cms.functions";
import {
  changePanelPassword,
  createPanelUser,
  deletePanelUser,
  listPanelUsers,
  panelLogout,
  panelMe,
} from "@/lib/panel.functions";
import { services } from "@/lib/content";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "پنل مدیریت | ارتباطات گستر ایمن حور" }] }),
  component: AdminGate,
});

type Tab = "settings" | "photos" | "team" | "articles" | "news" | "prices" | "accounts";

type State = Awaited<ReturnType<typeof adminState>>;

function AdminGate() {
  const navigate = useNavigate();
  const [ready, setReady] = useState<"wait" | "in" | "out">("wait");

  useEffect(() => {
    void panelMe()
      .then((me) => setReady(me.username ? "in" : "out"))
      .catch(() => setReady("out"));
  }, []);

  if (ready === "wait") {
    return (
      <SiteShell>
        <p className="px-4 py-16 text-center text-muted">در حال بررسی ورود…</p>
      </SiteShell>
    );
  }
  if (ready === "out") {
    void navigate({ to: "/login" });
    return (
      <SiteShell>
        <p className="px-4 py-16 text-center text-muted">برای پنل باید وارد شوید.</p>
      </SiteShell>
    );
  }
  return <AdminPanel />;
}

function AdminPanel() {
  const [tab, setTab] = useState<Tab>("photos");
  const [state, setState] = useState<State | null>(null);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");

  async function reload() {
    setError("");
    try {
      setState(await adminState());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "پنل باز نشد.");
    }
  }

  useEffect(() => {
    void reload();
  }, []);

  const tabs: { id: Tab; label: string }[] = [
    { id: "photos", label: "عکس" },
    { id: "team", label: "تیم" },
    { id: "articles", label: "مقاله" },
    { id: "news", label: "خبر" },
    { id: "prices", label: "قیمت" },
    { id: "accounts", label: "حساب" },
    { id: "settings", label: "تماس" },
  ];

  return (
    <SiteShell>
      <div className="mx-auto max-w-lg px-4 pb-28 pt-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold">پنل</h1>
            <p className="text-xs text-muted">برای کار در مسیر، دکمه‌ها درشت است.</p>
          </div>
          <button
            type="button"
            className="tap min-h-10 rounded-full border border-line px-3 text-xs"
            onClick={async () => {
              await panelLogout();
              window.location.href = "/login";
            }}
          >
            خروج
          </button>
        </div>
        {error ? <p className="mt-3 text-sm text-primary">{error}</p> : null}
        {note ? <p className="mt-3 text-sm text-primary">{note}</p> : null}
        {!state ? <p className="mt-6 text-sm text-muted">در حال خواندن اطلاعات…</p> : null}
        {state && tab === "photos" ? <Photos state={state} onDone={reload} onNote={setNote} onError={setError} /> : null}
        {state && tab === "team" ? <Team state={state} onDone={reload} onNote={setNote} onError={setError} /> : null}
        {state && tab === "articles" ? (
          <Articles state={state} onDone={reload} onNote={setNote} onError={setError} />
        ) : null}
        {state && tab === "news" ? <News state={state} onDone={reload} onError={setError} /> : null}
        {state && tab === "prices" ? <Prices onNote={setNote} onError={setError} /> : null}
        {state && tab === "accounts" ? <Accounts onNote={setNote} onError={setError} /> : null}
        {state && tab === "settings" ? (
          <SettingsForm state={state} onDone={reload} onNote={setNote} onError={setError} />
        ) : null}
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg/95 backdrop-blur">
        <ul className="mx-auto flex max-w-lg overflow-x-auto">
          {tabs.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={
                  "tap min-h-14 min-w-16 px-2 text-sm " + (tab === item.id ? "text-primary" : "text-muted")
                }
                onClick={() => {
                  setNote("");
                  setTab(item.id);
                }}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </SiteShell>
  );
}

const field = "min-h-12 w-full rounded-xl border border-line bg-bg px-3 text-base";

async function shrink(file: File) {
  const bitmap = await createImageBitmap(file);
  const max = 1280;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("مرورگر نتوانست عکس را کوچک کند.");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.72);
}

function Photos({
  state,
  onDone,
  onNote,
  onError,
}: {
  state: State;
  onDone: () => Promise<void>;
  onNote: (value: string) => void;
  onError: (value: string) => void;
}) {
  const [kind, setKind] = useState("gallery");
  const [refId, setRefId] = useState("towers");
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <section className="mt-5 grid gap-3">
      <p className="text-sm text-muted">عکس تخصص، عکس جمعی یا گالری. از دوربین گوشی هم می‌شود.</p>
      <select className={field} value={kind} onChange={(event) => setKind(event.target.value)}>
        <option value="gallery">گالری تخصص‌ها</option>
        <option value="service">وصل به یک خدمت</option>
        <option value="group">عکس دسته‌جمعی</option>
      </select>
      {kind === "service" ? (
        <select className={field} value={refId} onChange={(event) => setRefId(event.target.value)}>
          {services.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
            </option>
          ))}
        </select>
      ) : null}
      <input className={field} placeholder="عنوان روی عکس" value={title} onChange={(e) => setTitle(e.target.value)} />
      <input className={field} placeholder="توضیح کوتاه" value={caption} onChange={(e) => setCaption(e.target.value)} />
      <label className="tap flex min-h-12 items-center justify-center rounded-full border border-line text-sm">
        انتخاب یا گرفتن عکس
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) return;
            setBusy(true);
            onError("");
            try {
              const dataUrl = await shrink(file);
              await addMedia({
                data: { kind, refId: kind === "service" ? refId : "", title, caption, dataUrl },
              });
              setTitle("");
              setCaption("");
              onNote("عکس ذخیره شد.");
              await onDone();
            } catch (reason) {
              onError(reason instanceof Error ? reason.message : "ذخیره عکس نشد.");
            } finally {
              setBusy(false);
            }
          }}
        />
      </label>
      {busy ? <p className="text-sm text-muted">در حال کوچک‌کردن و ذخیره…</p> : null}
      <ul className="grid gap-2">
        {state.media.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-line px-3 py-2">
            <span className="text-sm">
              {item.title || item.kind}
              <span className="mt-0.5 block text-xs text-muted">{item.caption}</span>
            </span>
            <button
              type="button"
              className="tap min-h-11 shrink-0 text-sm text-primary"
              onClick={async () => {
                if (!confirm("این عکس حذف شود؟")) return;
                await deleteMedia({ data: item.id });
                await onDone();
              }}
            >
              حذف
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Team({
  state,
  onDone,
  onNote,
  onError,
}: {
  state: State;
  onDone: () => Promise<void>;
  onNote: (value: string) => void;
  onError: (value: string) => void;
}) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [photo, setPhoto] = useState("");

  return (
    <section className="mt-5 grid gap-3">
      <p className="text-sm text-muted">اسم، سمت، تخصص و عکس چهره. تا وقتی نگذارید، سایت چهره ساختگی نشان نمی‌دهد.</p>
      <input className={field} placeholder="نام" value={name} onChange={(e) => setName(e.target.value)} />
      <input className={field} placeholder="سمت" value={role} onChange={(e) => setRole(e.target.value)} />
      <input className={field} placeholder="تخصص" value={specialty} onChange={(e) => setSpecialty(e.target.value)} />
      <label className="tap flex min-h-12 items-center justify-center rounded-full border border-line text-sm">
        {photo ? "عکس انتخاب شد" : "عکس فرد"}
        <input
          type="file"
          accept="image/*"
          capture="user"
          className="sr-only"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) return;
            setPhoto(await shrink(file));
          }}
        />
      </label>
      <button
        type="button"
        className="tap min-h-12 rounded-full bg-primary text-sm font-semibold text-ink"
        onClick={async () => {
          onError("");
          try {
            await saveMember({ data: { name, role, specialty, photo } });
            setName("");
            setRole("");
            setSpecialty("");
            setPhoto("");
            onNote("عضو ذخیره شد.");
            await onDone();
          } catch (reason) {
            onError(reason instanceof Error ? reason.message : "ذخیره نشد.");
          }
        }}
      >
        افزودن عضو
      </button>
      <ul className="grid gap-2">
        {state.team.map((member) => (
          <li key={member.id} className="flex items-center justify-between gap-3 rounded-xl border border-line px-3 py-2">
            <span className="text-sm">
              {member.name}
              <span className="mt-0.5 block text-xs text-muted">
                {member.role}
                {member.specialty ? ` · ${member.specialty}` : ""}
              </span>
            </span>
            <button
              type="button"
              className="tap min-h-11 text-sm text-primary"
              onClick={async () => {
                if (!confirm(`${member.name} حذف شود؟`)) return;
                await deleteMember({ data: member.id });
                await onDone();
              }}
            >
              حذف
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Articles({
  state,
  onDone,
  onNote,
  onError,
}: {
  state: State;
  onDone: () => Promise<void>;
  onNote: (value: string) => void;
  onError: (value: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [body, setBody] = useState("");
  const [topic, setTopic] = useState("safety");
  const [editId, setEditId] = useState<number | undefined>(undefined);

  return (
    <section className="mt-5 grid gap-3">
      <input className={field} placeholder="عنوان" value={title} onChange={(e) => setTitle(e.target.value)} />
      <input className={field} placeholder="خلاصه یک خطی" value={summary} onChange={(e) => setSummary(e.target.value)} />
      <select className={field} value={topic} onChange={(e) => setTopic(e.target.value)}>
        <option value="safety">ایمنی</option>
        <option value="it">فناوری</option>
      </select>
      <textarea
        className="min-h-40 w-full rounded-xl border border-line bg-bg px-3 py-2 text-base"
        placeholder="متن. پاراگراف‌ها را با یک خط خالی جدا کنید."
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <button
        type="button"
        className="tap min-h-12 rounded-full bg-primary text-sm font-semibold text-ink"
        onClick={async () => {
          onError("");
          try {
            await saveArticle({ data: { id: editId, title, summary, body, topic } });
            setTitle("");
            setSummary("");
            setBody("");
            setEditId(undefined);
            onNote(editId ? "مقاله به‌روز شد." : "مقاله اضافه شد.");
            await onDone();
          } catch (reason) {
            onError(reason instanceof Error ? reason.message : "ذخیره مقاله نشد.");
          }
        }}
      >
        {editId ? "ذخیره ویرایش" : "افزودن مقاله"}
      </button>
      <ul className="grid gap-2">
        {state.articles.map((item) => (
          <li key={item.id} className="rounded-xl border border-line px-3 py-2">
            <p className="text-sm font-medium">{item.title}</p>
            <div className="mt-1 flex gap-3">
              <button
                type="button"
                className="tap min-h-11 text-sm text-primary"
                onClick={() => {
                  setEditId(item.id);
                  setTitle(item.title);
                  setSummary(item.summary);
                  setBody(item.body);
                  setTopic(item.topic);
                }}
              >
                ویرایش
              </button>
              <button
                type="button"
                className="tap min-h-11 text-sm text-muted"
                onClick={async () => {
                  if (!confirm("مقاله حذف شود؟")) return;
                  await deleteArticle({ data: item.id });
                  await onDone();
                }}
              >
                حذف
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function News({
  state,
  onDone,
  onError,
}: {
  state: State;
  onDone: () => Promise<void>;
  onError: (value: string) => void;
}) {
  return (
    <section className="mt-5 grid gap-2">
      <p className="text-sm text-muted">عنوان‌ها خودکار می‌آیند. اگر یکی را نخواهید، مخفی کنید.</p>
      {state.news.length === 0 ? <p className="text-sm">هنوز عنوانی ذخیره نشده. صفحه اخبار را یک بار باز کنید.</p> : null}
      {state.news.map((item) => (
        <div key={item.link} className="rounded-xl border border-line px-3 py-2">
          <p className="text-sm">{item.title}</p>
          <p className="text-xs text-muted">{item.source}</p>
          <button
            type="button"
            className="tap mt-1 min-h-11 text-sm text-primary"
            onClick={async () => {
              try {
                await setHeadlineHidden({ data: { link: item.link, hidden: !item.hidden } });
                await onDone();
              } catch (reason) {
                onError(reason instanceof Error ? reason.message : "تغییر اعمال نشد.");
              }
            }}
          >
            {item.hidden ? "نشان بده" : "مخفی کن"}
          </button>
        </div>
      ))}
    </section>
  );
}

function SettingsForm({
  state,
  onDone,
  onNote,
  onError,
}: {
  state: State;
  onDone: () => Promise<void>;
  onNote: (value: string) => void;
  onError: (value: string) => void;
}) {
  const [form, setForm] = useState(state.settings);
  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }
  return (
    <section className="mt-5 grid gap-3">
      <p className="text-sm text-muted">اگر خالی بماند، شماره و آدرس کاتالوگ نشان داده می‌شود.</p>
      <input className={field} placeholder="تلفن اول" value={form.phone1} onChange={(e) => set("phone1", e.target.value)} />
      <input className={field} placeholder="تلفن دوم" value={form.phone2} onChange={(e) => set("phone2", e.target.value)} />
      <input className={field} placeholder="آدرس" value={form.address} onChange={(e) => set("address", e.target.value)} />
      <input
        className={field}
        placeholder="واتساپ، مثل 989109595559"
        dir="ltr"
        value={form.whatsapp}
        onChange={(e) => set("whatsapp", e.target.value)}
      />
      <textarea
        className="min-h-24 w-full rounded-xl border border-line bg-bg px-3 py-2 text-base"
        placeholder="یک جمله بالای سایت، مثلاً اعلام تعطیلی یا پروژه فوری"
        value={form.banner}
        onChange={(e) => set("banner", e.target.value)}
      />
      <label className="flex min-h-12 items-center gap-3 rounded-xl border border-line px-3 text-sm">
        <input
          type="checkbox"
          checked={Boolean(form.show_prices)}
          onChange={(e) => setForm((prev) => ({ ...prev, show_prices: e.target.checked }))}
        />
        نمایش تب قیمت در سایت
      </label>
      <button
        type="button"
        className="tap min-h-12 rounded-full bg-primary text-sm font-semibold text-ink"
        onClick={async () => {
          onError("");
          try {
            await saveSettings({ data: form });
            onNote("اطلاعات تماس ذخیره شد.");
            await onDone();
          } catch (reason) {
            onError(reason instanceof Error ? reason.message : "ذخیره نشد.");
          }
        }}
      >
        ذخیره
      </button>
    </section>
  );
}

function Prices({
  onNote,
  onError,
}: {
  onNote: (value: string) => void;
  onError: (value: string) => void;
}) {
  const [items, setItems] = useState<Awaited<ReturnType<typeof adminPrices>>>([]);
  const [title, setTitle] = useState("");
  const [unit, setUnit] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  async function load() {
    setItems(await adminPrices());
  }
  useEffect(() => {
    void load().catch((reason) => onError(reason instanceof Error ? reason.message : "قیمت‌ها خوانده نشد."));
  }, []);

  return (
    <section className="mt-5 grid gap-3">
      <p className="text-sm text-muted">تیک «نمایش تب قیمت» را در بخش تماس بزنید تا این فهرست در سایت دیده شود.</p>
      <input className={field} placeholder="عنوان، مثلاً بازدید فنی" value={title} onChange={(e) => setTitle(e.target.value)} />
      <input className={field} placeholder="واحد، مثلاً هر سایت" value={unit} onChange={(e) => setUnit(e.target.value)} />
      <input className={field} placeholder="مبلغ، مثلاً تماس بگیرید" value={amount} onChange={(e) => setAmount(e.target.value)} />
      <input className={field} placeholder="توضیح کوتاه" value={note} onChange={(e) => setNote(e.target.value)} />
      <button
        type="button"
        className="tap min-h-12 rounded-full bg-primary text-sm font-semibold text-ink"
        onClick={async () => {
          onError("");
          try {
            await savePrice({ data: { title, unit, amount, note } });
            setTitle("");
            setUnit("");
            setAmount("");
            setNote("");
            onNote("ردیف قیمت ذخیره شد.");
            await load();
          } catch (reason) {
            onError(reason instanceof Error ? reason.message : "ذخیره نشد.");
          }
        }}
      >
        افزودن ردیف
      </button>
      {items.map((item) => (
        <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-line p-3">
          <div>
            <p className="font-semibold">{item.title}</p>
            <p className="text-sm text-muted">{item.amount}{item.unit ? ` · ${item.unit}` : ""}</p>
          </div>
          <button
            type="button"
            className="tap min-h-10 rounded-full border border-line px-3 text-xs"
            onClick={async () => {
              await deletePrice({ data: item.id });
              await load();
            }}
          >
            حذف
          </button>
        </div>
      ))}
    </section>
  );
}

function Accounts({
  onNote,
  onError,
}: {
  onNote: (value: string) => void;
  onError: (value: string) => void;
}) {
  const [users, setUsers] = useState<Awaited<ReturnType<typeof listPanelUsers>>>([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");

  async function load() {
    setUsers(await listPanelUsers());
  }
  useEffect(() => {
    void load().catch((reason) => onError(reason instanceof Error ? reason.message : "حساب‌ها خوانده نشد."));
  }, []);

  return (
    <section className="mt-5 grid gap-4">
      <div className="grid gap-3">
        <p className="text-sm font-semibold">ساخت حساب مدیر جدید</p>
        <input className={field} dir="ltr" placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input className={field} dir="ltr" type="password" placeholder="رمز، حداقل ۸ نویسه" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button
          type="button"
          className="tap min-h-12 rounded-full bg-primary text-sm font-semibold text-ink"
          onClick={async () => {
            onError("");
            try {
              await createPanelUser({ data: { username, password } });
              setUsername("");
              setPassword("");
              onNote("حساب ساخته شد.");
              await load();
            } catch (reason) {
              onError(reason instanceof Error ? reason.message : "ساخته نشد.");
            }
          }}
        >
          ساخت حساب
        </button>
      </div>
      <ul className="grid gap-2">
        {users.map((user) => (
          <li key={user.username} className="flex items-center justify-between rounded-xl border border-line px-3 py-2">
            <span dir="ltr">{user.username}{user.primary_admin ? " · اصلی" : ""}</span>
            {user.primary_admin ? null : (
              <button
                type="button"
                className="tap min-h-10 rounded-full border border-line px-3 text-xs"
                onClick={async () => {
                  await deletePanelUser({ data: user.username });
                  await load();
                }}
              >
                حذف
              </button>
            )}
          </li>
        ))}
      </ul>
      <div className="grid gap-3 border-t border-line pt-4">
        <p className="text-sm font-semibold">تغییر رمز همین حساب</p>
        <input className={field} dir="ltr" type="password" placeholder="رمز فعلی" value={current} onChange={(e) => setCurrent(e.target.value)} />
        <input className={field} dir="ltr" type="password" placeholder="رمز جدید" value={next} onChange={(e) => setNext(e.target.value)} />
        <button
          type="button"
          className="tap min-h-12 rounded-full border border-line text-sm"
          onClick={async () => {
            onError("");
            try {
              await changePanelPassword({ data: { current, next } });
              setCurrent("");
              setNext("");
              onNote("رمز عوض شد.");
            } catch (reason) {
              onError(reason instanceof Error ? reason.message : "رمز عوض نشد.");
            }
          }}
        >
          تغییر رمز
        </button>
      </div>
    </section>
  );
}
