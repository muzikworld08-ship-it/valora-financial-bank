import React from "react";
import { Plus, Users, ChevronRight } from "lucide-react";
import { Beneficiary } from "../types";
import { initials } from "../utils";

interface QuickTransferProps {
  beneficiaries: Beneficiary[];
  onAddNew: () => void;
  onViewAll: () => void;
  onSelectBeneficiary?: (b: Beneficiary) => void;
  dark: boolean;
}

export function QuickTransfer({
  beneficiaries,
  onAddNew,
  onViewAll,
  onSelectBeneficiary,
  dark,
}: QuickTransferProps) {
  return (
    <div className="px-5 mt-7 select-none">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-base tracking-tight text-slate-900">
          Quick Transfer
        </h3>
        <button
          onClick={onViewAll}
          className="text-[#C8102E] hover:text-[#A93226] text-xs font-black uppercase tracking-wider flex items-center gap-0.5 cursor-pointer"
        >
          View All <ChevronRight size={14} />
        </button>
      </div>
      <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-none">
        {/* Add New recipient button */}
        <button
          onClick={onAddNew}
          className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer"
        >
          <div className="w-14 h-14 rounded-full border-2 border-dashed flex items-center justify-center transition-all border-slate-300 hover:border-[#C8102E] hover:bg-red-50">
            <Plus size={20} className="text-slate-500 group-hover:text-[#C8102E] transition-colors" />
          </div>
          <span className="text-[11px] font-bold text-gray-800 group-hover:text-[#C8102E] transition-colors uppercase tracking-wider">
            Add New
          </span>
        </button>

        {beneficiaries.length === 0 ? (
          <div className="flex items-center gap-3 py-1.5 px-3 rounded-2xl bg-gray-50 border border-gray-200">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-slate-500">
              <Users size={16} />
            </div>
            <p className="text-xs text-gray-800 font-bold leading-tight">
              No saved payees.<br />Add some above!
            </p>
          </div>
        ) : (
          beneficiaries.map((b) => (
            <button
              key={b.id}
              onClick={() => onSelectBeneficiary?.(b)}
              className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer"
              title={`Send money to ${b.name}`}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-white font-extrabold text-sm shadow-md transition-transform group-hover:scale-105"
                style={{ background: "linear-gradient(135deg, #FF5252, #C8102E)" }}
              >
                {initials(b.name)}
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider truncate w-14 text-center transition-colors text-slate-800 group-hover:text-[#C8102E]">
                {b.name.split(" ")[0]}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
