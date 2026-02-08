type QuickAccessTileProps = {
  icon: React.ReactNode;
  label: string;
};

export function QuickAccessTile({ icon, label }: QuickAccessTileProps) {
  return (
    <button className="group flex flex-col items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-3 text-slate-700 transition-all hover:border-slate-900 hover:bg-slate-50 hover:shadow-sm">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white transition-transform group-hover:scale-110">
        {icon}
      </div>
      <span className="text-[10px] font-semibold">{label}</span>
    </button>
  );
}


