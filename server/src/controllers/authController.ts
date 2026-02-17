import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../config/database';
import { generateToken } from '../utils/jwt';
import { AuthRequest } from '../middleware/auth';

export async function login(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;
    const db = getDatabase();

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    if (!user.is_active) {
      res.status(403).json({ error: 'Your account has been deactivated.' });
      return;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
}

export async function register(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, email, password } = req.body;
    const db = getDatabase();

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const id = uuidv4();

    db.prepare(`
      INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, 'author')
    `).run(id, name, email, hashedPassword);

    const token = generateToken({ id, email, role: 'author' });

    res.status(201).json({
      token,
      user: { id, name, email, role: 'author', avatar: null, bio: null },
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
}

export function getMe(req: AuthRequest, res: Response): void {
  try {
    const db = getDatabase();
    const user = db.prepare(
      'SELECT id, name, email, role, avatar, bio, created_at FROM users WHERE id = ?'
    ).get(req.user!.id) as any;

    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user profile.' });
  }
}

export async function updateProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, bio, currentPassword, newPassword } = req.body;
    const db = getDatabase();

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user!.id) as any;
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    if (newPassword) {
      if (!currentPassword) {
        res.status(400).json({ error: 'Current password is required to set a new password.' });
        return;
      }
      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        res.status(401).json({ error: 'Current password is incorrect.' });
        return;
      }
      const hashed = await bcrypt.hash(newPassword, 12);
      db.prepare('UPDATE users SET password = ?, updated_at = datetime("now") WHERE id = ?').run(hashed, req.user!.id);
    }

    if (name || bio !== undefined) {
      db.prepare(
        'UPDATE users SET name = COALESCE(?, name), bio = COALESCE(?, bio), updated_at = datetime("now") WHERE id = ?'
      ).run(name || null, bio !== undefined ? bio : null, req.user!.id);
    }

    const updated = db.prepare(
      'SELECT id, name, email, role, avatar, bio FROM users WHERE id = ?'
    ).get(req.user!.id);

    res.json({ user: updated, message: 'Profile updated successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile.' });
  }
}
