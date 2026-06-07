"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useProgress } from "@/lib/progress/provider";
import { useAuth } from "@/lib/auth/provider";
import { deleteCloudProgress, pushCloudProgress } from "@/lib/progress/sync";
import { saveProgress, validateImportedProgress } from "@/lib/progress/store";
import type { ProgressStore } from "@/lib/progress/types";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export function SettingsPanel() {
  const { hydrated, store, setTrainerMode, setProfile, reset } = useProgress();
  const { hydrated: authReady, user, signOut } = useAuth();
  const [nameDraft, setNameDraft] = useState("");
  const [emailDraft, setEmailDraft] = useState("");
  const [resetStage, setResetStage] = useState<"idle" | "confirming">("idle");
  const [deleteStage, setDeleteStage] = useState<
    "idle" | "confirming" | "deleting"
  >("idle");
  const [deleteError, setDeleteError] = useState<string>("");
  const [importStage, setImportStage] = useState<
    "idle" | "confirming" | "importing"
  >("idle");
  const [importPreview, setImportPreview] = useState<ProgressStore | null>(
    null,
  );
  const [importError, setImportError] = useState<string>("");

  useEffect(() => {
    if (!hydrated) return;
    setNameDraft(store.settings.profileName ?? "");
    setEmailDraft(store.settings.profileEmail ?? "");
  }, [hydrated, store.settings.profileName, store.settings.profileEmail]);

  function saveProfile() {
    setProfile({ name: nameDraft.trim(), email: emailDraft.trim() });
  }

  function confirmReset() {
    reset();
    setResetStage("idle");
    // Hard navigation so the chrome re-evaluates onboardingComplete from a
    // freshly cleared store and routes the user back through onboarding.
    // router.push would leave React state in flight and can race hydration.
    if (typeof window !== "undefined") {
      window.location.assign("/");
    }
  }

  function downloadJsonBackup() {
    try {
      const blob = new Blob([JSON.stringify(store, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const dateStr = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `alpine-map-training-backup-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // Slight delay before revoking so older Safari versions can finish
      // the download. The exact value is not load-bearing.
      setTimeout(() => URL.revokeObjectURL(url), 500);
    } catch (err) {
      console.warn("[backup] export failed", err);
    }
  }

  async function onImportFile(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0];
    // Always reset the input so the same file can be picked again after
    // a cancelled flow.
    ev.target.value = "";
    if (!file) return;
    setImportError("");
    setImportPreview(null);
    try {
      const text = await file.text();
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        setImportError("File is not valid JSON.");
        return;
      }
      const result = validateImportedProgress(parsed);
      if (!result.ok) {
        setImportError(result.reason);
        return;
      }
      setImportPreview(result.store);
      setImportStage("confirming");
    } catch {
      setImportError("Could not read the selected file.");
    }
  }

  async function confirmImport() {
    if (!importPreview) return;
    setImportStage("importing");
    try {
      saveProgress(importPreview);
      // If signed in, mirror the import up to cloud BEFORE we reload.
      // Without this step, the next page load's initial sync would see
      // the old cloud row, decide "cloud has data, adopt it locally",
      // and silently discard the import. Pushing first makes cloud and
      // local agree, so cloud-wins is a no-op on reload.
      if (user) {
        const ok = await pushCloudProgress(user.id, importPreview);
        if (!ok) {
          setImportError(
            "Imported locally but could not sync to cloud. Sign out, sign back in, and the import will be pushed up on the next change.",
          );
          // Still reload — the local copy is correct.
        }
      }
    } catch {
      setImportError("Could not write to local storage.");
      setImportStage("confirming");
      return;
    }
    // Hard reload so the provider re-hydrates cleanly from the new
    // localStorage value.
    if (typeof window !== "undefined") {
      window.location.assign("/");
    }
  }

  function cancelImport() {
    setImportStage("idle");
    setImportPreview(null);
    setImportError("");
  }

  async function confirmDeleteCloud() {
    if (!user) return;
    setDeleteStage("deleting");
    setDeleteError("");
    const ok = await deleteCloudProgress(user.id);
    if (!ok) {
      setDeleteError(
        "Could not delete your synced progress. Please try again, or contact Hello@performos.ai if the problem persists.",
      );
      setDeleteStage("confirming");
      return;
    }
    // Also wipe local so the next sign-in starts from a clean slate.
    reset();
    setDeleteStage("idle");
    if (typeof window !== "undefined") {
      window.location.assign("/");
    }
  }

  if (!hydrated) {
    return (
      <div className="px-[22px] py-8 md:px-14">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-3">
          Loading settings…
        </p>
      </div>
    );
  }

  const trainerOn = store.settings.trainerMode;
  const totalKB = (() => {
    try {
      return (
        (window.localStorage.getItem("alpine-map-training:progress")?.length ?? 0) /
        1024
      ).toFixed(1);
    } catch {
      return "—";
    }
  })();

  const profileName = store.settings.profileName ?? "";
  const profileEmail = store.settings.profileEmail ?? "";
  const dirty =
    nameDraft.trim() !== profileName.trim() ||
    emailDraft.trim() !== profileEmail.trim();

  const authAvailable = isSupabaseConfigured();

  return (
    <div className="px-[22px] pb-12 pt-5 md:px-14 md:pt-8">
      {/* ===== Account ===== Hidden when auth is not configured. */}
      {authAvailable ? (
      <Section
        heading="Account"
        meta={user ? "Signed in" : "Local only"}
      >
        {!authReady ? (
          <SetRow
            label="Loading…"
            help="Checking sign-in state."
            control={null}
          />
        ) : !user ? (
          <>
            <SetRow
              label="Cross-device sync"
              help="Sign in with your email to mirror your progress between this device and any other you use. No password needed; a magic link is emailed to you. Stay local-only if you prefer; the app works either way."
              control={
                <Link href="/login" className="btn red sm">
                  Sign in to sync
                </Link>
              }
            />
            <SetRow
              label="Privacy"
              help="What we store and where."
              control={
                <Link
                  href="/privacy"
                  className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-3 no-underline hover:text-ink"
                >
                  Read notice
                </Link>
              }
            />
          </>
        ) : (
          <>
            <SetRow
              label="Signed in as"
              help="Magic-link sign-in via Supabase. Your progress is mirrored to a Postgres row keyed by this email."
              control={
                <span
                  className="max-w-[220px] truncate font-mono text-[12px] font-semibold text-ink"
                  title={user.email ?? undefined}
                >
                  {user.email ?? "Account"}
                </span>
              }
            />
            <SetRow
              label="Sign out"
              help="Ends this session on this device. Your synced progress stays on your account; sign back in any time to pick it up."
              control={
                <button
                  type="button"
                  onClick={() => {
                    void signOut();
                  }}
                  className="inline-flex items-center rounded-[2px] border border-rule bg-paper-2 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-2 hover:border-ink hover:text-ink"
                >
                  Sign out
                </button>
              }
            />
            {deleteStage === "idle" ? (
              <SetRow
                label="Delete my synced progress"
                help="Permanently removes the row holding your progress on our servers and clears it from this device. To also delete your account (the email record), email Hello@performos.ai."
                control={
                  <button
                    type="button"
                    onClick={() => setDeleteStage("confirming")}
                    className="inline-flex items-center rounded-[2px] border border-rule bg-paper-2 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-2 hover:border-ink hover:text-ink"
                  >
                    Delete…
                  </button>
                }
              />
            ) : (
              <div
                role="alertdialog"
                aria-labelledby="delete-cloud-confirm-heading"
                className="border-t border-rule py-4 first:border-t-0"
              >
                <p
                  id="delete-cloud-confirm-heading"
                  className="font-display text-[14px] font-bold tracking-[-0.005em] text-ink md:text-[15px]"
                >
                  Delete all synced progress?
                </p>
                <p className="mt-1 max-w-[58ch] text-[12px] leading-[1.5] text-ink-2 md:text-[13px]">
                  This permanently removes your synced row on our servers
                  and wipes the local copy on this device. Cannot be undone.
                  Export your progress first if you want to keep a copy.
                </p>
                {deleteError ? (
                  <p className="mt-2 text-[12px] leading-[1.5] text-red">
                    {deleteError}
                  </p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteStage("idle");
                      setDeleteError("");
                    }}
                    className="inline-flex items-center rounded-[2px] border border-rule bg-paper-2 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-2 hover:border-ink hover:text-ink"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmDeleteCloud}
                    disabled={deleteStage === "deleting"}
                    className="btn red sm"
                  >
                    {deleteStage === "deleting"
                      ? "Deleting…"
                      : "Yes, delete everything"}
                  </button>
                </div>
              </div>
            )}
            <SetRow
              label="Privacy"
              help="What we store and where."
              control={
                <Link
                  href="/privacy"
                  className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-3 no-underline hover:text-ink"
                >
                  Read notice
                </Link>
              }
            />
          </>
        )}
      </Section>
      ) : null}

      {/* ===== Identity ===== */}
      <Section heading="Identity" meta="On this device">
        <SetRow
          label="Name"
          help="Shown on any progress export you create."
          control={
            <input
              type="text"
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
              className="w-[180px] rounded-[2px] border border-rule bg-paper px-2.5 py-1.5 text-right font-display text-[13px] font-bold text-ink outline-none placeholder:font-sans placeholder:font-normal placeholder:text-ink-4 focus:border-ink"
            />
          }
        />
        <SetRow
          label="Email"
          help="Only used when you choose to email an export to a trainer."
          control={
            <input
              type="email"
              value={emailDraft}
              onChange={(e) => setEmailDraft(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="w-[220px] rounded-[2px] border border-rule bg-paper px-2.5 py-1.5 text-right font-mono text-[12px] text-ink outline-none placeholder:text-ink-4 focus:border-ink"
            />
          }
        />
        {resetStage === "idle" ? (
          <SetRow
            label="Start fresh / new user"
            help="Wipes all local progress on this device and re-runs onboarding. Use when switching to a different candidate, or to demo onboarding. Export your progress first from the Progress page if you want to keep a copy."
            control={
              <button
                type="button"
                onClick={() => setResetStage("confirming")}
                className="inline-flex items-center rounded-[2px] border border-rule bg-paper-2 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-2 hover:border-ink hover:text-ink"
              >
                Start fresh…
              </button>
            }
          />
        ) : (
          <div
            role="alertdialog"
            aria-labelledby="reset-confirm-heading"
            className="border-t border-rule py-4 first:border-t-0"
          >
            <p
              id="reset-confirm-heading"
              className="font-display text-[14px] font-bold tracking-[-0.005em] text-ink md:text-[15px]"
            >
              Wipe all local progress?
            </p>
            <p className="mt-1 max-w-[58ch] text-[12px] leading-[1.5] text-ink-2 md:text-[13px]">
              This clears your name, email, page progress, quiz responses,
              free-text answers, flashcard schedules, readiness checks, and
              trainer settings on this device. It cannot be undone. Export
              your progress first if you want to keep a copy.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setResetStage("idle")}
                className="inline-flex items-center rounded-[2px] border border-rule bg-paper-2 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-2 hover:border-ink hover:text-ink"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmReset}
                className="btn red sm"
              >
                Yes, wipe and restart
              </button>
            </div>
          </div>
        )}
        {dirty ? (
          <div className="border-t border-rule py-3">
            <button
              type="button"
              onClick={saveProfile}
              className="btn red sm"
            >
              Save profile
            </button>
          </div>
        ) : null}
      </Section>

      {/* ===== Mode ===== */}
      <Section heading="Mode" meta="Personal preference">
        <SetRow
          label="Trainer mode"
          help="Auto-expands every page's answer key, surfaces the matching trainer-notes bundle inline, and shows a red 'Trainer' tag in the top bar so you can't forget you're in it."
          control={
            <ToggleSwitch
              checked={trainerOn}
              onChange={(v) => setTrainerMode(v)}
              label="Trainer mode"
            />
          }
        />
        <SetRow
          label="Status"
          help="Whether trainer mode is currently on."
          control={
            <span
              className={"tag " + (trainerOn ? "red" : "")}
              style={trainerOn ? undefined : { color: "var(--ink-3)" }}
            >
              {trainerOn ? (
                <>
                  <span className="dot" /> On
                </>
              ) : (
                "Off"
              )}
            </span>
          }
        />
      </Section>

      {/* ===== Storage ===== */}
      <Section heading="Storage" meta="On-device only">
        <SetRow
          label="Local progress"
          help={
            <>
              All progress, quiz responses, settings, and flashcard schedules
              are stored only in this browser. Reset is on the{" "}
              <a
                href="/progress"
                className="text-red underline underline-offset-4 hover:text-ink"
              >
                progress page
              </a>
              .
            </>
          }
          control={
            <span className="font-mono text-[12px] font-semibold text-ink">
              ~{totalKB} KB
            </span>
          }
        />
        <SetRow
          label="Last updated"
          help="Most recent write to local storage."
          control={
            <span className="font-mono text-[11px] text-ink-3">
              {store.lastUpdated
                ? new Date(store.lastUpdated).toLocaleString()
                : "—"}
            </span>
          }
        />
      </Section>

      {/* ===== Backup and restore ===== */}
      <Section heading="Backup and restore" meta="From file">
        {importStage === "idle" || importStage === "importing" ? (
          <>
            <SetRow
              label="Download a backup file"
              help="Saves your current progress to a JSON file on this device. Take a copy before a major upgrade, before switching browsers, or any time you want a snapshot."
              control={
                <button
                  type="button"
                  onClick={downloadJsonBackup}
                  className="inline-flex items-center rounded-[2px] border border-rule bg-paper-2 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-2 hover:border-ink hover:text-ink"
                >
                  Download…
                </button>
              }
            />
            <SetRow
              label="Restore from a backup file"
              help="Imports a previously-saved progress JSON and replaces the current local copy. Your existing local progress will be replaced; if you are signed in, the cloud copy is replaced too."
              control={
                <label className="inline-flex cursor-pointer items-center rounded-[2px] border border-rule bg-paper-2 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-2 hover:border-ink hover:text-ink">
                  Choose file…
                  <input
                    type="file"
                    accept="application/json,.json,.txt"
                    onChange={onImportFile}
                    className="sr-only"
                  />
                </label>
              }
            />
            {importError ? (
              <div className="border-t border-rule py-3">
                <p className="text-[12px] leading-[1.5] text-red">
                  {importError}
                </p>
              </div>
            ) : null}
          </>
        ) : (
          <div
            role="alertdialog"
            aria-labelledby="import-confirm-heading"
            className="py-4"
          >
            <p
              id="import-confirm-heading"
              className="font-display text-[14px] font-bold tracking-[-0.005em] text-ink md:text-[15px]"
            >
              Restore from this backup?
            </p>
            {importPreview ? (
              <ImportPreviewSummary store={importPreview} />
            ) : null}
            {user ? (
              <p className="mt-3 max-w-[58ch] text-[12px] leading-[1.5] text-ink-2">
                You are signed in. Restoring replaces both the local copy
                on this device AND the synced copy in your account.
              </p>
            ) : (
              <p className="mt-3 max-w-[58ch] text-[12px] leading-[1.5] text-ink-2">
                You are not signed in. The restore only affects this
                device.
              </p>
            )}
            {importError ? (
              <p className="mt-2 text-[12px] leading-[1.5] text-red">
                {importError}
              </p>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={cancelImport}
                disabled={importStage === "importing"}
                className="inline-flex items-center rounded-[2px] border border-rule bg-paper-2 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-2 hover:border-ink hover:text-ink disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void confirmImport()}
                disabled={importStage === "importing"}
                className="btn red sm"
              >
                {importStage === "importing"
                  ? "Restoring…"
                  : "Yes, replace my progress"}
              </button>
            </div>
          </div>
        )}
      </Section>

      {/* ===== About ===== */}
      <Section heading="About" meta="Build">
        <SetRow
          label="Version"
          help="Glacier Lab visual direction (v2.0)."
          control={
            <span className="font-mono text-[12px] font-semibold text-ink">
              v2.0
            </span>
          }
        />
        <SetRow
          label="Workbook"
          help="Editions 1-3 (BASI Alpine Level 4 ISTD)."
          control={
            <span className="font-mono text-[11px] text-ink-3">L1-L3</span>
          }
        />
        <SetRow
          label="Offline"
          help="Installable as a Progressive Web App; works without a connection once installed."
          control={<span className="tag moss">Yes</span>}
        />
        <SetRow
          label="Built by"
          help="Designed and built by PerformOS."
          control={
            <a
              href="https://www.performos.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-red no-underline hover:text-ink"
            >
              performos.ai →
            </a>
          }
        />
      </Section>

      {/* ===== Get in touch ===== */}
      <Section heading="Get in touch" meta="Direct contact">
        <SetRow
          label="Web"
          help="Company site."
          control={
            <a
              href="https://www.performos.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[12px] font-semibold text-ink hover:text-red"
            >
              performos.ai
            </a>
          }
        />
        <SetRow
          label="Email"
          help="Questions, suggestions, or bug reports."
          control={
            <a
              href="mailto:Hello@performos.ai"
              className="font-mono text-[12px] font-semibold text-ink hover:text-red"
            >
              Hello@performos.ai
            </a>
          }
        />
      </Section>
    </div>
  );
}


/* ---------- subcomponents ---------- */

function Section({
  heading,
  meta,
  children,
}: {
  heading: string;
  meta?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6 border border-rule bg-paper-3 md:mb-8">
      <div className="flex items-center justify-between gap-3 border-b border-rule px-5 py-3.5 md:px-6">
        <h3 className="font-display text-[16px] font-extrabold tracking-[-0.012em] text-ink md:text-[18px]">
          {heading}
        </h3>
        {meta ? (
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">
            {meta}
          </span>
        ) : null}
      </div>
      <div className="px-5 md:px-6">{children}</div>
    </section>
  );
}

function SetRow({
  label,
  help,
  control,
}: {
  label: string;
  help?: React.ReactNode;
  control: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-t border-rule py-4 first:border-t-0">
      <div className="min-w-0 flex-1">
        <p className="font-display text-[14px] font-bold tracking-[-0.005em] text-ink md:text-[15px]">
          {label}
        </p>
        {help ? (
          <p className="mt-1 text-[12px] leading-[1.5] text-ink-2 md:text-[13px]">
            {help}
          </p>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center pt-0.5">{control}</div>
    </div>
  );
}

function ImportPreviewSummary({ store }: { store: ProgressStore }) {
  const pageCount = Object.keys(store.pages ?? {}).length;
  const completedPages = Object.values(store.pages ?? {}).filter(
    (p) => p.status === "completed",
  ).length;
  const quizCount = Object.keys(store.quizzes ?? {}).length;
  const flashcardCount = Object.keys(store.flashcards ?? {}).length;
  const lastUpdated = store.lastUpdated
    ? new Date(store.lastUpdated).toLocaleString()
    : "—";
  return (
    <dl className="mt-2 grid max-w-[58ch] grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-[12px] leading-[1.5] text-ink-2 md:text-[13px]">
      <dt className="font-mono text-ink-3">Pages</dt>
      <dd>
        {pageCount} tracked, {completedPages} completed
      </dd>
      <dt className="font-mono text-ink-3">Quizzes</dt>
      <dd>{quizCount}</dd>
      <dt className="font-mono text-ink-3">Flashcards</dt>
      <dd>{flashcardCount} schedules</dd>
      <dt className="font-mono text-ink-3">Saved at</dt>
      <dd>{lastUpdated}</dd>
      <dt className="font-mono text-ink-3">Backup version</dt>
      <dd>v{store.version}</dd>
    </dl>
  );
}

function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="relative inline-flex shrink-0 cursor-pointer items-center">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
        aria-label={label}
      />
      <span
        aria-hidden
        className={
          "block h-6 w-11 rounded-full transition-colors " +
          (checked ? "bg-red" : "border border-rule bg-paper-2")
        }
      />
      <span
        aria-hidden
        className={
          "absolute top-[2px] left-[2px] h-5 w-5 rounded-full bg-paper-3 transition-transform " +
          (checked ? "translate-x-5 shadow-sm" : "translate-x-0 border border-rule")
        }
      />
    </label>
  );
}
