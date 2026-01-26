import { getDifficultyColor, getDifficultyText } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface DifficultyIndicatorProps {
  difficulty: number;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function DifficultyIndicator({
  difficulty,
  size = 'md',
  showText = false,
}: DifficultyIndicatorProps) {
  const colorClass = getDifficultyColor(difficulty);
  const text = getDifficultyText(difficulty);

  const sizes = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          'rounded-full flex items-center justify-center text-white font-bold',
          colorClass,
          sizes[size]
        )}
        title={text}
      >
        {difficulty}
      </div>
      {showText && <span className="text-sm text-gray-600">{text}</span>}
    </div>
  );
}

