export default function Home() {
  return (
    <div className="min-h-screen w-full bg-white text-foreground">
      <div className="min-h-screen w-full bg-white">
        {/* Page title strip (from wireframe) */}
        <div className="border-b border-zinc-300 bg-zinc-100 px-6 py-3 text-center">
          <div className="text-sm font-semibold tracking-wide text-zinc-700">Home</div>
        </div>

        {/* Main content area */}
        <div className="flex min-h-[calc(100vh-49px)]">
          <aside className="w-56 border-r border-zinc-300 bg-zinc-50 px-4 py-5">
            <div className="mb-4 text-sm font-semibold text-zinc-800">MyTime</div>
            <nav aria-label="Primary" className="flex flex-col gap-2">
              {[
                { label: "Home", href: "/" },
                { label: "About", href: "/about" },
                { label: "Why MyTime?", href: "/why-mytime" },
                { label: "Key Features", href: "#" },
                { label: "Dashboard", href: "#" },
                { label: "Built Evidence", href: "#" },
                { label: "Reflection", href: "#" },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="block rounded border border-zinc-400 bg-white px-3 py-2 text-sm text-zinc-800"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </aside>

          <main className="flex-1 px-10 py-12">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-4xl font-semibold tracking-tight text-zinc-900">
                MyTime
              </h1>
              <p className="mt-2 text-sm font-medium tracking-wide text-zinc-700">
                Use YOUR time, effectively.
              </p>

              <p className="mt-10 text-sm leading-6 text-zinc-700">
                A study app for those who struggle with focusing, procrastinate a
                lot, and can&apos;t seem to manage their time.
              </p>

              <p className="mt-8 text-sm leading-6 text-zinc-700">
                Who will benefit the most from MyTime?
                <br />
                High school &amp; college students with a busy schedule.
              </p>

              <div className="mt-10 flex items-center justify-center gap-4">
                <button
                  type="button"
                  className="rounded border border-zinc-500 bg-white px-5 py-2 text-sm font-medium text-zinc-900"
                >
                  Try it out
                </button>
                <button
                  type="button"
                  className="rounded border border-zinc-500 bg-white px-5 py-2 text-sm font-medium text-zinc-900"
                >
                  View Features
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
