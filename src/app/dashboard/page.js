"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { SidebarNavWithFooter } from "../../components/SidebarNav";

const TAB_PARAM_TO_LABEL = {
  "study-planner": "Study Planner",
  "breakdown-wizard": "Breakdown Wizard",
  "mood-tracker": "Mood Tracker",
  "guided-notes": "Guided Notes",
};

const DEFAULT_BREAKDOWN_STEPS = [
  "Research context (30m)",
  "Outline key points (20m)",
  "Draft introduction (45m)",
  "First revision (30m)",
];

const AI_PLACEHOLDER_TEXT = "Press Regenerate Suggestions to recieve results.";

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
  return `${hours} Hour${hours === 1 ? "" : "s"} ${minutes} Minute${minutes === 1 ? "" : "s"
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

function parseIsoDate(iso) {
  const parts = String(iso ?? "").split("-");
  if (parts.length !== 3) return null;
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return null;
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  const date = new Date(y, m - 1, d);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function formatIsoDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseStepMinutes(stepText) {
  const match = String(stepText ?? "").match(/\((\d+)\s*m\)/i);
  if (!match) return 30;
  const n = Number(match[1]);
  if (!Number.isFinite(n) || n <= 0) return 30;
  return Math.max(5, Math.min(300, Math.round(n)));
}

function addMinutesToTimeHHMM(startHHMM, minutesToAdd) {
  const [hStr, mStr] = String(startHHMM ?? "").split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return startHHMM;
  const total = Math.min(23 * 60 + 59, h * 60 + m + (Number(minutesToAdd) || 0));
  const hh = String(Math.floor(total / 60)).padStart(2, "0");
  const mm = String(total % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

function StudyPlannerTab({
  categories,
  tasks,
  nowMs,
  activeSession,
  onCreateTask,
  onRemoveTask,
  onUpdateTask,
  onAddCategory,
  onDeleteCategory,
  onStartSession,
  onEndSession,
}) {
  const [category, setCategory] = React.useState(categories[0] ?? "Study");
  const [label, setLabel] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [date, setDate] = React.useState("");
  const [startTime, setStartTime] = React.useState("");
  const [endTime, setEndTime] = React.useState("");

  const [editingTaskId, setEditingTaskId] = React.useState(null);
  const [editCategory, setEditCategory] = React.useState(categories[0] ?? "Study");
  const [editLabel, setEditLabel] = React.useState("");
  const [editDescription, setEditDescription] = React.useState("");
  const [editDate, setEditDate] = React.useState("");
  const [editStartTime, setEditStartTime] = React.useState("");
  const [editEndTime, setEditEndTime] = React.useState("");

  const canCreate = React.useMemo(() => {
    const trimmedLabel = label.trim();
    if (!trimmedLabel) return false;
    if (!date.trim() || !startTime || !endTime) return false;
    const startMs = combineDateAndTimeToMs(date.trim(), startTime);
    const endMs = combineDateAndTimeToMs(date.trim(), endTime);
    return startMs != null && endMs != null && endMs > startMs;
  }, [label, date, startTime, endTime]);

  const canSaveEdit = React.useMemo(() => {
    const trimmedLabel = editLabel.trim();
    if (!trimmedLabel) return false;
    if (!editDate.trim() || !editStartTime || !editEndTime) return false;
    const startMs = combineDateAndTimeToMs(editDate.trim(), editStartTime);
    const endMs = combineDateAndTimeToMs(editDate.trim(), editEndTime);
    return startMs != null && endMs != null && endMs > startMs;
  }, [editLabel, editDate, editStartTime, editEndTime]);

  React.useEffect(() => {
    if (!categories.includes(category)) {
      setCategory(categories[0] ?? "Study");
    }
  }, [categories, category]);

  React.useEffect(() => {
    if (!categories.includes(editCategory)) {
      setEditCategory(categories[0] ?? "Study");
    }
  }, [categories, editCategory]);

  function beginEdit(task) {
    setEditingTaskId(task.id);
    setEditCategory(task.category ?? (categories[0] ?? "Study"));
    setEditLabel(task.label ?? "");
    setEditDescription(task.description ?? "");
    setEditDate(task.date ?? "");
    setEditStartTime(task.startTime ?? "");
    setEditEndTime(task.endTime ?? "");
  }

  function cancelEdit() {
    setEditingTaskId(null);
  }

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
      <div className="space-y-2">
        <div className="mb-3 text-sm font-semibold text-zinc-900">
          Scheduled Tasks
        </div>
        {sortedTasks.length === 0 ? (
          <div className="rounded border border-zinc-300 bg-white px-3 py-3 text-sm text-zinc-700">
            No scheduled tasks yet.
          </div>
        ) : null}

        {sortedTasks.map((t) => {
          const plannedStartMs = combineDateAndTimeToMs(t.date, t.startTime);
          const durationMs = getTaskDurationMs(t);
          const durationLabel = durationMs ? formatDuration(durationMs) : "";
          const statusLabel = t.endedAt
            ? "ENDED"
            : plannedStartMs != null && nowMs < plannedStartMs
              ? "WAIT"
              : "START";
          const isSessionForTask = activeSession?.taskId === t.id;
          const isEditing = editingTaskId === t.id;
          const canStartSession =
            !isSessionForTask &&
            !activeSession &&
            !t.endedAt &&
            durationMs != null &&
            plannedStartMs != null &&
            nowMs >= plannedStartMs;
          const canEndSession = isSessionForTask;

          return (
            <div key={t.id} className="space-y-2">
              <div className="flex items-center justify-between gap-3 rounded border border-zinc-300 bg-white px-3 py-2 text-sm">
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
                  {` - [${statusLabel}]`}
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
                ) : statusLabel === "ENDED" ? (
                  <span className="flex-none text-xs font-medium text-zinc-500">
                    [ENDED]
                  </span>
                ) : statusLabel === "WAIT" ? (
                  <span className="flex-none text-xs font-medium text-zinc-500">
                    [WAIT]
                  </span>
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

                {!isSessionForTask ? (
                  <button
                    type="button"
                    className={
                      "flex-none text-xs font-medium underline " +
                      (isEditing ? "text-zinc-400" : "text-zinc-800")
                    }
                    onClick={() => {
                      if (isEditing) return;
                      beginEdit(t);
                    }}
                    aria-disabled={isEditing}
                    disabled={isEditing}
                  >
                    [Edit]
                  </button>
                ) : null}
              </div>

              {isEditing ? (
                <div className="rounded border border-zinc-300 bg-white p-3">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-end gap-2">
                      <div className="flex flex-col">
                        <label
                          htmlFor={`edit-task-category-${t.id}`}
                          className="mb-1 text-[11px] text-zinc-700"
                        >
                          Task type
                        </label>
                        <select
                          id={`edit-task-category-${t.id}`}
                          className="h-9 w-36 rounded border border-zinc-300 bg-white px-2 text-sm text-zinc-800"
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
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
                          htmlFor={`edit-task-label-${t.id}`}
                          className="mb-1 text-[11px] text-zinc-700"
                        >
                          Task label
                        </label>
                        <input
                          id={`edit-task-label-${t.id}`}
                          className="h-9 w-36 rounded border border-zinc-300 bg-white px-2 text-sm text-zinc-800"
                          aria-label="Task Label"
                          value={editLabel}
                          onChange={(e) => setEditLabel(e.target.value)}
                        />
                      </div>

                      <div className="flex flex-col">
                        <label
                          htmlFor={`edit-task-description-${t.id}`}
                          className="mb-1 text-[11px] text-zinc-700"
                        >
                          Task description
                        </label>
                        <input
                          id={`edit-task-description-${t.id}`}
                          className="h-9 w-56 rounded border border-zinc-300 bg-white px-2 text-sm text-zinc-800"
                          aria-label="Task Description"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-end gap-2">
                      <div className="flex flex-col">
                        <label
                          htmlFor={`edit-task-date-${t.id}`}
                          className="mb-1 text-[11px] text-zinc-700"
                        >
                          Date
                        </label>
                        <input
                          id={`edit-task-date-${t.id}`}
                          className="h-9 w-40 rounded border border-zinc-300 bg-white px-2 text-sm text-zinc-800"
                          type="date"
                          aria-label="Task Date"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                        />
                      </div>

                      <div className="flex flex-col">
                        <label
                          htmlFor={`edit-task-start-${t.id}`}
                          className="mb-1 text-[11px] text-zinc-700"
                        >
                          Start time
                        </label>
                        <input
                          id={`edit-task-start-${t.id}`}
                          className="h-9 w-32 rounded border border-zinc-300 bg-white px-2 text-sm text-zinc-800"
                          type="time"
                          aria-label="Start Time"
                          value={editStartTime}
                          onChange={(e) => setEditStartTime(e.target.value)}
                        />
                      </div>

                      <div className="flex flex-col">
                        <label
                          htmlFor={`edit-task-end-${t.id}`}
                          className="mb-1 text-[11px] text-zinc-700"
                        >
                          End time
                        </label>
                        <input
                          id={`edit-task-end-${t.id}`}
                          className="h-9 w-32 rounded border border-zinc-300 bg-white px-2 text-sm text-zinc-800"
                          type="time"
                          aria-label="End Time"
                          value={editEndTime}
                          onChange={(e) => setEditEndTime(e.target.value)}
                        />
                      </div>

                      <button
                        type="button"
                        className="h-9 rounded border border-zinc-400 bg-white px-4 text-sm font-medium text-zinc-900"
                        disabled={!canSaveEdit}
                        aria-disabled={!canSaveEdit}
                        title={
                          canSaveEdit
                            ? "Save changes"
                            : "Enter a label, date, start time, and end time (end after start)."
                        }
                        onClick={() => {
                          if (!editingTaskId) return;
                          if (!canSaveEdit) return;

                          onUpdateTask(editingTaskId, {
                            category: editCategory,
                            label: editLabel.trim(),
                            description: editDescription.trim(),
                            date: editDate.trim(),
                            startTime: editStartTime,
                            endTime: editEndTime,
                          });

                          setEditingTaskId(null);
                        }}
                      >
                        Save
                      </button>

                      <button
                        type="button"
                        className="h-9 rounded border border-zinc-400 bg-white px-4 text-sm font-medium text-zinc-800"
                        onClick={() => cancelEdit()}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
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

              {categories.length > 1 ? (
                <button
                  type="button"
                  className="text-[11px] font-medium underline text-zinc-700"
                  onClick={() => {
                    const ok = window.confirm(
                      `Delete category "${b.category}"? Tasks in this category will be reassigned.`
                    );
                    if (!ok) return;
                    onDeleteCategory(b.category);
                  }}
                >
                  Delete
                </button>
              ) : null}
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

function BreakdownWizardTab({
  taskName,
  taskDate,
  priority,
  onChangeTaskName,
  onChangeTaskDate,
  onChangePriority,
  steps,
  showGenerateHint,
  onGenerate,
  isGenerating,
  generateError,
  onImportFile,
  importedFileName,
  importedCharCount,
  isImporting,
  importError,
  onEditStep,
  onDeleteStep,
  onAssignStep,
}) {
  const shownSteps =
    Array.isArray(steps) && steps.length > 0 ? steps : DEFAULT_BREAKDOWN_STEPS;

  const [selectedStepIndex, setSelectedStepIndex] = React.useState(null);

  React.useEffect(() => {
    if (!Array.isArray(shownSteps) || shownSteps.length === 0) {
      setSelectedStepIndex(null);
      return;
    }

    if (
      selectedStepIndex == null ||
      selectedStepIndex < 0 ||
      selectedStepIndex >= shownSteps.length
    ) {
      setSelectedStepIndex(null);
    }
  }, [shownSteps, selectedStepIndex]);

  return (
    <div className="space-y-6">
      <div className="mb-3 text-sm font-semibold text-zinc-900">
        Assignment Details
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <div className="flex flex-col">
          <label
            htmlFor="assignment-name"
            className="mb-1 text-[11px] text-zinc-700"
          >
            Assignment name
          </label>
          <input
            id="assignment-name"
            className="h-9 w-56 rounded border border-zinc-300 bg-white px-2 text-sm text-zinc-800"
            placeholder="Assignment name"
            aria-label="Assignment Name"
            value={taskName}
            onChange={(e) => onChangeTaskName(e.target.value)}
          />
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="assignment-date"
            className="mb-1 text-[11px] text-zinc-700"
          >
            Assignment date
          </label>
          <input
            id="assignment-date"
            className="h-9 w-40 rounded border border-zinc-300 bg-white px-2 text-sm text-zinc-800"
            type="date"
            aria-label="Assignment Date"
            value={taskDate}
            onChange={(e) => onChangeTaskDate(e.target.value)}
          />
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="assignment-priority"
            className="mb-1 text-[11px] text-zinc-700"
          >
            Assignment priority
          </label>
          <select
            id="assignment-priority"
            className="h-9 w-48 rounded border border-zinc-300 bg-white px-2 text-sm text-zinc-800"
            value={priority}
            onChange={(e) => onChangePriority(e.target.value)}
            aria-label="Assignment Priority"
          >
            <option value="" disabled>
              Priority
            </option>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>
      </div>

      <div className="rounded border border-zinc-300 bg-white p-8">
        <div className="grid min-h-32 place-items-center rounded border border-zinc-300 bg-zinc-50 px-4 py-8 text-sm font-medium text-zinc-700">
          <div className="flex w-full flex-col items-center gap-3">
            <label className="rounded border border-zinc-400 bg-white px-4 py-2 text-xs font-medium text-zinc-800">
              <input
                type="file"
                accept=".txt,.pdf,text/plain,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  onImportFile?.(f);
                  e.target.value = "";
                }}
              />
              {isImporting ? "Importing…" : "Import .txt/.pdf file"}
            </label>

            {importError ? (
              <div className="text-xs font-normal text-zinc-700">{importError}</div>
            ) : null}

            {importedFileName ? (
              <div className="text-xs font-normal text-zinc-700">
                Imported: <span className="font-semibold">{importedFileName}</span>
                {importedCharCount ? ` (${importedCharCount} chars)` : ""}
              </div>
            ) : (
              <div className="text-xs font-normal text-zinc-700">
                Optional: attach reading notes or assignment brief.
              </div>
            )}
          </div>
        </div>
      </div>

      <hr className="border-zinc-300" />

      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm font-semibold text-zinc-900">
            Suggested Steps
          </div>
          <button
            type="button"
            className={
              "rounded border border-zinc-400 bg-white px-4 py-2 text-xs font-medium " +
              (taskName.trim() && !isGenerating
                ? "text-zinc-800"
                : "text-zinc-400")
            }
            onClick={onGenerate}
            disabled={!taskName.trim() || isGenerating}
            aria-disabled={!taskName.trim() || isGenerating}
            title={
              taskName.trim()
                ? "Generate steps using AI"
                : "Enter an assignment name first"
            }
          >
            {isGenerating ? "Generating…" : "Generate"}
          </button>
        </div>

        {generateError ? (
          <div className="mt-2 text-xs text-zinc-700">{generateError}</div>
        ) : null}

        {showGenerateHint ? (
          <div className="mt-2 text-xs text-zinc-700">
            Use <span className="font-semibold">Regenerate Suggestions</span> in the sidebar
            to update AI steps.
          </div>
        ) : null}
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-zinc-800">
          {shownSteps.map((s, idx) => {
            const selected = idx === selectedStepIndex;
            return (
              <li key={`${idx}-${s}`}>
                <button
                  type="button"
                  className={
                    "w-full rounded border px-3 py-2 text-left text-sm " +
                    (selected
                      ? "border-zinc-400 bg-zinc-100 text-zinc-900"
                      : "border-zinc-300 bg-white text-zinc-800")
                  }
                  onClick={() => setSelectedStepIndex(idx)}
                >
                  {s}
                </button>
              </li>
            );
          })}
        </ol>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            className={
              "rounded border border-zinc-400 bg-white px-4 py-2 text-xs font-medium " +
              (selectedStepIndex == null ? "text-zinc-400" : "text-zinc-800")
            }
            disabled={selectedStepIndex == null}
            aria-disabled={selectedStepIndex == null}
            title={
              selectedStepIndex == null
                ? "Select a suggested step first"
                : "Edit selected step"
            }
            onClick={() => {
              if (selectedStepIndex == null) return;
              const current = shownSteps[selectedStepIndex] ?? "";
              const next = window.prompt("Edit step:", current);
              if (next == null) return;
              const trimmed = next.trim();
              if (!trimmed) return;
              onEditStep?.(selectedStepIndex, trimmed);
            }}
          >
            Edit Step
          </button>
          <button
            type="button"
            className={
              "rounded border border-zinc-400 bg-white px-4 py-2 text-xs font-medium " +
              (selectedStepIndex == null ? "text-zinc-400" : "text-zinc-800")
            }
            disabled={selectedStepIndex == null}
            aria-disabled={selectedStepIndex == null}
            title={
              selectedStepIndex == null
                ? "Select a suggested step first"
                : "Delete selected step"
            }
            onClick={() => {
              if (selectedStepIndex == null) return;
              const ok = window.confirm("Delete selected step?");
              if (!ok) return;
              onDeleteStep?.(selectedStepIndex);
              setSelectedStepIndex(null);
            }}
          >
            Delete Step
          </button>
          <button
            type="button"
            className={
              "rounded border border-zinc-400 bg-white px-4 py-2 text-xs font-medium " +
              (selectedStepIndex == null ? "text-zinc-400" : "text-zinc-800")
            }
            disabled={selectedStepIndex == null}
            aria-disabled={selectedStepIndex == null}
            title={
              selectedStepIndex == null
                ? "Select a suggested step first"
                : "Assign selected step to Study Planner"
            }
            onClick={() => {
              if (selectedStepIndex == null) return;
              onAssignStep?.(selectedStepIndex);
            }}
          >
            Assign to Planner
          </button>
        </div>
      </div>
    </div>
  );
}

function MoodTrackerTab({
  timeline,
  correlations,
  aiReady,
  onRecordMood,
  onDeleteMoodEntry,
}) {
  const [selectedMood, setSelectedMood] = React.useState("");
  const [note, setNote] = React.useState("");

  return (
    <div className="space-y-6">
      <div className="mb-3 text-sm font-semibold text-zinc-900">
        Record Mood
      </div>
      <div className="rounded border border-zinc-300 bg-white p-4">
        <div className="flex flex-wrap items-end gap-2">
          <div className="flex flex-col">
            <label
              htmlFor="mood-select"
              className="mb-1 text-[11px] text-zinc-700"
            >
              Mood
            </label>
            <select
              id="mood-select"
              className="h-9 w-40 rounded border border-zinc-300 bg-white px-2 text-sm text-zinc-800"
              value={selectedMood}
              onChange={(e) => setSelectedMood(e.target.value)}
              aria-label="Mood"
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
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="mood-notes"
              className="mb-1 text-[11px] text-zinc-700"
            >
              Notes
            </label>
            <input
              id="mood-notes"
              className="h-9 w-72 rounded border border-zinc-300 bg-white px-2 text-sm text-zinc-800"
              placeholder="Extra Notes"
              aria-label="Notes"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <button
            type="button"
            className="h-9 rounded border border-zinc-400 bg-white px-4 text-sm font-medium text-zinc-900"
            onClick={() => {
              const mood = selectedMood.trim();
              if (!mood) return;
              onRecordMood({ mood, note: note.trim() });
              setSelectedMood("");
              setNote("");
            }}
            disabled={!selectedMood.trim()}
            aria-disabled={!selectedMood.trim()}
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
          {timeline.length === 0 ? (
            <li className="text-zinc-700">No mood entries yet.</li>
          ) : null}

          {timeline.map((t) => (
            <li key={t.id} className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                {t.date} - {t.mood}
                {t.note ? ` - ${t.note}` : ""}
              </div>
              <button
                type="button"
                className="flex-none text-xs font-medium underline text-zinc-800"
                onClick={() => onDeleteMoodEntry(t.id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded border border-zinc-300 bg-white p-4">
        <div className="text-sm font-semibold text-zinc-900">
          Mood Correlations
        </div>
        {aiReady ? (
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-800">
            {correlations.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        ) : (
          <div className="mt-3 text-sm text-zinc-700">{AI_PLACEHOLDER_TEXT}</div>
        )}
      </div>
    </div>
  );
}

function GuidedNotesTab({ quickCheck, nextAssignment, guidedTips, aiReady }) {
  const recentActivity = React.useMemo(() => {
    const moodLine = aiReady
      ? `Mood: ${String(quickCheck?.mood || "(No mood entries yet)")}`
      : `Mood: ${AI_PLACEHOLDER_TEXT}`;
    const wbLine = aiReady
      ? `Work Balance: ${String(
        quickCheck?.workBalance || "(No scheduled tasks yet)"
      )}`
      : `Work Balance: ${AI_PLACEHOLDER_TEXT}`;
    const assignmentLine = `Assignment: ${String(
      nextAssignment || "(No upcoming scheduled tasks)"
    )}`;
    return [moodLine, wbLine, assignmentLine];
  }, [quickCheck, nextAssignment, aiReady]);

  const [personalNotes, setPersonalNotes] = React.useState(
    "- I have been feeling a bit bored lately\n- Work is tiring me out"
  );

  React.useEffect(() => {
    try {
      const stored = safeParseJson(
        window.localStorage.getItem("mytime.guidedNotes"),
        null
      );
      if (stored && typeof stored === "object" && typeof stored.text === "string") {
        setPersonalNotes(stored.text);
      }
    } catch {
      // ignore
    }
  }, []);

  const [saveStatus, setSaveStatus] = React.useState("");

  function saveNotes() {
    try {
      window.localStorage.setItem(
        "mytime.guidedNotes",
        JSON.stringify({ text: personalNotes })
      );
      setSaveStatus("Saved.");
      window.setTimeout(() => setSaveStatus(""), 1200);
    } catch {
      setSaveStatus("Could not save.");
      window.setTimeout(() => setSaveStatus(""), 1200);
    }
  }

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
        <textarea
          className="min-h-28 w-full resize-none rounded border border-zinc-300 bg-white p-2 text-sm text-zinc-800"
          aria-label="Personal Notes"
          value={personalNotes}
          onChange={(e) => setPersonalNotes(e.target.value)}
        />
        <div className="mt-2 flex items-center gap-3">
          <button
            type="button"
            className="h-9 rounded border border-zinc-400 bg-white px-4 text-sm font-medium text-zinc-900"
            onClick={saveNotes}
          >
            Save Notes
          </button>
          {saveStatus ? (
            <div className="text-xs text-zinc-700">{saveStatus}</div>
          ) : null}
        </div>
      </section>

      <section className="rounded border border-zinc-300 bg-white p-4">
        <div className="text-sm font-semibold text-zinc-900">Suggested Tips</div>
        {aiReady && Array.isArray(guidedTips) && guidedTips.length > 0 ? (
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-800">
            {guidedTips.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        ) : (
          <div className="mt-3 text-sm text-zinc-700">{AI_PLACEHOLDER_TEXT}</div>
        )}
      </section>
    </div>
  );
}

function DashboardPageInner() {
  const AI_BUNDLE_KEY = "mytime.aiBundle";
  const BREAKDOWN_KEY = "mytime.breakdownSteps";
  const tabs = [
    "Study Planner",
    "Breakdown Wizard",
    "Mood Tracker",
    "Guided Notes",
  ];
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const defaultCategories = React.useMemo(() => ["Study", "Self", "Work"], []);
  const [categories, setCategories] = React.useState(defaultCategories);
  const [tasks, setTasks] = React.useState([]);
  const [moods, setMoods] = React.useState([]);

  const [breakdownTaskName, setBreakdownTaskName] = React.useState("");
  const [breakdownTaskDate, setBreakdownTaskDate] = React.useState("");
  const [breakdownPriority, setBreakdownPriority] = React.useState("");

  const aiFallback = React.useMemo(
    () => ({
      generatedAt: null,
      moodCorrelations: ["Mostly Inconclusive", "Might Like Weekends More"],
      moodSummary: "",
      quickCheck: {
        mood: "Mostly Neutral",
        workBalance: "A lot of studying",
        tip: "Free more time for yourself",
      },
      guidedTips: [],
    }),
    []
  );

  const [aiBundle, setAiBundle] = React.useState(aiFallback);
  const aiReady = Boolean(aiBundle?.generatedAt);

  const [breakdownSteps, setBreakdownSteps] = React.useState([]);
  const [breakdownContext, setBreakdownContext] = React.useState({
    taskName: "",
    taskDate: "",
    priority: "",
  });
  const [breakdownImportedText, setBreakdownImportedText] = React.useState("");
  const [breakdownImportedFileName, setBreakdownImportedFileName] =
    React.useState("");
  const [breakdownImportedCharCount, setBreakdownImportedCharCount] =
    React.useState(0);
  const [isImportingBreakdown, setIsImportingBreakdown] = React.useState(false);
  const [breakdownImportError, setBreakdownImportError] = React.useState("");
  const [isGeneratingBreakdown, setIsGeneratingBreakdown] = React.useState(false);
  const [breakdownError, setBreakdownError] = React.useState("");

  const [isRegenerating, setIsRegenerating] = React.useState(false);
  const [regenError, setRegenError] = React.useState("");

  const [activeSession, setActiveSession] = React.useState(null);
  const [nowMs, setNowMs] = React.useState(0);
  const [hasHydrated, setHasHydrated] = React.useState(false);

  const [activeTab, setActiveTab] = React.useState(
    getInitialTabLabel(tabParam) ?? "Study Planner"
  );

  React.useEffect(() => {
    try {
      const storedCategories = safeParseJson(
        window.localStorage.getItem("mytime.categories"),
        null
      );
      if (Array.isArray(storedCategories) && storedCategories.length > 0) {
        setCategories(storedCategories);
      }

      const storedTasks = safeParseJson(
        window.localStorage.getItem("mytime.tasks"),
        []
      );
      if (Array.isArray(storedTasks)) {
        setTasks(storedTasks);
      }

      const storedMoods = safeParseJson(
        window.localStorage.getItem("mytime.moods"),
        []
      );
      if (Array.isArray(storedMoods)) {
        setMoods(storedMoods);
      }

      const storedSession = safeParseJson(
        window.localStorage.getItem("mytime.activeSession"),
        null
      );
      if (storedSession && typeof storedSession === "object") {
        setActiveSession(storedSession);
      }

      const storedBundle = safeParseJson(
        window.localStorage.getItem(AI_BUNDLE_KEY),
        null
      );
      if (storedBundle && typeof storedBundle === "object") {
        setAiBundle((prev) => ({
          ...prev,
          generatedAt: storedBundle.generatedAt ?? prev.generatedAt,
          moodCorrelations: Array.isArray(storedBundle.moodCorrelations)
            ? storedBundle.moodCorrelations
            : prev.moodCorrelations,
          moodSummary:
            typeof storedBundle.moodSummary === "string"
              ? storedBundle.moodSummary
              : prev.moodSummary,
          quickCheck: {
            mood:
              typeof storedBundle?.quickCheck?.mood === "string"
                ? storedBundle.quickCheck.mood
                : prev.quickCheck.mood,
            workBalance:
              typeof storedBundle?.quickCheck?.workBalance === "string"
                ? storedBundle.quickCheck.workBalance
                : typeof storedBundle?.quickCheck?.balance === "string"
                  ? storedBundle.quickCheck.balance
                  : prev.quickCheck.workBalance,
            tip:
              typeof storedBundle?.quickCheck?.tip === "string"
                ? storedBundle.quickCheck.tip
                : prev.quickCheck.tip,
          },
          guidedTips: Array.isArray(storedBundle.guidedTips)
            ? storedBundle.guidedTips
            : prev.guidedTips,
        }));
      }

      const storedBreakdown = safeParseJson(
        window.localStorage.getItem(BREAKDOWN_KEY),
        null
      );
      if (storedBreakdown && typeof storedBreakdown === "object") {
        const maybeSteps = storedBreakdown.steps;
        if (Array.isArray(maybeSteps) && maybeSteps.length > 0) {
          setBreakdownSteps(maybeSteps);
        }

        const maybeCtx = storedBreakdown.context;
        if (maybeCtx && typeof maybeCtx === "object") {
          setBreakdownContext({
            taskName: typeof maybeCtx.taskName === "string" ? maybeCtx.taskName : "",
            taskDate: typeof maybeCtx.taskDate === "string" ? maybeCtx.taskDate : "",
            priority: typeof maybeCtx.priority === "string" ? maybeCtx.priority : "",
          });
        }
      }
    } catch {
      // ignore
    } finally {
      setHasHydrated(true);
      setNowMs(Date.now());
    }
    // Intentionally run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    const nextTab = getInitialTabLabel(tabParam);
    if (nextTab && tabs.includes(nextTab)) {
      setActiveTab(nextTab);
    }
    // Only respond to URL query changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabParam]);

  React.useEffect(() => {
    if (!hasHydrated) return;
    try {
      window.localStorage.setItem(
        "mytime.categories",
        JSON.stringify(categories)
      );
    } catch {
      // ignore
    }
  }, [categories, hasHydrated]);

  React.useEffect(() => {
    if (!hasHydrated) return;
    try {
      window.localStorage.setItem("mytime.tasks", JSON.stringify(tasks));
    } catch {
      // ignore
    }
  }, [tasks, hasHydrated]);

  React.useEffect(() => {
    if (!hasHydrated) return;
    try {
      window.localStorage.setItem("mytime.moods", JSON.stringify(moods));
    } catch {
      // ignore
    }
  }, [moods, hasHydrated]);

  React.useEffect(() => {
    if (!hasHydrated) return;
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
  }, [activeSession, hasHydrated]);

  React.useEffect(() => {
    const id = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  React.useEffect(() => {
    if (!activeSession?.endsAt) return;
    if (nowMs >= activeSession.endsAt) {
      const endedTaskId = activeSession.taskId;
      setTasks((prev) =>
        prev.map((t) =>
          t.id === endedTaskId
            ? { ...t, endedAt: activeSession.endsAt }
            : t
        )
      );
      setActiveSession(null);
    }
  }, [activeSession, nowMs]);

  const latestThree = React.useMemo(() => {
    return [...tasks]
      .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
      .slice(0, 3);
  }, [tasks]);

  const taskCounts = React.useMemo(() => {
    return computeCategoryCounts(categories, tasks);
  }, [categories, tasks]);

  const topCategory = React.useMemo(() => {
    const entries = Object.entries(taskCounts);
    if (entries.length === 0) return "";
    let best = { category: "", count: -1 };
    for (const [categoryName, count] of entries) {
      const n = Number(count) || 0;
      if (n > best.count) best = { category: categoryName, count: n };
    }
    return best.count > 0 ? best.category : (categories[0] ?? "");
  }, [taskCounts, categories]);

  const hasUpcomingAssignment = React.useMemo(() => {
    return tasks.some((t) => {
      if (!t || t.endedAt) return false;
      const startMs = combineDateAndTimeToMs(t.date, t.startTime);
      return startMs != null && nowMs < startMs;
    });
  }, [tasks, nowMs]);

  const nextUpcomingAssignment = React.useMemo(() => {
    let best = null;

    for (const t of tasks) {
      if (!t || t.endedAt) continue;
      const startMs = combineDateAndTimeToMs(t.date, t.startTime);
      if (startMs == null) continue;
      if (nowMs >= startMs) continue;

      if (!best || startMs < best.startMs) {
        best = { startMs, label: String(t.label ?? "").trim() };
      }
    }

    return best?.label || "";
  }, [tasks, nowMs]);

  async function regenerateSuggestions() {
    setIsRegenerating(true);
    setRegenError("");

    try {
      let personalNotes = "";
      try {
        const storedNotes = safeParseJson(
          window.localStorage.getItem("mytime.guidedNotes"),
          null
        );
        if (storedNotes && typeof storedNotes === "object" && typeof storedNotes.text === "string") {
          personalNotes = storedNotes.text;
        }
      } catch {
        // ignore
      }

      const payload = {
        moods,
        topCategory,
        taskCounts,
        hasUpcomingAssignment,
        nextAssignment: nextUpcomingAssignment,
        personalNotes,
      };

      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || "Failed to regenerate suggestions.");
      }

      const nextBundle = {
        generatedAt: data?.generatedAt ?? Date.now(),
        moodCorrelations: Array.isArray(data?.moodCorrelations)
          ? data.moodCorrelations
          : aiBundle.moodCorrelations,
        moodSummary:
          typeof data?.moodSummary === "string"
            ? data.moodSummary
            : aiBundle.moodSummary,
        quickCheck: {
          mood: data?.quickCheck?.mood ?? aiBundle.quickCheck.mood,
          workBalance:
            data?.quickCheck?.workBalance ??
            data?.quickCheck?.balance ??
            aiBundle.quickCheck.workBalance,
          tip: data?.quickCheck?.tip ?? aiBundle.quickCheck.tip,
        },
        guidedTips: Array.isArray(data?.guidedTips) ? data.guidedTips : aiBundle.guidedTips,
      };

      setAiBundle(nextBundle);
      try {
        window.localStorage.setItem(AI_BUNDLE_KEY, JSON.stringify(nextBundle));
      } catch {
        // ignore
      }
    } catch (e) {
      setRegenError(e?.message || "Failed to regenerate suggestions.");
    } finally {
      setIsRegenerating(false);
    }
  }

  async function generateBreakdownSteps() {
    const trimmedName = breakdownTaskName.trim();
    if (!trimmedName) return;

    setIsGeneratingBreakdown(true);
    setBreakdownError("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskName: trimmedName,
          taskDate: breakdownTaskDate.trim(),
          priority: breakdownPriority.trim(),
          contextText: breakdownImportedText,
          contextFileName: breakdownImportedFileName,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || "Failed to generate steps.");
      }

      const nextSteps = Array.isArray(data?.steps) ? data.steps : [];
      const finalSteps = nextSteps.length > 0 ? nextSteps : DEFAULT_BREAKDOWN_STEPS;
      setBreakdownSteps(finalSteps);

      const ctx = {
        taskName: trimmedName,
        taskDate: breakdownTaskDate.trim(),
        priority: breakdownPriority.trim(),
      };
      setBreakdownContext(ctx);

      try {
        window.localStorage.setItem(
          BREAKDOWN_KEY,
          JSON.stringify({ steps: finalSteps, context: ctx })
        );
      } catch {
        // ignore
      }
    } catch (e) {
      setBreakdownError(e?.message || "Failed to generate steps.");
    } finally {
      setIsGeneratingBreakdown(false);
    }
  }

  async function importBreakdownFile(file) {
    if (!file) return;

    setIsImportingBreakdown(true);
    setBreakdownImportError("");

    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/extract", {
        method: "POST",
        body: form,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || "Failed to import file.");
      }

      const text = typeof data?.text === "string" ? data.text : "";
      if (!text.trim()) {
        throw new Error("No text found in the uploaded file.");
      }

      setBreakdownImportedText(text);
      setBreakdownImportedFileName(typeof data?.fileName === "string" ? data.fileName : file.name);
      setBreakdownImportedCharCount(Number(data?.charCount) || text.length);
    } catch (e) {
      setBreakdownImportError(e?.message || "Failed to import file.");
      setBreakdownImportedText("");
      setBreakdownImportedFileName("");
      setBreakdownImportedCharCount(0);
    } finally {
      setIsImportingBreakdown(false);
    }
  }

  function recordMoodEntry({ mood, note }) {
    const now = Date.now();
    const parts = new Date(now).toDateString().split(" ");
    const dateLabel = `${parts[0]} ${parts[1]} ${parts[2]}`;
    const entry = {
      id: getId(),
      createdAt: now,
      date: dateLabel,
      mood,
      note: String(note ?? "").trim(),
    };
    setMoods((prev) => [entry, ...prev]);
  }

  function deleteMoodEntry(id) {
    setMoods((prev) => prev.filter((e) => e.id !== id));
  }

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

  function deleteCategory(name) {
    const trimmed = String(name ?? "").trim();
    if (!trimmed) return;

    setCategories((prev) => {
      if (prev.length <= 1) return prev;

      const remaining = prev.filter(
        (c) => c.toLowerCase() !== trimmed.toLowerCase()
      );

      if (remaining.length === prev.length) return prev;
      if (remaining.length === 0) return prev;

      const fallback = remaining[0];
      setTasks((taskPrev) =>
        taskPrev.map((t) =>
          t.category && t.category.toLowerCase() === trimmed.toLowerCase()
            ? { ...t, category: fallback }
            : t
        )
      );

      return remaining;
    });
  }

  function persistAiBundle(next) {
    try {
      window.localStorage.setItem(AI_BUNDLE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }

  function getCurrentBreakdownSteps() {
    const current = Array.isArray(breakdownSteps) ? breakdownSteps : [];
    return current.length > 0 ? current : DEFAULT_BREAKDOWN_STEPS;
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
        endedAt: null,
        createdAt: Date.now(),
      },
      ...prev,
    ]);
  }

  function editBreakdownStep(stepIndex, nextText) {
    const idx = Number(stepIndex);
    if (!Number.isFinite(idx)) return;

    setBreakdownSteps((prev) => {
      const currentRaw = Array.isArray(prev) ? prev : [];
      const base = currentRaw.length > 0 ? currentRaw : DEFAULT_BREAKDOWN_STEPS;
      if (idx < 0 || idx >= base.length) return prev;
      const nextSteps = base.map((s, i) => (i === idx ? nextText : s));
      try {
        window.localStorage.setItem(
          BREAKDOWN_KEY,
          JSON.stringify({ steps: nextSteps, context: breakdownContext })
        );
      } catch {
        // ignore
      }
      return nextSteps;
    });
  }

  function deleteBreakdownStep(stepIndex) {
    const idx = Number(stepIndex);
    if (!Number.isFinite(idx)) return;

    setBreakdownSteps((prev) => {
      const currentRaw = Array.isArray(prev) ? prev : [];
      const base = currentRaw.length > 0 ? currentRaw : DEFAULT_BREAKDOWN_STEPS;
      if (idx < 0 || idx >= base.length) return prev;
      const nextSteps = base.filter((_, i) => i !== idx);
      try {
        window.localStorage.setItem(
          BREAKDOWN_KEY,
          JSON.stringify({ steps: nextSteps, context: breakdownContext })
        );
      } catch {
        // ignore
      }
      return nextSteps;
    });
  }

  function assignBreakdownStepToPlanner(stepIndex) {
    const idx = Number(stepIndex);
    if (!Number.isFinite(idx)) return;

    const steps = getCurrentBreakdownSteps();
    const stepText = steps[idx];
    if (!stepText) return;

    const minutes = parseStepMinutes(stepText);
    const startTime = "09:00";
    const endTime = addMinutesToTimeHHMM(startTime, minutes);

    const snapshotTaskDate =
      String(breakdownContext?.taskDate ?? "").trim() ||
      String(breakdownTaskDate ?? "").trim();
    const snapshotTaskName =
      String(breakdownContext?.taskName ?? "").trim() ||
      String(breakdownTaskName ?? "").trim();

    const todayIso = formatIsoDate(new Date());
    const due = parseIsoDate(snapshotTaskDate);
    // Assign directly on the assignment completion date (Task Date).
    const scheduledIso = due ? snapshotTaskDate : todayIso;

    const category = categories.includes("Study")
      ? "Study"
      : (categories[0] ?? "Study");

    const labelPrefix = snapshotTaskName ? `${snapshotTaskName}: ` : "";

    createTask({
      category,
      label: `${labelPrefix}${String(stepText).trim()}`,
      description: "",
      date: scheduledIso,
      startTime,
      endTime,
    });
  }

  function removeTask(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setActiveSession((prev) => (prev?.taskId === id ? null : prev));
  }

  function updateTask(id, patch) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...patch } : t))
    );
  }

  function startSession(taskId) {
    if (activeSession && activeSession.taskId !== taskId) return;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    if (task.endedAt) return;

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
    const endedTaskId = activeSession?.taskId;
    if (endedTaskId) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === endedTaskId
            ? { ...t, endedAt: Date.now() }
            : t
        )
      );
    }
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
          <SidebarNavWithFooter
            footer={
              <div className="space-y-2">
                <button
                  type="button"
                  className={
                    "w-full rounded border border-zinc-400 bg-white px-3 py-2 text-sm font-medium " +
                    (isRegenerating ? "text-zinc-400" : "text-zinc-800")
                  }
                  onClick={regenerateSuggestions}
                  disabled={isRegenerating}
                  aria-disabled={isRegenerating}
                >
                  {isRegenerating ? "Regenerating…" : "Regenerate Suggestions"}
                </button>
                {regenError ? (
                  <div className="text-xs text-zinc-700">{regenError}</div>
                ) : null}
              </div>
            }
          />

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
                        const statusLabel = t.endedAt
                          ? "ENDED"
                          : plannedStartMs != null && nowMs < plannedStartMs
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
                            {` - [${statusLabel}]`}
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
                    {aiReady ? (
                      <>
                        <p>
                          <span className="font-semibold">Mood:</span> {aiBundle.quickCheck.mood}
                        </p>
                        <p className="mt-2">
                          <span className="font-semibold">Work Balance:</span> {aiBundle.quickCheck.workBalance}
                        </p>
                        <p className="mt-2">
                          <span className="font-semibold">Tip:</span> {aiBundle.quickCheck.tip}
                        </p>
                      </>
                    ) : (
                      <div className="text-zinc-700">{AI_PLACEHOLDER_TEXT}</div>
                    )}
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
                      onUpdateTask={updateTask}
                      onAddCategory={addCategory}
                      onDeleteCategory={deleteCategory}
                      onStartSession={startSession}
                      onEndSession={endSession}
                    />
                  ) : null}
                  {activeTab === "Breakdown Wizard" ? (
                    <BreakdownWizardTab
                      taskName={breakdownTaskName}
                      taskDate={breakdownTaskDate}
                      priority={breakdownPriority}
                      onChangeTaskName={setBreakdownTaskName}
                      onChangeTaskDate={setBreakdownTaskDate}
                      onChangePriority={setBreakdownPriority}
                      steps={breakdownSteps}
                      showGenerateHint={false}
                      onGenerate={generateBreakdownSteps}
                      isGenerating={isGeneratingBreakdown}
                      generateError={breakdownError}
                      onImportFile={importBreakdownFile}
                      importedFileName={breakdownImportedFileName}
                      importedCharCount={breakdownImportedCharCount}
                      isImporting={isImportingBreakdown}
                      importError={breakdownImportError}
                      onEditStep={editBreakdownStep}
                      onDeleteStep={deleteBreakdownStep}
                      onAssignStep={assignBreakdownStepToPlanner}
                    />
                  ) : null}
                  {activeTab === "Mood Tracker" ? (
                    <MoodTrackerTab
                      timeline={moods}
                      correlations={aiBundle.moodCorrelations}
                      aiReady={aiReady}
                      onRecordMood={recordMoodEntry}
                      onDeleteMoodEntry={deleteMoodEntry}
                    />
                  ) : null}
                  {activeTab === "Guided Notes" ? (
                    <GuidedNotesTab
                      quickCheck={aiBundle.quickCheck}
                      nextAssignment={nextUpcomingAssignment}
                      guidedTips={aiBundle.guidedTips}
                      aiReady={aiReady}
                    />
                  ) : null}
                  {activeTab !== "Study Planner" &&
                    activeTab !== "Breakdown Wizard" &&
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

export default function DashboardPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen w-full bg-white p-10 text-sm text-zinc-700">
          Loading…
        </div>
      }
    >
      <DashboardPageInner />
    </React.Suspense>
  );
}
