"use client";

function formatXAF(value: number): string {
  return value.toLocaleString("fr-FR") + " XAF";
}

const mockPayouts = [
  { id: "PAY-001", affiliate: "AF-8829", amount: 125000, status: "Pending", date: "2026-02-04" },
  { id: "PAY-002", affiliate: "AF-8830", amount: 89000, status: "Paid", date: "2026-02-03" },
];

export default function PayoutsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
          Payouts
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage affiliate and regional payouts. All amounts in XAF.
        </p>
      </header>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[500px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              <th className="px-3 py-2.5 font-medium text-slate-600">ID</th>
              <th className="px-3 py-2.5 font-medium text-slate-600">
                Affiliate
              </th>
              <th className="px-3 py-2.5 font-medium text-slate-600">
                Amount (XAF)
              </th>
              <th className="px-3 py-2.5 font-medium text-slate-600">
                Status
              </th>
              <th className="px-3 py-2.5 font-medium text-slate-600">Date</th>
            </tr>
          </thead>
          <tbody>
            {mockPayouts.map((row) => (
              <tr key={row.id} className="border-b border-slate-100">
                <td className="px-3 py-2.5 font-medium text-slate-900">
                  {row.id}
                </td>
                <td className="px-3 py-2.5 text-slate-600">{row.affiliate}</td>
                <td className="px-3 py-2.5 font-medium text-slate-900">
                  {formatXAF(row.amount)}
                </td>
                <td className="px-3 py-2.5">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      row.status === "Paid"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-slate-600">{row.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
