import { MessageCircle, X } from "lucide-react";
import { useMemo, useState } from "react";
import { phones, site } from "@/lib/content";

const chips = ["ارت و صاعقه", "دوربین", "فیبر و دکل", "تماس و بازدید", "مقالات"];

function answer(text: string) {
  const q = text.trim();
  if (!q) return "موضوع کار را بنویسید: دکل، فیبر، دوربین، ارت، برق اضطراری یا درخواست بازدید.";
  if (/سلام|درود|وقت/.test(q)) return "سلام. موضوع کار را بگویید تا مسیر مناسب را راهنمایی کنیم.";
  if (/ارت|صاعق|زمین/.test(q))
    return "ارت و صاعقه‌گیر جزو خدمات اجرایی است: چاه ارت، هم‌بندی و میله حفاظت. برای جزئیات فنی، مقالات مربوطه را در بخش مقالات ببینید و برای بازدید تماس بگیرید.";
  if (/دوربین|تصویر|cctv|نظار/.test(q))
    return "نصب دوربین IP و AHD، ضبط، انتقال تصویر و کنترل تردد انجام می‌شود. پس از تحویل، تنظیمات و آموزش کاربر نیز ارائه می‌شود.";
  if (/فیبر|دکل|رادیو|لینک|مخابر/.test(q))
    return "فیبر (مفصل، فیوژن، OTDR) و دکل خودایستا یا مهاری با تجهیزات رادیویی در فهرست خدمات است. شهر و نوع سایت را اعلام کنید تا بازدید برنامه‌ریزی شود.";
  if (/برق|ups|باتری|ژنراتور|موتور/.test(q))
    return "برق سایت شامل تابلو، UPS، رکتیفایر و در صورت نیاز موتوربرق است. جزئیات بیشتر در مقالات فنی آمده است.";
  if (/مقاله|دانلود|آموزش/.test(q))
    return "در بخش مقالات، راهنماهای ایمنی و فناوری مجموعه در دسترس است و می‌توانید آن‌ها را مطالعه یا دریافت کنید.";
  if (/قیمت|هزینه|تعرفه/.test(q))
    return "قیمت پس از بررسی مسیر، ارتفاع دکل یا تعداد دوربین اعلام می‌شود. برای برآورد دقیق درخواست بازدید بدهید.";
  if (/تماس|بازدید|آدرس|شماره|واتس|پشتیبان/.test(q))
    return `آدرس: ${site.address}. تلفن ${phones[0].display} و ${phones[1].display}. برای ارتباط سریع‌تر می‌توانید از واتساپ استفاده کنید.`;
  return "موضوع را کوتاه‌تر بنویسید (مثلاً «دکل مهاری» یا «بازیابی هارد») یا مستقیم تماس بگیرید.";
}

export function Assistant({ whatsapp }: { whatsapp: string }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [log, setLog] = useState<{ from: "user" | "bot"; text: string }[]>([
    {
      from: "bot",
      text: "سلام. سوال فنی خود را بنویسید یا برای هماهنگی مستقیم از واتساپ استفاده کنید.",
    },
  ]);
  const wa = useMemo(() => {
    const digits = (whatsapp || "989109595559").replace(/\D/g, "");
    return `https://wa.me/${digits}`;
  }, [whatsapp]);

  function ask(value: string) {
    const clean = value.trim();
    if (!clean) return;
    setLog((prev) => [...prev, { from: "user", text: clean }, { from: "bot", text: answer(clean) }]);
    setText("");
  }

  return (
    <div className="fixed bottom-4 left-4 z-40">
      {open ? (
        <section className="mb-3 flex h-[min(70vh,520px)] w-[min(92vw,360px)] flex-col overflow-hidden rounded-card border border-line bg-raised shadow-2xl">
          <header className="flex items-center justify-between gap-2 border-b border-line px-3 py-2">
            <div>
              <p className="text-sm font-semibold">پشتیبانی سریع</p>
              <p className="text-xs text-muted">پاسخ‌های آماده درباره خدمات و تماس</p>
            </div>
            <button type="button" className="tap inline-flex size-10 items-center justify-center" onClick={() => setOpen(false)}>
              <X className="size-5" />
              <span className="sr-only">بستن</span>
            </button>
          </header>
          <div className="flex-1 space-y-2 overflow-y-auto px-3 py-3">
            {log.map((item, index) => (
              <p
                key={index}
                className={
                  "max-w-[90%] rounded-2xl px-3 py-2 text-sm " +
                  (item.from === "user" ? "mr-auto bg-primary text-ink" : "bg-surface text-fg")
                }
              >
                {item.text}
              </p>
            ))}
          </div>
          <div className="flex gap-1 overflow-x-auto px-3 pb-2">
            {chips.map((chip) => (
              <button
                key={chip}
                type="button"
                className="tap shrink-0 rounded-full border border-line px-3 py-1 text-xs"
                onClick={() => ask(chip)}
              >
                {chip}
              </button>
            ))}
          </div>
          <form
            className="flex gap-2 border-t border-line p-2"
            onSubmit={(event) => {
              event.preventDefault();
              ask(text);
            }}
          >
            <input
              value={text}
              onChange={(event) => setText(event.target.value)}
              className="min-h-11 flex-1 rounded-full border border-line bg-bg px-3 text-base"
              placeholder="سوال کوتاه…"
            />
            <button type="submit" className="tap min-h-11 rounded-full bg-primary px-3 text-sm font-semibold text-ink">
              بفرست
            </button>
          </form>
          <a href={wa} className="block border-t border-line px-3 py-2 text-center text-sm text-primary" target="_blank" rel="noreferrer">
            ادامه با پشتیبان در واتساپ
          </a>
        </section>
      ) : null}
      <button
        type="button"
        className="tap inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-ink shadow-lg"
        onClick={() => setOpen((value) => !value)}
      >
        <MessageCircle className="size-5" />
        راهنما
      </button>
    </div>
  );
}
