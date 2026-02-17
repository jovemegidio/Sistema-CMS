import slugify from 'slugify';

export function createSlug(text: string): string {
  return slugify(text, { lower: true, strict: true });
}

export function formatDate(date: string | Date): string {
  return new Date(date).toISOString();
}

export function paginate(page: number = 1, limit: number = 10) {
  const offset = (page - 1) * limit;
  return { limit, offset, page };
}
