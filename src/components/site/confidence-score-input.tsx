"use client";

import { useProgress } from "@/lib/progress/provider";

interface SkillArea {
  id: string;
  label: string;
}

interface ConfidenceScoreInputProps {
  scopeKey: string; // e.g. "L2.C7.1"
  skillAreas: SkillArea[];
}

const VALUES = [1, 2, 3, 4, 5];

export function ConfidenceScoreInput({
  scopeKey,
  skillAreas,
}: ConfidenceScoreInputProps) {
  const { hydrated, store, setConfidence } = useProgress();

  if (!hydrated) {
    return (
      <p className="font-sans text-sm text-muted-foreground">
        Loading confidence ratings…
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="font-sans text-sm text-muted-foreground">
        Rate yourself 1 (not at all confident) to 5 (fully confident) for each
        skill. Stored on this device.
      </p>
      <ul className="space-y-2">
        {skillAreas.map((area) => {
          const key = `${scopeKey}.${area.id}`;
          const current = store.confidenceScores[key]?.value ?? null;
          return (
            <li
              key={area.id}
              className="rounded-lg border border-border p-3 sm:flex sm:items-center sm:justify-between sm:gap-4"
            >
              <span className="font-sans text-sm">{area.label}</span>
              <fieldset className="mt-2 inline-flex gap-1 sm:mt-0">
                <legend className="sr-only">Confidence for {area.label}</legend>
                {VALUES.map((v) => {
                  const selected = current === v;
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setConfidence(key, selected ? null : v)}
                      aria-pressed={selected}
                      className={
                        "h-8 w-8 rounded-md border font-sans text-sm transition-colors " +
                        (selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-muted-foreground hover:border-foreground")
                      }
                    >
                      {v}
                    </button>
                  );
                })}
              </fieldset>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
