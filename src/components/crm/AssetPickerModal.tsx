import React, { useState, useEffect } from 'react';
import { X, Image, UploadCloud } from 'lucide-react';
import { apiService } from '../../services/apiService';

interface AssetItem {
  name: string;
  url: string;
  type: string;
}

interface AssetPickerModalProps {
  onSelect: (url: string) => void;
  onClose: () => void;
}

export function AssetPickerModal({ onSelect, onClose }: AssetPickerModalProps) {
  const [assets, setAssets] = useState<{ custom: AssetItem[], presets: AssetItem[] }>({ custom: [], presets: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    setIsLoading(true);
    const res = await apiService.getAssets();
    if (res.success && res.data) {
      setAssets(res.data);
    }
    setIsLoading(false);
  };

  const renderAsset = (asset: AssetItem) => (
    <div 
      key={asset.url}
      onClick={() => onSelect(asset.url)}
      className="bg-white border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:border-indigo-500 hover:shadow-md transition-all flex flex-col group"
    >
      <div className="h-24 bg-gray-50 flex items-center justify-center p-3 relative">
        <div className="absolute inset-0 bg-slate-100 opacity-50 checker-pattern" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #e2e8f0 25%, transparent 25%, transparent 75%, #e2e8f0 75%, #e2e8f0), repeating-linear-gradient(45deg, #e2e8f0 25%, #f8fafc 25%, #f8fafc 75%, #e2e8f0 75%, #e2e8f0)', backgroundPosition: '0 0, 10px 10px', backgroundSize: '20px 20px' }}></div>
        <img src={asset.url} alt={asset.name} className="max-h-full max-w-full object-contain relative z-10 drop-shadow-sm group-hover:scale-105 transition-transform" />
      </div>
      <div className="p-2 text-center text-[10px] font-semibold text-slate-500 truncate">
        {asset.name}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[85vh] flex flex-col shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Image className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-gray-900">Галерея логотипов и печатей</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 text-gray-500 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {assets.custom.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">
                    Загруженные файлы
                  </h4>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {assets.custom.map(renderAsset)}
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">
                  Системные пресеты
                </h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {assets.presets.map(renderAsset)}
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-100 bg-gray-50 text-xs text-gray-500 text-center">
          Чтобы загрузить новые файлы, используйте менеджер в разделе «CRM / Логотипы и Печати»
        </div>
      </div>
    </div>
  );
}
