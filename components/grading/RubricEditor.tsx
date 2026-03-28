"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { gradingService, type GradingRubric } from "../../src/lib/services/gradingService";

const DEFAULT_RUBRIC = {
  sections: [
    {
      name: "Team and Motivation",
      weight: 25,
      criteria: [
        {
          name: "Team Composition and Skills",
          maxScore: 10,
          description: "Team has diverse and complementary skills.",
        },
        { name: "Motivation for Participation", maxScore: 8, description: "Strong passion and clarity of purpose." },
        { name: "Utilization of Resources", maxScore: 7, description: "Strategic plan and use of resources." },
      ],
    },
    {
      name: "Innovation & Solution",
      weight: 35,
      criteria: [
        { name: "Problem understanding", maxScore: 12, description: "Clear problem statement and user need." },
        { name: "Creativity & originality", maxScore: 13, description: "Novel approach vs existing solutions." },
        { name: "Feasibility", maxScore: 10, description: "Technical and operational viability." },
      ],
    },
    {
      name: "Execution & Impact",
      weight: 40,
      criteria: [
        { name: "Prototype / deliverable quality", maxScore: 15, description: "Working demo, polish, documentation." },
        { name: "Presentation", maxScore: 10, description: "Clarity of pitch and demo." },
        { name: "Potential impact", maxScore: 15, description: "Scalability and benefit to community." },
      ],
    },
  ],
};

export function RubricEditor() {
  const [name, setName] = useState("TIC Summit Rubric");
  const [json, setJson] = useState(JSON.stringify(DEFAULT_RUBRIC, null, 2));
  const [current, setCurrent] = useState<GradingRubric | null>(null);
  const [loading, setLoading] = useState(true);

  const preview = useMemo(() => {
    try {
      const parsed = JSON.parse(json) as { sections?: Array<{ name: string; weight: number; criteria: unknown[] }> };
      return Array.isArray(parsed?.sections) ? parsed.sections : [];
    } catch {
      return null;
    }
  }, [json]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await gradingService.getRubric();
      setCurrent(r);
      if (r) {
        setName(r.name);
        const sec = r.sections as object;
        setJson(JSON.stringify(sec, null, 2));
      }
    } catch {
      toast.error("Could not load rubric");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    let sections: unknown;
    try {
      sections = JSON.parse(json);
    } catch {
      toast.error("Invalid JSON");
      return;
    }
    try {
      await gradingService.saveRubric({
        name,
        sections,
        rubricId: current?.id ?? null,
        maxScore: 100,
      });
      toast.success("Rubric saved and activated");
      load();
    } catch (e: unknown) {
      const msg = e && typeof e === "object" && "response" in e ? (e as any).response?.data?.message : null;
      toast.error(msg || "Save failed");
    }
  };

  if (loading) return <p className="text-sm text-slate-600">Loading…</p>;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Edit rubric</h2>
        {current && <p className="text-xs text-slate-500">Active rubric ID: {current.id}</p>}
        <div>
          <label className="text-xs font-medium text-slate-600">Name</label>
          <input
            className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Full rubric JSON</label>
          <p className="mt-0.5 text-xs text-slate-500">
            Structure: <code className="rounded bg-slate-100 px-1">{"{ \"sections\": [ { \"name\", \"weight\", \"criteria\": [...] } ] }"}</code>
            . Weights should sum to 100 across sections.
          </p>
          <textarea
            className="mt-1 min-h-[min(60vh,520px)] w-full rounded border border-slate-200 px-3 py-2 font-mono text-xs leading-relaxed text-slate-900"
            spellCheck={false}
            value={json}
            onChange={(e) => setJson(e.target.value)}
          />
        </div>
        <button type="button" onClick={save} className="rounded-md bg-[#111827] px-4 py-2 text-sm text-white">
          Save & activate
        </button>
      </div>

      <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Preview</h2>
        <p className="text-xs text-slate-500">Parsed from JSON — fix JSON if this disappears.</p>
        {!preview && <p className="text-sm text-amber-800">Invalid JSON — check brackets and commas.</p>}
        {preview && preview.length === 0 && <p className="text-sm text-slate-600">No sections in JSON.</p>}
        <div className="max-h-[min(70vh,640px)] space-y-4 overflow-y-auto pr-1">
          {preview?.map((sec, i) => (
            <div key={i} className="rounded-md border border-slate-200 bg-white p-3">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-sm font-semibold text-slate-900">{sec.name}</h3>
                <span className="text-xs font-medium text-slate-500">Weight {sec.weight}</span>
              </div>
              <ul className="mt-2 space-y-2">
                {(sec.criteria as Array<{ name: string; maxScore: number; description?: string }> | undefined)?.map(
                  (c, j) => (
                    <li key={j} className="rounded border border-slate-100 bg-slate-50/80 px-2 py-1.5 text-xs">
                      <span className="font-medium text-slate-800">{c.name}</span>
                      <span className="text-slate-500"> — max {c.maxScore}</span>
                      {c.description && <p className="mt-0.5 text-slate-600">{c.description}</p>}
                    </li>
                  )
                )}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
