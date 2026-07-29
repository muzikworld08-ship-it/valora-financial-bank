import React from "react";

interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export function PrimaryButton({ children, onClick, disabled, className = "" }: PrimaryButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-3.5 rounded-2xl font-semibold text-white transition-opacity duration-150 cursor-pointer ${disabled ? "opacity-40" : "active:opacity-80 hover:opacity-95"} ${className}`}
      style={{
        background: disabled ? undefined : "linear-gradient(135deg, #3DC4F5, #0B6FB0)",
        backgroundColor: disabled ? "#94a3b8" : undefined,
      }}
    >
      {children}
    </button>
  );
}
