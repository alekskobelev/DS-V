import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface FeatureListProps {
  features: string[];
  className?: string;
  itemClassName?: string;
}

export const FeatureList: React.FC<FeatureListProps> = ({ 
  features, 
  className = "grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-500",
  itemClassName = "flex items-start gap-2 bg-blue-50/50 p-2 rounded-lg min-w-0"
}) => {
  if (!features || features.length === 0) return null;

  // Check if it's a single HTML string from the rich text editor
  if (features.length === 1 && (features[0].includes('<p>') || features[0].includes('<ul>'))) {
    return (
      <div 
        className="prose prose-sm max-w-none text-xs text-slate-500"
        dangerouslySetInnerHTML={{ __html: features[0] }}
      />
    );
  }

  return (
    <ul className={className}>
      {features.map((feat, i) => (
        <li key={i} className={itemClassName}>
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
          <span className="flex-1 min-w-0 break-words">{feat}</span>
        </li>
      ))}
    </ul>
  );
};
