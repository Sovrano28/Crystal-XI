import { getTeamColors } from '@/lib/team-colors';

interface PlayerKitProps {
  teamShortName: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function PlayerKit({ teamShortName, className, size = 'md' }: PlayerKitProps) {
  const colors = getTeamColors(teamShortName);
  
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className={`${sizeClasses[size]} ${className} drop-shadow-md filter`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Shadow */}
        <path
          d="M25 20 L75 20 L85 35 L75 50 L75 90 L25 90 L25 50 L15 35 L25 20 Z"
          fill="black"
          fillOpacity="0.2"
          transform="translate(2, 2)"
        />
        
        {/* Main Body */}
        <path
          d="M25 20 L75 20 L85 35 L75 50 L75 90 L25 90 L25 50 L15 35 L25 20 Z"
          fill={colors.primary}
          stroke="rgba(0,0,0,0.1)"
          strokeWidth="1"
        />
        
        {/* Collar */}
        <path
          d="M40 20 Q50 30 60 20"
          stroke={colors.secondary}
          strokeWidth="3"
          fill="none"
        />
        
        {/* Sleeves details */}
        <path
          d="M15 35 L25 20 M85 35 L75 20"
          stroke="rgba(0,0,0,0.1)"
          strokeWidth="1"
        />
        
        {/* Stripe/Detail (generic) */}
        {colors.primary === '#FFFFFF' ? (
           // Dark stripe for light kits
           <rect x="45" y="20" width="10" height="70" fill={colors.secondary} fillOpacity="0.1" />
        ) : (
           // Light stripe for dark kits
           <rect x="45" y="20" width="10" height="70" fill="white" fillOpacity="0.1" />
        )}
      </svg>
    </div>
  );
}
