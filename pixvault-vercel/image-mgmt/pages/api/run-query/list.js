import { requireAuth } from '../../../lib/auth';

const QUERY_LIST = [
  { id: 1, title: 'Show All Images', category: 'Basic Select' },
  { id: 2, title: 'Unique Tags', category: 'DISTINCT' },
  { id: 3, title: 'Image Name + Tag Concatenation', category: 'String Functions' },
  { id: 4, title: 'Images Uploaded After 2024-01-01', category: 'Filter / WHERE' },
  { id: 5, title: 'Images Without Persons', category: 'LEFT JOIN / NULL' },
  { id: 6, title: 'Images With Multiple Tags', category: 'GROUP BY / HAVING' },
  { id: 7, title: "Images Tagged 'Trip'", category: 'JOIN / Filter' },
  { id: 8, title: 'Images Containing Specific Person', category: 'Multi-table JOIN' },
  { id: 9, title: 'Images Uploaded in Current Year', category: 'Date Functions' },
  { id: 10, title: "Images With 'birthday' in Description", category: 'Pattern Matching' },
  { id: 11, title: 'Images With More Than 3 Tags', category: 'Aggregation / HAVING' },
  { id: 12, title: 'Sort Images by Upload Date', category: 'ORDER BY' },
  { id: 13, title: "Image Names 3rd Letter = 'a'", category: 'Pattern Matching' },
  { id: 14, title: "Images Tagged 'Trip' or 'College'", category: 'OR Condition' },
  { id: 15, title: 'Tags in More Than 5 Images', category: 'GROUP BY / HAVING' },
  { id: 16, title: 'Current Date Display', category: 'Date Functions' },
  { id: 17, title: 'Months Since Image Uploaded', category: 'Date Arithmetic' },
  { id: 18, title: 'Image Upload Summary', category: 'String Functions' },
  { id: 19, title: 'Tag Count per Image', category: 'Aggregation' },
  { id: 20, title: 'Capitalized Image Names', category: 'String Functions' },
  { id: 21, title: 'Day of Week Uploaded', category: 'Date Functions' },
  { id: 22, title: 'Image With Person and Tag', category: 'Multi-table JOIN' },
  { id: 23, title: 'Unique Tags per User', category: 'Multi-table JOIN' },
  { id: 24, title: "Images Containing Letter 'a'", category: 'Pattern Matching' },
  { id: 25, title: 'Most Tagged Images', category: 'Aggregation / Subquery' },
];

async function handler(req, res) {
  return res.status(200).json({ queries: QUERY_LIST });
}

export default requireAuth(handler);
