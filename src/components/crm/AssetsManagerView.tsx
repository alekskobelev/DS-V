import React, { useState, useEffect, useRef } from 'react';
import { Image, UploadCloud, Trash2, Link as LinkIcon, Check, Copy } from 'lucide-react';
import { apiService } from '../../services/apiService';

interface AssetItem {
  name: string;
  url: string;
  type: string;
}

export function AssetsManagerView() {
  const [assets, setAssets] = useState<{ custom: AssetItem[], presets: AssetItem[] }>({ custom: [], presets: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAssets = async () => {
    setIsLoading(true);
    const res = await apiService.getAssets();
    if (res.success && res.data) {
      setAssets(res.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const res = await apiService.uploadAsset(file);
    setIsUploading(false);
    
    if (res.success) {
      fetchAssets();
    } else {
      alert(res.error || 'Ошибка загрузки файла');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (filename: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот файл?')) {
      const res = await apiService.deleteAsset(filename);
      if (res.success) {
        fetchAssets();
      } else {
        alert(res.error || 'Ошибка удаления файла');
      }
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const renderAssetCard = (asset: AssetItem, isCustom: boolean) => (
    <div key={asset.name} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group relative flex flex-col">
      <div className="h-32 bg-gray-50 flex items-center justify-center p-4 relative">
        <div className="absolute inset-0 bg-slate-100 opacity-50 checker-pattern" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #e2e8f0 25%, transparent 25%, transparent 75%, #e2e8f0 75%, #e2e8f0), repeating-linear-gradient(45deg, #e2e8f0 25%, #f8fafc 25%, #f8fafc 75%, #e2e8f0 75%, #e2e8f0)', backgroundPosition: '0 0, 10px 10px', backgroundSize: '20px 20px' }}></div>
        <img 
          src={asset.url} 
          alt={asset.name} 
          className="max-h-full max-w-full object-contain relative z-10 drop-shadow-sm"
        />
      </div>
      <div className="p-3 bg-white flex flex-col gap-2 flex-grow">
        <div className="text-xs font-semibold text-slate-800 truncate" title={asset.name}>
          {asset.name}
        </div>
        <div className="flex items-center gap-2 mt-auto">
          <button
            onClick={() => copyUrl(asset.url)}
            className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            title="Скопировать URL"
          >
            {copiedUrl === asset.url ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>URL</span>
          </button>
          
          {isCustom && (
            <button
              onClick={() => handleDelete(asset.name)}
              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
              title="Удалить"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Image className="w-5 h-5 text-indigo-600" />
              Менеджер логотипов и печатей
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Управляйте графическими файлами (логотипы компаний, печати, водяные знаки), которые можно динамически вставлять в редактор свидетельств и предложений.
            </p>
          </div>
          
          <div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/png, image/jpeg, image/svg+xml, image/webp"
            />
            <button
              onClick={handleUploadClick}
              disabled={isUploading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {isUploading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <UploadCloud className="w-4 h-4" />
              )}
              <span>Загрузить новый файл</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Custom Uploaded Assets */}
            <div>
              <h4 className="text-sm font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">
                Загруженные файлы
              </h4>
              
              {assets.custom.length === 0 ? (
                <div className="text-center p-8 bg-slate-50 border border-slate-200 border-dashed rounded-lg">
                  <Image className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">Нет загруженных файлов</p>
                  <p className="text-xs text-slate-500 mt-1">Нажмите «Загрузить новый файл», чтобы добавить логотип или печать.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {assets.custom.map(asset => renderAssetCard(asset, true))}
                </div>
              )}
            </div>

            {/* Default System Presets */}
            <div>
              <h4 className="text-sm font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">
                Системные пресеты (предустановленные логотипы)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {assets.presets.map(asset => renderAssetCard(asset, false))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
