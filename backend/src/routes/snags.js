import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
  getSnagsByAudit,
  getSnagById,
  updateSnag,
  getAllSnags,
  getMediaByAudit,
  getMediaBySnag,
  updateMediaSnag,
} from '../models/snag.js';

const router = Router();

router.get('/', (req, res) => {
  try {
    const { project, status, trade } = req.query;
    const filters = {};
    if (project) filters.project = project;
    if (status) filters.status = status;
    if (trade) filters.trade = trade;
    const snags = getAllSnags(filters);
    res.json(snags);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/audit/:auditId', (req, res) => {
  try {
    const snags = getSnagsByAudit(req.params.auditId);
    const media = getMediaByAudit(req.params.auditId).map(m => {
      const filename = m.file_path.split(/[/\\]/).pop();
      return { ...m, url: `/uploads/media/${filename}` };
    });
    res.json({ snags, media });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const snag = getSnagById(req.params.id);
    if (!snag) return res.status(404).json({ error: 'Snag not found' });
    const media = getMediaBySnag(req.params.id).map(m => {
      const filename = m.file_path.split(/[/\\]/).pop();
      return { ...m, url: `/uploads/media/${filename}` };
    });
    res.json({ ...snag, media });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id', (req, res) => {
  try {
    const allowed = ['snag_description', 'project_name', 'recommended_trade', 'recommended_builder', 'deadline', 'materials_needed', 'plant_needed', 'drawing_reference', 'additional_notes', 'status'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'No valid updates' });
    const snag = updateSnag(req.params.id, updates);
    res.json(snag);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/attach-media', (req, res) => {
  try {
    const { mediaIds } = req.body;
    if (!Array.isArray(mediaIds)) return res.status(400).json({ error: 'mediaIds array required' });
    for (const mediaId of mediaIds) {
      updateMediaSnag(mediaId, req.params.id);
    }
    const snag = getSnagById(req.params.id);
    const media = getMediaBySnag(req.params.id);
    res.json({ ...snag, media });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
