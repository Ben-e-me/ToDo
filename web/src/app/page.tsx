"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, ArrowUp, ArrowDown, History, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Task = {
  id: string;
  title: string;
  createdAt: string;
  completedAt?: string;
  isCompleted: boolean;
};

type StoredTasks = {
  tasks: Task[];
};

const STORAGE_KEY = "todo-studio-tasks-v1";

function loadTasks(): Task[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredTasks;
    if (!Array.isArray(parsed.tasks)) return [];
    return parsed.tasks;
  } catch {
    return [];
  }
}

function saveTasks(tasks: Task[]) {
  if (typeof window === "undefined") return;
  const payload: StoredTasks = { tasks };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function createTask(title: string): Task {
  const now = new Date().toISOString();
  return {
    id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
    title: title.trim(),
    createdAt: now,
    isCompleted: false
  };
}

export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState("");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setTasks(loadTasks());
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    saveTasks(tasks);
  }, [tasks, isHydrated]);

  const activeTasks = useMemo(
    () => tasks.filter((t) => !t.isCompleted),
    [tasks]
  );

  const completedTasks = useMemo(
    () =>
      tasks
        .filter((t) => t.isCompleted && !!t.completedAt)
        .sort((a, b) => (a.completedAt! < b.completedAt! ? 1 : -1)),
    [tasks]
  );

  function handleAddTask() {
    if (!input.trim()) return;
    setTasks((prev) => [createTask(input), ...prev]);
    setInput("");
  }

  function handleToggleTask(id: string) {
    const now = new Date().toISOString();
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              isCompleted: !task.isCompleted,
              completedAt: task.isCompleted ? undefined : now
            }
          : task
      )
    );
  }

  function handleMoveTask(id: string, direction: "up" | "down") {
    setTasks((prev) => {
      const idx = prev.findIndex((t) => t.id === id);
      if (idx === -1) return prev;

      const isCompleted = prev[idx].isCompleted;
      const group = prev.filter((t) => t.isCompleted === isCompleted);
      const groupIds = group.map((t) => t.id);
      const groupIndex = groupIds.indexOf(id);
      if (groupIndex === -1) return prev;

      const targetIndex =
        direction === "up" ? groupIndex - 1 : groupIndex + 1;
      if (targetIndex < 0 || targetIndex >= group.length) return prev;

      const newGroup = [...group];
      const [removed] = newGroup.splice(groupIndex, 1);
      newGroup.splice(targetIndex, 0, removed);

      const next: Task[] = [];
      for (const task of prev) {
        if (task.isCompleted !== isCompleted) {
          next.push(task);
        } else {
          const replacement = newGroup.shift();
          if (replacement) next.push(replacement);
        }
      }
      return next;
    });
  }

  function formatTime(iso: string | undefined) {
    if (!iso) return "";
    const date = new Date(iso);
    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTask();
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="container max-w-5xl">
        <div className="mb-8 flex flex-col gap-3 text-center sm:mb-10">
          <span className="inline-flex items-center justify-center gap-2 self-center rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
            <CheckCircle2 className="h-3.5 w-3.5 text-sky-400" />
            Task Studio
          </span>
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
            A calm, tactile to-do list for your day
          </h1>
          <p className="mx-auto max-w-xl text-sm text-slate-400 sm:text-base">
            Capture tasks, check them off with satisfying feedback, and keep a
            lightweight history so you can see where your time went.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:gap-6">
          <Card className="border-slate-800/80 bg-slate-950/70">
            <CardHeader>
              <CardTitle>Your tasks</CardTitle>
              <CardDescription>
                Add, reorder, and complete tasks. Everything stays on this
                device.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3 rounded-lg border border-slate-800 bg-slate-900/70 p-2.5 shadow-inner sm:flex-row sm:items-center sm:gap-2.5">
                <Input
                  placeholder="Add a task, e.g. “Review design spec”"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                />
                <Button
                  type="button"
                  className="mt-2 w-full sm:mt-0 sm:w-auto"
                  onClick={handleAddTask}
                  disabled={!input.trim()}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add
                </Button>
              </div>

              <section className="space-y-2">
                <div className="flex items-center justify-between text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                  <span>Today</span>
                  <span>{activeTasks.length} open</span>
                </div>
                <div className="space-y-1">
                  {activeTasks.length === 0 && (
                    <div className="flex items-center justify-between rounded-lg border border-dashed border-slate-800 bg-slate-950/40 px-3 py-3 text-xs text-slate-500">
                      <span>Nothing queued. Add what you need to focus on.</span>
                    </div>
                  )}
                  {activeTasks.map((task, index) => {
                    const canMoveUp = index > 0;
                    const canMoveDown = index < activeTasks.length - 1;
                    return (
                      <article
                        key={task.id}
                        className="group flex items-center gap-3 rounded-lg border border-slate-800/90 bg-slate-950/80 px-3 py-2.5 text-sm shadow-sm transition hover:border-sky-500/80 hover:bg-slate-900/80"
                      >
                        <button
                          type="button"
                          onClick={() => handleToggleTask(task.id)}
                          className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-sky-400 transition group-hover:border-sky-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                          aria-label="Mark task complete"
                        >
                          <span className="h-2.5 w-2.5 rounded-full bg-sky-400/90" />
                        </button>
                        <div className="flex-1 text-left">
                          <p className="text-[13px] font-medium text-slate-50">
                            {task.title}
                          </p>
                          <p className="mt-0.5 text-[11px] text-slate-500">
                            Added at {formatTime(task.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => handleMoveTask(task.id, "up")}
                            disabled={!canMoveUp}
                            aria-label="Move task up"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => handleMoveTask(task.id, "down")}
                            disabled={!canMoveDown}
                            aria-label="Move task down"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>

              {completedTasks.length > 0 && (
                <section className="space-y-2 border-t border-slate-800 pt-3">
                  <div className="flex items-center justify-between text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <History className="h-3 w-3" />
                      Completed today
                    </span>
                    <span>{completedTasks.length} done</span>
                  </div>
                  <div className="space-y-1">
                    {completedTasks.slice(0, 4).map((task, index) => {
                      const canMoveUp = index > 0;
                      const canMoveDown =
                        index < completedTasks.length - 1;
                      return (
                        <article
                          key={task.id}
                          className="group flex items-center gap-3 rounded-lg border border-slate-900 bg-slate-950/60 px-3 py-2.5 text-sm shadow-inner"
                        >
                          <Checkbox
                            checked={task.isCompleted}
                            onChange={() => handleToggleTask(task.id)}
                            className="border-slate-700 bg-slate-950 data-[state=checked]:bg-emerald-500"
                            aria-label="Mark task active again"
                          />
                          <div className="flex-1 text-left">
                            <p className="text-[13px] font-medium text-slate-300 line-through decoration-slate-500/70">
                              {task.title}
                            </p>
                            <p className="mt-0.5 text-[11px] text-slate-500">
                              Completed at {formatTime(task.completedAt)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() => handleMoveTask(task.id, "up")}
                              disabled={!canMoveUp}
                              aria-label="Move task up in history"
                            >
                              <ArrowUp className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() => handleMoveTask(task.id, "down")}
                              disabled={!canMoveDown}
                              aria-label="Move task down in history"
                            >
                              <ArrowDown className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-800/80 bg-slate-950/50">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>History</span>
                <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-slate-400">
                  {tasks.length} total
                </span>
              </CardTitle>
              <CardDescription>
                A log of everything you have completed so you can glance back
                at your day.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex max-h-[380px] flex-col gap-2 overflow-y-auto pr-1 text-sm">
                {tasks.length === 0 && (
                  <div className="rounded-lg border border-dashed border-slate-800 bg-slate-950/40 px-3 py-3 text-xs text-slate-500">
                    As you create and complete tasks, they will appear here.
                  </div>
                )}
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className={cn(
                      "flex items-start justify-between gap-2 rounded-md border px-3 py-2 text-xs transition",
                      task.isCompleted
                        ? "border-emerald-500/30 bg-emerald-500/5"
                        : "border-slate-800 bg-slate-950/50"
                    )}
                  >
                    <div className="flex flex-1 flex-col gap-0.5">
                      <p
                        className={cn(
                          "font-medium",
                          task.isCompleted
                            ? "text-emerald-200"
                            : "text-slate-200"
                        )}
                      >
                        {task.title}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Created at {formatTime(task.createdAt)}
                        {task.completedAt && (
                          <>
                            {" • "}Completed at {formatTime(task.completedAt)}
                          </>
                        )}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "mt-0.5 inline-flex h-5 items-center rounded-full px-2 text-[11px] font-medium",
                        task.isCompleted
                          ? "bg-emerald-500/10 text-emerald-300"
                          : "bg-slate-900 text-slate-400"
                      )}
                    >
                      {task.isCompleted ? "Done" : "Active"}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

