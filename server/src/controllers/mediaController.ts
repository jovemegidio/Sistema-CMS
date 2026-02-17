import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { getDatabase } from '../config/database';
import { AuthRequest } from '../middleware/auth';

export function getMedia(req: AuthRequest, res: Response): void {
  try {
    const db = getDatabase();
    const { search, type } = req.query;

    let where = 'WHERE 1=1';
    const params: any[] = [];

    if (search) {
      where += ' AND (m.original_name LIKE ?)';
      params.push(`%${search}%`);
    }

    if (type) {
      where += ' AND m.mime_type LIKE ?';
      params.push(`${type}%`);
    }

    const media = db.prepare(`
      SELECT m.*, u.name as uploaded_by_name
      FROM media m
      LEFT JOIN users u ON m.uploaded_by = u.id
      ${where}
      ORDER BY m.created_at DESC
    `).all(...params);

    res.json({ media });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch media.' });
  }
}

export function uploadMedia(req: AuthRequest, res: Response): void {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded.' });
      return;
    }

    const db = getDatabase();
    const id = uuidv4();
    const url = `/uploads/${req.file.filename}`;

    db.prepare(`
      INSERT INTO media (id, filename, original_name, mime_type, size, url, uploaded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, req.file.filename, req.file.originalname, req.file.mimetype, req.file.size, url, req.user!.id);

    const media = db.prepare(`
      SELECT m.*, u.name as uploaded_by_name
      FROM media m
      LEFT JOIN users u ON m.uploaded_by = u.id
      WHERE m.id = ?
    `).get(id);

    res.status(201).json({ media, message: 'File uploaded successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload file.' });
  }
}

export function deleteMedia(req: AuthRequest, res: Response): void {
  try {
    const db = getDatabase();
    const media = db.prepare('SELECT * FROM media WHERE id = ?').get(req.params.id) as any;

    if (!media) {
      res.status(404).json({ error: 'Media not found.' });
      return;
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, '../../uploads', media.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    db.prepare('DELETE FROM media WHERE id = ?').run(req.params.id);
    res.json({ message: 'Media deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete media.' });
  }
}
