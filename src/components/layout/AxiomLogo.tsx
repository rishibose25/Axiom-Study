import React from 'react';
import { cn } from '../../lib/utils';

interface AxiomLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function AxiomLogo({ className, size = 'md', showText = true }: AxiomLogoProps) {
  const sizes = {
    sm: { container: 'gap-2', spark: 'w-6 h-6', text: 'text-lg' },
    md: { container: 'gap-3', spark: 'w-10 h-10', text: 'text-2xl' },
    lg: { container: 'gap-4', spark: 'w-16 h-16', text: 'text-4xl' }
  };

  const currentSize = sizes[size];

  return (
    <div className={cn("flex items-center", currentSize.container, className)}>
      <div className={cn("relative shrink-0", currentSize.spark)}>
        <svg 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_4px_10px_rgba(99,102,241,0.2)]"
        >
          {/* Main Spark */}
          <path 
            d="M50 0C50 25 25 50 0 50C25 50 50 75 50 100C50 75 75 50 100 50C75 50 50 25 50 0Z" 
            fill="url(#axiom-gradient)"
          />
          {/* Secondary Spark */}
          <path 
            d="M85 18C85 23 81.5 25 78 25C81.5 25 85 27 85 32C85 27 88.5 25 92 25C88.5 25 85 23 85 18Z" 
            fill="#22D3EE"
          />
          <defs>
            <linearGradient id="axiom-gradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FACC15" />
              <stop offset="0.45" stopColor="#EC4899" />
              <stop offset="1" stopColor="#6366F1" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={cn("font-[Inter] font-black tracking-tight text-[#0B0F14]", currentSize.text)}>
            Axiom
          </span>
        </div>
      )}
    </div>
  );
}
