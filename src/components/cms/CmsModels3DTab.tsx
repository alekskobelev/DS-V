import React, { useState } from 'react';
import { 
  Box, 
  Plus, 
  Trash2, 
  Edit3, 
  RotateCcw, 
  Eye, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Sparkles, 
  Cpu, 
  Disc, 
  Activity, 
  Grid, 
  Save, 
  X, 
  Sliders, 
  Scan,
  Compass,
  FileCode2,
  Copy,
  Download,
  Lock,
  FileText
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Model3DItem, InspectionPoint, GeometryPresetType, canUserManage3DModels } from '../../types';
import { CadFileUploadCard } from './CadFileUploadCard';

import { CadModel3DViewer } from '../common/CadModel3DViewer';

export const CmsModels3DTab: React.FC = () => {
  const { models3D, addModel3D, updateModel3D, deleteModel3D, resetModels3D, showToast, currentUser } = useApp();
  const canManage3D = canUserManage3DModels(currentUser);

  const [selectedModelForPreview, setSelectedModelForPreview] = useState<string | null>(
    models3D[0]?.id || null
  );
  const [previewSize, setPreviewSize] = useState<'standard' | 'expanded' | 'fullwidth'>('standard');

  const [isEditingModalOpen, setIsEditingModalOpen] = useState<boolean>(false);
  const [editingModel, setEditingModel] = useState<Partial<Model3DItem> | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);

  // Safe in-app confirmation modals (replaces window.confirm which fails inside iframes)
  const [deleteConfirmModel, setDeleteConfirmModel] = useState<{ id: string; name: string } | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);

  // Open modal for new model creation
  const handleOpenCreateModal = () => {
    if (!canManage3D) {
      showToast('Добавление моделей доступно только администраторам и модераторам');
      return;
    }
    setIsCreatingNew(true);
    setEditingModel({
      id: `model-${Date.now()}`,
      name: '',
      category: 'Инжиниринговые детали',
      geometryType: 'procedural_impeller',
      description: '',
      material: 'Конструкционная легированная сталь',
      manufacturingProcess: '5-осевая ЧПУ фрезеровка',
      pointCount: 180000,
      triangleCount: 360000,
      minTolerance: -0.05,
      maxTolerance: 0.05,
      inspectionPoints: [
        {
          id: `pt-${Date.now()}-1`,
          name: 'Контрольная точка 1',
          coords: [0, 0.8, 0],
          deviation: 0.012,
          status: 'nominal',
          surfaceName: 'Базовая плоскость'
        }
      ]
    });
    setIsEditingModalOpen(true);
  };

  // Open modal for editing existing model
  const handleOpenEditModal = (model: Model3DItem) => {
    if (!canManage3D) {
      showToast('Редактирование моделей доступно только администраторам и модераторам');
      return;
    }
    setIsCreatingNew(false);
    setEditingModel(JSON.parse(JSON.stringify(model)));
    setIsEditingModalOpen(true);
  };

  // Duplicate / Copy model for admin/moderator
  const handleDuplicateModel = async (model: Model3DItem) => {
    if (!canManage3D) {
      showToast('Копирование моделей доступно только администраторам и модераторам');
      return;
    }
    const newId = `model-${Date.now()}`;
    const duplicate: Model3DItem = {
      ...JSON.parse(JSON.stringify(model)),
      id: newId,
      name: `${model.name} (Копия)`,
      isDefault: false,
      orderIndex: models3D.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await addModel3D(duplicate);
    setSelectedModelForPreview(newId);
    showToast(`Создана копия модели «${duplicate.name}»`);
  };

  // Export model specification as JSON (for admin/moderator)
  const handleExportModelSpec = (model: Model3DItem) => {
    if (!canManage3D) {
      showToast('Экспорт спецификаций доступен только администраторам и модераторам');
      return;
    }
    const spec = {
      id: model.id,
      name: model.name,
      category: model.category,
      geometryType: model.geometryType,
      description: model.description,
      material: model.material,
      manufacturingProcess: model.manufacturingProcess,
      pointCount: model.pointCount,
      triangleCount: model.triangleCount,
      minTolerance: model.minTolerance,
      maxTolerance: model.maxTolerance,
      inspectionPoints: model.inspectionPoints,
      cadFileName: model.cadFileName,
      scanMeshFileName: model.scanMeshFileName,
      pointCloudFileName: model.pointCloudFileName,
      exportedAt: new Date().toISOString(),
      platform: 'ООО «ДС-Инжиниринг» WebGL Metrology Platform'
    };
    const blob = new Blob([JSON.stringify(spec, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ds-engineering-model-${model.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Спецификация «${model.name}» сохранена в файл JSON`);
  };

  // Save changes (Create or Update)
  const handleSaveModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModel || !editingModel.name?.trim()) {
      showToast('Укажите название 3D-модели');
      return;
    }

    if (isCreatingNew) {
      await addModel3D(editingModel);
      if (editingModel.id) {
        setSelectedModelForPreview(editingModel.id);
      }
    } else if (editingModel.id) {
      await updateModel3D(editingModel.id, editingModel);
      setSelectedModelForPreview(editingModel.id);
    }

    setIsEditingModalOpen(false);
    setEditingModel(null);
  };

  // Delete model (called from safe modal)
  const handleConfirmDeleteModel = async () => {
    if (!deleteConfirmModel) return;
    const { id, name } = deleteConfirmModel;
    setDeleteConfirmModel(null);
    await deleteModel3D(id);
    if (selectedModelForPreview === id) {
      setSelectedModelForPreview(models3D.find(m => m.id !== id)?.id || null);
    }
  };

  // Reset to factory defaults (called from safe modal)
  const handleConfirmResetDefaults = async () => {
    setIsResetConfirmOpen(false);
    await resetModels3D();
    setSelectedModelForPreview(null);
  };

  // Inspection Points manipulation in Edit Modal
  const handleAddInspectionPoint = () => {
    if (!editingModel) return;
    const newPt: InspectionPoint = {
      id: `pt-${Date.now()}`,
      name: `Точка #${(editingModel.inspectionPoints?.length || 0) + 1}`,
      coords: [0, 0, 0],
      deviation: 0.0,
      status: 'nominal',
      surfaceName: 'Контрольная грань'
    };
    setEditingModel({
      ...editingModel,
      inspectionPoints: [...(editingModel.inspectionPoints || []), newPt]
    });
  };

  const handleUpdateInspectionPoint = (index: number, updates: Partial<InspectionPoint>) => {
    if (!editingModel || !editingModel.inspectionPoints) return;
    const pts = [...editingModel.inspectionPoints];
    pts[index] = { ...pts[index], ...updates };
    setEditingModel({ ...editingModel, inspectionPoints: pts });
  };

  const handleDeleteInspectionPoint = (index: number) => {
    if (!editingModel || !editingModel.inspectionPoints) return;
    const pts = editingModel.inspectionPoints.filter((_, i) => i !== index);
    setEditingModel({ ...editingModel, inspectionPoints: pts });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 rounded-xl border border-blue-800/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-semibold mb-2">
            <Scan className="w-3.5 h-3.5" />
            <span>Управление интерактивным 3D WebGL просмотрщиком</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Инженерные 3D-модели, Сетки сканирования и Карты GD&T
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
            Настройка моделей для страницы услуг (3D-сканирование, реверс-инжиниринг, метрологический контроль). Добавляйте детали, задавайте типы геометрии, допуски и точки метрологического контроля.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {canManage3D ? (
            <>
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(true)}
                className="flex items-center gap-1.5 px-4.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-slate-700"
                title="Восстановить заводские 3D-модели"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Сброс к эталонам</span>
              </button>

              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Добавить 3D-модель</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-amber-300">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Только для чтения</span>
            </div>
          )}
        </div>
      </div>

      {/* Grid: Models Table + Live Interactive 3D Preview (Adaptive Sizing) */}
      <div className={`grid gap-6 ${previewSize === 'fullwidth' ? 'grid-cols-1' : 'grid-cols-1 xl:grid-cols-12'}`}>
        {/* Left Side: Models List */}
        <div className={`${previewSize === 'fullwidth' ? 'w-full order-2' : 'xl:col-span-7'} space-y-3`}>
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Список 3D-моделей в просмотрщике ({models3D.length})</span>
            </h3>
            {canManage3D && (
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Полный доступ: Админ / Модератор</span>
              </span>
            )}
          </div>

          <div className="space-y-3">
            {models3D.map((model) => {
              const isSelected = selectedModelForPreview === model.id;
              return (
                <div
                  key={model.id}
                  onClick={() => setSelectedModelForPreview(model.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isSelected
                      ? 'border-blue-600 shadow-md ring-2 ring-blue-500/20'
                      : 'border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      model.geometryType === 'procedural_impeller' ? 'bg-blue-500/10 text-blue-600' :
                      model.geometryType === 'procedural_mold' ? 'bg-amber-500/10 text-amber-600' :
                      model.geometryType === 'procedural_housing' ? 'bg-indigo-500/10 text-indigo-600' :
                      model.geometryType === 'procedural_bevel_gear' ? 'bg-emerald-500/10 text-emerald-600' :
                      'bg-purple-500/10 text-purple-600'
                    }`}>
                      {model.geometryType === 'procedural_impeller' && <Sparkles className="w-5 h-5" />}
                      {model.geometryType === 'procedural_mold' && <Box className="w-5 h-5" />}
                      {model.geometryType === 'procedural_housing' && <Cpu className="w-5 h-5" />}
                      {model.geometryType === 'procedural_bevel_gear' && <Disc className="w-5 h-5" />}
                      {model.geometryType === 'procedural_volute' && <Activity className="w-5 h-5" />}
                      {model.geometryType === 'custom_url' && <Grid className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-sm text-gray-900 dark:text-white">
                          {model.name}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                          {model.category}
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                        {model.description || 'Инженерная геометрическая модель для инспекции'}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500 dark:text-slate-400 mt-2 font-mono">
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                          Точек: {model.pointCount.toLocaleString('ru-RU')}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                          Полигонов: {model.triangleCount.toLocaleString('ru-RU')}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Допуск: ±{Math.max(Math.abs(model.minTolerance), Math.abs(model.maxTolerance)).toFixed(3)} мм
                        </span>
                        <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                          <CheckCircle2 className="w-3 h-3" />
                          Точек инспекции: {model.inspectionPoints?.length || 0}
                        </span>
                      </div>

                      {/* Custom files badges */}
                      {(model.cadFileUrl || model.scanMeshUrl || model.pointCloudUrl) && (
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          {model.cadFileUrl && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
                              <Box className="w-3 h-3" />
                              <span>CAD .STP</span>
                            </span>
                          )}
                          {model.scanMeshUrl && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800">
                              <Layers className="w-3 h-3" />
                              <span>СКАН .STL</span>
                            </span>
                          )}
                          {model.pointCloudUrl && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200 border border-purple-200 dark:border-purple-800">
                              <Activity className="w-3 h-3" />
                              <span>ОБЛАКО .XYZ</span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {canManage3D ? (
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditModal(model);
                        }}
                        className="px-2.5 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-xl transition-colors flex items-center gap-1 border border-blue-200/80 dark:border-blue-800/80 cursor-pointer"
                        title="Редактировать параметры, допуски и точки контроля"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Изменить</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateModel(model);
                        }}
                        className="px-2.5 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-300 hover:text-blue-600 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-1 border border-gray-200 dark:border-slate-700 cursor-pointer"
                        title="Создать копию (дубликат) этой 3D-модели"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Копия</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExportModelSpec(model);
                        }}
                        className="p-1.5 text-gray-500 hover:text-emerald-600 bg-gray-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 rounded-xl transition-colors border border-gray-200 dark:border-slate-700 cursor-pointer"
                        title="Скачать спецификацию модели в JSON"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmModel({ id: model.id, name: model.name });
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 bg-gray-50 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors border border-gray-200 dark:border-slate-700 cursor-pointer"
                        title="Удалить 3D-модель"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                      <Lock className="w-3 h-3 text-amber-500" />
                      <span>Защищено</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Live Interactive 3D WebGL Preview with Adaptive Sizes */}
        <div className={`${previewSize === 'fullwidth' ? 'w-full order-1' : 'xl:col-span-5'} space-y-3`}>
          <div className="flex items-center justify-between px-1 flex-wrap gap-2">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-600" />
              <span>Интерактивный предпросмотр</span>
            </h3>
            
            {/* Adaptive Size Controls */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-800 p-0.5 rounded-xl text-[11px] font-semibold border border-gray-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setPreviewSize('standard')}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                  previewSize === 'standard'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                title="Стандартная панель (500px)"
              >
                Компактный
              </button>
              <button
                type="button"
                onClick={() => setPreviewSize('expanded')}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                  previewSize === 'expanded'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                title="Увеличенная панель (680px)"
              >
                Увеличенный
              </button>
              <button
                type="button"
                onClick={() => setPreviewSize('fullwidth')}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                  previewSize === 'fullwidth'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                title="На всю ширину экрана"
              >
                Широкий экран
              </button>
            </div>
          </div>

          <div className={`bg-slate-950 p-2 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-center transition-all duration-300 ${
            previewSize === 'expanded' ? 'min-h-[640px] h-[680px]' : previewSize === 'fullwidth' ? 'min-h-[620px] h-[720px]' : 'min-h-[460px] h-[520px]'
          }`}>
              <CadModel3DViewer
                initialModel={selectedModelForPreview || models3D[0]?.id}
                compactHeight={previewSize === 'standard'}
                showTitle={true}
                className="h-full w-full"
              />
          </div>
        </div>
      </div>

      {/* Edit / Create 3D Model Modal */}
      {isEditingModalOpen && editingModel && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center">
                  <Scan className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white">
                    {isCreatingNew ? 'Создание новой 3D-модели' : `Редактирование: ${editingModel.name}`}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    Параметры геометрии, допусков и метрологических точек контроля
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditingModalOpen(false)}
                className="p-2 text-gray-400 hover:text-slate-500 dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveModel} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 mb-1">
                    Название детали / узла *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingModel.name || ''}
                    onChange={(e) => setEditingModel({ ...editingModel, name: e.target.value })}
                    placeholder="Например: Крыльчатка турбины (Блиск)"
                    className="w-full px-4.5 py-2.5 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 mb-1">
                    Категория / Отрасль
                  </label>
                  <input
                    type="text"
                    value={editingModel.category || ''}
                    onChange={(e) => setEditingModel({ ...editingModel, category: e.target.value })}
                    placeholder="Авиастроение / Пресс-формы / Двигатели"
                    className="w-full px-4.5 py-2.5 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 mb-1">
                    Тип процедурной 3D геометрии
                  </label>
                  <select
                    value={editingModel.geometryType || 'procedural_impeller'}
                    onChange={(e) => setEditingModel({ ...editingModel, geometryType: e.target.value as GeometryPresetType })}
                    className="w-full px-4.5 py-2.5 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="procedural_impeller">Крыльчатка / Блиск (5-осевой турбинный ротор)</option>
                    <option value="procedural_mold">Пресс-форма (Плита матрицы с каналами охлаждения)</option>
                    <option value="procedural_housing">Корпус редуктора (Литье, фланцы, подшипники)</option>
                    <option value="procedural_bevel_gear">Вал-шестерня (Коническая спиральная гипоидная передача)</option>
                    <option value="procedural_volute">Улитка насоса (Спиральный корпус центробежного компрессора)</option>
                    <option value="custom_url">Пользовательский STL / Загрузка</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 mb-1">
                    Материал заготовки
                  </label>
                  <input
                    type="text"
                    value={editingModel.material || ''}
                    onChange={(e) => setEditingModel({ ...editingModel, material: e.target.value })}
                    placeholder="Титан ВТ6 / Сталь 40Х / Алюминий АК7ч"
                    className="w-full px-4.5 py-2.5 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 mb-1">
                    Нижний предел допуска (мм)
                  </label>
                  <input
                    type="number"
                    step="0.005"
                    value={editingModel.minTolerance ?? -0.05}
                    onChange={(e) => setEditingModel({ ...editingModel, minTolerance: parseFloat(e.target.value) })}
                    className="w-full px-4.5 py-2.5 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 mb-1">
                    Верхний предел допуска (мм)
                  </label>
                  <input
                    type="number"
                    step="0.005"
                    value={editingModel.maxTolerance ?? 0.05}
                    onChange={(e) => setEditingModel({ ...editingModel, maxTolerance: parseFloat(e.target.value) })}
                    className="w-full px-4.5 py-2.5 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 mb-1">
                  Описание и технологические особенности
                </label>
                <textarea
                  rows={2}
                  value={editingModel.description || ''}
                  onChange={(e) => setEditingModel({ ...editingModel, description: e.target.value })}
                  placeholder="Опишите назначение детали, методы контроля и особенности реверс-инжиниринга..."
                  className="w-full px-4.5 py-2.5 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* 3D Files Upload Section for the 3 Representation Modes */}
              <div className="pt-4 border-t border-gray-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span>Файлы 3D-модели для 3 режимов отображения</span>
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      Загрузите файлы для CAD-модели (.stp, .step), полигонального 3D-скана (.stl) и облака точек (.xyz, .pts, .txt)
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* 1. CAD Solid Model (STP/STEP) */}
                  <CadFileUploadCard
                    id="cms-upload-cad-stp"
                    title="1. CAD-модель (STP/STEP)"
                    subtitle="Твердотельная мастер-модель"
                    targetModeLabel="CAD-модель"
                    icon={Box}
                    formatPill=".STP / .STEP / .IGES"
                    accept=".stp,.step,.iges,.igs,.obj"
                    fileUrl={editingModel.cadFileUrl}
                    fileName={editingModel.cadFileName}
                    fileSize={editingModel.cadFileSize}
                    onUploadSuccess={({ url, fileName, fileSize, detectedPoints, detectedTriangles }) => {
                      setEditingModel(prev => prev ? {
                        ...prev,
                        cadFileUrl: url,
                        cadFileName: fileName,
                        cadFileSize: fileSize,
                        pointCount: detectedPoints ? detectedPoints : prev.pointCount,
                        triangleCount: detectedTriangles ? detectedTriangles : prev.triangleCount
                      } : null);
                    }}
                    onRemove={() => {
                      setEditingModel(prev => prev ? {
                        ...prev,
                        cadFileUrl: undefined,
                        cadFileName: undefined,
                        cadFileSize: undefined
                      } : null);
                    }}
                  />

                  {/* 2. 3D-Scan Mesh (STL) */}
                  <CadFileUploadCard
                    id="cms-upload-scan-stl"
                    title="2. 3D-скан / Сетка (STL)"
                    subtitle="Полигональная сетка скана"
                    targetModeLabel="Сетка / Отклонения"
                    icon={Layers}
                    formatPill=".STL / .PLY"
                    accept=".stl,.ply,.obj"
                    fileUrl={editingModel.scanMeshUrl || editingModel.customMeshUrl}
                    fileName={editingModel.scanMeshFileName}
                    fileSize={editingModel.scanMeshFileSize}
                    onUploadSuccess={({ url, fileName, fileSize, detectedPoints, detectedTriangles }) => {
                      setEditingModel(prev => prev ? {
                        ...prev,
                        scanMeshUrl: url,
                        customMeshUrl: url,
                        scanMeshFileName: fileName,
                        scanMeshFileSize: fileSize,
                        pointCount: detectedPoints ? detectedPoints : prev.pointCount,
                        triangleCount: detectedTriangles ? detectedTriangles : prev.triangleCount
                      } : null);
                    }}
                    onRemove={() => {
                      setEditingModel(prev => prev ? {
                        ...prev,
                        scanMeshUrl: undefined,
                        customMeshUrl: undefined,
                        scanMeshFileName: undefined,
                        scanMeshFileSize: undefined
                      } : null);
                    }}
                  />

                  {/* 3. Point Cloud (XYZ / PTS) */}
                  <CadFileUploadCard
                    id="cms-upload-points-cloud"
                    title="3. Облако точек (XYZ)"
                    subtitle="Координаты лазерного скана"
                    targetModeLabel="Облако точек"
                    icon={Activity}
                    formatPill=".XYZ / .PTS / .TXT"
                    accept=".xyz,.pts,.asc,.pcd,.txt,.csv"
                    fileUrl={editingModel.pointCloudUrl}
                    fileName={editingModel.pointCloudFileName}
                    fileSize={editingModel.pointCloudFileSize}
                    onUploadSuccess={({ url, fileName, fileSize, detectedPoints }) => {
                      setEditingModel(prev => prev ? {
                        ...prev,
                        pointCloudUrl: url,
                        pointCloudFileName: fileName,
                        pointCloudFileSize: fileSize,
                        pointCount: detectedPoints ? detectedPoints : prev.pointCount
                      } : null);
                    }}
                    onRemove={() => {
                      setEditingModel(prev => prev ? {
                        ...prev,
                        pointCloudUrl: undefined,
                        pointCloudFileName: undefined,
                        pointCloudFileSize: undefined
                      } : null);
                    }}
                  />
                </div>
              </div>

              {/* Inspection Points Table Editor */}
              <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Контрольные метрологические точки GD&T ({editingModel.inspectionPoints?.length || 0})</span>
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      Интерактивные маркеры с расчетом отклонений на 3D-модели
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddInspectionPoint}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Добавить точку</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {editingModel.inspectionPoints?.map((pt, idx) => (
                    <div key={pt.id || idx} className="p-3 bg-gray-50 dark:bg-slate-950 rounded-xl border border-gray-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                      <div className="sm:col-span-3">
                        <input
                          type="text"
                          value={pt.name}
                          onChange={(e) => handleUpdateInspectionPoint(idx, { name: e.target.value })}
                          placeholder="Название точки"
                          className="w-full px-2 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <input
                          type="text"
                          value={pt.surfaceName}
                          onChange={(e) => handleUpdateInspectionPoint(idx, { surfaceName: e.target.value })}
                          placeholder="Контролируемая грань"
                          className="w-full px-2 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <input
                          type="number"
                          step="0.001"
                          value={pt.deviation}
                          onChange={(e) => {
                            const dev = parseFloat(e.target.value);
                            const status = Math.abs(dev) <= 0.02 ? 'nominal' : (Math.abs(dev) <= 0.04 ? 'warning' : 'critical');
                            handleUpdateInspectionPoint(idx, { deviation: dev, status });
                          }}
                          placeholder="Отклонение Δ (мм)"
                          className="w-full px-2 py-1.5 text-xs font-mono rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <select
                          value={pt.status}
                          onChange={(e) => handleUpdateInspectionPoint(idx, { status: e.target.value as any })}
                          className="w-full px-2 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                        >
                          <option value="nominal">В допуске (Nominal)</option>
                          <option value="warning">Предупреждение (Warning)</option>
                          <option value="critical">Брак / Критично (Critical)</option>
                        </select>
                      </div>

                      <div className="sm:col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleDeleteInspectionPoint(idx)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-slate-800 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="pt-4 border-t border-gray-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div>
                  {!isCreatingNew && editingModel.id && (
                    <button
                      type="button"
                      onClick={() => handleExportModelSpec(editingModel as Model3DItem)}
                      className="px-4.5 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 rounded-xl transition-colors flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Выгрузить JSON спецификацию</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditingModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Сохранить 3D-модель</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Safe In-App Delete Confirmation Modal */}
      {deleteConfirmModel && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full p-6 border border-gray-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-950/60 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Удаление 3D-модели
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  Действие необратимо
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-300 leading-relaxed">
              Вы действительно хотите удалить 3D-модель <strong className="text-gray-900 dark:text-white">«{deleteConfirmModel.name}»</strong>? Будут удалены связанные контрольные точки GD&T и настройки отображения из базы данных.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmModel(null)}
                className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteModel}
                className="px-4 py-2 text-xs font-bold bg-red-600 hover:bg-red-500 text-white rounded-xl shadow-lg shadow-red-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Да, удалить</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Safe In-App Reset Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full p-6 border border-gray-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center shrink-0">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Сброс к эталонам
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  Восстановление заводских моделей
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-300 leading-relaxed">
              Сбросить все 3D-модели к исходным инженерным пресетам ООО «ДС-Инжиниринг»? Все пользовательские изменения будут сброшены к метрологическим эталонам.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleConfirmResetDefaults}
                className="px-4 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white rounded-xl shadow-lg shadow-amber-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Сбросить к эталонам</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
