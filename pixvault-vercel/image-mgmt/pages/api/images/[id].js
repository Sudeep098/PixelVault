import { query } from '../../../lib/db';
import { requireAuth } from '../../../lib/auth';
import { deleteFromCloudinary } from '../../../lib/cloudinary';

async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const result = await query(`
        SELECT 
          i.*,
          u.username,
          COALESCE(array_agg(DISTINCT t.tag_name) FILTER (WHERE t.tag_name IS NOT NULL), '{}') as tags,
          COALESCE(array_agg(DISTINCT p.person_name) FILTER (WHERE p.person_name IS NOT NULL), '{}') as persons
        FROM images i
        LEFT JOIN users u ON i.user_id = u.user_id
        LEFT JOIN image_tag it ON i.image_id = it.image_id
        LEFT JOIN tags t ON it.tag_id = t.tag_id
        LEFT JOIN image_person ip ON i.image_id = ip.image_id
        LEFT JOIN persons p ON ip.person_id = p.person_id
        WHERE i.image_id = $1
        GROUP BY i.image_id, u.username
      `, [id]);

      if (result.rows.length === 0) return res.status(404).json({ error: 'Image not found' });
      return res.status(200).json({ image: result.rows[0] });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to fetch image' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { image_name, description, persons: personsRaw, tags: tagsRaw } = req.body;

      // Check ownership
      const existing = await query('SELECT * FROM images WHERE image_id = $1 AND user_id = $2', [id, req.user.user_id]);
      if (existing.rows.length === 0) return res.status(403).json({ error: 'Forbidden' });

      await query('UPDATE images SET image_name = $1, description = $2 WHERE image_id = $3', [image_name, description, id]);

      // Reset tags
      await query('DELETE FROM image_tag WHERE image_id = $1', [id]);
      const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [];
      for (const tname of tags) {
        let tag = await query('SELECT * FROM tags WHERE LOWER(tag_name) = LOWER($1)', [tname]);
        if (tag.rows.length === 0) tag = await query('INSERT INTO tags (tag_name) VALUES ($1) RETURNING *', [tname]);
        await query('INSERT INTO image_tag (image_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [id, tag.rows[0].tag_id]);
      }

      // Reset persons
      await query('DELETE FROM image_person WHERE image_id = $1', [id]);
      const persons = personsRaw ? personsRaw.split(',').map(p => p.trim()).filter(Boolean) : [];
      for (const pname of persons) {
        let person = await query('SELECT * FROM persons WHERE LOWER(person_name) = LOWER($1)', [pname]);
        if (person.rows.length === 0) person = await query('INSERT INTO persons (person_name) VALUES ($1) RETURNING *', [pname]);
        await query('INSERT INTO image_person (image_id, person_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [id, person.rows[0].person_id]);
      }

      return res.status(200).json({ message: 'Updated' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Update failed' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const existing = await query('SELECT * FROM images WHERE image_id = $1 AND user_id = $2', [id, req.user.user_id]);
      if (existing.rows.length === 0) return res.status(403).json({ error: 'Forbidden' });

      await deleteFromCloudinary(existing.rows[0].image_path);
      await query('DELETE FROM images WHERE image_id = $1', [id]);
      return res.status(200).json({ message: 'Deleted' });
    } catch (err) {
      return res.status(500).json({ error: 'Delete failed' });
    }
  }

  return res.status(405).end();
}

export default requireAuth(handler);
