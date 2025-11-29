export function PillCharacter({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Cute pill character */}
      <g>
        {/* Pill body */}
        <rect x="60" y="50" width="80" height="100" rx="40" fill="url(#pillGradient)" className="animate-bounce-slow" />

        {/* Pill divider */}
        <line x1="60" y1="100" x2="140" y2="100" stroke="white" strokeWidth="3" strokeDasharray="5,5" />

        {/* Happy face */}
        <circle cx="85" cy="80" r="4" fill="#2D3748" />
        <circle cx="115" cy="80" r="4" fill="#2D3748" />
        <path d="M 80 95 Q 100 105 120 95" stroke="#2D3748" strokeWidth="3" strokeLinecap="round" fill="none" />

        {/* Sparkles */}
        <circle cx="45" cy="60" r="3" fill="#FCD34D" className="animate-pulse" />
        <circle cx="155" cy="70" r="2" fill="#FCD34D" className="animate-pulse" style={{ animationDelay: "0.5s" }} />
        <circle cx="50" cy="140" r="2.5" fill="#FCD34D" className="animate-pulse" style={{ animationDelay: "1s" }} />
      </g>

      <defs>
        <linearGradient id="pillGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
    </svg>
  )
}
