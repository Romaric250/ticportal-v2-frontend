import { Users, Plus, Crown, Linkedin, Figma } from "lucide-react";

type Props = {
  onAddMember: () => void;
};

export function TeamMembers({ onAddMember }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-[#111827]" />
          <h2 className="text-sm font-semibold text-slate-900">Members</h2>
        </div>
        <button
          onClick={onAddMember}
          className="cursor-pointer rounded-full p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
        >
          <Plus size={18} />
        </button>
      </div>

      <div className="space-y-3">
        <MemberCard
          name="Sarah Jenkins"
          role="Team Captain"
          roleIcon={<Crown size={14} />}
          avatar="/api/placeholder/40/40"
        />
        <MemberCard
          name="David Kim"
          role="Developer"
          roleIcon={<Linkedin size={14} />}
          avatar="/api/placeholder/40/40"
        />
        <MemberCard
          name="Maria Garcia"
          role="Designer"
          roleIcon={<Figma size={14} />}
          avatar="/api/placeholder/40/40"
        />
      </div>
    </div>
  );
}

type MemberCardProps = {
  name: string;
  role: string;
  roleIcon: React.ReactNode;
  avatar: string;
};

function MemberCard({ name, role, roleIcon, avatar }: MemberCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
      <div className="h-10 w-10 flex-shrink-0 rounded-full bg-slate-200" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-slate-900">{name}</p>
        <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
          {roleIcon}
          <span>{role}</span>
        </div>
      </div>
    </div>
  );
}

