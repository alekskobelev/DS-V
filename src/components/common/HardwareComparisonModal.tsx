import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Scale, Check, Minus, Plus, Trash2, ShieldCheck, Download, 
  ExternalLink, PhoneCall, Sparkles, ArrowRight, HelpCircle
} from 'lucide-react';
import { Product } from '../../types';
import { useApp } from '../../context/AppContext';

interface HardwareComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  selectedProductIds: string[];
  onRemoveProduct: (id: string) => void;
  onAddProduct: (product: Product) => void;
  allAvailableProducts: Product[];
}

export const HardwareComparisonModal: React.FC<HardwareComparisonModalProps> = ({
  isOpen,
  onClose,
  products,
  selectedProductIds,
  onRemoveProduct,
  onAddProduct,
  allAvailableProducts
}) => {
  const { openContactModal } = useApp();
  const [showAddPicker, setShowAddPicker] = useState(false);

  const selectedProducts = products.filter(p => selectedProductIds.includes(p.id));

  // Extract unique spec keys across all selected products
  const specKeys = Array.from(
    new Set(
      selectedProducts.flatMap(p => Object.keys(p.specs || {}))
    )
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden"
        >
          {/* Modal Header */}
          <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50 dark:bg-slate-850">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-md">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Сравнение технических и метрологических характеристик
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Построчное сопоставление точности, диапазона, технологий сканирования и статуса в Госреестре СИ РФ
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Body / Comparison Matrix */}
          <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
            {selectedProducts.length === 0 ? (
              <div className="py-12 text-center text-slate-500 space-y-3">
                <Scale className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-500" />
                <div className="text-base font-bold text-slate-700 dark:text-slate-300">
                  Нет выбранных приборов для сравнения
                </div>
                <p className="text-xs max-w-md mx-auto text-slate-400">
                  Выберите до 4 единиц измерительного оборудования или 3D-сканеров в каталоге для построчного сопоставления параметров.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr>
                      <th className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold w-1/4 rounded-tl-xl border-b border-slate-200 dark:border-slate-700">
                        Параметр / Прибор
                      </th>
                      {selectedProducts.map(p => (
                        <th key={p.id} className="p-3 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white font-bold border-b border-l border-slate-200 dark:border-slate-700 align-top relative min-w-[200px]">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="text-[10px] text-blue-600 dark:text-blue-400 font-extrabold uppercase">
                                {p.brand}
                              </div>
                              <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                                {p.name}
                              </div>
                            </div>
                            <button
                              onClick={() => onRemoveProduct(p.id)}
                              className="text-slate-400 hover:text-rose-500 transition-colors cursor-pointer p-1"
                              title="Убрать из сравнения"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </th>
                      ))}
                      {selectedProducts.length < 4 && (
                        <th className="p-3 bg-slate-50/50 dark:bg-slate-900/50 border-b border-l border-dashed border-slate-300 dark:border-slate-700 text-center align-middle min-w-[150px]">
                          <button
                            onClick={() => setShowAddPicker(!showAddPicker)}
                            className="px-4 py-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Добавить</span>
                          </button>
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {/* Basic Metrology Row: Status in State Register */}
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-850">
                        Госреестр СИ РФ
                      </td>
                      {selectedProducts.map(p => (
                        <td key={p.id} className="p-3 border-l border-slate-200 dark:border-slate-800">
                          {p.badge?.includes('Госреестр') || p.fullDescription.includes('Госреестр') ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                              <ShieldCheck className="w-4 h-4" /> Внесен в Госреестр СИ
                            </span>
                          ) : (
                            <span className="text-slate-400">По запросу / Сертификат заводской калибровки</span>
                          )}
                        </td>
                      ))}
                      {selectedProducts.length < 4 && <td className="border-l border-dashed border-slate-200 dark:border-slate-800"></td>}
                    </tr>

                    {/* Price & Lead time */}
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-850">
                        Стоимость и наличие
                      </td>
                      {selectedProducts.map(p => (
                        <td key={p.id} className="p-3 border-l border-slate-200 dark:border-slate-800">
                          <div className="font-extrabold text-blue-600 dark:text-blue-400 text-sm">
                            {p.priceText || (p.price ? (typeof p.price === 'number' ? `${p.price.toLocaleString('ru-RU')} ₽` : `${p.price} ₽`) : 'По запросу ТКП')}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">В наличии на складе в Москве</div>
                        </td>
                      ))}
                      {selectedProducts.length < 4 && <td className="border-l border-dashed border-slate-200 dark:border-slate-800"></td>}
                    </tr>

                    {/* Dynamic Tech Specs */}
                    {specKeys.map(key => (
                      <tr key={key} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-medium text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-850">
                          {key}
                        </td>
                        {selectedProducts.map(p => {
                          const val = p.specs ? p.specs[key] : undefined;
                          return (
                            <td key={p.id} className="p-3 border-l border-slate-200 dark:border-slate-800">
                              {val ? (
                                <span className="font-semibold text-slate-900 dark:text-white">{val}</span>
                              ) : (
                                <span className="text-slate-300 dark:text-slate-500">—</span>
                              )}
                            </td>
                          );
                        })}
                        {selectedProducts.length < 4 && <td className="border-l border-dashed border-slate-200 dark:border-slate-800"></td>}
                      </tr>
                    ))}

                    {/* Action Row */}
                    <tr>
                      <td className="p-3 bg-slate-100 dark:bg-slate-800 font-bold">Официальное ТКП</td>
                      {selectedProducts.map(p => (
                        <td key={p.id} className="p-3 border-l border-slate-200 dark:border-slate-700">
                          <button
                            onClick={() => openContactModal({
                              title: `Запрос ТКП на ${p.name}`,
                              formType: 'consultation'
                            })}
                            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            <span>Запросить ТКП</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      ))}
                      {selectedProducts.length < 4 && <td className="border-l border-dashed border-slate-200 dark:border-slate-800"></td>}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Quick Picker dropdown when "Add" is clicked */}
            {showAddPicker && (
              <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold uppercase text-slate-500 dark:text-slate-300">
                    Выберите прибор для добавления в сравнение:
                  </div>
                  <button
                    onClick={() => setShowAddPicker(false)}
                    className="text-xs text-slate-400 hover:text-slate-500"
                  >
                    Закрыть
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                  {allAvailableProducts
                    .filter(p => !selectedProductIds.includes(p.id))
                    .map(p => (
                      <button
                        key={p.id}
                        onClick={() => {
                          onAddProduct(p);
                          setShowAddPicker(false);
                        }}
                        className="p-2.5 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-900/30 border border-slate-200 dark:border-slate-700 rounded-xl text-left transition-colors flex items-center justify-between text-xs cursor-pointer"
                      >
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{p.name}</div>
                          <div className="text-[10px] text-slate-500">{p.brand} • {p.categoryLabel}</div>
                        </div>
                        <Plus className="w-4 h-4 text-blue-600 shrink-0" />
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Официальная гарантия ООО «ДС-Инжиниринг» — до 36 месяцев с выездным сервисом.</span>
            </div>

            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Закрыть окно
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
