type DeadlineVariant = "danger" | "info" | "purple";

type UpcomingDeadlineProps = {
  variant: DeadlineVariant;
  title: string;
  subtitle: string;
  date: string;
};

export function UpcomingDeadlineItem({
  variant,
  title,
  subtitle,
  date,
}: UpcomingDeadlineProps) {
  const colorMap: Record<DeadlineVariant, string> = {
    danger: "bg-rose-100 text-rose-600",
    info: "bg-sky-100 text-sky-600",
    purple: "bg-violet-100 text-violet-600",
  };

  return (
    <li className="flex items-start justify-between gap-2">
      <div className="flex items-start gap-2">
        <span
          className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full text-[11px] ${colorMap[variant]}`}
        >
          •
        </span>
        <div>
          <p className="text-[11px] font-semibold text-slate-900">{title}</p>
          <p className="text-[10px] text-slate-500">{subtitle}</p>
        </div>
      </div>
      <span className="text-[10px] text-slate-400">{date}</span>
    </li>
  );
}


