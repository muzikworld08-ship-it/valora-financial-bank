import React from "react";

interface ValoraLogoProps {
  className?: string; // typically height like "h-11"
  iconOnly?: boolean;
  dark?: boolean;
}

export function ValoraLogo({ className = "h-11", iconOnly = false, dark = false }: ValoraLogoProps) {
  const navyColor = dark ? "#FFFFFF" : "#0A2540";
  const goldColor = "#B89765";

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Official Valora Financial Bank Stylized V with 3 Ascending Gold Bars */}
      <svg
        viewBox="0 0 120 100"
        className="h-full w-auto shrink-0"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Deep Navy/White Serif V */}
        <path
          d="M 16 16
             H 48
             V 21
             C 40 21, 38 24, 36 30
             L 58 80
             H 61
             L 79 30
             C 81 24, 82 21, 88 21
             V 16
             H 68
             V 21
             C 74 21, 75 24, 73 30
             L 59 74
             L 43 30
             C 41 24, 38 21, 30 21
             V 16
             Z"
          fill={navyColor}
        />
        {/* Three ascending gold columns representing growth and prosperity */}
        {/* Short Bar */}
        <path
          d="M 76 48
             L 81 40
             V 60
             L 76 66
             Z"
          fill={goldColor}
        />
        {/* Medium Bar */}
        <path
          d="M 85 34
             L 90 26
             V 53
             L 85 59
             Z"
          fill={goldColor}
        />
        {/* Tall Bar */}
        <path
          d="M 94 20
             L 99 12
             V 46
             L 94 52
             Z"
          fill={goldColor}
        />
      </svg>

      {/* Typography matches official logo font styling */}
      {!iconOnly && (
        <div className="flex flex-col text-left">
          <span 
            className="font-serif font-extrabold tracking-widest leading-none text-base" 
            style={{ color: navyColor, fontFamily: "'Inter', 'Georgia', serif" }}
          >
            VALORA
          </span>
          <div className="flex items-center gap-1 mt-1">
            <span className="w-4 h-[1px]" style={{ backgroundColor: goldColor }} />
            <span 
              className="font-display font-black tracking-[0.22em] text-[8.5px] uppercase leading-none" 
              style={{ color: goldColor }}
            >
              FINANCIAL BANK
            </span>
            <span className="w-4 h-[1px]" style={{ backgroundColor: goldColor }} />
          </div>
        </div>
      )}
    </div>
  );
}
