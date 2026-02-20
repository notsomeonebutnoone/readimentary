import React from 'react';
import logoSrc from '../assets/readimentary.png';

/**
 * Logo Component
 * 
 * Core identity anchor for Readimentary - integrated into visual system.
 * Responsive sizing and subtle animations for different contexts:
 * - Landing: Large, prominent with fade-in
 * - Library: Medium, header-sized
 * - Reader: Small, minimal (non-distracting, reduced opacity)
 */
export default function Logo({ size = 'medium', className = '', variant = 'default' }) {
  const sizeClasses = {
    large: 'h-16 md:h-20',
    medium: 'h-10 md:h-12',
    small: 'h-6 md:h-8',
    icon: 'h-5 w-5'
  };

  // Variant-specific styling
  const variantClasses = {
    default: 'opacity-100',
    reader: 'opacity-40 hover:opacity-60', // Subdued in reader mode
    landing: 'opacity-100' // Full opacity on landing
  };

  return (
    <img
      src={logoSrc}
      alt="Readimentary"
      className={`${sizeClasses[size] || sizeClasses.medium} w-auto object-contain transition-opacity duration-300 ${variantClasses[variant] || variantClasses.default} ${className}`}
    />
  );
}

