import { query } from '../../../lib/db';
import { requireAuth } from '../../../lib/auth';

async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { q, type, date } = req.query;

  try {
    let sql = `
      SELECT DISTINCT
        i.*,
        COALESCE(array_agg(DISTINCT t.tag_name) FILTER (WHERE t.tag_name IS NOT NULL), '{}') as tags,
        COALESCE(array_agg(DISTINCT p.person_name) FILTER (WHERE p.person_name IS NOT NULL), '{}') as persons
      FROM images i
      LEFT JOIN image_tag it ON i.image_id = it.image_id
      LEFT JOIN tags t ON it.tag_id = t.tag_id
      LEFT JOIN image_person ip ON i.image_id = ip.image_id
      LEFT JOIN persons p ON ip.person_id = p.person_id
    `;

    const params = [];
    const conditions = [];

    if (type === 'person' && q) {
      sql += ' JOIN image_person ip2 ON i.image_id = ip2.image_id JOIN persons p2 ON ip2.person_id = p2.person_id';
      params.push(`%${q}%`);
      conditions.push(`LOWER(p2.person_name) LIKE LOWER($${params.length})`);
    } else if (type === 'tag' && q) {
      sql += ' JOIN image_tag it2 ON i.image_id = it2.image_id JOIN tags t2 ON it2.tag_id = t2.tag_id';
      params.push(`%${q}%`);
      conditions.push(`LOWER(t2.tag_name) LIKE LOWER($${params.length})`);
    } else if (type === 'name' && q) {
      params.push(`%${q}%`);
      conditions.push(`LOWER(i.image_name) LIKE LOWER($${params.length})`);
    } else if (type === 'date' && date) {
      params.push(date);
      conditions.push(`DATE(i.upload_date) = $${params.length}`);
    } else if (q) {
      params.push(`%${q}%`);
      conditions.push(`(LOWER(i.image_name) LIKE LOWER($${params.length}))`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' GROUP BY i.image_id ORDER BY i.upload_date DESC LIMIT 50';

    const result = await query(sql, params);
    return res.status(200).json({ images: result.rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Search failed' });
  }
}

export default requireAuth(handler);
