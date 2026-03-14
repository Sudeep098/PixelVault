import formidable from 'formidable';
import { query, initDB } from '../../../lib/db';
import { uploadToCloudinary } from '../../../lib/cloudinary';
import { requireAuth } from '../../../lib/auth';

export const config = { api: { bodyParser: false } };

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  await initDB();

  const form = formidable({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'File parse error' });

    try {
      const image_name = Array.isArray(fields.image_name) ? fields.image_name[0] : fields.image_name;
      const description = Array.isArray(fields.description) ? fields.description[0] : fields.description;
      const personsRaw = Array.isArray(fields.persons) ? fields.persons[0] : fields.persons;
      const tagsRaw = Array.isArray(fields.tags) ? fields.tags[0] : fields.tags;

      const persons = personsRaw ? personsRaw.split(',').map(p => p.trim()).filter(Boolean) : [];
      const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [];

      const fileObj = Array.isArray(files.image) ? files.image[0] : files.image;
      if (!fileObj) return res.status(400).json({ error: 'No image file uploaded' });

      const ext = fileObj.originalFilename?.split('.').pop()?.toLowerCase();
      if (!['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
        return res.status(400).json({ error: 'Invalid file type. Only jpg, jpeg, png, gif, webp allowed.' });
      }

      const imageUrl = await uploadToCloudinary(fileObj.filepath);

      const imgResult = await query(
        'INSERT INTO images (user_id, image_name, image_path, description) VALUES ($1, $2, $3, $4) RETURNING *',
        [req.user.user_id, image_name, imageUrl, description]
      );
      const image = imgResult.rows[0];

      for (const pname of persons) {
        let person = await query('SELECT * FROM persons WHERE LOWER(person_name) = LOWER($1)', [pname]);
        if (person.rows.length === 0) {
          person = await query('INSERT INTO persons (person_name) VALUES ($1) RETURNING *', [pname]);
        }
        await query(
          'INSERT INTO image_person (image_id, person_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [image.image_id, person.rows[0].person_id]
        );
      }

      for (const tname of tags) {
        let tag = await query('SELECT * FROM tags WHERE LOWER(tag_name) = LOWER($1)', [tname]);
        if (tag.rows.length === 0) {
          tag = await query('INSERT INTO tags (tag_name) VALUES ($1) RETURNING *', [tname]);
        }
        await query(
          'INSERT INTO image_tag (image_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [image.image_id, tag.rows[0].tag_id]
        );
      }

      return res.status(201).json({ image });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Upload failed: ' + e.message });
    }
  });
}

export default requireAuth(handler);
