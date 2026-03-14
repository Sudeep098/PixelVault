import { query } from '../../../lib/db';
import { requireAuth } from '../../../lib/auth';

async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  try {
    const result = await query(`
      SELECT 
        i.*,
        COALESCE(array_agg(DISTINCT t.tag_name) FILTER (WHERE t.tag_name IS NOT NULL), '{}') as tags,
        COALESCE(array_agg(DISTINCT p.person_name) FILTER (WHERE p.person_name IS NOT NULL), '{}') as persons
      FROM images i
      LEFT JOIN image_tag it ON i.image_id = it.image_id
      LEFT JOIN tags t ON it.tag_id = t.tag_id
      LEFT JOIN image_person ip ON i.image_id = ip.image_id
      LEFT JOIN persons p ON ip.person_id = p.person_id
      WHERE i.user_id = $1
      GROUP BY i.image_id
      ORDER BY i.upload_date DESC
    `, [req.user.user_id]);

    return res.status(200).json({ images: result.rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch images' });
  }
}

export default requireAuth(handler);
