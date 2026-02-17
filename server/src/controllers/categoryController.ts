import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { createSlug } from '../utils/helpers';

export function getCategories(req: AuthRequest, res: Response): void {
  try {
    const db = getDatabase();
    const categories = db.prepare(`
      SELECT c.*, COUNT(p.id) as actual_count
      FROM categories c
      LEFT JOIN posts p ON p.category_id = c.id
      GROUP BY c.id
      ORDER BY c.name ASC
    `).all();

    res.json({ categories });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories.' });
  }
}

export function getCategory(req: AuthRequest, res: Response): void {
  try {
    const db = getDatabase();
    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);

    if (!category) {
      res.status(404).json({ error: 'Category not found.' });
      return;
    }

    res.json({ category });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch category.' });
  }
}

export function createCategory(req: AuthRequest, res: Response): void {
  try {
    const { name, description, color } = req.body;
    const db = getDatabase();

    const id = uuidv4();
    let slug = createSlug(name);

    const existing = db.prepare('SELECT id FROM categories WHERE slug = ?').get(slug);
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    db.prepare(`
      INSERT INTO categories (id, name, slug, description, color)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, name, slug, description || '', color || '#6366f1');

    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    res.status(201).json({ category, message: 'Category created successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create category.' });
  }
}

export function updateCategory(req: AuthRequest, res: Response): void {
  try {
    const { name, description, color } = req.body;
    const db = getDatabase();

    const existing = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id) as any;
    if (!existing) {
      res.status(404).json({ error: 'Category not found.' });
      return;
    }

    let slug = existing.slug;
    if (name && name !== existing.name) {
      slug = createSlug(name);
      const slugExists = db.prepare('SELECT id FROM categories WHERE slug = ? AND id != ?').get(slug, req.params.id);
      if (slugExists) slug = `${slug}-${Date.now()}`;
    }

    db.prepare(`
      UPDATE categories SET
        name = COALESCE(?, name),
        slug = ?,
        description = COALESCE(?, description),
        color = COALESCE(?, color),
        updated_at = datetime('now')
      WHERE id = ?
    `).run(name || null, slug, description !== undefined ? description : null, color || null, req.params.id);

    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
    res.json({ category, message: 'Category updated successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update category.' });
  }
}

export function deleteCategory(req: AuthRequest, res: Response): void {
  try {
    const db = getDatabase();

    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
    if (!category) {
      res.status(404).json({ error: 'Category not found.' });
      return;
    }

    // Set posts in this category to null
    db.prepare('UPDATE posts SET category_id = NULL WHERE category_id = ?').run(req.params.id);
    db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);

    res.json({ message: 'Category deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete category.' });
  }
}
