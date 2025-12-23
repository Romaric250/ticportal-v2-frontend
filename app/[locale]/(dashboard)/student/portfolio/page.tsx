"use client";

export default function StudentPortfolioPage() {
  return (
    <div className="space-y-6 text-slate-900">
      {/* Profile header */}
      <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-slate-200 sm:h-20 sm:w-20" />
          <div>
            <h1 className="text-lg font-semibold sm:text-xl">Jane Doe</h1>
            <p className="text-sm text-slate-500">
              Grade 11, Lincoln High · Level 3 Scholar
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-[#111827]">
                4,250 TP
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                Rank #42
              </span>
            </div>
          </div>
        </div>
        <button className="self-start rounded-full bg-[#111827] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1f2937]">
          Share profile
        </button>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2.1fr)_minmax(0,1fr)]">
        {/* Left column */}
        <div className="space-y-6">
          {/* Learning journey */}
          <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm border-l-4 border-l-[#111827]">
            <div className="flex items-center justify-between text-sm font-semibold text-slate-800">
              <span>My learning journey</span>
              <span className="text-xs text-slate-500">65% complete</span>
            </div>
            <div className="space-y-4 text-sm">
              <JourneyStep
                level="Level 1: Bootcamp"
                status="Completed Oct 12"
                description="Mastered the fundamentals of design thinking and problem identification."
              />
              <JourneyStep
                level="Level 2: Team formation"
                status="Completed Nov 05"
                description="Teamed up with 3 peers to brainstorm solutions for local sustainability."
              />
              <JourneyStep
                level="Level 3: Summit finalist"
                status="In progress"
                description="Developing the MVP and preparing the final pitch deck for judges."
                highlight
              />
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div className="h-full w-2/3 rounded-full bg-[#111827]" />
            </div>
          </section>

          {/* Project spotlight */}
          <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm border-l-4 border-l-[#111827]">
            <div className="flex items-center justify-between text-sm font-semibold text-slate-800">
              <span>Project spotlight</span>
              <button className="text-xs font-medium text-[#111827] hover:underline">
                View all
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-[220px,minmax(0,1fr)]">
              <div className="relative h-40 rounded-xl bg-slate-100">
                <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700 shadow-sm">
                  Environment
                </span>
              </div>
              <div className="flex flex-col justify-between gap-3 text-sm">
                <div className="space-y-1">
                  <h2 className="text-base font-semibold text-slate-900">
                    Eco‑Water filter system
                  </h2>
                  <p className="text-xs text-slate-600 line-clamp-3">
                    A low‑cost, biodegradable filtration system designed for
                    rural communities to access clean drinking water using
                    locally available materials.
                  </p>
                  <p className="text-xs text-slate-500">
                    Team: <span className="font-semibold">Team Hydro</span>
                  </p>
                </div>
                <button className="self-start rounded-full border border-slate-300 px-4 py-1.5 text-xs font-semibold text-[#111827] hover:border-[#111827]">
                  View project details
                </button>
              </div>
            </div>
          </section>

          {/* Certificates */}
          <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-sm border-l-4 border-l-[#111827]">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-700">
              Certificates
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              <CertificateCard
                title="Intro to entrepreneurship"
                issued="Issued Oct 2023"
              />
              <CertificateCard
                title="TIC Summit 2024 finalist"
                issued="Issued Jan 2024"
              />
            </div>
          </section>

          {/* Download resume */}
          <section className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm text-sm">
            <button className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 px-5 py-2 text-xs font-semibold text-[#111827] hover:border-[#111827]">
              <span>⬇</span>
              <span>Download full resume</span>
            </button>
          </section>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Current stats */}
          <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-sm shadow-sm sm:grid-cols-2">
            <StatBlock label="Hackathon lvl" value="Summit" />
            <StatBlock label="Learning hrs" value="124h" />
            <StatBlock label="Global rank" value="Top 5%" />
            <StatBlock label="TIC points (TP)" value="4.2k" />
          </section>

          {/* Trophy case */}
          <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 text-sm shadow-sm border-l-4 border-l-[#111827]">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                Trophy case
              </h2>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                12 earned
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <TrophyPill label="Innovator" />
              <TrophyPill label="Top coder" />
              <TrophyPill label="Team player" />
              <TrophyPill label="Strategist" />
              <TrophyPill label="Designer" />
              <TrophyPill label="Next" muted />
            </div>
          </section>

          {/* Mentor feedback */}
          <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 text-sm shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-700">
              Mentor feedback
            </h2>
            <p className="text-xs text-slate-600">
              "Jane showed incredible leadership during the sprint phase. Her
              ability to synthesize complex data into actionable insights was
              key to the team&apos;s success."
            </p>
            <div className="mt-3 flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-slate-200" />
              <div>
                <p className="text-xs font-semibold text-slate-900">
                  Alex Thompson
                </p>
                <p className="text-xs text-slate-500">
                  Lead mentor, TechStar
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

type JourneyStepProps = {
  level: string;
  status: string;
  description: string;
  highlight?: boolean;
};

function JourneyStep({ level, status, description, highlight }: JourneyStepProps) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <div className="mt-1 flex flex-col items-center">
        <span
          className={`flex h-4 w-4 items-center justify-center rounded-full border ${
            highlight ? "border-[#111827] bg-[#111827]" : "border-slate-300 bg-white"
          }`}
        />
        <span className="mt-1 h-8 w-px bg-slate-200" />
      </div>
      <div className="flex-1 space-y-0.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold text-slate-900">{level}</p>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
            {status}
          </span>
        </div>
        <p className="text-xs text-slate-600">{description}</p>
      </div>
    </div>
  );
}

type CertificateCardProps = {
  title: string;
  issued: string;
};

function CertificateCard({ title, issued }: CertificateCardProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
      <div>
        <p className="text-xs font-semibold text-slate-900">{title}</p>
        <p className="text-xs text-slate-500">{issued}</p>
      </div>
      <span className="text-lg text-slate-400">⬇</span>
    </div>
  );
}

type StatBlockProps = {
  label: string;
  value: string;
};

function StatBlock({ label, value }: StatBlockProps) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-base font-semibold text-slate-900">{value}</p>
    </div>
  );
}

type TrophyPillProps = {
  label: string;
  muted?: boolean;
};

function TrophyPill({ label, muted }: TrophyPillProps) {
  const base =
    "flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-3 text-xs";

  return (
    <div
      className={
        muted
          ? `${base} bg-slate-50 text-slate-400`
          : `${base} bg-slate-50 text-slate-700`
      }
    >
      <span>🏅</span>
      <span>{label}</span>
    </div>
  );
}


