import { Router } from 'express';
import { createTask } from '../services/clickup.js';
import { getSnagById, getSnagsByAudit, updateSnag } from '../models/snag.js';
import { getMediaBySnag } from '../models/snag.js';

const router = Router();

router.post('/sync/:snagId', async (req, res) => {
  try {
    const snag = getSnagById(req.params.snagId);
    if (!snag) return res.status(404).json({ error: 'Snag not found' });
    if (snag.clickup_task_id) return res.status(400).json({ error: 'Snag already synced to ClickUp' });

    const media = getMediaBySnag(req.params.snagId);
    const { existsSync } = await import('fs');
    const mediaPaths = media.map(m => m.file_path).filter(existsSync);

    const task = await createTask(snag, mediaPaths);
    updateSnag(req.params.snagId, { clickup_task_id: task?.id });

    res.json({ task, snag: getSnagById(req.params.snagId) });
  } catch (err) {
    console.error('ClickUp sync error:', err);
    res.status(500).json({ error: err.message || 'Sync failed' });
  }
});

router.post('/sync-audit/:auditId', async (req, res) => {
  try {
    const snags = getSnagsByAudit(req.params.auditId);
    const results = [];
    for (const snag of snags) {
      if (snag.clickup_task_id) {
        results.push({ snag_id: snag.id, status: 'skipped', reason: 'Already synced' });
        continue;
      }
      try {
        const media = getMediaBySnag(snag.id);
        const { existsSync } = await import('fs');
        const mediaPaths = media.map(m => m.file_path).filter(existsSync);

        const task = await createTask(snag, mediaPaths);
        updateSnag(snag.id, { clickup_task_id: task?.id });
        results.push({ snag_id: snag.id, status: 'created', task_id: task?.id });
      } catch (err) {
        results.push({ snag_id: snag.id, status: 'failed', error: err.message });
      }
    }
    res.json({ results });
  } catch (err) {
    console.error('ClickUp bulk sync error:', err);
    res.status(500).json({ error: err.message || 'Bulk sync failed' });
  }
});

export default router;
