import React from "react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function FakturasLogo({ className = "", size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-16 h-16",
    xl: "w-32 h-32"
  };

  return (
    <svg 
      className={`${sizeClasses[size] || sizeClasses.md} ${className} select-none`}
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Absolute high-end premium liquid brass and gold gradient */}
        <linearGradient id="luxury-gold" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFF7D6" />
          <stop offset="25%" stopColor="#ECC561" />
          <stop offset="70%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#8F7122" />
        </linearGradient>
      </defs>
      
      {/* 3D Isometric Luxury Sovereign Vault Prism / Diamond */}
      <path 
        d="M 50 12 L 88 34 L 50 56 L 12 34 Z" 
        fill="url(#luxury-gold)" 
        opacity="0.95"
      />
      <path 
        d="M 12 34 L 50 56 L 50 88 L 12 66 Z" 
        fill="url(#luxury-gold)" 
        opacity="0.8"
      />
      <path 
        d="M 50 56 L 88 34 L 88 66 L 50 88 Z" 
        fill="url(#luxury-gold)" 
        opacity="0.65"
      />
      {/* Center structural dividing core wire */}
      <path 
        d="M 50 12 L 50 88" 
        stroke="#FFFFFF" 
        strokeWidth="1.2" 
        strokeLinecap="round" 
        opacity="0.25"
      />
    </svg>
  );
}

export function FakturasTextLogo({ isDarkMode = true }: { isDarkMode?: boolean }) {
  return (
    <div className="flex items-center gap-3.5 select-none">
      <FakturasLogo size="md" className="transition-transform duration-500 hover:rotate-12 cursor-pointer scale-105" />
      <div className="flex flex-col text-left leading-none">
        <span className={`tracking-[0.25em] text-base font-extrabold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-[#050B1A]'}`}>
          FAKTURAS
        </span>
        <span className="text-[7.5px] font-mono tracking-[0.15em] text-[#F5C542] font-semibold uppercase mt-1">
          Smart Invoicing Platform
        </span>
      </div>
    </div>
  );
}
