import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import slugify from 'slugify';
import dotenv from 'dotenv';
import { initializeDatabase, getDatabase } from './database';

dotenv.config();

async function seed() {
  console.log('🌱 Seeding database...\n');

  await initializeDatabase();
  const db = getDatabase();

  // Clear existing data
  db.exec('DELETE FROM media');
  db.exec('DELETE FROM posts');
  db.exec('DELETE FROM categories');
  db.exec('DELETE FROM users');

  // Create users
  const adminId = uuidv4();
  const editorId = uuidv4();
  const authorId = uuidv4();

  const adminPassword = await bcrypt.hash('admin123', 12);
  const editorPassword = await bcrypt.hash('editor123', 12);
  const authorPassword = await bcrypt.hash('author123', 12);

  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, password, role, bio) 
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertUser.run(adminId, 'Admin User', 'admin@contenthub.com', adminPassword, 'admin', 'System administrator with full access to all features.');
  insertUser.run(editorId, 'Sarah Editor', 'editor@contenthub.com', editorPassword, 'editor', 'Senior content editor with a passion for quality writing.');
  insertUser.run(authorId, 'John Author', 'author@contenthub.com', authorPassword, 'author', 'Content creator focused on technology and development topics.');

  console.log('✅ Users created');

  // Create categories
  const categories = [
    { name: 'Technology', description: 'Latest in tech, software, and innovation', color: '#6366f1' },
    { name: 'Design', description: 'UI/UX design, typography, and visual arts', color: '#ec4899' },
    { name: 'Business', description: 'Entrepreneurship, strategy, and management', color: '#f59e0b' },
    { name: 'Development', description: 'Programming, frameworks, and best practices', color: '#10b981' },
    { name: 'Marketing', description: 'Digital marketing, SEO, and growth strategies', color: '#8b5cf6' },
    { name: 'Tutorials', description: 'Step-by-step guides and how-to articles', color: '#06b6d4' },
  ];

  const insertCategory = db.prepare(`
    INSERT INTO categories (id, name, slug, description, color)
    VALUES (?, ?, ?, ?, ?)
  `);

  const categoryIds: string[] = [];
  for (const cat of categories) {
    const id = uuidv4();
    categoryIds.push(id);
    insertCategory.run(id, cat.name, slugify(cat.name, { lower: true }), cat.description, cat.color);
  }

  console.log('✅ Categories created');

  // Create posts
  const posts = [
    {
      title: 'Getting Started with TypeScript in 2026',
      content: `# Getting Started with TypeScript in 2026\n\nTypeScript has become the de facto standard for modern JavaScript development. In this comprehensive guide, we'll explore the latest features and best practices.\n\n## Why TypeScript?\n\nTypeScript provides static type checking, better IDE support, and improved code quality. It catches errors at compile time rather than runtime.\n\n## Key Features\n\n- **Type Inference**: TypeScript can automatically infer types\n- **Generics**: Write reusable, type-safe code\n- **Decorators**: Add metadata to classes and methods\n- **Union Types**: Combine multiple types\n\n## Getting Started\n\n\`\`\`typescript\ninterface User {\n  id: string;\n  name: string;\n  email: string;\n}\n\nfunction greetUser(user: User): string {\n  return \`Hello, \${user.name}!\`;\n}\n\`\`\`\n\n## Conclusion\n\nTypeScript continues to evolve and remains an essential tool for professional developers.`,
      excerpt: 'A comprehensive guide to TypeScript features and best practices for modern development.',
      status: 'published',
      author_id: adminId,
      category_id: categoryIds[0],
    },
    {
      title: 'Building Scalable React Applications',
      content: `# Building Scalable React Applications\n\nLearn how to architect React applications that scale with your team and codebase.\n\n## Architecture Patterns\n\n### Feature-Based Structure\n\nOrganize your code by features rather than file types:\n\n\`\`\`\nsrc/\n  features/\n    auth/\n      components/\n      hooks/\n      api/\n    dashboard/\n      components/\n      hooks/\n      api/\n\`\`\`\n\n### State Management\n\nChoose the right state management solution:\n- **React Context** for simple global state\n- **Zustand** for medium complexity\n- **Redux Toolkit** for complex state logic\n\n## Performance Optimization\n\n1. Use React.memo wisely\n2. Implement code splitting with lazy loading\n3. Optimize re-renders with useMemo and useCallback\n4. Use virtualization for long lists`,
      excerpt: 'Architecture patterns and best practices for building large-scale React applications.',
      status: 'published',
      author_id: editorId,
      category_id: categoryIds[3],
    },
    {
      title: 'Modern CSS Techniques Every Developer Should Know',
      content: `# Modern CSS Techniques\n\nCSS has evolved tremendously. Here are the techniques every developer should master.\n\n## CSS Grid Layout\n\nCSS Grid is perfect for two-dimensional layouts:\n\n\`\`\`css\n.grid-container {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));\n  gap: 1.5rem;\n}\n\`\`\`\n\n## CSS Custom Properties\n\nVariables that cascade and inherit:\n\n\`\`\`css\n:root {\n  --primary: #6366f1;\n  --radius: 0.5rem;\n}\n\n.button {\n  background: var(--primary);\n  border-radius: var(--radius);\n}\n\`\`\`\n\n## Container Queries\n\nResponsive design based on container size, not viewport.`,
      excerpt: 'Master modern CSS techniques including Grid, Custom Properties, and Container Queries.',
      status: 'published',
      author_id: authorId,
      category_id: categoryIds[1],
    },
    {
      title: 'The Complete Guide to REST API Design',
      content: `# REST API Design Guide\n\nDesigning a great REST API requires careful thought about resources, naming, and conventions.\n\n## Principles\n\n1. Use nouns for resources\n2. Use HTTP methods correctly\n3. Return appropriate status codes\n4. Implement pagination\n5. Version your API\n\n## Example\n\n\`\`\`\nGET    /api/posts        - List posts\nPOST   /api/posts        - Create post\nGET    /api/posts/:id    - Get post\nPUT    /api/posts/:id    - Update post\nDELETE /api/posts/:id    - Delete post\n\`\`\``,
      excerpt: 'Learn the principles and best practices for designing clean, maintainable REST APIs.',
      status: 'published',
      author_id: adminId,
      category_id: categoryIds[3],
    },
    {
      title: 'Introduction to Docker for Web Developers',
      content: `# Docker for Web Developers\n\nDocker simplifies deployment and ensures consistency across environments.\n\n## Key Concepts\n\n- **Images**: Blueprints for containers\n- **Containers**: Running instances of images\n- **Volumes**: Persistent data storage\n- **Networks**: Communication between containers\n\n## Getting Started\n\n\`\`\`dockerfile\nFROM node:20-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nEXPOSE 3000\nCMD ["node", "index.js"]\n\`\`\``,
      excerpt: 'A beginner-friendly introduction to Docker containerization for web applications.',
      status: 'draft',
      author_id: editorId,
      category_id: categoryIds[0],
    },
    {
      title: 'SEO Best Practices for Modern Web Apps',
      content: `# SEO Best Practices\n\nOptimize your web application for search engines with these proven strategies.\n\n## Technical SEO\n\n- Implement proper meta tags\n- Use semantic HTML\n- Optimize Core Web Vitals\n- Create XML sitemaps\n- Implement structured data\n\n## Content SEO\n\n- Write quality, original content\n- Use proper heading hierarchy\n- Optimize images with alt text\n- Internal linking strategy`,
      excerpt: 'Proven SEO strategies to improve your web application visibility in search engines.',
      status: 'published',
      author_id: authorId,
      category_id: categoryIds[4],
    },
    {
      title: 'Building a Design System from Scratch',
      content: `# Building a Design System\n\nA design system ensures consistency and accelerates development across your organization.\n\n## Core Components\n\n1. **Tokens**: Colors, typography, spacing\n2. **Components**: Buttons, inputs, cards\n3. **Patterns**: Forms, navigation, layouts\n4. **Documentation**: Usage guidelines\n\n## Implementation\n\nStart small, iterate, and document everything.`,
      excerpt: 'A practical guide to creating a comprehensive design system for your organization.',
      status: 'archived',
      author_id: editorId,
      category_id: categoryIds[1],
    },
    {
      title: 'Step-by-Step: Building a Node.js REST API',
      content: `# Building a Node.js REST API\n\nFollow this tutorial to build a production-ready REST API with Node.js and Express.\n\n## Setup\n\n\`\`\`bash\nmkdir my-api && cd my-api\nnpm init -y\nnpm install express cors helmet\nnpm install -D typescript @types/express tsx\n\`\`\`\n\n## Project Structure\n\n\`\`\`\nsrc/\n  controllers/\n  middleware/\n  routes/\n  index.ts\n\`\`\`\n\nFollow along to build a complete CRUD API with authentication and validation.`,
      excerpt: 'A hands-on tutorial for building a complete REST API with Node.js, Express, and TypeScript.',
      status: 'published',
      author_id: adminId,
      category_id: categoryIds[5],
    },
  ];

  const insertPost = db.prepare(`
    INSERT INTO posts (id, title, slug, content, excerpt, status, author_id, category_id, views, published_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const dates = [
    '2026-01-05 10:00:00', '2026-01-12 14:30:00', '2026-01-20 09:15:00',
    '2026-01-28 16:45:00', '2026-02-03 11:20:00', '2026-02-08 13:00:00',
    '2026-02-12 15:30:00', '2026-02-15 10:45:00',
  ];

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const id = uuidv4();
    const slug = slugify(post.title, { lower: true, strict: true });
    const views = Math.floor(Math.random() * 500) + 50;
    const publishedAt = post.status === 'published' ? dates[i] : null;

    insertPost.run(id, post.title, slug, post.content, post.excerpt, post.status, post.author_id, post.category_id, views, publishedAt, dates[i]);
  }

  // Update category post counts
  db.exec(`
    UPDATE categories SET post_count = (
      SELECT COUNT(*) FROM posts WHERE posts.category_id = categories.id
    )
  `);

  console.log('✅ Posts created');
  console.log('\n🎉 Database seeded successfully!\n');
  console.log('📧 Login credentials:');
  console.log('   Admin:  admin@contenthub.com  / admin123');
  console.log('   Editor: editor@contenthub.com / editor123');
  console.log('   Author: author@contenthub.com / author123\n');
}

seed().catch(console.error);
