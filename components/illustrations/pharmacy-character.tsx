export function PharmacyCharacter({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Cute pharmacy building */}
      <g>
        {/* Building */}
        <rect x="50" y="80" width="100" height="90" rx="8" fill="#10B981" />

        {/* Roof */}
        <path d="M 40 80 L 100 40 L 160 80 Z" fill="#059669" />

        {/* Cross sign */}
        <g transform="translate(100, 100)">
          <rect x="-15" y="-5" width="30" height="10" rx="2" fill="white" />
          <rect x="-5" y="-15" width="10" height="30" rx="2" fill="white" />
        </g>

        {/* Windows */}
        <rect x="65" y="95" width="20" height="20" rx="4" fill="white" opacity="0.8" />
        <rect x="115" y="95" width="20" height="20" rx="4" fill="white" opacity="0.8" />

        {/* Door */}
        <rect x="85" y="130" width="30" height="40" rx="4" fill="#047857" />
        <circle cx="108" cy="150" r="2" fill="#FCD34D" />

        {/* Sparkles around */}
        <circle cx="35" cy="70" r="3" fill="#FCD34D" className="animate-pulse" />
        <circle cx="165" cy="75" r="2.5" fill="#FCD34D" className="animate-pulse" style={{ animationDelay: "0.3s" }} />
        <circle cx="100" cy="30" r="2" fill="#FCD34D" className="animate-pulse" style={{ animationDelay: "0.6s" }} />
      </g>
    </svg>
  )
}
