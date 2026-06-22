// src/components/common/Logo.jsx
import React, { useState } from 'react';
import { Package } from 'lucide-react';

const Logo = ({ className = "", showText = true, size = "md", onClick = null }) => {
  const [imgError, setImgError] = useState(false);
  // 🔥 Perbaiki path logo ke folder images
  const logoUrl = '/images/logo.png';
  
  const sizeClasses = {
    sm: { 
      container: "w-8 h-8", 
      text: "text-lg", 
      icon: "w-5 h-5",
      tagline: "text-[10px]"
    },
    md: { 
      container: "w-10 h-10", 
      text: "text-xl", 
      icon: "w-6 h-6",
      tagline: "text-xs"
    },
    lg: { 
      container: "w-12 h-12", 
      text: "text-2xl", 
      icon: "w-7 h-7",
      tagline: "text-sm"
    },
  };
  
  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };
  
  return (
    <div 
      onClick={handleClick} 
      className={`flex items-center gap-2 group ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Logo Image / Fallback */}
      <div className={`
        ${sizeClasses[size].container} 
        rounded-xl overflow-hidden 
        shadow-lg transition-all duration-300 
        ${onClick ? 'group-hover:scale-105 group-hover:shadow-indigo-500/30' : ''}
        bg-linear-to-r from-indigo-600 to-purple-600 
        flex items-center justify-center
        shrink-0
      `}>
        {!imgError ? (
          <img 
            src={logoUrl} 
            alt="UD. Mia Sari Logo" 
            className="w-full h-full object-contain p-1"
            onError={() => setImgError(true)}
          />
        ) : (
          <Package className={`${sizeClasses[size].icon} text-white`} />
        )}
      </div>
      
      {showText && (
        <div className="shrink-0 min-w-0">
          <h1 className={`
            font-bold bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent 
            ${sizeClasses[size].text}
            whitespace-nowrap
          `}>
            UD. Mia Sari
          </h1>
          <p className={`
            text-slate-400 
            ${sizeClasses[size].tagline}
            whitespace-nowrap
          `}>
            Bakso Rumahan Berkualitas
          </p>
        </div>
      )}
    </div>
  );
};

export default Logo;