"use client";

interface ProgressBarProps {
  completedModules: number;
  totalModules: number;
  percentComplete?: number;
  averageScore?: number | null;
  showIndicators?: boolean;
  moduleStatuses?: Array<{ isCompleted: boolean }>;
  size?: "sm" | "md" | "lg";
}

export const ProgressBar = ({
  completedModules,
  totalModules,
  percentComplete,
  averageScore,
  showIndicators = false,
  moduleStatuses = [],
  size = "md",
}: ProgressBarProps) => {
  // Calculate percent if not provided
  const calculatedPercent = percentComplete ?? (totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0);
  const displayPercent = Math.min(calculatedPercent, 100);

  // Size variants
  const sizeClasses = {
    sm: {
      container: "p-2 sm:p-3",
      title: "text-xs",
      subtitle: "text-[10px]",
      badge: "h-6 w-6 text-[10px]",
      bar: "h-2",
      indicator: "h-1.5 w-1.5",
    },
    md: {
      container: "p-3 sm:p-4",
      title: "text-sm sm:text-base",
      subtitle: "text-xs",
      badge: "h-8 w-8 text-xs",
      bar: "h-3",
      indicator: "h-2 w-2",
    },
    lg: {
      container: "p-4 sm:p-5",
      title: "text-base sm:text-lg",
      subtitle: "text-xs sm:text-sm",
      badge: "h-10 w-10 text-sm",
      bar: "h-4",
      indicator: "h-2.5 w-2.5",
    },
  };

  const classes = sizeClasses[size];

  return (
    <div className={`rounded-lg border border-slate-200 bg-white ${classes.container} shadow-sm`}>
      <div className="mb-2 sm:mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className={`flex ${classes.badge} items-center justify-center rounded-lg bg-[#111827]`}>
            <span className={`font-bold text-white`}>{displayPercent}%</span>
          </div>
          <div>
            <p className={`${classes.subtitle} text-slate-600`}>
              {completedModules} of {totalModules} modules completed
            </p>
          </div>
        </div>
        {averageScore !== undefined && averageScore !== null && (
          <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-2 sm:px-3 py-1 sm:py-1.5">
            <span className={`${classes.subtitle} font-medium text-emerald-700`}>Average Score</span>
            <span className={`${classes.title} font-bold text-emerald-900`}>{averageScore}%</span>
          </div>
        )}
      </div>
      
      {/* Progress Bar */}
      <div className={`relative ${classes.bar} w-full overflow-hidden rounded-full bg-slate-200`}>
        <div
          className={`h-full rounded-full bg-gradient-to-r from-[#111827] to-[#1f2937] transition-all duration-500 ease-out`}
          style={{ width: `${displayPercent}%` }}
        />
        {displayPercent === 100 && (
          <div className="absolute inset-0 animate-pulse rounded-full bg-emerald-400 opacity-20" />
        )}
      </div>
      
      {/* Module Completion Indicators */}
      {showIndicators && moduleStatuses.length > 0 && moduleStatuses.length <= 10 && (
        <div className="mt-2 sm:mt-3 flex flex-wrap gap-1.5">
          {moduleStatuses.map((status, index) => (
            <div
              key={index}
              className={`${classes.indicator} rounded-full transition-all ${
                status.isCompleted
                  ? "bg-emerald-500"
                  : "bg-slate-300"
              }`}
              title={`Module ${index + 1} - ${status.isCompleted ? "Completed" : "Incomplete"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
