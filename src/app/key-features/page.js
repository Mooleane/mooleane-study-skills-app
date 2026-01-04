import SidebarNav from "../../components/SidebarNav";

export default function KeyFeaturesPage() {
  return (
    <div className="min-h-screen w-full bg-white text-foreground">
      <div className="min-h-screen w-full bg-white">
        <div className="border-b border-zinc-300 bg-zinc-100 px-6 py-3 text-center">
          <div className="text-sm font-semibold tracking-wide text-zinc-700">
            Key Features
          </div>
        </div>

        <div className="flex min-h-[calc(100vh-49px)]">
          <SidebarNav />

          <main className="flex-1 overflow-y-auto px-10 py-10">
            <div className="mx-auto max-w-3xl text-sm leading-6 text-zinc-800">
              <h1 className="text-center text-2xl font-semibold text-zinc-900">
                Key Features
              </h1>

              <section className="mt-8">
                <h2 className="font-semibold text-zinc-900">Feature Breakdown</h2>

                <div className="mt-4 space-y-4">
                  <p>
                    <span className="font-semibold">[Study Planner]</span> - Lets
                    users block out different tasks on a calendar and start
                    sessions for each one.
                  </p>
                  <p>
                    <span className="font-semibold">[Breakdown wizard]</span> -
                    Simplifies large tasks into digestible steps for easier
                    understanding.
                  </p>
                  <p>
                    <span className="font-semibold">[Mood Tracker]</span> - Tasks
                    can be marked with a mood (great, neutral, etc.) which is
                    visually shown over time.
                  </p>
                  <p>
                    <span className="font-semibold">[Guided Notes]</span> - Based
                    on recent activity, notes are generated for resources,
                    suggested steps, etc.
                  </p>
                </div>
              </section>

              <section className="mt-8">
                <h2 className="font-semibold text-zinc-900">
                  Why this solution over others?
                </h2>
                <p className="mt-2">
                  Not only does it help structure tasks, it keeps you in-check so
                  you don&apos;t get burnt out, overwhelmed by too much work.
                </p>
              </section>

              <section className="mt-6">
                <h2 className="font-semibold text-zinc-900">How does AI help?</h2>
                <p className="mt-2">
                  It allows this tool to recommend relevant suggestions to the
                  user based on their activity, reducing the chances they get
                  lost on work or struggle.
                </p>
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
