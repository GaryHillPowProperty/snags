import Database from 'better-sqlite3';
import { join } from 'path';
import { mkdirSync, existsSync } from 'fs';

let db = null;

export function getDb() {
  if (!db) {
    const dbPath = process.env.DATABASE_URL || join(process.cwd(), 'data', 'snags.db');
    const dataDir = join(process.cwd(), 'data');
    if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
  }
  return db;
}

export function initDatabase() {
  const database = getDb();
  
  database.exec(`
    CREATE TABLE IF NOT EXISTS snags (
      id TEXT PRIMARY KEY,
      audit_id TEXT NOT NULL,
      snag_description TEXT NOT NULL,
      project_name TEXT NOT NULL,
      recommended_trade TEXT,
      recommended_builder TEXT,
      deadline TEXT,
      materials_needed TEXT,
      plant_needed TEXT,
      drawing_reference TEXT,
      additional_notes TEXT,
      status TEXT DEFAULT 'new',
      clickup_task_id TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS media (
      id TEXT PRIMARY KEY,
      audit_id TEXT NOT NULL,
      snag_id TEXT,
      file_path TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_type TEXT NOT NULL,
      media_type TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (snag_id) REFERENCES snags(id)
    );

    CREATE TABLE IF NOT EXISTS audits (
      id TEXT PRIMARY KEY,
      project_name TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      status TEXT DEFAULT 'draft'
    );

    CREATE INDEX IF NOT EXISTS idx_snags_audit ON snags(audit_id);
    CREATE INDEX IF NOT EXISTS idx_snags_project ON snags(project_name);
    CREATE INDEX IF NOT EXISTS idx_snags_status ON snags(status);
    CREATE INDEX IF NOT EXISTS idx_media_audit ON media(audit_id);
    CREATE INDEX IF NOT EXISTS idx_media_snag ON media(snag_id);
  `);

  return Promise.resolve();
}

export function createSnag(snag) {
  const database = getDb();
  const stmt = database.prepare(`
    INSERT INTO snags (id, audit_id, snag_description, project_name, recommended_trade, recommended_builder, deadline, materials_needed, plant_needed, drawing_reference, additional_notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    snag.id,
    snag.audit_id,
    snag.snag_description,
    snag.project_name,
    snag.recommended_trade || null,
    snag.recommended_builder || null,
    snag.deadline || null,
    snag.materials_needed || null,
    snag.plant_needed || null,
    snag.drawing_reference || null,
    snag.additional_notes || null
  );
  return snag;
}

export function getSnagsByAudit(auditId) {
  const database = getDb();
  const stmt = database.prepare('SELECT * FROM snags WHERE audit_id = ? ORDER BY created_at');
  return stmt.all(auditId);
}

export function getSnagById(id) {
  const database = getDb();
  const stmt = database.prepare('SELECT * FROM snags WHERE id = ?');
  return stmt.get(id);
}

export function updateSnag(id, updates) {
  const database = getDb();
  const fields = [...Object.keys(updates), 'updated_at'];
  const values = [...Object.values(updates), new Date().toISOString()];
  const setClause = fields.map(f => `${f} = ?`).join(', ');
  const stmt = database.prepare(`UPDATE snags SET ${setClause} WHERE id = ?`);
  stmt.run(...values, id);
  return getSnagById(id);
}

export function getAllSnags(filters = {}) {
  const database = getDb();
  let query = 'SELECT * FROM snags WHERE 1=1';
  const params = [];

  if (filters.project) {
    query += ' AND project_name = ?';
    params.push(filters.project);
  }
  if (filters.status) {
    query += ' AND status = ?';
    params.push(filters.status);
  }
  if (filters.trade) {
    query += ' AND recommended_trade = ?';
    params.push(filters.trade);
  }

  query += ' ORDER BY deadline ASC, created_at DESC';
  const stmt = database.prepare(query);
  return stmt.all(...params);
}

export function createMedia(media) {
  const database = getDb();
  const stmt = database.prepare(`
    INSERT INTO media (id, audit_id, snag_id, file_path, file_name, file_type, media_type)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    media.id,
    media.audit_id,
    media.snag_id || null,
    media.file_path,
    media.file_name,
    media.file_type,
    media.media_type
  );
  return media;
}

export function getMediaByAudit(auditId) {
  const database = getDb();
  const stmt = database.prepare('SELECT * FROM media WHERE audit_id = ?');
  return stmt.all(auditId);
}

export function getMediaBySnag(snagId) {
  const database = getDb();
  const stmt = database.prepare('SELECT * FROM media WHERE snag_id = ?');
  return stmt.all(snagId);
}

export function updateMediaSnag(mediaId, snagId) {
  const database = getDb();
  const stmt = database.prepare('UPDATE media SET snag_id = ? WHERE id = ?');
  stmt.run(snagId, mediaId);
}
