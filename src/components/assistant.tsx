import { MessageCircle, X } from "lucide-react";
import { useMemo, useState } from "react";
import { phones, site } from "@/lib/content";

const chips = ["ارت و صاعقه", "دوربین", "فیبر و دکل", "تماس و بازدید", "مقالات"];

function answer(text: string) {
  const q = text.trim();
  if (!q) return "بنویسید دنبال چه کاری هستید: دکل، فیبر، دوربین، ارت، برق اضطراری یا بازدید.";
  if (/سلام|درود|وقت/.test(q)) return "سلام. من راهنمای سایت هستم، نه اپراتور زنده. بگویید موضوع کار چیست تا مسیر درست را نشان بدهم.";
  if (/ارت|صاعق|زمین/.test(q))
    return "ارت و صاعقه‌گیر جزو کار اجرایی مجموعه است: چاه ارت، هم‌بندی و میله حفاظت. برای جزئیات عملی، مقاله «ارت استاندارد» و «صاعقه‌گیر» را بخوانید و برای بازدید، شماره تماس را بگیرید.";
  if (/دوربین|تصویر|cctv|نظار/.test(q))
    return "نصب دوربین IP و AHD، ضبط، انتقال تصویر و کنترل تردد انجام می‌شود. بعد از تحویل، رمز و آموزش کاربر جزو کار است. از صفحه خدمات، کارت نظارت تصویری را ببینید.";
  if (/فیبر|دکل|رادیو|لینک|مخابر/.test(q))
    return "فیبر (مفصل، فیوژن، OTDR) و دکل خودایستا یا مهاری با تجهیزات رادیویی در فهرست کار است. شهر و نوع سایت را در فرم تماس بنویسید تا بازدید معنا داشته باشد.";
  if (/برق|ups|باتری|ژنراتور|موتور/.test(q))
    return "برق سایت شامل تابلو، UPS، رکتیفایر و در صورت نیاز موتوربرق است. مقاله «برق اضطراری برای سایت رادیویی» فرق این‌ها را کوتاه گفته است.";
  if (/مقاله|دانلود|آموزش/.test(q))
    return "شش راهنمای ایمنی و فناوری در بخش مقالات هست و می‌توانید متن را دانلود کنید. متن‌ها آموزشی خود مجموعه است، نه بازنشر مجله‌های دیگر.";
  if (/قیمت|هزینه|تعرفه/.test(q))
    return "قیمت بدون دیدن مسیر، ارتفاع دکل یا تعداد دوربین قابل اعلام نیست. درخواست بازدید بدهید تا دامنه کار مشخص شود.";
  if (/تماس|بازدید|آدرس|شماره|واتس|پشتیبان/.test(q))
    return `پایگاه: ${site.address}. تلفن ${phones[0].display} و ${phones[1].display}. اگر بخواهید با همکار صحبت کنید، دکمه واتساپ پایین همین پنجره را بزنید.`;
  return "این را دقیق در فهرست آماده ندارم. موضوع را کوتاه‌تر بنویسید (مثلاً «دکل مهاری» یا «بازیابی هارد») یا مستقیم زنگ بزنید تا پشتیبان انسانی جواب بدهد.";
}

export function Assistant({ whatsapp }: { whatsapp: string }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [log, setLog] = useState<{ from: "user" | "bot"; text: string }[]>([
    {
      from: "bot",
      text: "راهنمای سایت اینجاست. سوال فنی کوتاه بپرسید، یا برای صحبت با همکار به واتساپ بروید.",
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
              <p className="text-sm font-semibold">راهنمای سایت</p>
              <p className="text-xs text-muted">پاسخ از روی کاتالوگ، نه اپراتور زنده</p>
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
