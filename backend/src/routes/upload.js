import { Router } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { transcribeAudio, extractSnagsFromTranscript, matchPhotosToSnags } from '../services/openai.js';
import { parseAndValidateSnags } from '../services/snagParser.js';
import { createSnag, createMedia } from '../models/snag.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = Router();

const voiceStorage = multer.diskStorage({
  destination: join(__dirname, '../../uploads/voice'),
  filename: (req, file, cb) => {
    const ext = file.originalname.split('.').pop() || 'webm';
    cb(null, `${uuidv4()}.${ext}`);
  },
});

const mediaStorage = multer.diskStorage({
  destination: join(__dirname, '../../uploads/media'),
  filename: (req, file, cb) => {
    const ext = file.originalname.split('.').pop() || 'bin';
    cb(null, `${uuidv4()}-${file.originalname}`);
  },
});

const voiceUpload = multer({
  storage: voiceStorage,
  limits: { fileSize: parseInt(process.env.MAX_VOICE_SIZE, 10) || 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/webm', 'audio/mp4', 'audio/x-m4a', 'audio/m4a'];
    if (allowed.includes(file.mimetype) || file.originalname.match(/\.(mp3|wav|webm|m4a|mp4)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid audio format'));
    }
  },
});

const mediaUpload = multer({
  storage: mediaStorage,
  limits: { fileSize: parseInt(process.env.MAX_MEDIA_SIZE, 10) || 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/heic', 'image/webp', 'video/mp4', 'video/quicktime', 'video/webm', 'application/pdf'];
    if (allowed.includes(file.mimetype) || file.originalname.match(/\.(jpg|jpeg|png|heic|webp|mp4|mov|webm|pdf)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid media format'));
    }
  },
});

router.post('/voice', voiceUpload.single('audio'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No audio file provided' });

    const transcript = await transcribeAudio(req.file.path);
    const rawSnags = await extractSnagsFromTranscript(transcript);
    const snags = parseAndValidateSnags(rawSnags);

    const auditId = req.body.auditId || uuidv4();
    const snagRecords = snags.map(s => ({
      ...s,
      id: uuidv4(),
      audit_id: auditId,
    }));

    for (const snag of snagRecords) {
      createSnag(snag);
    }

    res.json({
      auditId,
      transcript,
      snags: snagRecords,
    });
  } catch (err) {
    console.error('Voice processing error:', err);
    res.status(500).json({ error: err.message || 'Voice processing failed' });
  }
});

router.post('/media', mediaUpload.array('media', 20), async (req, res) => {
  try {
    if (!req.files?.length) return res.status(400).json({ error: 'No media files provided' });

    const auditId = req.body.auditId || uuidv4();
    const mediaRecords = req.files.map(file => {
      const type = file.mimetype.startsWith('image/') ? 'photo' : file.mimetype.startsWith('video/') ? 'video' : 'drawing';
      const record = {
        id: uuidv4(),
        audit_id: auditId,
        file_path: file.path.replace(/\\/g, '/'),
        file_name: file.originalname,
        file_type: file.mimetype,
        media_type: type,
      };
      createMedia(record);
      return { ...record, url: `/uploads/media/${file.filename}` };
    });

    res.json({ auditId, media: mediaRecords });
  } catch (err) {
    console.error('Media upload error:', err);
    res.status(500).json({ error: err.message || 'Media upload failed' });
  }
});

router.post('/process', voiceUpload.single('audio'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No audio file provided' });

    const auditId = req.body.auditId || uuidv4();
    const projectName = req.body.projectName || 'Unknown Project';

    const transcript = await transcribeAudio(req.file.path);
    const rawSnags = await extractSnagsFromTranscript(transcript);
    const snags = parseAndValidateSnags(rawSnags, projectName);

    const snagRecords = snags.map(s => ({
      ...s,
      id: uuidv4(),
      audit_id: auditId,
    }));

    for (const snag of snagRecords) {
      createSnag(snag);
    }

    res.json({
      auditId,
      transcript,
      snags: snagRecords,
    });
  } catch (err) {
    console.error('Process error:', err);
    res.status(500).json({ error: err.message || 'Processing failed' });
  }
});

router.post('/text', async (req, res) => {
  try {
    const { text, projectName, auditId: existingAuditId } = req.body || {};

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'No text provided' });
    }

    const auditId = existingAuditId || uuidv4();
    const defaultProject = projectName || 'Unknown Project';

    const rawSnags = await extractSnagsFromTranscript(text);
    const snags = parseAndValidateSnags(rawSnags, defaultProject);

    const snagRecords = snags.map(s => ({
      ...s,
      id: uuidv4(),
      audit_id: auditId,
    }));

    for (const snag of snagRecords) {
      createSnag(snag);
    }

    res.json({
      auditId,
      snags: snagRecords,
    });
  } catch (err) {
    console.error('Text processing error:', err);
    res.status(500).json({ error: err.message || 'Text processing failed' });
  }
});

export default router;
