import SidebarNav from "../../components/SidebarNav";
import Link from "next/link";

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
                    Example: "CCC.1.1 is shown on the{" "}
                    <Link
                      href="/about"
                      className="underline underline-offset-2"
                    >
                      About Page
                    </Link>
                    ,{" "}
                    <Link
                      href="/why-mytime"
                      className="underline underline-offset-2"
                    >
                      Why MyTime Page
                    </Link>
                    , and{" "}
                    <Link
                      href="/key-features"
                      className="underline underline-offset-2"
                    >
                      Key Features Page
                    </Link>
                    ."
                  </div>
                </div>

                <div>
                  <div className="font-semibold text-zinc-900">
                    CCC.1.2 - Identify and plan a solution
                  </div>
                  <div className="mt-2">
                    Example: "CCC.1.2 is shown on the{" "}
                    <Link
                      href="/why-mytime"
                      className="underline underline-offset-2"
                    >
                      Why MyTime Page
                    </Link>
                    {" "}and{" "}
                    <Link
                      href="/key-features"
                      className="underline underline-offset-2"
                    >
                      Key Features Page
                    </Link>
                    ."
                  </div>
                  <div className="mt-2">
                    Example: "CCC.1.2 is also shown in the Trello linked to the
                    {" "}
                    <Link
                      href="/why-mytime"
                      className="underline underline-offset-2"
                    >
                      Why MyTime Page
                    </Link>
                    , which includes wireframes, tasks, a user story, etc."
                  </div>
                </div>

                <div>
                  <div className="font-semibold text-zinc-900">
                    CCC.1.3 - Implement a solution
                  </div>
                  <div className="mt-2">
                    Example: "CCC.1.3 is shown on the{" "}
                    <Link
                      href="/dashboard"
                      className="underline underline-offset-2"
                    >
                      Dashboard Page
                    </Link>
                    ,{" "}
                    <Link
                      href="/dashboard?tab=study-planner"
                      className="underline underline-offset-2"
                    >
                      Study Planner
                    </Link>
                    ,{" "}
                    <Link
                      href="/dashboard?tab=breakdown-wizard"
                      className="underline underline-offset-2"
                    >
                      Breakdown Wizard
                    </Link>
                    ,{" "}
                    <Link
                      href="/dashboard?tab=mood-tracker"
                      className="underline underline-offset-2"
                    >
                      Mood Tracker
                    </Link>
                    , and{" "}
                    <Link
                      href="/dashboard?tab=guided-notes"
                      className="underline underline-offset-2"
                    >
                      Guided Notes
                    </Link>
                    ."
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
