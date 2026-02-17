import { Response } from 'express';
import { getDatabase } from '../config/database';
import { AuthRequest } from '../middleware/auth';

export function getStats(req: AuthRequest, res: Response): void {
  try {
    const db = getDatabase();

    const totalPosts = db.prepare('SELECT COUNT(*) as count FROM posts').get() as any;
    const publishedPosts = db.prepare("SELECT COUNT(*) as count FROM posts WHERE status = 'published'").get() as any;
    const draftPosts = db.prepare("SELECT COUNT(*) as count FROM posts WHERE status = 'draft'").get() as any;
    const totalCategories = db.prepare('SELECT COUNT(*) as count FROM categories').get() as any;
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get() as any;
    const totalMedia = db.prepare('SELECT COUNT(*) as count FROM media').get() as any;
    const totalViews = db.prepare('SELECT COALESCE(SUM(views), 0) as count FROM posts').get() as any;

    // Posts per month (last 6 months)
    const postsOverTime = db.prepare(`
      SELECT 
        strftime('%Y-%m', created_at) as month,
        COUNT(*) as count
      FROM posts
      WHERE created_at >= datetime('now', '-6 months')
      GROUP BY strftime('%Y-%m', created_at)
      ORDER BY month ASC
    `).all();

    // Posts by category
    const postsByCategory = db.prepare(`
      SELECT c.name, c.color, COUNT(p.id) as count
      FROM categories c
      LEFT JOIN posts p ON p.category_id = c.id
      GROUP BY c.id
      HAVING count > 0
      ORDER BY count DESC
    `).all();

    // Posts by status
    const postsByStatus = db.prepare(`
      SELECT status, COUNT(*) as count
      FROM posts
      GROUP BY status
    `).all();

    // Recent posts
    const recentPosts = db.prepare(`
      SELECT p.id, p.title, p.status, p.created_at, p.views, u.name as author_name
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      ORDER BY p.created_at DESC
      LIMIT 5
    `).all();

    // Recent users
    const recentUsers = db.prepare(`
      SELECT id, name, email, role, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 5
    `).all();

    res.json({
      stats: {
        totalPosts: totalPosts.count,
        publishedPosts: publishedPosts.count,
        draftPosts: draftPosts.count,
        totalCategories: totalCategories.count,
        totalUsers: totalUsers.count,
        totalMedia: totalMedia.count,
        totalViews: totalViews.count,
      },
      charts: {
        postsOverTime,
        postsByCategory,
        postsByStatus,
      },
      recent: {
        posts: recentPosts,
        users: recentUsers,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard statistics.' });
  }
}
