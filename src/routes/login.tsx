import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { GROK_PROVIDERS, authClient, signIn } from "@/lib/auth/client";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "ورود مدیر | ارتباطات گستر ایمن حور" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      const result =
        mode === "up"
          ? await authClient.signUp.email({ name, email, password, callbackURL: "/admin" })
          : await authClient.signIn.email({ email, password, callbackURL: "/admin" });
      if (result.error) {
        setError(result.error.message || "ورود انجام نشد. ایمیل و رمز را دوباره چک کنید.");
        return;
      }
      await navigate({ to: "/admin" });
    } catch {
      setError("ارتباط با ورود برقرار نشد. یک بار دیگر تلاش کنید.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-8">
      <p className="font-mono text-xs text-primary" dir="ltr">
        ADMIN
      </p>
      <h1 className="mt-2 text-2xl font-extrabold">ورود به پنل</h1>
      <p className="mt-2 text-sm text-muted">
        اولین حسابی که ساخته شود مدیر سایت است. بعد از آن فقط همان حساب می‌تواند عکس، تیم، مقاله و خبر را عوض
        کند. این صفحه برای گوشی درست شده است.
      </p>
      <form className="mt-6 grid gap-3" onSubmit={submit}>
        {mode === "up" ? (
          <input
            className="min-h-12 rounded-xl border border-line bg-surface px-3 text-base"
            placeholder="نام"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        ) : null}
        <input
          className="min-h-12 rounded-xl border border-line bg-surface px-3 text-base"
          type="email"
          inputMode="email"
          autoComplete="username"
          placeholder="ایمیل"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <input
          className="min-h-12 rounded-xl border border-line bg-surface px-3 text-base"
          type="password"
          autoComplete={mode === "up" ? "new-password" : "current-password"}
          placeholder="رمز، حداقل ۸ نویسه"
          minLength={8}
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
          {pending ? "صبر کنید…" : mode === "up" ? "ساخت حساب مدیر" : "ورود"}
        </button>
      </form>
      <button
        type="button"
        className="tap mt-3 min-h-11 text-sm text-muted"
        onClick={() => setMode(mode === "up" ? "in" : "up")}
      >
        {mode === "up" ? "حساب دارم؛ ورود" : "حساب ندارم؛ اولین مدیر را می‌سازم"}
      </button>
      <div className="mt-6 grid gap-2">
        {GROK_PROVIDERS.map((provider) => (
          <button
            key={provider.providerId}
            type="button"
            className="tap min-h-12 rounded-full border border-line text-sm"
            onClick={() => signIn(provider.providerId, { callbackURL: "/admin" })}
          >
            ادامه با {provider.label}
          </button>
        ))}
      </div>
    </main>
  );
}
