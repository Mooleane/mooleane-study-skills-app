export default function WhyMyTimePage() {
  return (
    <div className="min-h-screen w-full bg-white text-foreground">
      <div className="min-h-screen w-full bg-white">
        <div className="border-b border-zinc-300 bg-zinc-100 px-6 py-3 text-center">
          <div className="text-sm font-semibold tracking-wide text-zinc-700">
            Why MyTime?
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

          <main className="flex-1 overflow-y-auto px-10 py-10">
            <div className="mx-auto max-w-3xl text-sm leading-6 text-zinc-800">
              <h1 className="text-center text-2xl font-semibold text-zinc-900">
                Why MyTime?
              </h1>

              <section className="mt-8">
                <h2 className="font-semibold text-zinc-900">The Solution</h2>
                <p className="mt-2">
                  MyTime combines time management, planning, and self care into an
                  all-in-one toolkit.
                </p>
              </section>

              <section className="mt-6">
                <h2 className="font-semibold text-zinc-900">Features</h2>
                <ul className="mt-2 list-disc pl-5">
                  <li>Blocking out time for different needs</li>
                  <li>Simplifying overall work into a step-by-step structure</li>
                  <li>
                    Creating a space to reflect on mood and changes over time
                  </li>
                </ul>
              </section>

              <section className="mt-6">
                <h2 className="font-semibold text-zinc-900">
                  Expected Future Challenges/Constraints
                </h2>
                <ul className="mt-2 list-disc pl-5">
                  <li>
                    Turning the UI accessible and easy to navigate for everyone
                    (test constraint due to limited testers)
                  </li>
                  <li>
                    Creating features that build off each other (time constraint
                    due to taking long to develop)
                  </li>
                  <li>
                    Making the app like a partner rather than a manager
                    (time/test constraint due to balance the app&apos;s theme to make
                    a calm experience)
                  </li>
                </ul>
              </section>

              <section className="mt-6">
                <h2 className="font-semibold text-zinc-900">
                  How the Challenges will be handled/planned for
                </h2>
                <ul className="mt-2 list-disc pl-5">
                  <li>
                    A dashboard will be used to access key features, little
                    navigating
                  </li>
                  <li>
                    The features will all revolve around scheduling and
                    suggestions
                  </li>
                  <li>Features will be flexible and not too strict/demanding</li>
                </ul>
              </section>

              <section className="mt-6">
                <h2 className="font-semibold text-zinc-900">The Project Plan</h2>
                <p className="mt-2">
                  <a href="#" className="underline">
                    Trello Link
                  </a>
                </p>
              </section>

              <hr className="my-10 border-zinc-300" />

              <section>
                <h2 className="font-semibold text-zinc-900">
                  The Plausible Solutions (why and why not)
                </h2>

                <div className="mt-4">
                  <h3 className="font-semibold text-zinc-900">
                    Plausible Solution 1 - Focus Timer
                  </h3>
                  <ul className="mt-2 list-disc pl-5">
                    <li>
                      + Good for different work/break cycles (keeps you engaged)
                    </li>
                    <li>
                      - Not enough study features to streamline the work process
                      (work confusion)
                    </li>
                  </ul>
                </div>

                <div className="mt-6">
                  <h3 className="font-semibold text-zinc-900">
                    Plausible Solution 2 - Chatbot Study Assistant
                  </h3>
                  <ul className="mt-2 list-disc pl-5">
                    <li>
                      + Easy to answer questions about work (solves questions
                      fast)
                    </li>
                    <li>
                      - Little guidance to improve routines (might get lost on
                      where to start)
                    </li>
                    <li>
                      - Too much like a cheat-sheet (doesn&apos;t improve your skills)
                    </li>
                  </ul>
                </div>

                <div className="mt-6">
                  <h3 className="font-semibold text-zinc-900">
                    Plausible Solution 3 - MyTime (all-in-one dashboard)
                  </h3>
                  <ul className="mt-2 list-disc pl-5">
                    <li>
                      + Easy to access study and mood features (focus on many
                      areas of life)
                    </li>
                    <li>
                      + Suggestions to improve routines (helps to balance work
                      life)
                    </li>
                    <li>
                      + Shows actionable steps, but doesn&apos;t complete then (allows
                      for learning)
                    </li>
                    <li>
                      - Feature overload (might get lost in the app trying to
                      focus on many features)
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
