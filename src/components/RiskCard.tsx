import React from 'react';

type RiskLevel = 'rendah' | 'sedang' | 'tinggi';

interface RiskCardProps {
  title: string;
  level: RiskLevel;
  icon?: string; // opsional bisa pake icon
}

const RiskCard: React.FC<RiskCardProps> = ({ title, level, icon }) => {
  // Styling dinamis berdasarkan level risiko
  const getStyle = () => {
    switch (level) {
      case 'tinggi':
        return {
          bg: 'bg-red-50',
          text: 'text-red-600',
          border: 'border-red-200',
          emoji: '🔥'
        };
      case 'sedang':
        return {
          bg: 'bg-yellow-50',
          text: 'text-yellow-600',
          border: 'border-yellow-200',
          emoji: '⚠️'
        };
      default: // rendah
        return {
          bg: 'bg-green-50',
          text: 'text-green-600',
          border: 'border-green-200',
          emoji: '✅'
        };
    }
  };

  const style = getStyle();

  return (
    <div className={`p-4 rounded-lg border ${style.bg} ${style.border} shadow-sm`}>
      <div className="flex items-center gap-3">
        {/* Icon/Emoji */}
        <span className="text-2xl">{icon || style.emoji}</span>
        
        <div>
          {/* Title */}
          <h3 className={`font-semibold ${style.text}`}>{title}</h3>
          
          {/* Badge Level */}
          <span 
            className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full ${style.bg} ${style.text} ${style.border}`}
          >
            {level.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Progress Bar (Opsional) */}
      <div className="mt-3 w-full bg-gray-200 rounded-full h-1.5">
        <div 
          className={`h-1.5 rounded-full ${style.text.replace('text', 'bg')}`}
          style={{ width: level === 'tinggi' ? '100%' : level === 'sedang' ? '60%' : '30%' }}
        />
      </div>
    </div>
  );
};

export default RiskCard;