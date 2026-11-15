import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { panelLogin } from "@/lib/panel.functions";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "ورود مدیر | ارتباطات گستر ایمن حور" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      await panelLogin({ data: { username, password } });
      await navigate({ to: "/admin" });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "ورود انجام نشد.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-8">
      <h1 className="text-2xl font-extrabold">ورود به پنل</h1>
      <p className="mt-2 text-sm text-muted">
        برای ورود، نام کاربری و رمز عبور خود را وارد کنید.
      </p>
      <form className="mt-6 grid gap-3" onSubmit={submit}>
        <input
          className="min-h-12 rounded-xl border border-line bg-surface px-3 text-base"
          autoComplete="username"
          placeholder="نام کاربری"
          dir="ltr"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          required
        />
        <input
          className="min-h-12 rounded-xl border border-line bg-surface px-3 text-base"
          type="password"
          autoComplete="current-password"
          placeholder="رمز عبور"
          dir="ltr"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        {error ? <p className="text-sm text-primary">{error}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="tap min-h-12 rounded-full bg-primary text-sm font-semibold text-ink disabled:opacity-60"
        >
          {pending ? "صبر کنید…" : "ورود"}
        </button>
      </form>
    </main>
  );
}
