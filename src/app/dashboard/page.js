"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import SidebarNav from "../../components/SidebarNav";

const TAB_PARAM_TO_LABEL = {
  "study-planner": "Study Planner",
  "breakdown-wizard": "Breakdown wizard",
  "mood-tracker": "Mood Tracker",
  "guided-notes": "Guided Notes",
};

function getInitialTabLabel(tabParam) {
  if (!tabParam) return null;

  const normalized = String(tabParam).trim().toLowerCase();
  if (normalized in TAB_PARAM_TO_LABEL) {
    return TAB_PARAM_TO_LABEL[normalized];
  }

  return null;
}

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

function safeParseJson(value, fallback) {
  try {
    if (!value) return fallback;
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function combineDateAndTimeToMs(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  const d = new Date(`${dateStr}T${timeStr}`);
  const ms = d.getTime();
  return Number.isFinite(ms) ? ms : null;
}

function getTaskDurationMs(task) {
  const start = combineDateAndTimeToMs(task?.date, task?.startTime);
  const end = combineDateAndTimeToMs(task?.date, task?.endTime);
  if (start == null || end == null) return null;
  const diff = end - start;
  return diff > 0 ? diff : null;
}

function formatDuration(ms) {
  if (!ms || ms <= 0) return "";
  const totalMinutes = Math.round(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes === 0) {
    return `${hours} Hour${hours === 1 ? "" : "s"}`;
  }
  if (hours === 0) {
    return `${minutes} Minute${minutes === 1 ? "" : "s"}`;
  }
  return `${hours} Hour${hours === 1 ? "" : "s"} ${minutes} Minute${
    minutes === 1 ? "" : "s"
  }`;
}

function getId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function computeCategoryCounts(categories, tasks) {
  const counts = {};
  for (const c of categories) counts[c] = 0;
  for (const t of tasks) {
    if (t?.category && t.category in counts) {
      counts[t.category] += 1;
    }
  }
  return counts;
}

function StudyPlannerTab({
  categories,
  tasks,
  nowMs,
  activeSession,
  onCreateTask,
  onRemoveTask,
  onAddCategory,
  onStartSession,
  onEndSession,
}) {
  const [category, setCategory] = React.useState(categories[0] ?? "Study");
  const [label, setLabel] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [date, setDate] = React.useState("");
  const [startTime, setStartTime] = React.useState("");
  const [endTime, setEndTime] = React.useState("");

  const canCreate = React.useMemo(() => {
    const trimmedLabel = label.trim();
    if (!trimmedLabel) return false;
    if (!date.trim() || !startTime || !endTime) return false;
    const startMs = combineDateAndTimeToMs(date.trim(), startTime);
    const endMs = combineDateAndTimeToMs(date.trim(), endTime);
    return startMs != null && endMs != null && endMs > startMs;
  }, [label, date, startTime, endTime]);

  React.useEffect(() => {
    if (!categories.includes(category)) {
      setCategory(categories[0] ?? "Study");
    }
  }, [categories, category]);

  const sortedTasks = React.useMemo(() => {
    return [...tasks].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  }, [tasks]);

  const sessionRemainingMs = React.useMemo(() => {
    if (!activeSession?.endsAt) return null;
    return Math.max(0, activeSession.endsAt - nowMs);
  }, [activeSession, nowMs]);

  const sessionRemainingLabel = React.useMemo(() => {
    if (sessionRemainingMs == null) return "";
    const totalSeconds = Math.ceil(sessionRemainingMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  }, [sessionRemainingMs]);

  const counts = React.useMemo(() => {
    return computeCategoryCounts(categories, tasks);
  }, [categories, tasks]);

  const total = tasks.length;
  const balanceData = React.useMemo(() => {
    const safeTotal = total === 0 ? 1 : total;
    return categories
      .map((c) => {
        const count = counts[c] ?? 0;
        const percent = Math.round((count / safeTotal) * 100);
        return { category: c, count, percent };
      })
      .sort((a, b) => b.count - a.count);
  }, [categories, counts, total]);

  return (
    <div className="space-y-6">
      <div className="mb-3 text-sm font-semibold text-zinc-900">
        Scheduled Tasks
      </div>

      <div className="space-y-2">
        {sortedTasks.length === 0 ? (
          <div className="rounded border border-zinc-300 bg-white px-3 py-3 text-sm text-zinc-700">
            No scheduled tasks yet.
          </div>
        ) : null}

        {sortedTasks.map((t) => {
          const plannedStartMs = combineDateAndTimeToMs(t.date, t.startTime);
          const plannedEndMs = combineDateAndTimeToMs(t.date, t.endTime);
          const durationMs = getTaskDurationMs(t);
          const durationLabel = durationMs ? formatDuration(durationMs) : "";
          const statusLabel =
            plannedStartMs != null && nowMs < plannedStartMs ? "WAIT" : "START";
          const isSessionForTask = activeSession?.taskId === t.id;
          const canStartSession =
            !isSessionForTask &&
            !activeSession &&
            durationMs != null &&
            plannedStartMs != null &&
            nowMs >= plannedStartMs;
          const canEndSession = isSessionForTask;

          return (
          <div
            key={t.id}
            className="flex items-center justify-between gap-3 rounded border border-zinc-300 bg-white px-3 py-2 text-sm"
          >
            <button
              type="button"
              aria-label="Remove"
              onClick={() => onRemoveTask(t.id)}
              className="grid h-6 w-6 flex-none place-items-center rounded-full border border-zinc-400 bg-white text-zinc-700"
            >
              ×
            </button>

            <div className="min-w-0 flex-1 text-zinc-800">
              [{t.date || "No date"}{t.startTime ? ` ${t.startTime}` : ""}
              {t.endTime ? `-${t.endTime}` : ""} {t.category}] {t.label}
              {durationLabel ? ` (${durationLabel})` : ""}
              {isSessionForTask && sessionRemainingLabel
                ? ` (Session: ${sessionRemainingLabel})`
                : ""}
            </div>

            {canEndSession ? (
              <button
                type="button"
                className="flex-none text-xs font-medium underline text-zinc-800"
                onClick={() => onEndSession()}
              >
                [END]
              </button>
            ) : (
              <button
                type="button"
                className={
                  "flex-none text-xs font-medium underline " +
                  (canStartSession ? "text-zinc-800" : "text-zinc-400")
                }
                onClick={() => {
                  if (!canStartSession) return;
                  onStartSession(t.id);
                }}
                aria-disabled={!canStartSession}
                disabled={!canStartSession}
              >
                [START]
              </button>
            )}

            <button
              type="button"
              className="flex-none text-xs font-medium underline text-zinc-800"
              onClick={() =>
                t.description
                  ? window.alert(t.description)
                  : window.alert("No description.")
              }
            >
              [View Desc]
            </button>
          </div>
          );
        })}
      </div>

      <div className="rounded border border-zinc-300 bg-white p-4">
        <div className="mb-3 text-sm font-semibold text-zinc-900">New Task</div>
        <div className="mb-3 text-xs text-zinc-600">
          Choose a date, then set a start and end time.
        </div>
        <div className="space-y-2">
          <div className="flex flex-wrap items-end gap-2">
            <div className="flex flex-col">
            <label
              htmlFor="new-task-category"
              className="mb-1 text-[11px] text-zinc-700"
            >
              Task type
            </label>
            <select
              id="new-task-category"
              className="h-9 w-36 rounded border border-zinc-300 bg-white px-2 text-sm text-zinc-800"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Category"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            </div>

            <div className="flex flex-col">
            <label
              htmlFor="new-task-label"
              className="mb-1 text-[11px] text-zinc-700"
            >
              Task label
            </label>
            <input
              id="new-task-label"
              className="h-9 w-36 rounded border border-zinc-300 bg-white px-2 text-sm text-zinc-800"
              placeholder="e.g., Read Ch 3"
              aria-label="Task Label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
            </div>

            <div className="flex flex-col">
            <label
              htmlFor="new-task-description"
              className="mb-1 text-[11px] text-zinc-700"
            >
              Task description
            </label>
            <input
              id="new-task-description"
              className="h-9 w-56 rounded border border-zinc-300 bg-white px-2 text-sm text-zinc-800"
              placeholder="Optional details"
              aria-label="Task Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-2">
            <div className="flex flex-col">
              <label
                htmlFor="new-task-date"
                className="mb-1 text-[11px] text-zinc-700"
              >
                Date
              </label>
              <input
                id="new-task-date"
                className="h-9 w-40 rounded border border-zinc-300 bg-white px-2 text-sm text-zinc-800"
                type="date"
                aria-label="Task Date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="new-task-start"
                className="mb-1 text-[11px] text-zinc-700"
              >
                Start time
              </label>
              <input
                id="new-task-start"
                className="h-9 w-32 rounded border border-zinc-300 bg-white px-2 text-sm text-zinc-800"
                type="time"
                aria-label="Start Time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="new-task-end"
                className="mb-1 text-[11px] text-zinc-700"
              >
                End time
              </label>
              <input
                id="new-task-end"
                className="h-9 w-32 rounded border border-zinc-300 bg-white px-2 text-sm text-zinc-800"
                type="time"
                aria-label="End Time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>

            <button
              type="button"
              className="h-9 rounded border border-zinc-400 bg-white px-4 text-sm font-medium text-zinc-900"
              disabled={!canCreate}
              aria-disabled={!canCreate}
              title={
                canCreate
                  ? "Create the task"
                  : "Enter a label, date, start time, and end time (end after start)."
              }
              onClick={() => {
                const trimmedLabel = label.trim();
                if (!trimmedLabel) return;

                const startMs = combineDateAndTimeToMs(date.trim(), startTime);
                const endMs = combineDateAndTimeToMs(date.trim(), endTime);
                if (!date.trim() || !startTime || !endTime) return;
                if (startMs == null || endMs == null || endMs <= startMs) return;

                onCreateTask({
                  category,
                  label: trimmedLabel,
                  description: description.trim(),
                  date: date.trim(),
                  startTime,
                  endTime,
                });

                setLabel("");
                setDescription("");
                setDate("");
                setStartTime("");
                setEndTime("");
              }}
            >
              Create
            </button>
          </div>
        </div>
      </div>

      <div className="rounded border border-zinc-300 bg-white p-4">
        <div className="text-sm font-semibold text-zinc-900">Work Balance</div>
        <div className="mt-1 text-xs text-zinc-600">
          Based on counts of scheduled tasks by category.
        </div>

        <div className="mt-4 flex flex-wrap items-end gap-10">
          {balanceData.map((b) => (
            <div key={b.category} className="flex flex-col items-center gap-2">
              <div className="text-xs text-zinc-700">{b.percent}</div>
              <div className="h-44 w-12 rounded border border-zinc-300 bg-zinc-50 p-1">
                <div
                  className="w-full rounded bg-zinc-200"
                  style={{ height: `${b.percent}%` }}
                />
              </div>
              <div className="text-xs font-medium text-zinc-800">
                {b.category}
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="mt-4 text-sm font-medium text-zinc-800"
          onClick={() => {
            const name = window
              .prompt("New category name?")
              ?.trim();
            if (!name) return;
            onAddCategory(name);
          }}
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

function MoodTrackerTab() {
  const timeline = [
    {
      date: "Mon Jan 05",
      mood: "Neutral",
      note: "The day is starting out okay.",
    },
    {
      date: "Sun Jan 04",
      mood: "Good",
      note: "I had a fun evening.",
    },
    {
      date: "Sat Jan 03",
      mood: "Good",
      note: "It was relaxing today.",
    },
  ];

  const correlations = ["Mostly Inconclusive", "Might Like Weekends More"];

  return (
    <div className="space-y-6">
      <div className="rounded border border-zinc-300 bg-white p-4">
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="h-9 w-40 rounded border border-zinc-300 bg-white px-2 text-sm text-zinc-800"
            defaultValue=""
            aria-label="Select Mood"
          >
            <option value="" disabled>
              Select Mood
            </option>
            <option>Great</option>
            <option>Good</option>
            <option>Neutral</option>
            <option>Stressed</option>
            <option>Overwhelmed</option>
          </select>

          <input
            className="h-9 w-72 rounded border border-zinc-300 bg-white px-2 text-sm text-zinc-800"
            placeholder="Extra Notes"
            aria-label="Extra Notes"
          />

          <button
            type="button"
            className="h-9 rounded border border-zinc-400 bg-white px-4 text-sm font-medium text-zinc-900"
          >
            Record Mood
          </button>
        </div>
      </div>

      <div className="rounded border border-zinc-300 bg-white p-4">
        <div className="text-sm font-semibold text-zinc-900">
          Recent Mood Timeline
        </div>
        <ul className="mt-3 space-y-2 text-sm text-zinc-800">
          {timeline.map((t) => (
            <li key={t.date}>
              {t.date} - {t.mood} - {t.note}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded border border-zinc-300 bg-white p-4">
        <div className="text-sm font-semibold text-zinc-900">
          Mood Correlations
        </div>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-800">
          {correlations.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function GuidedNotesTab() {
  const recentActivity = [
    "Mood: Mostly Neutral",
    "Mostly Studying",
    "Working on Essay",
  ];

  const suggestedTips = [
    "Block out more time for yourself",
    "Find a hobby to spend time on",
    "Take breaks between work",
  ];

  return (
    <div className="space-y-4">
      <section className="rounded border border-zinc-300 bg-white p-4">
        <div className="text-sm font-semibold text-zinc-900">Recent Activity</div>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-800">
          {recentActivity.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </section>

      <section className="rounded border border-zinc-300 bg-white p-4">
        <div className="text-sm font-semibold text-zinc-900">Personal Notes</div>
        <div className="mt-3 rounded border border-zinc-300 bg-white p-4">
          <div className="text-sm text-zinc-800">
            <div>- I have been feeling a bit bored lately</div>
            <div>- Work is tiring me out</div>
          </div>
        </div>
      </section>

      <section className="rounded border border-zinc-300 bg-white p-4">
        <div className="text-sm font-semibold text-zinc-900">Suggested Tips</div>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-800">
          {suggestedTips.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </section>
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
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [categories, setCategories] = React.useState(() => {
    if (typeof window === "undefined") return ["Study", "Self", "Work"];
    const stored = safeParseJson(
      window.localStorage.getItem("mytime.categories"),
      null
    );
    return Array.isArray(stored) && stored.length > 0
      ? stored
      : ["Study", "Self", "Work"];
  });

  const [tasks, setTasks] = React.useState(() => {
    if (typeof window === "undefined") return [];
    const stored = safeParseJson(
      window.localStorage.getItem("mytime.tasks"),
      []
    );
    return Array.isArray(stored) ? stored : [];
  });

  const [activeSession, setActiveSession] = React.useState(() => {
    if (typeof window === "undefined") return null;
    const stored = safeParseJson(
      window.localStorage.getItem("mytime.activeSession"),
      null
    );
    return stored && typeof stored === "object" ? stored : null;
  });

  const [nowMs, setNowMs] = React.useState(() => Date.now());

  const [activeTab, setActiveTab] = React.useState(
    getInitialTabLabel(tabParam) ?? "Study Planner"
  );

  React.useEffect(() => {
    const nextTab = getInitialTabLabel(tabParam);
    if (nextTab && tabs.includes(nextTab)) {
      setActiveTab(nextTab);
    }
    // Only respond to URL query changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabParam]);

  React.useEffect(() => {
    try {
      window.localStorage.setItem(
        "mytime.categories",
        JSON.stringify(categories)
      );
    } catch {
      // ignore
    }
  }, [categories]);

  React.useEffect(() => {
    try {
      window.localStorage.setItem("mytime.tasks", JSON.stringify(tasks));
    } catch {
      // ignore
    }
  }, [tasks]);

  React.useEffect(() => {
    try {
      if (!activeSession) {
        window.localStorage.removeItem("mytime.activeSession");
      } else {
        window.localStorage.setItem(
          "mytime.activeSession",
          JSON.stringify(activeSession)
        );
      }
    } catch {
      // ignore
    }
  }, [activeSession]);

  React.useEffect(() => {
    const id = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  React.useEffect(() => {
    if (!activeSession?.endsAt) return;
    if (nowMs >= activeSession.endsAt) {
      setActiveSession(null);
    }
  }, [activeSession, nowMs]);

  const latestThree = React.useMemo(() => {
    return [...tasks]
      .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
      .slice(0, 3);
  }, [tasks]);

  function addCategory(name) {
    const trimmed = name.trim();
    if (!trimmed) return;
    setCategories((prev) => {
      if (prev.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
        return prev;
      }
      return [...prev, trimmed];
    });
  }

  function createTask({ category, label, description, date }) {
    setTasks((prev) => [
      {
        id: getId(),
        category,
        label,
        description,
        date,
        startTime: arguments[0]?.startTime ?? "",
        endTime: arguments[0]?.endTime ?? "",
        status: "WAIT",
        createdAt: Date.now(),
      },
      ...prev,
    ]);
  }

  function removeTask(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setActiveSession((prev) => (prev?.taskId === id ? null : prev));
  }

  function startSession(taskId) {
    if (activeSession && activeSession.taskId !== taskId) return;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const durationMs = getTaskDurationMs(task);
    if (!durationMs) return;

    const plannedStartMs = combineDateAndTimeToMs(task.date, task.startTime);
    if (plannedStartMs == null) return;
    if (nowMs < plannedStartMs) return;

    setActiveSession({
      taskId,
      startedAt: nowMs,
      endsAt: nowMs + durationMs,
    });
  }

  function endSession() {
    setActiveSession(null);
  }

  const todayLabel = React.useMemo(() => {
    const parts = new Date().toDateString().split(" ");
    return `${parts[0]} ${parts[1]} ${parts[2]}`;
  }, []);

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
                    Today&apos;s Adventure - {todayLabel}
                  </h2>
                  <div className="mt-2 rounded border border-zinc-400 bg-white p-4 text-sm text-zinc-800">
                    <ul className="space-y-2">
                      {latestThree.length === 0 ? (
                        <li className="rounded border border-zinc-300 px-3 py-2 text-zinc-700">
                          No scheduled tasks yet.
                        </li>
                      ) : null}

                      {latestThree.map((t) => {
                        const plannedStartMs = combineDateAndTimeToMs(
                          t.date,
                          t.startTime
                        );
                        const durationMs = getTaskDurationMs(t);
                        const durationLabel = durationMs
                          ? formatDuration(durationMs)
                          : "";
                        const statusLabel =
                          plannedStartMs != null && nowMs < plannedStartMs
                            ? "WAIT"
                            : "START";
                        const isSessionForTask = activeSession?.taskId === t.id;
                        const remainingLabel = isSessionForTask
                          ? (() => {
                              const remaining = Math.max(
                                0,
                                (activeSession?.endsAt ?? 0) - nowMs
                              );
                              const totalSeconds = Math.ceil(remaining / 1000);
                              const minutes = Math.floor(totalSeconds / 60);
                              const seconds = totalSeconds % 60;
                              return `${minutes}:${String(seconds).padStart(
                                2,
                                "0"
                              )}`;
                            })()
                          : "";

                        return (
                        <li
                          key={t.id}
                          className="rounded border border-zinc-300 px-3 py-2"
                        >
                          [{t.date || "No date"}{t.startTime ? ` ${t.startTime}` : ""}
                          {t.endTime ? `-${t.endTime}` : ""} {t.category}] {t.label}
                          {durationLabel ? ` (${durationLabel})` : ""}
                          {remainingLabel ? ` (Session: ${remainingLabel})` : ""}
                        </li>
                        );
                      })}
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
                  {activeTab === "Study Planner" ? (
                    <StudyPlannerTab
                      categories={categories}
                      tasks={tasks}
                      nowMs={nowMs}
                      activeSession={activeSession}
                      onCreateTask={createTask}
                      onRemoveTask={removeTask}
                      onAddCategory={addCategory}
                      onStartSession={startSession}
                      onEndSession={endSession}
                    />
                  ) : null}
                  {activeTab === "Breakdown wizard" ? (
                    <BreakdownWizardTab />
                  ) : null}
                  {activeTab === "Mood Tracker" ? <MoodTrackerTab /> : null}
                  {activeTab === "Guided Notes" ? <GuidedNotesTab /> : null}
                  {activeTab !== "Study Planner" &&
                  activeTab !== "Breakdown wizard" &&
                  activeTab !== "Mood Tracker" &&
                  activeTab !== "Guided Notes" ? (
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
