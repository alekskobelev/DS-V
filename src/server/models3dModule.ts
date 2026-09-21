import express from 'express';
import fs from 'fs';
import path from 'path';
import { Model3DItem } from '../types.ts';
import { DEFAULT_3D_MODELS } from '../data/default3dModels.ts';
import { logRealtimeEvent } from './logger.ts';

const DATA_FILE = path.join(process.cwd(), 'data', 'models3d.json');

let modelsStore: Model3DItem[] = [];

// Initialize data from disk or fallback to presets
export function init3DModelsStore() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        modelsStore = parsed;
        return;
      }
    }
  } catch (err) {
    console.warn('[3DModelsModule] Failed to read models3d.json, using defaults:', err);
  }
  modelsStore = JSON.parse(JSON.stringify(DEFAULT_3D_MODELS));
  saveToDisk();
}

function saveToDisk() {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(modelsStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('[3DModelsModule] Failed to save models3d.json:', err);
  }
}

export function register3DModelsRoutes(app: express.Application) {
  init3DModelsStore();

  // GET all 3D models
  app.get('/api/models3d', (_req, res) => {
    res.json({
      success: true,
      data: modelsStore.sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
    });
  });

  // GET single 3D model
  app.get('/api/models3d/:id', (req, res) => {
    const model = modelsStore.find(m => m.id === req.params.id);
    if (!model) {
      return res.status(404).json({ success: false, error: '3D-модель не найдена' });
    }
    res.json({ success: true, data: model });
  });

  // POST create new 3D model
  app.post('/api/models3d', (req, res) => {
    try {
      const {
        name,
        category,
        geometryType,
        description,
        material,
        manufacturingProcess,
        pointCount,
        triangleCount,
        minTolerance,
        maxTolerance,
        inspectionPoints,
        customMeshUrl,
        cadFileUrl,
        cadFileName,
        cadFileSize,
        scanMeshUrl,
        scanMeshFileName,
        scanMeshFileSize,
        pointCloudUrl,
        pointCloudFileName,
        pointCloudFileSize
      } = req.body;

      if (!name || typeof name !== 'string') {
        return res.status(400).json({ success: false, error: 'Название 3D-модели обязательно' });
      }

      const id = req.body.id && typeof req.body.id === 'string'
        ? req.body.id.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-')
        : `model-${Date.now()}`;

      // Check unique ID
      if (modelsStore.some(m => m.id === id)) {
        return res.status(400).json({ success: false, error: `Модель с идентификатором '${id}' уже существует` });
      }

      const newModel: Model3DItem = {
        id,
        name: name.trim(),
        category: category?.trim() || 'Инжиниринговые детали',
        geometryType: geometryType || 'procedural_impeller',
        description: description?.trim() || '',
        material: material?.trim() || 'Конструкционная сталь',
        manufacturingProcess: manufacturingProcess?.trim() || 'ЧПУ Мехобработка',
        pointCount: Number(pointCount) || 150000,
        triangleCount: Number(triangleCount) || 300000,
        minTolerance: typeof minTolerance === 'number' ? minTolerance : -0.05,
        maxTolerance: typeof maxTolerance === 'number' ? maxTolerance : 0.05,
        inspectionPoints: Array.isArray(inspectionPoints) ? inspectionPoints : [],
        customMeshUrl: customMeshUrl?.trim() || undefined,
        cadFileUrl: cadFileUrl?.trim() || undefined,
        cadFileName: cadFileName?.trim() || undefined,
        cadFileSize: cadFileSize?.trim() || undefined,
        scanMeshUrl: scanMeshUrl?.trim() || undefined,
        scanMeshFileName: scanMeshFileName?.trim() || undefined,
        scanMeshFileSize: scanMeshFileSize?.trim() || undefined,
        pointCloudUrl: pointCloudUrl?.trim() || undefined,
        pointCloudFileName: pointCloudFileName?.trim() || undefined,
        pointCloudFileSize: pointCloudFileSize?.trim() || undefined,
        orderIndex: modelsStore.length,
        isDefault: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      modelsStore.push(newModel);
      saveToDisk();

      logRealtimeEvent({
        category: 'CMS_UPDATE',
        level: 'INFO',
        action: 'CREATE_3D_MODEL',
        summary: `Создана новая 3D-модель для просмотрщика: ${newModel.name} (${newModel.id})`
      });

      res.status(201).json({ success: true, data: newModel });
    } catch (err: any) {
      console.error('[3DModelsModule] Error creating model:', err);
      res.status(500).json({ success: false, error: 'Не удалось создать 3D-модель' });
    }
  });

  // PATCH update 3D model
  app.patch('/api/models3d/:id', (req, res) => {
    try {
      const idx = modelsStore.findIndex(m => m.id === req.params.id);
      if (idx === -1) {
        return res.status(404).json({ success: false, error: '3D-модель не найдена' });
      }

      const current = modelsStore[idx];
      const updates = req.body;

      const updatedModel: Model3DItem = {
        ...current,
        ...updates,
        id: current.id, // ID is immutable
        updatedAt: new Date().toISOString()
      };

      if (typeof updates.pointCount === 'number') updatedModel.pointCount = updates.pointCount;
      if (typeof updates.triangleCount === 'number') updatedModel.triangleCount = updates.triangleCount;
      if (typeof updates.minTolerance === 'number') updatedModel.minTolerance = updates.minTolerance;
      if (typeof updates.maxTolerance === 'number') updatedModel.maxTolerance = updates.maxTolerance;
      if (Array.isArray(updates.inspectionPoints)) updatedModel.inspectionPoints = updates.inspectionPoints;

      modelsStore[idx] = updatedModel;
      saveToDisk();

      logRealtimeEvent({
        category: 'CMS_UPDATE',
        level: 'INFO',
        action: 'UPDATE_3D_MODEL',
        summary: `Обновлена 3D-модель в просмотрщике: ${updatedModel.name} (${updatedModel.id})`
      });

      res.json({ success: true, data: updatedModel });
    } catch (err: any) {
      console.error('[3DModelsModule] Error updating model:', err);
      res.status(500).json({ success: false, error: 'Не удалось обновить 3D-модель' });
    }
  });

  // DELETE 3D model
  app.delete('/api/models3d/:id', (req, res) => {
    try {
      const id = req.params.id;
      const idx = modelsStore.findIndex(m => m.id === id);
      if (idx === -1) {
        return res.status(404).json({ success: false, error: '3D-модель не найдена' });
      }

      const deleted = modelsStore.splice(idx, 1)[0];
      saveToDisk();

      logRealtimeEvent({
        category: 'CMS_UPDATE',
        level: 'WARN',
        action: 'DELETE_3D_MODEL',
        summary: `Удалена 3D-модель из просмотрщика: ${deleted.name} (${deleted.id})`
      });

      res.json({ success: true, message: `3D-модель ${deleted.name} удалена`, data: deleted });
    } catch (err: any) {
      console.error('[3DModelsModule] Error deleting model:', err);
      res.status(500).json({ success: false, error: 'Не удалось удалить 3D-модель' });
    }
  });

  // POST reset to factory default models
  app.post('/api/models3d/reset', (_req, res) => {
    try {
      modelsStore = JSON.parse(JSON.stringify(DEFAULT_3D_MODELS));
      saveToDisk();

      logRealtimeEvent({
        category: 'CMS_UPDATE',
        level: 'WARN',
        action: 'RESET_3D_MODELS',
        summary: '3D-модели в просмотрщике сброшены к заводским пресетам'
      });

      res.json({ success: true, data: modelsStore });
    } catch (err: any) {
      console.error('[3DModelsModule] Error resetting models:', err);
      res.status(500).json({ success: false, error: 'Не удалось сбросить 3D-модели' });
    }
  });
}
