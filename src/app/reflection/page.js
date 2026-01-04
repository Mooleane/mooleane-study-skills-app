import SidebarNav from "../../components/SidebarNav";
import Link from "next/link";

export default function ReflectionPage() {
  return (
    <div className="min-h-screen w-full bg-white text-foreground">
      <div className="min-h-screen w-full bg-white">
        <div className="border-b border-zinc-300 bg-zinc-100 px-6 py-3 text-center">
          <div className="text-sm font-semibold tracking-wide text-zinc-700">
            Reflection
          </div>
        </div>

        <div className="flex min-h-[calc(100vh-49px)]">
          <SidebarNav />

          <main className="flex-1 overflow-y-auto px-10 py-10">
            <div className="mx-auto max-w-4xl text-sm leading-6 text-zinc-800">
              <h1 className="text-center text-2xl font-semibold text-zinc-900">
                Reflection
              </h1>

              <section className="mt-10">
                <h2 className="font-semibold text-zinc-900">What went well?</h2>
                <p className="mt-2">
                  Creating the wireframes and implementing them into the Next JS
                  project went well, and I was able to create
                  features that built off each other decently.
                </p>
              </section>

              <section className="mt-8">
                <h2 className="font-semibold text-zinc-900">What didn&apos;t go well?</h2>
                <p className="mt-2">
                  Implementing the features into Next JS was a challenge because
                  they all had to connect to each other, and that approach meant
                  a lot of saving between all the different tabs for the AI to
                  output info from other tabs to the sections that relied on it
                  (e.g.{" "}
                  <Link href="/dashboard" className="underline underline-offset-2">
                    Dashboard
                  </Link>
                  ,{" "}
                  <Link
                    href="/dashboard?tab=guided-notes"
                    className="underline underline-offset-2"
                  >
                    Guided Notes
                  </Link>
                  ). Satisfying the user story fully also
                  didn't go well because some features such as the calendar would
                  be too complex to satisfy for the user story considering the UI buttons.
                  One benefit from a change during the project was adding a Regenerate Suggestions button.
                  It saves a lot more AI tokens because there would be no other way to regenerate suggestions
                  other than automatically, which would cost a lot for the API key.
                </p>
              </section>

              <section className="mt-8">
                <h2 className="font-semibold text-zinc-900">
                  What I changed during the project and why?
                </h2>
                <p className="mt-2">
                  Something I changed during the project was how to approach the
                  features. I originally intended the features to be separate
                  pages but I realized it would be a lot of pages to navigate
                  between, so I put them all in a single{" "}
                  <Link href="/dashboard" className="underline underline-offset-2">
                    Dashboard
                  </Link>
                  {" "}page so
                  it&apos;s a lot more compact. I also decided to remove the
                  ability for all steps to be assigned to the planner for the suggested steps
                  section located in the{" "}
                  <Link
                    href="/dashboard?tab=breakdown-wizard"
                    className="underline underline-offset-2"
                  >
                    Breakdown Wizard
                  </Link>
                  .
                </p>
              </section>

              <section className="mt-8">
                <h2 className="font-semibold text-zinc-900">
                  What I would build if I had more time?
                </h2>
                <p className="mt-2">
                  I would make the app have many more calm features such as the
                  ability to listen to favorite songs or a page which is focused
                  on meditation.
                </p>
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
