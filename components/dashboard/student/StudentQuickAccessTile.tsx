type QuickAccessTileProps = {
  icon: string;
  label: string;
};

export function QuickAccessTile({ icon, label }: QuickAccessTileProps) {
  return (
    <button className="flex flex-col items-center justify-center gap-1 rounded-xl bg-slate-50 px-3 py-3 text-slate-700 hover:bg-slate-100">
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </button>
  );
}


