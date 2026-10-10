
export default function Logo({ size = 40, className = "" }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ filter: 'drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.1))' }}
    >
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
        <linearGradient id="grad2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      {/* Abstract overlapping layers */}
      <path d="M50 10 L85 30 L85 70 L50 90 L15 70 L15 30 Z" fill="url(#grad1)" opacity="0.8" />
      <path d="M50 25 L75 40 L75 60 L50 75 L25 60 L25 40 Z" fill="url(#grad2)" opacity="0.9" />
      <path d="M50 40 L60 46 L60 54 L50 60 L40 54 L40 46 Z" fill="#ffffff" />
    </svg>
  );
}
