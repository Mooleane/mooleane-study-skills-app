import SidebarNav from "../../components/SidebarNav";

export default function RubricEvidencePage() {
  return (
    <div className="min-h-screen w-full bg-white text-foreground">
      <div className="min-h-screen w-full bg-white">
        <div className="border-b border-zinc-300 bg-zinc-100 px-6 py-3 text-center">
          <div className="text-sm font-semibold tracking-wide text-zinc-700">
            Rubric Evidence
          </div>
        </div>

        <div className="flex min-h-[calc(100vh-49px)]">
          <SidebarNav />

          <main className="flex-1 overflow-y-auto px-10 py-10">
            <div className="mx-auto max-w-4xl text-sm leading-6 text-zinc-800">
              <h1 className="text-center text-2xl font-semibold text-zinc-900">
                Rubric Evidence
              </h1>

              <section className="mt-10 space-y-6">
                <div>
                  <div className="font-semibold text-zinc-900">
                    CCC.1.1 - Understand and identify a problem
                  </div>
                  <div className="mt-2">
                    Example: "CCC.1.1 is shown on the About Page, why MyTime Page,
                    and Key Features Page."
                  </div>
                </div>

                <div>
                  <div className="font-semibold text-zinc-900">
                    CCC.1.2 - Identify and plan a solution
                  </div>
                  <div className="mt-2">
                    Example: "CCC.1.2 is shown on the why MyTime Page and Key
                    Features Page."
                  </div>
                  <div className="mt-2">
                    Example: "CCC.1.2 is also shown in the Trello linked to the
                    why MyTime Page, which includes wireframes, tasks, a user
                    story, etc."
                  </div>
                </div>

                <div>
                  <div className="font-semibold text-zinc-900">
                    CCC.1.3 - Implement a solution
                  </div>
                  <div className="mt-2">
                    Example: "CCC.1.3 is shown on the Dashboard Page, Study
                    Planner, Breakdown wizard, Mood Tracker, and Guided Notes."
                  </div>
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
