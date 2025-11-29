export function MedicineBoxCharacter({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Cute medicine box */}
      <g>
        {/* Box */}
        <rect x="50" y="70" width="100" height="80" rx="8" fill="url(#boxGradient)" />

        {/* Box lid */}
        <rect x="50" y="60" width="100" height="15" rx="4" fill="#047857" />

        {/* Cross on box */}
        <g transform="translate(100, 105)">
          <rect x="-20" y="-4" width="40" height="8" rx="2" fill="white" />
          <rect x="-4" y="-20" width="8" height="40" rx="2" fill="white" />
        </g>

        {/* Happy face */}
        <circle cx="80" cy="130" r="3" fill="white" />
        <circle cx="120" cy="130" r="3" fill="white" />
        <path d="M 85 138 Q 100 145 115 138" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* Pills floating around */}
        <ellipse cx="35" cy="90" rx="8" ry="12" fill="#FCD34D" className="animate-float" />
        <ellipse
          cx="165"
          cy="100"
          rx="7"
          ry="11"
          fill="#FCD34D"
          className="animate-float"
          style={{ animationDelay: "0.5s" }}
        />
        <circle cx="40" cy="130" r="6" fill="#FCD34D" className="animate-float" style={{ animationDelay: "1s" }} />

        {/* Sparkles */}
        <circle cx="160" cy="70" r="2" fill="#FCD34D" className="animate-pulse" />
        <circle cx="45" cy="60" r="2.5" fill="#FCD34D" className="animate-pulse" style={{ animationDelay: "0.3s" }} />
      </g>

      <defs>
        <linearGradient id="boxGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
    </svg>
  )
}
