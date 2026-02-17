import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { createSlug, paginate } from '../utils/helpers';

export function getPosts(req: AuthRequest, res: Response): void {
  try {
    const db = getDatabase();
    const { page = '1', limit = '10', status, category, search, sort = 'created_at', order = 'desc' } = req.query;

    const { limit: lim, offset } = paginate(Number(page), Number(limit));

    let where = 'WHERE 1=1';
    const params: any[] = [];

    if (status && status !== 'all') {
      where += ' AND p.status = ?';
      params.push(status);
    }

    if (category) {
      where += ' AND p.category_id = ?';
      params.push(category);
    }

    if (search) {
      where += ' AND (p.title LIKE ? OR p.excerpt LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    const allowedSorts = ['created_at', 'title', 'views', 'updated_at'];
    const sortField = allowedSorts.includes(sort as string) ? sort : 'created_at';
    const sortOrder = order === 'asc' ? 'ASC' : 'DESC';

    const total = db.prepare(
      `SELECT COUNT(*) as count FROM posts p ${where}`
    ).get(...params) as any;

    const posts = db.prepare(`
      SELECT p.*, u.name as author_name, u.avatar as author_avatar, c.name as category_name, c.color as category_color
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      ${where}
      ORDER BY p.${sortField} ${sortOrder}
      LIMIT ? OFFSET ?
    `).all(...params, lim, offset);

    res.json({
      posts,
      pagination: {
        page: Number(page),
        limit: lim,
        total: total.count,
        totalPages: Math.ceil(total.count / lim),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts.' });
  }
}

export function getPost(req: AuthRequest, res: Response): void {
  try {
    const db = getDatabase();
    const post = db.prepare(`
      SELECT p.*, u.name as author_name, u.avatar as author_avatar, c.name as category_name, c.color as category_color
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `).get(req.params.id);

    if (!post) {
      res.status(404).json({ error: 'Post not found.' });
      return;
    }

    res.json({ post });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch post.' });
  }
}

export function createPost(req: AuthRequest, res: Response): void {
  try {
    const { title, content, excerpt, cover_image, status = 'draft', category_id } = req.body;
    const db = getDatabase();

    const id = uuidv4();
    let slug = createSlug(title);

    // Ensure unique slug
    const existing = db.prepare('SELECT id FROM posts WHERE slug = ?').get(slug);
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const publishedAt = status === 'published' ? new Date().toISOString() : null;

    db.prepare(`
      INSERT INTO posts (id, title, slug, content, excerpt, cover_image, status, author_id, category_id, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, title, slug, content || '', excerpt || '', cover_image || null, status, req.user!.id, category_id || null, publishedAt);

    // Update category post count
    if (category_id) {
      db.prepare('UPDATE categories SET post_count = post_count + 1 WHERE id = ?').run(category_id);
    }

    const post = db.prepare(`
      SELECT p.*, u.name as author_name, c.name as category_name, c.color as category_color
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `).get(id);

    res.status(201).json({ post, message: 'Post created successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create post.' });
  }
}

export function updatePost(req: AuthRequest, res: Response): void {
  try {
    const { title, content, excerpt, cover_image, status, category_id } = req.body;
    const db = getDatabase();

    const existing = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id) as any;
    if (!existing) {
      res.status(404).json({ error: 'Post not found.' });
      return;
    }

    let slug = existing.slug;
    if (title && title !== existing.title) {
      slug = createSlug(title);
      const slugExists = db.prepare('SELECT id FROM posts WHERE slug = ? AND id != ?').get(slug, req.params.id);
      if (slugExists) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    const publishedAt = status === 'published' && existing.status !== 'published'
      ? new Date().toISOString()
      : existing.published_at;

    db.prepare(`
      UPDATE posts SET
        title = COALESCE(?, title),
        slug = ?,
        content = COALESCE(?, content),
        excerpt = COALESCE(?, excerpt),
        cover_image = ?,
        status = COALESCE(?, status),
        category_id = ?,
        published_at = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `).run(
      title || null, slug, content !== undefined ? content : null,
      excerpt !== undefined ? excerpt : null, cover_image !== undefined ? cover_image : existing.cover_image,
      status || null, category_id !== undefined ? category_id : existing.category_id,
      publishedAt, req.params.id
    );

    // Update category counts if category changed
    if (category_id !== undefined && category_id !== existing.category_id) {
      if (existing.category_id) {
        db.prepare('UPDATE categories SET post_count = MAX(0, post_count - 1) WHERE id = ?').run(existing.category_id);
      }
      if (category_id) {
        db.prepare('UPDATE categories SET post_count = post_count + 1 WHERE id = ?').run(category_id);
      }
    }

    const post = db.prepare(`
      SELECT p.*, u.name as author_name, c.name as category_name, c.color as category_color
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `).get(req.params.id);

    res.json({ post, message: 'Post updated successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update post.' });
  }
}

export function deletePost(req: AuthRequest, res: Response): void {
  try {
    const db = getDatabase();

    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id) as any;
    if (!post) {
      res.status(404).json({ error: 'Post not found.' });
      return;
    }

    db.prepare('DELETE FROM posts WHERE id = ?').run(req.params.id);

    // Update category count
    if (post.category_id) {
      db.prepare('UPDATE categories SET post_count = MAX(0, post_count - 1) WHERE id = ?').run(post.category_id);
    }

    res.json({ message: 'Post deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete post.' });
  }
}
