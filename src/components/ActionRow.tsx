import React from "react";
import { Plus, Send, ArrowDown, LayoutGrid } from "lucide-react";

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  accent?: boolean;
  dark?: boolean;
}

function ActionButton({ icon, label, onClick, accent, dark }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 group cursor-pointer"
    >
      <div
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-150 active:scale-95 group-hover:scale-105 shadow-md ${
          accent
            ? "bg-amber-400 hover:bg-amber-300 text-slate-900"
            : dark
            ? "bg-slate-800 hover:bg-slate-700 text-white"
            : "bg-slate-900 hover:bg-slate-850 text-white"
        }`}
      >
        {icon}
      </div>
      <span className={`text-xs font-black tracking-wide uppercase transition-colors ${
        dark 
          ? "text-white group-hover:text-[#C8102E]" 
          : "text-gray-950 group-hover:text-[#C8102E]"
      }`}>
        {label}
      </span>
    </button>
  );
}

interface ActionRowProps {
  onTopUp: () => void;
  onSend: () => void;
  onReceive: () => void;
  onMore: () => void;
  dark?: boolean;
}

export function ActionRow({ onTopUp, onSend, onReceive, onMore, dark }: ActionRowProps) {
  return (
    <div className="flex justify-between px-8 mt-7">
      <ActionButton
        icon={<Plus size={24} className="text-slate-900 stroke-[2.5]" />}
        label="Top Up"
        onClick={onTopUp}
        accent
        dark={dark}
      />
      <ActionButton
        icon={<Send size={20} className="text-white" />}
        label="Send"
        onClick={onSend}
        dark={dark}
      />
      <ActionButton
        icon={<ArrowDown size={20} className="text-white" />}
        label="Receive"
        onClick={onReceive}
        dark={dark}
      />
      <ActionButton
        icon={<LayoutGrid size={20} className="text-white" />}
        label="More"
        onClick={onMore}
        dark={dark}
      />
    </div>
  );
}
