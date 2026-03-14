import { query } from '../../../lib/db';
import { requireAuth } from '../../../lib/auth';

const QUERIES = {
  1: {
    title: 'Show All Images',
    category: 'Basic Select',
    explanation: 'Retrieves all records from the Images table with their basic metadata.',
    sql: `SELECT image_id, image_name, description, upload_date 
FROM images 
ORDER BY upload_date DESC`,
    fn: (q) => q(`SELECT image_id, image_name, description, upload_date FROM images ORDER BY upload_date DESC`),
  },
  2: {
    title: 'Unique Tags',
    category: 'DISTINCT',
    explanation: 'Uses DISTINCT to show each unique tag only once, removing duplicates.',
    sql: `SELECT DISTINCT tag_name FROM tags ORDER BY tag_name`,
    fn: (q) => q(`SELECT DISTINCT tag_name FROM tags ORDER BY tag_name`),
  },
  3: {
    title: 'Image Name + Tag Concatenation',
    category: 'String Functions',
    explanation: 'Concatenates image name and tag name to create a combined label using string functions.',
    sql: `SELECT CONCAT(i.image_name, ' , ', t.tag_name) AS image_tag_combined
FROM images i
JOIN image_tag it ON i.image_id = it.image_id
JOIN tags t ON it.tag_id = t.tag_id`,
    fn: (q) => q(`SELECT CONCAT(i.image_name, ' , ', t.tag_name) AS image_tag_combined FROM images i JOIN image_tag it ON i.image_id = it.image_id JOIN tags t ON it.tag_id = t.tag_id`),
  },
  4: {
    title: 'Images Uploaded After 2024-01-01',
    category: 'Filter / WHERE',
    explanation: 'Filters images uploaded after a specific date using the WHERE clause.',
    sql: `SELECT image_id, image_name, upload_date 
FROM images 
WHERE upload_date > '2024-01-01'
ORDER BY upload_date`,
    fn: (q) => q(`SELECT image_id, image_name, upload_date FROM images WHERE upload_date > '2024-01-01' ORDER BY upload_date`),
  },
  5: {
    title: 'Images Without Persons',
    category: 'LEFT JOIN / NULL',
    explanation: 'Uses LEFT JOIN with a NULL check to find images that have no person tagged.',
    sql: `SELECT i.image_id, i.image_name
FROM images i
LEFT JOIN image_person ip ON i.image_id = ip.image_id
WHERE ip.person_id IS NULL`,
    fn: (q) => q(`SELECT i.image_id, i.image_name FROM images i LEFT JOIN image_person ip ON i.image_id = ip.image_id WHERE ip.person_id IS NULL`),
  },
  6: {
    title: 'Images With Multiple Tags',
    category: 'GROUP BY / HAVING',
    explanation: 'Uses GROUP BY and HAVING to find images that have more than one tag.',
    sql: `SELECT i.image_id, i.image_name, COUNT(it.tag_id) AS tag_count
FROM images i
JOIN image_tag it ON i.image_id = it.image_id
GROUP BY i.image_id, i.image_name
HAVING COUNT(it.tag_id) > 1
ORDER BY tag_count DESC`,
    fn: (q) => q(`SELECT i.image_id, i.image_name, COUNT(it.tag_id) AS tag_count FROM images i JOIN image_tag it ON i.image_id = it.image_id GROUP BY i.image_id, i.image_name HAVING COUNT(it.tag_id) > 1 ORDER BY tag_count DESC`),
  },
  7: {
    title: "Images Tagged 'Trip'",
    category: 'JOIN / Filter',
    explanation: "Joins Images and Tags tables to find all images that have the tag 'trip' (case-insensitive).",
    sql: `SELECT i.image_id, i.image_name, t.tag_name
FROM images i
JOIN image_tag it ON i.image_id = it.image_id
JOIN tags t ON it.tag_id = t.tag_id
WHERE LOWER(t.tag_name) = 'trip'`,
    fn: (q) => q(`SELECT i.image_id, i.image_name, t.tag_name FROM images i JOIN image_tag it ON i.image_id = it.image_id JOIN tags t ON it.tag_id = t.tag_id WHERE LOWER(t.tag_name) = 'trip'`),
  },
  8: {
    title: 'Images Containing Specific Person',
    category: 'Multi-table JOIN',
    explanation: 'Joins Images → Image_Person → Persons to retrieve images containing a specific person.',
    sql: `SELECT i.image_id, i.image_name, p.person_name
FROM images i
JOIN image_person ip ON i.image_id = ip.image_id
JOIN persons p ON ip.person_id = p.person_id
WHERE LOWER(p.person_name) LIKE '%rahul%'`,
    fn: (q) => q(`SELECT i.image_id, i.image_name, p.person_name FROM images i JOIN image_person ip ON i.image_id = ip.image_id JOIN persons p ON ip.person_id = p.person_id WHERE LOWER(p.person_name) LIKE '%rahul%'`),
  },
  9: {
    title: 'Images Uploaded in Current Year',
    category: 'Date Functions',
    explanation: 'Uses EXTRACT() date function to filter images uploaded in the current calendar year.',
    sql: `SELECT image_id, image_name, upload_date
FROM images
WHERE EXTRACT(YEAR FROM upload_date) = EXTRACT(YEAR FROM NOW())`,
    fn: (q) => q(`SELECT image_id, image_name, upload_date FROM images WHERE EXTRACT(YEAR FROM upload_date) = EXTRACT(YEAR FROM NOW())`),
  },
  10: {
    title: "Images With Description Containing 'birthday'",
    category: 'Pattern Matching',
    explanation: "Uses LIKE operator to search for images whose description contains the word 'birthday'.",
    sql: `SELECT image_id, image_name, description
FROM images
WHERE LOWER(description) LIKE '%birthday%'`,
    fn: (q) => q(`SELECT image_id, image_name, description FROM images WHERE LOWER(description) LIKE '%birthday%'`),
  },
  11: {
    title: 'Images With More Than 3 Tags',
    category: 'Aggregation / HAVING',
    explanation: 'Aggregation query using COUNT and HAVING to find images with more than 3 tags.',
    sql: `SELECT i.image_id, i.image_name, COUNT(it.tag_id) AS tag_count
FROM images i
JOIN image_tag it ON i.image_id = it.image_id
GROUP BY i.image_id, i.image_name
HAVING COUNT(it.tag_id) > 3`,
    fn: (q) => q(`SELECT i.image_id, i.image_name, COUNT(it.tag_id) AS tag_count FROM images i JOIN image_tag it ON i.image_id = it.image_id GROUP BY i.image_id, i.image_name HAVING COUNT(it.tag_id) > 3`),
  },
  12: {
    title: 'Sort Images by Upload Date (Descending)',
    category: 'ORDER BY',
    explanation: 'Orders all images by upload_date in descending order to see the newest images first.',
    sql: `SELECT image_id, image_name, upload_date
FROM images
ORDER BY upload_date DESC`,
    fn: (q) => q(`SELECT image_id, image_name, upload_date FROM images ORDER BY upload_date DESC`),
  },
  13: {
    title: "Image Names Where 3rd Letter = 'a'",
    category: 'Pattern Matching',
    explanation: "Uses LIKE pattern '__a%' to match image names where the third character is the letter 'a'.",
    sql: `SELECT image_id, image_name
FROM images
WHERE image_name LIKE '__a%'`,
    fn: (q) => q(`SELECT image_id, image_name FROM images WHERE image_name LIKE '__a%'`),
  },
  14: {
    title: "Images Tagged 'Trip' or 'College'",
    category: 'OR Condition',
    explanation: "Uses OR condition in WHERE clause to find images with either 'trip' or 'college' tag.",
    sql: `SELECT DISTINCT i.image_id, i.image_name, t.tag_name
FROM images i
JOIN image_tag it ON i.image_id = it.image_id
JOIN tags t ON it.tag_id = t.tag_id
WHERE LOWER(t.tag_name) IN ('trip', 'college')`,
    fn: (q) => q(`SELECT DISTINCT i.image_id, i.image_name, t.tag_name FROM images i JOIN image_tag it ON i.image_id = it.image_id JOIN tags t ON it.tag_id = t.tag_id WHERE LOWER(t.tag_name) IN ('trip', 'college')`),
  },
  15: {
    title: 'Tags Appearing in More Than 5 Images',
    category: 'GROUP BY / HAVING',
    explanation: 'Groups by tag and counts image appearances, using HAVING to filter tags used in more than 5 images.',
    sql: `SELECT t.tag_name, COUNT(it.image_id) AS image_count
FROM tags t
JOIN image_tag it ON t.tag_id = it.tag_id
GROUP BY t.tag_name
HAVING COUNT(it.image_id) > 5
ORDER BY image_count DESC`,
    fn: (q) => q(`SELECT t.tag_name, COUNT(it.image_id) AS image_count FROM tags t JOIN image_tag it ON t.tag_id = it.tag_id GROUP BY t.tag_name HAVING COUNT(it.image_id) > 5 ORDER BY image_count DESC`),
  },
  16: {
    title: 'Current Date Display',
    category: 'Date Functions',
    explanation: 'Shows the current date and time using the NOW() function.',
    sql: `SELECT NOW() AS current_datetime, 
       CURRENT_DATE AS today,
       CURRENT_TIME AS current_time`,
    fn: (q) => q(`SELECT NOW() AS current_datetime, CURRENT_DATE AS today, CURRENT_TIME AS current_time`),
  },
  17: {
    title: 'Months Since Image Uploaded',
    category: 'Date Arithmetic',
    explanation: 'Calculates the number of months elapsed since each image was uploaded using date functions.',
    sql: `SELECT image_id, image_name, upload_date,
       EXTRACT(YEAR FROM AGE(NOW(), upload_date)) * 12 + 
       EXTRACT(MONTH FROM AGE(NOW(), upload_date)) AS months_ago
FROM images
ORDER BY months_ago`,
    fn: (q) => q(`SELECT image_id, image_name, upload_date, EXTRACT(YEAR FROM AGE(NOW(), upload_date)) * 12 + EXTRACT(MONTH FROM AGE(NOW(), upload_date)) AS months_ago FROM images ORDER BY months_ago`),
  },
  18: {
    title: 'Image Upload Summary (String Formatting)',
    category: 'String Functions',
    explanation: 'Uses CONCAT and TO_CHAR to format a readable upload summary for each image.',
    sql: `SELECT CONCAT(image_name, ' uploaded on ', TO_CHAR(upload_date, 'DD Mon YYYY')) AS upload_summary
FROM images
ORDER BY upload_date DESC`,
    fn: (q) => q(`SELECT CONCAT(image_name, ' uploaded on ', TO_CHAR(upload_date, 'DD Mon YYYY')) AS upload_summary FROM images ORDER BY upload_date DESC`),
  },
  19: {
    title: 'Tag Count per Image',
    category: 'Aggregation',
    explanation: 'Counts the number of tags associated with each image using COUNT and GROUP BY.',
    sql: `SELECT i.image_id, i.image_name, 
       COUNT(it.tag_id) AS total_tags
FROM images i
LEFT JOIN image_tag it ON i.image_id = it.image_id
GROUP BY i.image_id, i.image_name
ORDER BY total_tags DESC`,
    fn: (q) => q(`SELECT i.image_id, i.image_name, COUNT(it.tag_id) AS total_tags FROM images i LEFT JOIN image_tag it ON i.image_id = it.image_id GROUP BY i.image_id, i.image_name ORDER BY total_tags DESC`),
  },
  20: {
    title: 'Capitalized Image Names',
    category: 'String Functions',
    explanation: 'Uses INITCAP() to convert image names to title case (first letter capitalized).',
    sql: `SELECT image_id, 
       image_name AS original_name,
       INITCAP(image_name) AS capitalized_name
FROM images`,
    fn: (q) => q(`SELECT image_id, image_name AS original_name, INITCAP(image_name) AS capitalized_name FROM images`),
  },
  21: {
    title: 'Day of Week Image Was Uploaded',
    category: 'Date Functions',
    explanation: 'Uses TO_CHAR with day format to extract the day of week each image was uploaded.',
    sql: `SELECT image_id, image_name, upload_date,
       TO_CHAR(upload_date, 'Day') AS day_of_week,
       EXTRACT(DOW FROM upload_date) AS day_number
FROM images
ORDER BY upload_date`,
    fn: (q) => q(`SELECT image_id, image_name, upload_date, TO_CHAR(upload_date, 'Day') AS day_of_week, EXTRACT(DOW FROM upload_date) AS day_number FROM images ORDER BY upload_date`),
  },
  22: {
    title: 'Image With Person and Tag',
    category: 'Multi-table JOIN',
    explanation: 'Joins Images, Persons, and Tags tables together to show a complete view of image metadata.',
    sql: `SELECT i.image_name, p.person_name, t.tag_name
FROM images i
JOIN image_person ip ON i.image_id = ip.image_id
JOIN persons p ON ip.person_id = p.person_id
JOIN image_tag it ON i.image_id = it.image_id
JOIN tags t ON it.tag_id = t.tag_id
ORDER BY i.image_name`,
    fn: (q) => q(`SELECT i.image_name, p.person_name, t.tag_name FROM images i JOIN image_person ip ON i.image_id = ip.image_id JOIN persons p ON ip.person_id = p.person_id JOIN image_tag it ON i.image_id = it.image_id JOIN tags t ON it.tag_id = t.tag_id ORDER BY i.image_name`),
  },
  23: {
    title: 'Unique Tags Used by Each User',
    category: 'Multi-table JOIN',
    explanation: 'Joins Users → Images → Image_Tag → Tags to show which unique tags each user has applied.',
    sql: `SELECT u.username, COUNT(DISTINCT t.tag_id) AS unique_tags_used
FROM users u
JOIN images i ON u.user_id = i.user_id
JOIN image_tag it ON i.image_id = it.image_id
JOIN tags t ON it.tag_id = t.tag_id
GROUP BY u.username
ORDER BY unique_tags_used DESC`,
    fn: (q) => q(`SELECT u.username, COUNT(DISTINCT t.tag_id) AS unique_tags_used FROM users u JOIN images i ON u.user_id = i.user_id JOIN image_tag it ON i.image_id = it.image_id JOIN tags t ON it.tag_id = t.tag_id GROUP BY u.username ORDER BY unique_tags_used DESC`),
  },
  24: {
    title: "Images Containing Letter 'a'",
    category: 'Pattern Matching',
    explanation: "Uses LIKE with wildcard %a% to find all images whose name contains the letter 'a'.",
    sql: `SELECT image_id, image_name
FROM images
WHERE LOWER(image_name) LIKE '%a%'
ORDER BY image_name`,
    fn: (q) => q(`SELECT image_id, image_name FROM images WHERE LOWER(image_name) LIKE '%a%' ORDER BY image_name`),
  },
  25: {
    title: 'Most Tagged Images',
    category: 'Aggregation / Subquery',
    explanation: 'Finds the most tagged images by counting tags per image, then ordering from highest to lowest.',
    sql: `SELECT i.image_id, i.image_name,
       COUNT(it.tag_id) AS total_tags,
       RANK() OVER (ORDER BY COUNT(it.tag_id) DESC) AS rank
FROM images i
LEFT JOIN image_tag it ON i.image_id = it.image_id
GROUP BY i.image_id, i.image_name
ORDER BY total_tags DESC
LIMIT 10`,
    fn: (q) => q(`SELECT i.image_id, i.image_name, COUNT(it.tag_id) AS total_tags, RANK() OVER (ORDER BY COUNT(it.tag_id) DESC) AS rank FROM images i LEFT JOIN image_tag it ON i.image_id = it.image_id GROUP BY i.image_id, i.image_name ORDER BY total_tags DESC LIMIT 10`),
  },
};

async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { id } = req.query;
  const qNum = parseInt(id);

  if (!qNum || !QUERIES[qNum]) {
    return res.status(404).json({ error: 'Query not found' });
  }

  const qDef = QUERIES[qNum];
  const startTime = Date.now();

  try {
    const result = await qDef.fn(query);
    const execTime = Date.now() - startTime;

    return res.status(200).json({
      title: qDef.title,
      category: qDef.category,
      explanation: qDef.explanation,
      sql: qDef.sql,
      columns: result.rows.length > 0 ? Object.keys(result.rows[0]) : [],
      rows: result.rows,
      rowCount: result.rowCount,
      execTimeMs: execTime,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message, sql: qDef.sql });
  }
}

export default requireAuth(handler);
