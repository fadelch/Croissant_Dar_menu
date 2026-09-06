import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Container } from "@/components/ui/container";

const highlights = [
  {
    title: "يُخبز كل يوم",
    description: "تحضير يومي بعناية، لأن المخبوزات الأطيب تبدأ طازجة.",
  },
  {
    title: "دفء الدار",
    description: "نكهات بسيطة ومريحة تجمع جودة المكونات مع روح الضيافة.",
  },
  {
    title: "لحظات ألذ",
    description: "من أول قهوة في الصباح إلى استراحة حلوة في آخر النهار.",
  },
] as const;

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col overflow-hidden bg-cream-50">
      <SiteHeader />

      <main className="flex-1">
        <section className="relative isolate min-h-[calc(100dvh-5rem)] overflow-hidden border-b border-brown-900/10">
          <div
            aria-hidden="true"
            className="absolute -start-28 top-12 -z-10 size-72 rounded-full bg-caramel-400/20 blur-3xl sm:size-96"
          />
          <div
            aria-hidden="true"
            className="absolute -end-24 bottom-0 -z-10 size-80 rounded-full bg-cream-100 blur-3xl sm:size-[30rem]"
          />

          <Container className="grid min-h-[calc(100dvh-5rem)] items-center gap-12 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
            <div className="max-w-3xl">
              <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-caramel-400/40 bg-white/60 px-4 py-2 text-sm font-bold text-brown-700 backdrop-blur">
                <span className="size-2 rounded-full bg-caramel-500" />
                تجربة جديدة تُخبز على مهل
              </p>

              <h1 className="text-5xl font-black leading-[1.15] tracking-tight text-brown-900 sm:text-6xl lg:text-7xl">
                كروسان الدار
                <span className="mt-3 block font-serif text-2xl font-medium tracking-[0.16em] text-caramel-500 sm:text-3xl" dir="ltr">
                  CROISSANT DAR
                </span>
              </h1>

              <p className="mt-8 max-w-2xl text-lg leading-9 text-brown-700 sm:text-xl">
                نُحضّر مساحة دافئة تجمع رائحة الكروسان الطازج، مذاقاً صادقاً،
                وتفاصيل تشبه راحة البيت.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <span className="rounded-full bg-brown-900 px-6 py-3 text-sm font-bold text-cream-50 shadow-lg shadow-brown-900/15">
                  الافتتاح قريباً
                </span>
                <span className="text-sm font-semibold text-brown-700">
                  الصفحة الكاملة قيد التحضير
                </span>
              </div>
            </div>

            <div className="relative mx-auto aspect-square w-full max-w-md" aria-hidden="true">
              <div className="absolute inset-0 rotate-6 rounded-[38%_62%_45%_55%/58%_42%_58%_42%] bg-caramel-400/25" />
              <div className="absolute inset-8 -rotate-3 rounded-[55%_45%_62%_38%/42%_55%_45%_58%] border border-brown-700/15 bg-cream-100 shadow-2xl shadow-brown-900/10" />
              <div className="absolute inset-0 grid place-items-center">
                <span className="text-[8rem] drop-shadow-xl sm:text-[10rem]">🥐</span>
              </div>
            </div>
          </Container>
        </section>

        <section className="bg-white/45 py-16 sm:py-20" aria-labelledby="foundation-heading">
          <Container>
            <div className="max-w-2xl">
              <p className="text-sm font-black tracking-wider text-caramel-500">روح كروسان الدار</p>
              <h2 id="foundation-heading" className="mt-3 text-3xl font-black text-brown-900 sm:text-4xl">
                أساس بسيط لتجربة دافئة
              </h2>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {highlights.map((highlight, index) => (
                <article
                  key={highlight.title}
                  className="rounded-3xl border border-brown-900/10 bg-cream-50 p-6 shadow-sm sm:p-7"
                >
                  <span className="grid size-10 place-items-center rounded-full bg-caramel-400/15 text-sm font-black text-caramel-500">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-6 text-xl font-black text-brown-900">{highlight.title}</h3>
                  <p className="mt-3 leading-8 text-brown-700">{highlight.description}</p>
                </article>
              ))}
            </div>
          </Container>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
