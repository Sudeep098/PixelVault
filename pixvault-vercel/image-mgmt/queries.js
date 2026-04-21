/**
 * queries.js
 * SQL query functions for the Pixel Vault image database.
 * Each function returns a { sql, params } object ready for use with
 * any Node.js DB driver (pg, mysql2, better-sqlite3, etc.).
 *
 * Usage example (with `pg`):
 *   const { sql, params } = queries.showAllImages();
 *   const result = await client.query(sql, params);
 */

const queries = {

  // Q01 – Show All Images
  showAllImages() {
    return {
      sql: `SELECT * FROM images ORDER BY upload_date DESC`,
      params: [],
    };
  },

  // Q02 – Unique Tags
  uniqueTags() {
    return {
      sql: `SELECT DISTINCT tag_name FROM tags ORDER BY tag_name`,
      params: [],
    };
  },

  // Q03 – Image Name + Tag Concatenation
  imageNameTagConcat() {
    return {
      sql: `
        SELECT i.image_name,
               STRING_AGG(t.tag_name, ', ' ORDER BY t.tag_name) AS all_tags
        FROM images i
        LEFT JOIN image_tags it ON i.id = it.image_id
        LEFT JOIN tags t        ON it.tag_id = t.id
        GROUP BY i.id, i.image_name
        ORDER BY i.image_name`,
      params: [],
    };
  },

  // Q04 – Images Uploaded After 2024-01-01
  imagesUploadedAfter(date = '2024-01-01') {
    return {
      sql: `SELECT * FROM images WHERE upload_date > $1 ORDER BY upload_date`,
      params: [date],
    };
  },

  // Q05 – Images Without Persons
  imagesWithoutPersons() {
    return {
      sql: `
        SELECT i.*
        FROM images i
        WHERE i.id NOT IN (
          SELECT DISTINCT image_id FROM image_persons
        )
        ORDER BY i.upload_date DESC`,
      params: [],
    };
  },

  // Q06 – Images With Multiple Tags
  imagesWithMultipleTags(minTags = 2) {
    return {
      sql: `
        SELECT i.image_name, COUNT(it.tag_id) AS tag_count
        FROM images i
        JOIN image_tags it ON i.id = it.image_id
        GROUP BY i.id, i.image_name
        HAVING COUNT(it.tag_id) >= $1
        ORDER BY tag_count DESC`,
      params: [minTags],
    };
  },

  // Q07 – Images Tagged 'Trip'
  imagesTaggedTrip() {
    return {
      sql: `
        SELECT i.*
        FROM images i
        JOIN image_tags it ON i.id = it.image_id
        JOIN tags t        ON it.tag_id = t.id
        WHERE LOWER(t.tag_name) = 'trip'
        ORDER BY i.upload_date DESC`,
      params: [],
    };
  },

  // Q08 – Images Containing a Specific Person
  imagesContainingPerson(personName) {
    return {
      sql: `
        SELECT i.*
        FROM images i
        JOIN image_persons ip ON i.id = ip.image_id
        JOIN persons p        ON ip.person_id = p.id
        WHERE LOWER(p.name) = LOWER($1)
        ORDER BY i.upload_date DESC`,
      params: [personName],
    };
  },

  // Q09 – Images Uploaded in Current Year
  imagesUploadedInCurrentYear() {
    return {
      sql: `
        SELECT *
        FROM images
        WHERE EXTRACT(YEAR FROM upload_date) = EXTRACT(YEAR FROM CURRENT_DATE)
        ORDER BY upload_date DESC`,
      params: [],
    };
  },

  // Q10 – Images With 'birthday' in Description
  imagesWithBirthdayInDescription() {
    return {
      sql: `
        SELECT *
        FROM images
        WHERE LOWER(description) LIKE '%birthday%'
        ORDER BY upload_date DESC`,
      params: [],
    };
  },

  // Q11 – Images With More Than 3 Tags
  imagesWithMoreThan3Tags(minTags = 3) {
    return {
      sql: `
        SELECT i.image_name, COUNT(it.tag_id) AS tag_count
        FROM images i
        JOIN image_tags it ON i.id = it.image_id
        GROUP BY i.id, i.image_name
        HAVING COUNT(it.tag_id) > $1
        ORDER BY tag_count DESC`,
      params: [minTags],
    };
  },

  // Q12 – Sort Images by Upload Date
  sortImagesByUploadDate(order = 'DESC') {
    const safeOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    return {
      sql: `SELECT * FROM images ORDER BY upload_date ${safeOrder}`,
      params: [],
    };
  },

  // Q13 – Image Names Whose 3rd Letter = 'a'
  imageNames3rdLetterA() {
    return {
      sql: `
        SELECT image_name
        FROM images
        WHERE LOWER(SUBSTRING(image_name FROM 3 FOR 1)) = 'a'
        ORDER BY image_name`,
      params: [],
    };
  },

  // Q14 – Images Tagged 'Trip' or 'College'
  imagesTaggedTripOrCollege() {
    return {
      sql: `
        SELECT DISTINCT i.*
        FROM images i
        JOIN image_tags it ON i.id = it.image_id
        JOIN tags t        ON it.tag_id = t.id
        WHERE LOWER(t.tag_name) IN ('trip', 'college')
        ORDER BY i.upload_date DESC`,
      params: [],
    };
  },

  // Q15 – Tags in More Than 5 Images
  tagsInMoreThan5Images(minImages = 5) {
    return {
      sql: `
        SELECT t.tag_name, COUNT(it.image_id) AS image_count
        FROM tags t
        JOIN image_tags it ON t.id = it.tag_id
        GROUP BY t.id, t.tag_name
        HAVING COUNT(it.image_id) > $1
        ORDER BY image_count DESC`,
      params: [minImages],
    };
  },

  // Q16 – Current Date Display
  currentDateDisplay() {
    return {
      sql: `SELECT CURRENT_DATE AS today,
                   TO_CHAR(CURRENT_DATE, 'Day, DD Month YYYY') AS formatted_date`,
      params: [],
    };
  },

  // Q17 – Months Since Image Uploaded
  monthsSinceImageUploaded() {
    return {
      sql: `
        SELECT image_name,
               upload_date,
               DATE_PART('year', AGE(CURRENT_DATE, upload_date)) * 12 +
               DATE_PART('month', AGE(CURRENT_DATE, upload_date)) AS months_since_upload
        FROM images
        ORDER BY months_since_upload DESC`,
      params: [],
    };
  },

  // Q18 – Image Upload Summary
  imageUploadSummary() {
    return {
      sql: `
        SELECT COUNT(*)                                          AS total_images,
               MIN(upload_date)                                 AS earliest_upload,
               MAX(upload_date)                                 AS latest_upload,
               TO_CHAR(AVG(EXTRACT(EPOCH FROM upload_date)),
                        'YYYY-MM-DD')                           AS avg_upload_epoch
        FROM images`,
      params: [],
    };
  },

  // Q19 – Tag Count per Image
  tagCountPerImage() {
    return {
      sql: `
        SELECT i.image_name,
               COUNT(it.tag_id) AS tag_count
        FROM images i
        LEFT JOIN image_tags it ON i.id = it.image_id
        GROUP BY i.id, i.image_name
        ORDER BY tag_count DESC, i.image_name`,
      params: [],
    };
  },

  // Q20 – Capitalized Image Names
  capitalizedImageNames() {
    return {
      sql: `
        SELECT image_name,
               INITCAP(image_name) AS capitalized_name
        FROM images
        ORDER BY image_name`,
      params: [],
    };
  },

  // Q21 – Day of Week Uploaded
  dayOfWeekUploaded() {
    return {
      sql: `
        SELECT image_name,
               upload_date,
               TO_CHAR(upload_date, 'Day') AS day_of_week
        FROM images
        ORDER BY EXTRACT(DOW FROM upload_date), upload_date`,
      params: [],
    };
  },

  // Q22 – Image With a Specific Person and Tag
  imageWithPersonAndTag(personName, tagName) {
    return {
      sql: `
        SELECT DISTINCT i.*
        FROM images i
        JOIN image_persons ip ON i.id = ip.image_id
        JOIN persons p        ON ip.person_id = p.id
        JOIN image_tags it    ON i.id = it.image_id
        JOIN tags t           ON it.tag_id = t.id
        WHERE LOWER(p.name)     = LOWER($1)
          AND LOWER(t.tag_name) = LOWER($2)
        ORDER BY i.upload_date DESC`,
      params: [personName, tagName],
    };
  },

  // Q23 – Unique Tags per User
  uniqueTagsPerUser() {
    return {
      sql: `
        SELECT u.username,
               COUNT(DISTINCT it.tag_id) AS unique_tag_count
        FROM users u
        JOIN images i     ON u.id = i.user_id
        JOIN image_tags it ON i.id = it.image_id
        GROUP BY u.id, u.username
        ORDER BY unique_tag_count DESC`,
      params: [],
    };
  },

  // Q24 – Images Containing Letter 'a' (in name)
  imagesContainingLetterA(letter = 'a') {
    return {
      sql: `
        SELECT *
        FROM images
        WHERE LOWER(image_name) LIKE $1
        ORDER BY image_name`,
      params: [`%${letter.toLowerCase()}%`],
    };
  },

  // Q25 – Most Tagged Images
  mostTaggedImages(limit = 10) {
    return {
      sql: `
        SELECT i.image_name,
               COUNT(it.tag_id) AS tag_count
        FROM images i
        JOIN image_tags it ON i.id = it.image_id
        GROUP BY i.id, i.image_name
        ORDER BY tag_count DESC
        LIMIT $1`,
      params: [limit],
    };
  },
};

module.exports = queries;
