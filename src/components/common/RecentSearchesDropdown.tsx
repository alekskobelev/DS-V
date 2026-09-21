import React from 'react';
import { Clock, X, Trash2 } from 'lucide-react';

interface RecentSearchesDropdownProps {
  searches: string[];
  onSelect: (query: string) => void;
  onRemove: (query: string) => void;
  onClear: () => void;
  className?: string;
}

export const RecentSearchesDropdown: React.FC<RecentSearchesDropdownProps> = ({
  searches,
  onSelect,
  onRemove,
  onClear,
  className = '',
}) => {
  if (!searches || searches.length === 0) return null;

  return (
    <div
      onMouseDown={(e) => e.preventDefault()}
      className={`absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-sm border border-gray-200 py-2 px-2.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150 ${className}`}
    >
      <div className="flex items-center justify-between pb-1.5 mb-1 border-b border-gray-100 text-[11px] font-semibold text-gray-500 px-1">
        <div className="flex items-center gap-1.5 text-slate-500">
          <Clock className="w-3.5 h-3.5 text-blue-600" />
          <span>Недавние поиски</span>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
          className="text-[10px] text-gray-400 hover:text-red-600 transition-colors flex items-center gap-1 cursor-pointer"
          title="Очистить историю поиска"
        >
          <Trash2 className="w-3 h-3" />
          <span>Очистить</span>
        </button>
      </div>

      <div className="space-y-0.5">
        {searches.map((item, idx) => (
          <div
            key={idx}
            onClick={() => onSelect(item)}
            className="flex items-center justify-between group px-2 py-1.5 rounded-lg hover:bg-blue-50 text-xs text-slate-500 hover:text-blue-700 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 overflow-hidden flex-1 mr-2">
              <Clock className="w-3 h-3 text-gray-400 group-hover:text-blue-500 shrink-0" />
              <span className="truncate font-medium">{item}</span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(item);
              }}
              className="text-gray-300 hover:text-red-500 p-0.5 rounded opacity-60 group-hover:opacity-100 hover:bg-red-50 transition-all shrink-0 cursor-pointer"
              title="Удалить из недавних"
              aria-label={`Удалить ${item} из истории`}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
