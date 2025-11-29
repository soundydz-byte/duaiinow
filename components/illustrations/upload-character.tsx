export function UploadCharacter({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Cute upload document */}
      <g>
        {/* Document */}
        <path d="M 60 40 L 60 160 L 140 160 L 140 70 L 110 40 Z" fill="white" stroke="#10B981" strokeWidth="3" />

        {/* Folded corner */}
        <path d="M 110 40 L 110 70 L 140 70 Z" fill="#D1FAE5" />

        {/* Upload arrow */}
        <g transform="translate(100, 110)">
          <rect x="-4" y="-25" width="8" height="35" rx="4" fill="#10B981" />
          <path
            d="M -15 -15 L 0 -30 L 15 -15"
            stroke="#10B981"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </g>

        {/* Happy face on document */}
        <circle cx="85" cy="75" r="3" fill="#10B981" />
        <circle cx="115" cy="75" r="3" fill="#10B981" />
        <path d="M 85 85 Q 100 92 115 85" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* Sparkles */}
        <circle cx="45" cy="50" r="3" fill="#FCD34D" className="animate-pulse" />
        <circle cx="155" cy="60" r="2.5" fill="#FCD34D" className="animate-pulse" style={{ animationDelay: "0.4s" }} />
        <circle cx="50" cy="140" r="2" fill="#FCD34D" className="animate-pulse" style={{ animationDelay: "0.8s" }} />
      </g>
    </svg>
  )
}
