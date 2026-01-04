export default function AboutPage() {
  return (
    <div className="min-h-screen w-full bg-white text-foreground">
      <div className="min-h-screen w-full bg-white">
        <div className="border-b border-zinc-300 bg-zinc-100 px-6 py-3 text-center">
          <div className="text-sm font-semibold tracking-wide text-zinc-700">
            About
          </div>
        </div>

        <div className="flex min-h-[calc(100vh-49px)]">
          <aside className="w-56 border-r border-zinc-300 bg-zinc-50 px-4 py-5">
            <div className="mb-4 text-sm font-semibold text-zinc-800">MyTime</div>
            <nav aria-label="Primary" className="flex flex-col gap-2">
              {[
                { label: "Home", href: "/" },
                { label: "About", href: "/about" },
                { label: "Why MyTime?", href: "/why-mytime" },
                { label: "Key Features", href: "/key-features" },
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

          <main className="flex-1 overflow-y-auto px-10 py-10">
            <div className="mx-auto max-w-3xl text-sm leading-6 text-zinc-800">
              <h1 className="text-center text-2xl font-semibold text-zinc-900">
                About
              </h1>

              <section className="mt-8">
                <h2 className="font-semibold text-zinc-900">The Problem</h2>
                <p className="mt-2">
                  Many students/workers find themselves struggling to manage their
                  time, keep up with deadlines, and stay focused.
                </p>
              </section>

              <section className="mt-6">
                <h2 className="font-semibold text-zinc-900">
                  How It Shows Up In Real Life
                </h2>
                <ul className="mt-2 list-disc pl-5">
                  <li>Starting assignments late right before its due</li>
                  <li>Forgetting to work on deliverables</li>
                  <li>Getting overwhelmed by work</li>
                </ul>
              </section>

              <section className="mt-6">
                <h2 className="font-semibold text-zinc-900">
                  Why It&apos;s Hard to Solve
                </h2>
                <ul className="mt-2 list-disc pl-5">
                  <li>
                    Too many distractions (might get off-track from work)
                  </li>
                  <li>
                    The work feels boring (may feel unmotivated to continue
                    working)
                  </li>
                  <li>
                    Not enough time to focus on yourself (could get burnt out
                    from overworking)
                  </li>
                </ul>
              </section>

              <section className="mt-6">
                <h2 className="font-semibold text-zinc-900">
                  Problems It Isn&apos;t Solved
                </h2>
                <ul className="mt-2 list-disc pl-5">
                  <li>Bad Grades/Performance</li>
                  <li>Constant Burnout</li>
                  <li>Increased Stress</li>
                </ul>
              </section>

              <section className="mt-6">
                <h2 className="font-semibold text-zinc-900">Personal Example</h2>
                <p className="mt-2">
                  Whenever I start an assignment, it may feel like a lot of time.
                  At that point I do something else and push the assignment to a
                  later date. It happens so often that I end up wasting days
                  that could have been spent on the work.
                </p>
              </section>

              <hr className="my-10 border-zinc-300" />

              <section className="mt-10">
                <h2 className="font-semibold text-zinc-900">
                  Existing Solutions (their pros/cons)
                </h2>

                <div className="mt-4">
                  <h3 className="font-semibold text-zinc-900">
                    Existing Solution 1 - Google Calendar
                  </h3>
                  <ul className="mt-2 list-disc pl-5">
                    <li>
                      + Good for scheduling time for different needs (allows a
                      study schedule)
                    </li>
                    <li>
                      - Can&apos;t help with where to block time (hard knowing
                      exactly how to plan goals)
                    </li>
                    <li>
                      - Less focus on flexibility/breaks (users may be
                      overwhelmed with this tool)
                    </li>
                  </ul>
                </div>

                <div className="mt-6">
                  <h3 className="font-semibold text-zinc-900">
                    Existing Solution 2 - Daylio
                  </h3>
                  <ul className="mt-2 list-disc pl-5">
                    <li>
                      + Low-effort required to log moods (promotes quick self
                      reflections)
                    </li>
                    <li>
                      - Focuses only on mood and habits (no guidance on studying
                      and doing tasks)
                    </li>
                    <li>
                      - Limited guidance based on trends (hard to suggest tips
                      based on moods)
                    </li>
                  </ul>
                </div>

                <div className="mt-6">
                  <h3 className="font-semibold text-zinc-900">
                    Existing Solution 3 - Microsoft To Do
                  </h3>
                  <ul className="mt-2 list-disc pl-5">
                    <li>
                      + Simple interface (a quick onboarding experience and
                      easier use)
                    </li>
                    <li>
                      - Limited planning features (may struggle with adding tasks
                      to overcome goals)
                    </li>
                  </ul>
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
