import { Calendar, Radio, Trophy, Video } from "lucide-react";

export function TeamMetrics() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        icon={<Calendar size={20} />}
        label="Submission Due"
        value="12 Days"
      />
      <MetricCard
        icon={<Radio size={20} />}
        label="Mentor Sessions"
        value="3 / 5 Used"
      />
      <MetricCard
        icon={<Trophy size={20} />}
        label="Team Score"
        value="850 pts"
      />
      <MetricCard
        icon={<Video size={20} />}
        label="Next Sync"
        value="4:00 PM"
      />
    </div>
  );
}

type MetricCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
};

function MetricCard({ icon, label, value }: MetricCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-1 text-lg font-bold text-slate-900">{value}</p>
        </div>
        <div className="text-[#111827]">{icon}</div>
      </div>
    </div>
  );
}

