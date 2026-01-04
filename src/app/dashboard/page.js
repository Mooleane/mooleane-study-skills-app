"use client";

import React from "react";
import SidebarNav from "../../components/SidebarNav";

function TabButton({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "rounded border border-zinc-400 px-3 py-2 text-xs font-medium " +
        (active
          ? "bg-zinc-100 text-zinc-900"
          : "bg-white text-zinc-800")
      }
      aria-pressed={active}
    >
      {label}
    </button>
  );
}

function StudyPlannerTab() {
  const sessions = [
    {
      time: "8:00-9:00",
      type: "Self",
      title: "Personal Time",
      status: "Ended",
      mood: "Neutral",
    },
    {
      time: "9:00-10:00",
      type: "Study",
      title: "Math Review",
      status: "START",
    },
    {
      time: "10:00-11:00",
      type: "Study",
      title: "Work on Essay",
      status: "WAIT",
    },
    {
      time: "11:00-12:00",
      type: "Study",
      title: "Math Review",
      status: "WAIT",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        {sessions.map((s) => (
          <div
            key={`${s.time}-${s.title}`}
            className="flex items-center justify-between gap-3 rounded border border-zinc-300 bg-white px-3 py-2 text-sm"
          >
            <button
              type="button"
              aria-label="Remove"
              className="grid h-6 w-6 flex-none place-items-center rounded-full border border-zinc-400 bg-white text-zinc-700"
            >
              ×
            </button>

            <div className="min-w-0 flex-1 text-zinc-800">
              [{s.time} {s.type}] {s.title} - [{s.status}]
              {s.mood ? ` (${s.mood})` : ""}
            </div>

            <button
              type="button"
              className="flex-none text-xs font-medium underline text-zinc-800"
            >
              [View Desc]
            </button>
          </div>
        ))}
      </div>

      <div className="rounded border border-zinc-300 bg-white p-4">
        <div className="mb-3 text-sm font-semibold text-zinc-900">New Task</div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="h-9 rounded border border-zinc-300 bg-white px-2 text-sm text-zinc-800"
            defaultValue=""
            aria-label="Category"
          >
            <option value="" disabled>
              Category
            </option>
            <option>Study</option>
            <option>Self</option>
            <option>Work</option>
          </select>
          <input
            className="h-9 w-44 rounded border border-zinc-300 bg-white px-2 text-sm text-zinc-800"
            placeholder="Task Label"
            aria-label="Task Label"
          />
          <input
            className="h-9 w-56 rounded border border-zinc-300 bg-white px-2 text-sm text-zinc-800"
            placeholder="Task Description"
            aria-label="Task Description"
          />
          <input
            className="h-9 w-36 rounded border border-zinc-300 bg-white px-2 text-sm text-zinc-800"
            placeholder="Task Date"
            aria-label="Task Date"
          />
          <button
            type="button"
            className="h-9 rounded border border-zinc-400 bg-white px-4 text-sm font-medium text-zinc-900"
          >
            Create
          </button>
        </div>
      </div>

      <div className="rounded border border-zinc-300 bg-white p-4">
        <div className="text-sm font-semibold text-zinc-900">Work Balance</div>
        <div className="mt-4 flex items-end gap-10">
          <div className="flex flex-col items-center gap-2">
            <div className="text-xs text-zinc-700">75</div>
            <div className="h-44 w-12 rounded border border-zinc-300 bg-zinc-50 p-1">
              <div className="h-[75%] w-full rounded bg-zinc-200" />
            </div>
            <div className="text-xs font-medium text-zinc-800">Study</div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="text-xs text-zinc-700">25</div>
            <div className="h-44 w-12 rounded border border-zinc-300 bg-zinc-50 p-1">
              <div className="h-[25%] w-full rounded bg-zinc-200" />
            </div>
            <div className="text-xs font-medium text-zinc-800">Self</div>
          </div>
        </div>

        <button
          type="button"
          className="mt-4 text-sm font-medium text-zinc-800"
        >
          + Add New Category
        </button>
      </div>
    </div>
  );
}

function BreakdownWizardTab() {
  const steps = [
    "Research context (30m)",
    "Outline key points (20m)",
    "Draft introduction (45m)",
    "First revision (30m)",
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <input
          className="h-9 w-40 rounded border border-zinc-300 bg-white px-2 text-sm text-zinc-800"
          placeholder="Task Date"
          aria-label="Task Date"
        />
        <select
          className="h-9 w-48 rounded border border-zinc-300 bg-white px-2 text-sm text-zinc-800"
          defaultValue=""
          aria-label="Priority"
        >
          <option value="" disabled>
            Priority
          </option>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
      </div>

      <div className="rounded border border-zinc-300 bg-white p-8">
        <div className="grid min-h-32 place-items-center rounded border border-zinc-300 bg-zinc-50 px-4 py-10 text-sm font-medium text-zinc-700">
          Import .txt/.pdf file
        </div>
      </div>

      <hr className="border-zinc-300" />

      <div>
        <div className="text-sm font-semibold text-zinc-900">Suggested Steps</div>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-zinc-800">
          {steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded border border-zinc-400 bg-white px-4 py-2 text-xs font-medium text-zinc-800"
          >
            Edit Step
          </button>
          <button
            type="button"
            className="rounded border border-zinc-400 bg-white px-4 py-2 text-xs font-medium text-zinc-800"
          >
            Delete Step
          </button>
          <button
            type="button"
            className="rounded border border-zinc-400 bg-white px-4 py-2 text-xs font-medium text-zinc-800"
          >
            Assign to Planner
          </button>
          <button
            type="button"
            className="rounded border border-zinc-400 bg-white px-4 py-2 text-xs font-medium text-zinc-800"
          >
            Assign All to Planner
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const tabs = [
    "Study Planner",
    "Breakdown wizard",
    "Mood Tracker",
    "Guided Notes",
  ];
  const [activeTab, setActiveTab] = React.useState("Study Planner");

  return (
    <div className="min-h-screen w-full bg-white text-foreground">
      <div className="min-h-screen w-full bg-white">
        <div className="border-b border-zinc-300 bg-zinc-100 px-6 py-3 text-center">
          <div className="text-sm font-semibold tracking-wide text-zinc-700">
            Dashboard
          </div>
        </div>

        <div className="flex min-h-[calc(100vh-49px)]">
          <SidebarNav />

          <main className="flex-1 overflow-y-auto px-10 py-10">
            <div className="mx-auto max-w-5xl">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <section>
                  <h2 className="text-sm font-semibold text-zinc-900">
                    Today&apos;s Adventure - Mon Jan 05
                  </h2>
                  <div className="mt-2 rounded border border-zinc-400 bg-white p-4 text-sm text-zinc-800">
                    <ul className="space-y-2">
                      <li className="rounded border border-zinc-300 px-3 py-2">
                        [9:00-10:00 Study] Math Review
                      </li>
                      <li className="rounded border border-zinc-300 px-3 py-2">
                        [10:00-11:00 Study] Work on Essay
                      </li>
                      <li className="rounded border border-zinc-300 px-3 py-2">
                        [11:00-12:00 Study] Math Review
                      </li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-sm font-semibold text-zinc-900">
                    Quick Check
                  </h2>
                  <div className="mt-2 rounded border border-zinc-400 bg-white p-4 text-sm text-zinc-800">
                    <p>
                      <span className="font-semibold">Mood:</span> Mostly Neutral
                    </p>
                    <p className="mt-2">
                      <span className="font-semibold">Balance:</span> A lot of
                      studying
                    </p>
                    <p className="mt-2">
                      <span className="font-semibold">Tip:</span> Free more time
                      for yourself
                    </p>
                  </div>
                </section>
              </div>

              <div className="mt-6">
                <div className="flex flex-wrap gap-2 border-b border-zinc-300 pb-2">
                  {tabs.map((label) => (
                    <TabButton
                      key={label}
                      label={label}
                      active={activeTab === label}
                      onClick={() => setActiveTab(label)}
                    />
                  ))}
                </div>

                <div className="mt-4 rounded border border-zinc-400 bg-white p-6">
                  {activeTab === "Study Planner" ? <StudyPlannerTab /> : null}
                  {activeTab === "Breakdown wizard" ? (
                    <BreakdownWizardTab />
                  ) : null}
                  {activeTab !== "Study Planner" &&
                  activeTab !== "Breakdown wizard" ? (
                    <div className="py-12 text-center text-lg font-semibold text-zinc-800">
                      [Tab Content Shown]
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
