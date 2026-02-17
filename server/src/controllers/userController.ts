import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../config/database';
import { AuthRequest } from '../middleware/auth';

export function getUsers(req: AuthRequest, res: Response): void {
  try {
    const db = getDatabase();
    const { search, role } = req.query;

    let where = 'WHERE 1=1';
    const params: any[] = [];

    if (search) {
      where += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (role && role !== 'all') {
      where += ' AND role = ?';
      params.push(role);
    }

    const users = db.prepare(`
      SELECT id, name, email, role, avatar, bio, is_active, created_at, updated_at,
        (SELECT COUNT(*) FROM posts WHERE author_id = users.id) as post_count
      FROM users ${where}
      ORDER BY created_at DESC
    `).all(...params);

    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
}

export function getUser(req: AuthRequest, res: Response): void {
  try {
    const db = getDatabase();
    const user = db.prepare(`
      SELECT id, name, email, role, avatar, bio, is_active, created_at, updated_at,
        (SELECT COUNT(*) FROM posts WHERE author_id = users.id) as post_count
      FROM users WHERE id = ?
    `).get(req.params.id);

    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user.' });
  }
}

export async function createUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, email, password, role = 'author', bio } = req.body;
    const db = getDatabase();

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      res.status(409).json({ error: 'A user with this email already exists.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const id = uuidv4();

    db.prepare(`
      INSERT INTO users (id, name, email, password, role, bio)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, name, email, hashedPassword, role, bio || '');

    const user = db.prepare(
      'SELECT id, name, email, role, avatar, bio, is_active, created_at FROM users WHERE id = ?'
    ).get(id);

    res.status(201).json({ user, message: 'User created successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user.' });
  }
}

export async function updateUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, email, password, role, bio, is_active } = req.body;
    const db = getDatabase();

    const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id) as any;
    if (!existing) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    if (email && email !== existing.email) {
      const emailExists = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, req.params.id);
      if (emailExists) {
        res.status(409).json({ error: 'This email is already in use.' });
        return;
      }
    }

    if (password) {
      const hashed = await bcrypt.hash(password, 12);
      db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashed, req.params.id);
    }

    db.prepare(`
      UPDATE users SET
        name = COALESCE(?, name),
        email = COALESCE(?, email),
        role = COALESCE(?, role),
        bio = COALESCE(?, bio),
        is_active = COALESCE(?, is_active),
        updated_at = datetime('now')
      WHERE id = ?
    `).run(
      name || null, email || null, role || null,
      bio !== undefined ? bio : null,
      is_active !== undefined ? (is_active ? 1 : 0) : null,
      req.params.id
    );

    const user = db.prepare(
      'SELECT id, name, email, role, avatar, bio, is_active, created_at, updated_at FROM users WHERE id = ?'
    ).get(req.params.id);

    res.json({ user, message: 'User updated successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user.' });
  }
}

export function deleteUser(req: AuthRequest, res: Response): void {
  try {
    const db = getDatabase();

    if (req.params.id === req.user!.id) {
      res.status(400).json({ error: 'You cannot delete your own account.' });
      return;
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
    res.json({ message: 'User deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user.' });
  }
}
